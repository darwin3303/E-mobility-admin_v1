"""
speed_tracker.py - Advanced YOLOv8 + ByteTrack + Homography Speed & Incident Engine.

Step 1: calibrate a camera (click 4 road points, enter real distances)
    python speed_tracker.py calibrate --video camera_01_feed.mp4 --out cam01_calib.json

Step 2: run detection, tracking, speed and incident/violation logging
    python speed_tracker.py run --video camera_01_feed.mp4 --calib cam01_calib.json \
        --model yolov8n.pt --limit 100 --show

Install: pip install ultralytics opencv-python numpy
"""
import argparse
import csv
import json
import os
import time
from collections import defaultdict, deque

import cv2
import numpy as np
from ultralytics import YOLO

COCO_VEHICLES = [2, 3, 5, 7]  # car, motorcycle, bus, truck.


# ---------------------------------------------------------------- calibration
def calibrate(video, out):
    cap = cv2.VideoCapture(video)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise SystemExit(f"Cannot read {video}")

    print("Click 4 road points forming a rectangle on the ground, in this order:")
    print("  1 near-left, 2 near-right, 3 far-right, 4 far-left")
    print("Use lane-marking dashes or a measured stretch. Press any key when done.")
    pts = []

    def on_click(event, x, y, *_):
        if event == cv2.EVENT_LBUTTONDOWN and len(pts) < 4:
            pts.append([x, y])
            cv2.circle(frame, (x, y), 5, (0, 0, 255), -1)
            cv2.putText(frame, str(len(pts)), (x + 8, y - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.imshow("calibrate", frame)

    cv2.imshow("calibrate", frame)
    cv2.setMouseCallback("calibrate", on_click)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    if len(pts) != 4:
        raise SystemExit("Need exactly 4 points.")

    width = float(input("Real width of the rectangle in metres (across the road): "))
    length = float(input("Real length of the rectangle in metres (along the road): "))
    with open(out, "w") as f:
        json.dump({"image_pts": pts, "width_m": width, "length_m": length}, f, indent=2)
    print(f"Saved {out}")


def load_homography(path):
    c = json.load(open(path))
    src = np.float32(c["image_pts"])
    w, l = c["width_m"], c["length_m"]
    dst = np.float32([[0, l], [w, l], [w, 0], [0, 0]])
    return cv2.getPerspectiveTransform(src, dst), src.astype(np.int32)


def to_ground(H, pt):
    p = cv2.perspectiveTransform(np.float32([[[pt[0], pt[1]]]]), H)[0][0]
    return float(p[0]), float(p[1])


# ------------------------------------------------------------------ speed
def fit_speed_kmh(samples):
    """Least-squares linear regression of ground position vs time, robust to jitter."""
    t = np.array([s[0] for s in samples])
    x = np.array([s[1] for s in samples])
    y = np.array([s[2] for s in samples])
    dt = t[-1] - t[0]
    if dt < 0.2:
        return None
    try:
        vx = np.polyfit(t, x, 1)[0]
        vy = np.polyfit(t, y, 1)[0]
        return float(np.hypot(vx, vy) * 3.6), float(vx), float(vy)
    except Exception:
        return None


# -------------------------------------------------------------------- run
def run(args):
    H, zone = load_homography(args.calib)
    model = YOLO(args.model)
    cap = cv2.VideoCapture(args.video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    cap.release()

    classes = [int(c) for c in args.classes.split(",")] if args.classes else COCO_VEHICLES
    os.makedirs(args.evidence, exist_ok=True)

    tracks = defaultdict(lambda: deque(maxlen=40))   # id -> (t, X, Y) inside zone
    speeds = defaultdict(lambda: deque(maxlen=int(fps * args.sustain)))
    logged_violations = set()
    logged_incidents = set()
    best_crop = {}                                   # id -> (box_area, crop)
    stopped_tracker = defaultdict(lambda: None)      # id -> start_time

    log = open(args.log, "a", newline="")
    writer = csv.writer(log)
    if log.tell() == 0:
        writer.writerow(["time_utc", "event_type", "track_id", "class", "speed_kmh", "limit_kmh", "evidence"])

    results = model.track(source=args.video, stream=True, persist=True,
                          tracker=args.tracker, classes=classes,
                          conf=args.conf, imgsz=args.imgsz, verbose=False)

    for frame_idx, r in enumerate(results):
        frame = r.orig_img
        t = frame_idx / fps
        cv2.polylines(frame, [zone], True, (255, 200, 0), 1)

        if r.boxes.id is not None:
            ids = r.boxes.id.int().tolist()
            xyxy = r.boxes.xyxy.cpu().numpy()
            cls = r.boxes.cls.int().tolist()
            for tid, box, c in zip(ids, xyxy, cls):
                x1, y1, x2, y2 = box
                foot = ((x1 + x2) / 2, y2)       # ground contact point
                inside = cv2.pointPolygonTest(zone, foot, False) >= 0
                speed = None

                if inside:
                    X, Y = to_ground(H, foot)
                    dq = tracks[tid]
                    dq.append((t, X, Y))
                    while dq and t - dq[0][0] > args.window:
                        dq.popleft()
                    
                    if len(dq) >= max(4, int(fps * 0.3)):
                        fit_res = fit_speed_kmh(dq)
                        if fit_res is not None:
                            speed, vx, vy = fit_res
                            speeds[tid].append(speed)

                            # Stopped vehicle detection inside zone
                            if speed < 8.0:
                                if stopped_tracker[tid] is None:
                                    stopped_tracker[tid] = t
                                elif t - stopped_tracker[tid] >= 4.0 and (tid, "STOPPED") not in logged_incidents:
                                    logged_incidents.add((tid, "STOPPED"))
                                    ev_path = os.path.join(args.evidence, f"stopped_track{tid}_{int(time.time())}.jpg")
                                    if tid in best_crop:
                                        cv2.imwrite(ev_path, best_crop[tid][1])
                                    writer.writerow([time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
                                                     "STOPPED_VEHICLE", tid, model.names[c], round(speed, 1),
                                                     args.limit, ev_path])
                                    log.flush()
                                    print(f"HAZARD: Track {tid} ({model.names[c]}) is STOPPED on highway!")
                            else:
                                stopped_tracker[tid] = None

                    area = (x2 - x1) * (y2 - y1)
                    if tid not in best_crop or area > best_crop[tid][0]:
                        best_crop[tid] = (area, frame[int(y1):int(y2), int(x1):int(x2)].copy())

                # sustained speeding violation: every recent reading above limit
                sp = speeds[tid]
                violating = (len(sp) == sp.maxlen and min(sp) > args.limit)
                if violating and tid not in logged_violations:
                    logged_violations.add(tid)
                    path = os.path.join(args.evidence, f"speed_track{tid}_{int(time.time())}.jpg")
                    cv2.imwrite(path, best_crop[tid][1])
                    writer.writerow([time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
                                     "SPEED_VIOLATION", tid, model.names[c], round(float(np.mean(sp)), 1),
                                     args.limit, path])
                    log.flush()
                    print(f"VIOLATION track {tid} ({model.names[c]}): {np.mean(sp):.0f} km/h (Limit: {args.limit})")

                if args.show:
                    color = (0, 0, 255) if (tid in logged_violations or (tid, "STOPPED") in logged_incidents) else (0, 255, 0)
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                    label = f"#{tid} {speed:.0f} km/h" if speed is not None else f"#{tid}"
                    cv2.putText(frame, label, (int(x1), int(y1) - 6),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        if args.show:
            cv2.imshow("E-Mobility Speed & Incident Radar", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    log.close()
    cv2.destroyAllWindows()
    print(f"Done. {len(logged_violations)} speeding violations & {len(logged_incidents)} incidents logged to {args.log}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("calibrate")
    c.add_argument("--video", required=True)
    c.add_argument("--out", default="calib.json")

    r = sub.add_parser("run")
    r.add_argument("--video", required=True)
    r.add_argument("--calib", required=True)
    r.add_argument("--model", default="yolov8n.pt")
    r.add_argument("--classes", default="", help="comma list of class ids")
    r.add_argument("--limit", type=float, default=100.0, help="speed limit km/h")
    r.add_argument("--window", type=float, default=1.5, help="seconds used for speed fit")
    r.add_argument("--sustain", type=float, default=1.0, help="seconds above limit to trigger")
    r.add_argument("--conf", type=float, default=0.35)
    r.add_argument("--imgsz", type=int, default=960)
    r.add_argument("--tracker", default="bytetrack.yaml")
    r.add_argument("--evidence", default="evidence")
    r.add_argument("--log", default="violations.csv")
    r.add_argument("--show", action="store_true")

    a = p.parse_args()
    calibrate(a.video, a.out) if a.cmd == "calibrate" else run(a)


if __name__ == "__main__":
    main()

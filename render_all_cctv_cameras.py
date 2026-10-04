"""
Renders all 4 CCTV cameras (Camera 01, Camera 02, Camera 03, Camera 04) with real highway video footage,
YOLOv8 vehicle detection & tracking, individual primary speed banners, and ANPR license plate zoom callout boxes.
"""

import os
import subprocess
import time
import cv2
import numpy as np
import imageio_ffmpeg
from ultralytics import YOLO

class MultiCameraRenderer:
    def __init__(self, video_path="expressway_traffic.mp4", model_path="yolov8n.pt"):
        self.video_path = video_path
        self.model = YOLO(model_path)
        self.vehicle_classes = [2, 3, 5, 7] # car, moto, bus, truck

    def process_camera_frame(self, frame, primary_speed, primary_plate, cam_label):
        h, w, _ = frame.shape
        annotated = frame.copy()
        YELLOW = (45, 220, 245)
        YELLOW_LINE = (30, 200, 240)
        DARK_TEXT = (15, 15, 15)

        raw_detections = []
        try:
            results = self.model.track(
                frame, 
                persist=True, 
                classes=self.vehicle_classes,
                conf=0.40,
                verbose=False,
                tracker="bytetrack.yaml"
            )
            if results and len(results) > 0 and results[0].boxes is not None and len(results[0].boxes) > 0:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                clss = results[0].boxes.cls.int().cpu().numpy()
                confs = results[0].boxes.conf.cpu().numpy()
                if results[0].boxes.id is not None:
                    track_ids = results[0].boxes.id.int().cpu().numpy()
                else:
                    track_ids = np.arange(1, len(boxes) + 1)

                for box, tid, cid, conf in zip(boxes, track_ids, clss, confs):
                    if int(box[0]) < 200 and int(box[1]) < 350:
                        continue
                    if int(cid) in self.vehicle_classes:
                        raw_detections.append((int(box[0]), int(box[1]), int(box[2]), int(box[3]), int(tid)))
        except Exception:
            pass

        if len(raw_detections) == 0:
            try:
                results = self.model(frame, classes=self.vehicle_classes, conf=0.20, verbose=False)
                if results and len(results) > 0 and results[0].boxes is not None and len(results[0].boxes) > 0:
                    boxes = results[0].boxes.xyxy.cpu().numpy()
                    for idx, b in enumerate(boxes):
                        raw_detections.append((int(b[0]), int(b[1]), int(b[2]), int(b[3]), idx + 1))
            except Exception:
                pass

        tracked_objects = []
        for x1, y1, x2, y2, track_id in raw_detections:
            if x1 < 160 and y1 < 320:
                continue
            x1 = max(0, min(w - 1, x1))
            y1 = max(0, min(h - 1, y1))
            x2 = max(0, min(w - 1, x2))
            y2 = max(0, min(h - 1, y2))
            bw, bh = x2 - x1, y2 - y1
            if bw <= 20 or bh <= 15:
                continue
            tracked_objects.append({
                'id': track_id,
                'box': (x1, y1, x2, y2),
                'area': bw * bh
            })

        primary_vehicle = None
        if tracked_objects:
            tracked_objects.sort(key=lambda o: o['area'], reverse=True)
            primary_vehicle = tracked_objects[0]

        # Draw yellow bounding boxes for all vehicles
        for obj in tracked_objects:
            x1, y1, x2, y2 = obj['box']
            is_primary = (primary_vehicle and obj['id'] == primary_vehicle['id'])
            box_thick = 2 if is_primary else 1
            cv2.rectangle(annotated, (x1, y1), (x2, y2), YELLOW, box_thick)

            if is_primary:
                # 1. "SPEED: XX km/h" Header Banner
                speed_str = f"SPEED: {int(primary_speed)} km/h"
                font = cv2.FONT_HERSHEY_DUPLEX
                scale = 0.65
                thick = 2
                (tw, th), baseline = cv2.getTextSize(speed_str, font, scale, thick)
                banner_y2 = y1
                banner_y1 = max(0, y1 - th - 12)
                banner_x1 = x1
                banner_x2 = min(w, x1 + tw + 18)
                
                cv2.rectangle(annotated, (banner_x1, banner_y1), (banner_x2, banner_y2), YELLOW, -1)
                cv2.putText(annotated, speed_str, (banner_x1 + 8, banner_y2 - 6), font, scale, DARK_TEXT, thick, cv2.LINE_AA)

                # 2. License Plate Zoom Callout Popout
                cw, ch = 220, 85
                callout_x1 = min(w - cw - 15, x2 + 30)
                callout_y1 = max(10, min(h - ch - 30, y1 - 20))
                callout_x2 = callout_x1 + cw
                callout_y2 = callout_y1 + ch

                # Create plate zoom asset
                plate_crop = self.create_callout_crop(frame, (x1, y1, x2, y2), primary_plate, cw, ch)
                annotated[callout_y1:callout_y2, callout_x1:callout_x2] = plate_crop
                cv2.rectangle(annotated, (callout_x1, callout_y1), (callout_x2, callout_y2), YELLOW, 2)

                # 3. Yellow Pointer Lines
                bw_car, bh_car = x2 - x1, y2 - y1
                plate_x = x1 + int(bw_car * 0.50)
                plate_y = y1 + int(bh_car * 0.78)
                cv2.line(annotated, (plate_x, plate_y), (callout_x1, callout_y1 + 10), YELLOW_LINE, 1, cv2.LINE_AA)
                cv2.line(annotated, (plate_x, plate_y), (callout_x1, callout_y2 - 10), YELLOW_LINE, 1, cv2.LINE_AA)

        # Bottom HUD Timestamp & Location
        time_str = time.strftime("%Y-%m-%d %H:%M:%S")
        hud_txt = f"{time_str}  {cam_label}"
        cv2.rectangle(annotated, (10, h - 30), (520, h - 8), (15, 18, 22), -1)
        cv2.putText(annotated, hud_txt, (16, h - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (240, 242, 245), 1, cv2.LINE_AA)

        return annotated

    def create_callout_crop(self, frame, box, plate_text, width, height):
        x1, y1, x2, y2 = box
        bw, bh = x2 - x1, y2 - y1
        h, w, _ = frame.shape
        py1 = max(0, y1 + int(bh * 0.58))
        py2 = min(h, y1 + int(bh * 0.98))
        px1 = max(0, x1 + int(bw * 0.15))
        px2 = min(w, x1 + int(bw * 0.85))

        if py2 > py1 + 8 and px2 > px1 + 8:
            crop = frame[py1:py2, px1:px2]
            enlarged = cv2.resize(crop, (width, height), interpolation=cv2.INTER_CUBIC)
            pw, ph = int(width * 0.80), int(height * 0.44)
            px = (width - pw) // 2
            py = int(height * 0.46)
            cv2.rectangle(enlarged, (px, py), (px + pw, py + ph), (242, 245, 248), -1)
            cv2.rectangle(enlarged, (px, py), (px + pw, py + ph), (18, 18, 18), 2)
            cv2.putText(enlarged, plate_text, (px + 6, py + ph - 8), cv2.FONT_HERSHEY_DUPLEX, 0.58, (12, 12, 15), 2, cv2.LINE_AA)
            return enlarged
        else:
            syn = np.zeros((height, width, 3), dtype=np.uint8)
            syn[:] = (32, 34, 40)
            cv2.rectangle(syn, (10, height // 2 - 10), (width - 10, height - 10), (240, 242, 246), -1)
            cv2.putText(syn, plate_text, (16, height - 18), cv2.FONT_HERSHEY_DUPLEX, 0.60, (15, 15, 20), 2, cv2.LINE_AA)
            return syn

    def render_camera_video(self, primary_speed, primary_plate, cam_label, output_file, max_frames=175):
        cap = cv2.VideoCapture(self.video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

        cmd = [
            ffmpeg_exe, "-y",
            "-f", "rawvideo", "-vcodec", "rawvideo",
            "-s", f"{width}x{height}", "-pix_fmt", "bgr24",
            "-r", str(fps), "-i", "-",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            output_file
        ]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

        f_count = 0
        while cap.isOpened() and f_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            processed = self.process_camera_frame(frame, primary_speed, primary_plate, cam_label)
            proc.stdin.write(processed.tobytes())
            f_count += 1

        cap.release()
        proc.stdin.close()
        proc.wait()
        print(f"Rendered {output_file} ({f_count} frames)")

def main():
    renderer = MultiCameraRenderer()
    
    cameras = [
        {"speed": 115, "plate": "WP CAB-4521", "label": "CAM-01 (SOUTHERN EXPWY KM 68.4)", "out": "d:/e-mobility-admin/e-mobility-admin/public/camera_01_feed.mp4"},
        {"speed": 92,  "plate": "SP KY-3390",  "label": "CAM-02 (OUTER CIRCULAR KM 14.2)", "out": "d:/e-mobility-admin/e-mobility-admin/public/camera_02_feed.mp4"},
        {"speed": 124, "plate": "WP CBM-4821", "label": "CAM-03 (KATUNAYAKE EXPWY KM 8.5)", "out": "d:/e-mobility-admin/e-mobility-admin/public/camera_03_feed.mp4"},
        {"speed": 115, "plate": "WP CAB-4521", "label": "CAM-04 (CENTRAL EXPWY KM 22.1)",   "out": "d:/e-mobility-admin/e-mobility-admin/public/camera_04_feed.mp4"}
    ]
    
    for cam in cameras:
        renderer.render_camera_video(cam["speed"], cam["plate"], cam["label"], cam["out"])

if __name__ == "__main__":
    main()

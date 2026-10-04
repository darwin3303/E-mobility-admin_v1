"""
Generates a realistic moving CCTV video feed for Camera 03 (Katunayake Expressway Km 8.5).
Features active highway traffic flow, Katunayake E03 overhead signboard, dynamic vehicles,
and high quality H.264 encoding for smooth MJPEG streaming & YOLOv8 tracking.
"""

import os
import subprocess
import time
import math
import cv2
import numpy as np

def generate_cam03_video():
    outputs = [
        "d:/e-mobility-admin/camera_03_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_03_feed.mp4"
    ]
    
    duration_sec = 15
    fps = 30
    width = 960
    height = 720
    total_frames = duration_sec * fps

    print("Starting generation of Camera 03 (Katunayake Expressway) video feed...")

    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        ffmpeg_exe = "ffmpeg"

    # Setup ffmpeg process for H.264 mp4 encoding
    for output_mp4 in outputs:
        os.makedirs(os.path.dirname(output_mp4), exist_ok=True)

    primary_output = outputs[0]
    
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "bgr24",
        "-r", str(fps),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        primary_output
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    # Highway perspective geometry parameters for Cam 03
    horizon_y = int(height * 0.18)
    vp_x = int(width * 0.52) # Vanishing point center-left
    road_top_w = int(width * 0.16)

    # Fleet of traffic vehicles moving on expressway
    vehicles = [
        # Overtaking Lane 1 (Fast car speeding at 112 km/h)
        {'lane': 0, 'speed': 112, 'progress': 0.15, 'color': (30, 35, 45), 'type': 'sedan', 'plate': 'WP CAB-7890'},
        # Center Lane 2 (Cruising Prius at 96 km/h)
        {'lane': 1, 'speed': 96, 'progress': 0.55, 'color': (240, 242, 248), 'type': 'sedan', 'plate': 'WP CAD-1234'},
        # Right Lane 3 (Silver Aqua hatchback at 90 km/h)
        {'lane': 2, 'speed': 90, 'progress': 0.35, 'color': (210, 215, 220), 'type': 'hatchback', 'plate': 'SP KY-5678'},
        # Overtaking Lane 1 (Follower car far behind)
        {'lane': 0, 'speed': 105, 'progress': 0.85, 'color': (180, 50, 40), 'type': 'suv', 'plate': 'CP NC-9012'},
        # Right Lane 3 (Van at 85 km/h)
        {'lane': 2, 'speed': 85, 'progress': 0.75, 'color': (245, 245, 245), 'type': 'van', 'plate': 'NW ND-3456'},
    ]

    for f_idx in range(total_frames):
        # 1. Environment Sky & Scenery Backdrop
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Daylight Gradient Sky
        for y in range(horizon_y):
            ratio = y / float(horizon_y)
            b = int(210 - ratio * 20)
            g = int(218 - ratio * 15)
            r = int(225 - ratio * 10)
            frame[y, :] = (b, g, r)

        # Left Landscaping & Trees
        frame[horizon_y:, 0:vp_x] = (42, 85, 45)
        for t in range(24):
            tx = int((t % 6) * 40 + math.sin(t) * 12)
            ty = int(horizon_y + 15 + (t // 6) * 50)
            r = int(22 + (t % 3) * 6)
            cv2.circle(frame, (tx, ty), r, (32, 68, 35), -1)
            cv2.circle(frame, (tx + 6, ty - 4), int(r * 0.8), (46, 92, 48), -1)

        # Right Embankment & Coconut/Palm Trees
        frame[horizon_y:, vp_x:] = (45, 88, 48)
        for t in range(18):
            tx = int(width - (t % 4) * 42 - 15)
            ty = int(horizon_y + 20 + (t // 4) * 65)
            cv2.circle(frame, (tx, ty), 24, (35, 75, 40), -1)

        # 2. Highway Asphalt Road Trapezoid
        road_pts = np.array([
            [vp_x - road_top_w // 2, horizon_y],
            [vp_x + road_top_w // 2, horizon_y],
            [int(width * 0.98), height],
            [int(width * 0.02), height]
        ], np.int32)
        cv2.fillPoly(frame, [road_pts], (110, 114, 120))

        # Solid Left Shoulder Marking Line
        cv2.line(frame, (vp_x - road_top_w // 2, horizon_y), (int(width * 0.02), height), (245, 248, 250), 4, cv2.LINE_AA)

        # Right Metal Highway Guardrail & Posts
        gr_top = (vp_x + road_top_w // 2 + 2, horizon_y)
        gr_bot = (int(width * 0.98), height)
        cv2.line(frame, gr_top, gr_bot, (170, 175, 180), 5, cv2.LINE_AA)
        cv2.line(frame, (gr_top[0] - 2, gr_top[1]), (gr_bot[0] - 2, gr_bot[1]), (110, 115, 120), 2, cv2.LINE_AA)
        for g in range(15):
            t_post = (g / 14.0) ** 1.3
            gy = int(horizon_y + (height - horizon_y) * t_post)
            gx = int(gr_top[0] + (gr_bot[0] - gr_top[0]) * t_post)
            cv2.line(frame, (gx, gy), (gx, gy + max(3, int(16 * t_post))), (90, 95, 100), max(1, int(3 * t_post)))

        # Blue Highway Gantry Signboard (E03 Katunayake Expressway)
        sign_top_l = (int(width * 0.06), int(height * 0.12))
        sign_w, sign_h = 240, 56
        # Support posts
        cv2.rectangle(frame, (sign_top_l[0] + 20, sign_top_l[1] + sign_h), (sign_top_l[0] + 26, sign_top_l[1] + sign_h + 45), (80, 85, 90), -1)
        cv2.rectangle(frame, (sign_top_l[0] + sign_w - 26, sign_top_l[1] + sign_h), (sign_top_l[0] + sign_w - 20, sign_top_l[1] + sign_h + 45), (80, 85, 90), -1)
        # Sign panel in Sri Lankan Highway Blue
        cv2.rectangle(frame, sign_top_l, (sign_top_l[0] + sign_w, sign_top_l[1] + sign_h), (160, 65, 15), -1)
        cv2.rectangle(frame, sign_top_l, (sign_top_l[0] + sign_w, sign_top_l[1] + sign_h), (245, 248, 250), 2)
        cv2.putText(frame, "E03 KATUNAYAKE EXPY", (sign_top_l[0] + 12, sign_top_l[1] + 22), cv2.FONT_HERSHEY_DUPLEX, 0.48, (255, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, "PELIYAGODA / COLOMBO AIRPORT", (sign_top_l[0] + 12, sign_top_l[1] + 44), cv2.FONT_HERSHEY_DUPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)

        # 3. Dashed White Lane Dividers
        d1_top = (int(vp_x - road_top_w * 0.16), horizon_y)
        d1_bot = (int(width * 0.34), height)
        d2_top = (int(vp_x + road_top_w * 0.16), horizon_y)
        d2_bot = (int(width * 0.66), height)

        dash_offset = (f_idx * 4.5) % 60
        for d in range(16):
            t1 = (d * 60 + dash_offset) / 800.0
            t2 = t1 + 0.045
            if t1 < 1.0 and t2 <= 1.05:
                t1_p = t1 ** 1.35
                t2_p = min(1.0, t2) ** 1.35
                # Left divider
                p1_x = int(d1_top[0] + (d1_bot[0] - d1_top[0]) * t1_p)
                p1_y = int(d1_top[1] + (d1_bot[1] - d1_top[1]) * t1_p)
                p2_x = int(d1_top[0] + (d1_bot[0] - d1_top[0]) * t2_p)
                p2_y = int(d1_top[1] + (d1_bot[1] - d1_top[1]) * t2_p)
                cv2.line(frame, (p1_x, p1_y), (p2_x, p2_y), (245, 248, 250), max(1, int(1 + t1_p * 4)), cv2.LINE_AA)
                # Right divider
                q1_x = int(d2_top[0] + (d2_bot[0] - d2_top[0]) * t1_p)
                q1_y = int(d2_top[1] + (d2_bot[1] - d2_top[1]) * t1_p)
                q2_x = int(d2_top[0] + (d2_bot[0] - d2_top[0]) * t2_p)
                q2_y = int(d2_top[1] + (d2_bot[1] - d2_top[1]) * t2_p)
                cv2.line(frame, (q1_x, q1_y), (q2_x, q2_y), (245, 248, 250), max(1, int(1 + t1_p * 4)), cv2.LINE_AA)

        # 4. Render Dynamic Vehicles
        for veh in vehicles:
            # Advance vehicle progress down the road (towards camera)
            veh['progress'] = (veh['progress'] + (veh['speed'] / 100.0) * 0.0035) % 1.0
            p = veh['progress']
            if p < 0.02 or p > 0.98:
                continue

            p_geom = p ** 1.35
            y_pos = int(horizon_y + (height - horizon_y) * p_geom)

            # Lane X interpolation
            lane_ratio = [0.18, 0.50, 0.82][veh['lane']]
            x_left = int((vp_x - road_top_w // 2) + (int(width * 0.02) - (vp_x - road_top_w // 2)) * p_geom)
            x_right = int((vp_x + road_top_w // 2) + (int(width * 0.98) - (vp_x + road_top_w // 2)) * p_geom)
            x_pos = int(x_left + (x_right - x_left) * lane_ratio)

            # Vehicle size scaling by perspective depth
            car_w = int(24 + p_geom * 140)
            car_h = int(18 + p_geom * 95)
            
            x1 = x_pos - car_w // 2
            y1 = y_pos - car_h
            x2 = x1 + car_w
            y2 = y_pos

            # Draw vehicle body shadow
            sh_pts = np.array([
                [x1 - 4, y2 + 2], [x2 + 4, y2 + 2],
                [x2 + 8, y2 + 8], [x1 - 8, y2 + 8]
            ], np.int32)
            cv2.fillPoly(frame, [sh_pts], (20, 22, 25))

            # Main Car Body
            body_color = veh['color']
            cv2.rectangle(frame, (x1, y1 + int(car_h * 0.35)), (x2, y2), body_color, -1)
            cv2.rectangle(frame, (x1, y1 + int(car_h * 0.35)), (x2, y2), (20, 20, 25), 1)

            # Cabin / Roof
            roof_margin = int(car_w * 0.18)
            cv2.rectangle(frame, (x1 + roof_margin, y1), (x2 - roof_margin, y1 + int(car_h * 0.45)), body_color, -1)

            # Windshield / Rear Window
            win_color = (65, 75, 85)
            cv2.rectangle(frame, (x1 + roof_margin + 2, y1 + 3), (x2 - roof_margin - 2, y1 + int(car_h * 0.35)), win_color, -1)

            # Red Tail Lights (Rear View)
            tl_w = max(2, int(car_w * 0.16))
            tl_h = max(2, int(car_h * 0.15))
            cv2.rectangle(frame, (x1 + 3, y2 - tl_h - 4), (x1 + 3 + tl_w, y2 - 4), (15, 20, 230), -1)
            cv2.rectangle(frame, (x2 - 3 - tl_w, y2 - tl_h - 4), (x2 - 3, y2 - 4), (15, 20, 230), -1)

            # License Plate on Rear Bumper
            if car_w > 45:
                pw = int(car_w * 0.32)
                ph = int(car_h * 0.16)
                px = x_pos - pw // 2
                py = y2 - ph - 3
                cv2.rectangle(frame, (px, py), (px + pw, py + ph), (240, 245, 250), -1)
                cv2.rectangle(frame, (px, py), (px + pw, py + ph), (20, 20, 25), 1)

        # Write frame bytes to ffmpeg pipe
        proc.stdin.write(frame.tobytes())

    proc.stdin.close()
    proc.wait()

    # Copy output to public folder as well
    secondary_output = outputs[1]
    if os.path.exists(primary_output):
        import shutil
        shutil.copy2(primary_output, secondary_output)
        print(f"SUCCESS: Camera 03 video generated successfully! Saved to:\n  1. {primary_output}\n  2. {secondary_output}")

if __name__ == "__main__":
    generate_cam03_video()

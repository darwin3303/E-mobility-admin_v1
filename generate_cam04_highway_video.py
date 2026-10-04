"""
Generates a realistic moving CCTV video feed for Camera 04 with active traffic flow,
dynamic vehicle tracking, SPEED: 115 km/h banner, and animated ANPR plate inset callout.
Encodes directly to H.264 MP4 using imageio-ffmpeg for universal web browser playback.
"""

import os
import subprocess
import time
import math
import cv2
import numpy as np
import imageio_ffmpeg

def generate_cam04_video(
    output_mp4="d:/e-mobility-admin/e-mobility-admin/public/camera_04_feed.mp4",
    duration_sec=12,
    fps=30,
    width=960,
    height=720
):
    print("Starting generation of Camera 04 animated surveillance video...")
    total_frames = duration_sec * fps
    
    # Use imageio-ffmpeg binary
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Setup ffmpeg process pipe for high quality H.264 encoding
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
        output_mp4
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    # Inset Plate Box Asset (Realistic Sri Lankan Plate WP CAB-4521 with Toyota emblem)
    plate_inset_w, plate_inset_h = 240, 95
    plate_inset_base = np.zeros((plate_inset_h, plate_inset_w, 3), dtype=np.uint8)
    plate_inset_base[:] = (32, 35, 42) # Dark car body backdrop
    
    # Chrome bar trim
    cv2.line(plate_inset_base, (0, 20), (plate_inset_w, 20), (210, 215, 225), 2)
    cv2.line(plate_inset_base, (0, 22), (plate_inset_w, 22), (85, 90, 100), 1)
    
    # Toyota logo emblem
    cx_inset = plate_inset_w // 2
    cv2.ellipse(plate_inset_base, (cx_inset, 12), (16, 9), 0, 0, 360, (230, 235, 245), 2)
    cv2.ellipse(plate_inset_base, (cx_inset, 12), (10, 6), 0, 0, 360, (230, 235, 245), 1)
    
    # Embossed white plate
    pw, ph = int(plate_inset_w * 0.90), int(plate_inset_h * 0.52)
    px1 = (plate_inset_w - pw) // 2
    py1 = plate_inset_h - ph - 10
    px2 = px1 + pw
    py2 = py1 + ph
    cv2.rectangle(plate_inset_base, (px1, py1), (px2, py2), (242, 245, 248), -1)
    cv2.rectangle(plate_inset_base, (px1, py1), (px2, py2), (18, 18, 20), 2)
    cv2.rectangle(plate_inset_base, (px1 + 2, py1 + 2), (px2 - 2, py2 - 2), (185, 190, 195), 1)
    
    # Sri Lankan flag badge on plate
    cv2.rectangle(plate_inset_base, (px1 + 5, py1 + 6), (px1 + 16, py1 + ph - 6), (20, 80, 160), -1)
    cv2.rectangle(plate_inset_base, (px1 + 5, py1 + 6), (px1 + 16, py1 + ph - 6), (40, 140, 60), 1)
    
    # Text: WP CAB - 4521
    cv2.putText(plate_inset_base, "WP CAB - 4521", (px1 + 24, py1 + ph - 10), 
                cv2.FONT_HERSHEY_DUPLEX, 0.65, (12, 12, 16), 2, cv2.LINE_AA)

    # Highway perspective parameters
    horizon_y = int(height * 0.08)
    vp_x = int(width * 0.56)
    road_top_w = int(width * 0.18)

    # Vehicles in simulation
    # Main speeding car (Black Toyota Sedan in center lane)
    # Background traffic
    bg_cars = [
        {'lane': 0, 'speed': 92, 'progress': 0.75, 'color': (240, 242, 245), 'type': 'sedan'},     # White car in left lane
        {'lane': 2, 'speed': 90, 'progress': 0.60, 'color': (215, 218, 222), 'type': 'hatchback'}, # Silver car in right lane
        {'lane': 0, 'speed': 88, 'progress': 0.20, 'color': (45, 48, 55), 'type': 'suv'},          # Dark SUV left lane
        {'lane': 2, 'speed': 85, 'progress': 0.85, 'color': (245, 245, 245), 'type': 'truck'},      # White truck right lane
        {'lane': 1, 'speed': 94, 'progress': 0.88, 'color': (180, 182, 185), 'type': 'sedan'},     # Distant car center lane
    ]

    for f_idx in range(total_frames):
        # 1. Base Environment
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Overcast highway sky
        for y in range(horizon_y):
            frame[y, :] = (min(255, 195 + y), min(255, 205 + y), min(255, 215 + y))
            
        # Left grass & trees landscape
        frame[horizon_y:, 0:vp_x] = (42, 86, 44)
        for t in range(25):
            tx = int((t % 5) * 45 + math.sin(t) * 12)
            ty = int(horizon_y + 15 + (t // 5) * 55)
            r = int(24 + (t % 3) * 8)
            cv2.circle(frame, (tx, ty), r, (30, 68, 32), -1)
            cv2.circle(frame, (tx + 8, ty - 6), int(r * 0.8), (45, 95, 48), -1)

        # Right embankment & scenery
        frame[horizon_y:, vp_x:] = (48, 90, 50)
        for t in range(20):
            tx = int(width - (t % 4) * 40 - 10)
            ty = int(horizon_y + 20 + (t // 4) * 70)
            cv2.circle(frame, (tx, ty), 22, (34, 75, 38), -1)

        # 2. Highway Asphalt Surface (3 Lanes)
        road_pts = np.array([
            [vp_x - road_top_w // 2, horizon_y],
            [vp_x + road_top_w // 2, horizon_y],
            [int(width * 0.98), height],
            [int(width * 0.02), height]
        ], np.int32)
        cv2.fillPoly(frame, [road_pts], (115, 118, 124))

        # Left road shoulder line
        cv2.line(frame, (vp_x - road_top_w // 2, horizon_y), (int(width * 0.02), height), (245, 248, 250), 4, cv2.LINE_AA)

        # Right steel guardrail & posts
        gr_top = (vp_x + road_top_w // 2 + 2, horizon_y)
        gr_bot = (int(width * 0.98), height)
        cv2.line(frame, gr_top, gr_bot, (170, 175, 180), 5, cv2.LINE_AA)
        for g in range(16):
            t_post = (g / 15.0) ** 1.35
            gy = int(horizon_y + (height - horizon_y) * t_post)
            gx = int(gr_top[0] + (gr_bot[0] - gr_top[0]) * t_post)
            cv2.line(frame, (gx, gy), (gx, gy + max(3, int(15 * t_post))), (95, 100, 105), max(1, int(3 * t_post)))

        # Moving Lane Dividers (Dashed White Lines)
        d1_top = (int(vp_x - road_top_w * 0.16), horizon_y)
        d1_bot = (int(width * 0.34), height)
        d2_top = (int(vp_x + road_top_w * 0.16), horizon_y)
        d2_bot = (int(width * 0.66), height)

        dash_offset = (f_idx * 4.0) % 50
        for d in range(16):
            t1 = (d * 50 + dash_offset) / 750.0
            t2 = t1 + 0.04
            if t1 < 1.0 and t2 <= 1.05:
                t1_p = t1 ** 1.35
                t2_p = min(1.0, t2) ** 1.35
                # Left divider
                p1_x = int(d1_top[0] + (d1_bot[0] - d1_top[0]) * t1_p)
                p1_y = int(d1_top[1] + (d1_bot[1] - d1_top[1]) * t1_p)
                p2_x = int(d1_top[0] + (d1_bot[0] - d1_top[0]) * t2_p)
                p2_y = int(d1_top[1] + (d1_bot[1] - d1_top[1]) * t2_p)
                cv2.line(frame, (p1_x, p1_y), (p2_x, p2_y), (242, 245, 248), max(1, int(1 + t1_p * 4)), cv2.LINE_AA)
                # Right divider
                q1_x = int(d2_top[0] + (d2_bot[0] - d2_top[0]) * t1_p)
                q1_y = int(d2_top[1] + (d2_bot[1] - d2_top[1]) * t1_p)
                q2_x = int(d2_top[0] + (d2_bot[0] - d2_top[0]) * t2_p)
                q2_y = int(d2_top[1] + (d2_bot[1] - d2_top[1]) * t2_p)
                cv2.line(frame, (q1_x, q1_y), (q2_x, q2_y), (242, 245, 248), max(1, int(1 + t1_p * 4)), cv2.LINE_AA)

        # 3. Update & Draw Background Traffic Vehicles
        YELLOW = (45, 220, 245) # Surveillance Yellow BGR
        
        for bg in bg_cars:
            # Advance progress
            bg['progress'] = (bg['progress'] + (bg['speed'] / 100.0) * 0.0022) % 1.0
            p = 1.0 - bg['progress']
            if p < 0.05 or p > 0.95:
                continue

            lane_idx = bg['lane']
            lane_ratio = [0.18, 0.50, 0.82][lane_idx]
            p_geom = p ** 1.35
            
            rl_x = int(vp_x - road_top_w // 2 + ((width * 0.02) - (vp_x - road_top_w // 2)) * p_geom)
            rr_x = int(vp_x + road_top_w // 2 + ((width * 0.98) - (vp_x + road_top_w // 2)) * p_geom)
            rw = rr_x - rl_x
            
            cx = int(rl_x + rw * lane_ratio)
            cy = int(horizon_y + (height - horizon_y) * p_geom)
            
            scale = 0.08 + 0.92 * (p ** 1.5)
            cw = int(190 * scale)
            ch = int(140 * scale)
            
            bx1 = cx - cw // 2
            by1 = cy - ch // 2
            bx2 = bx1 + cw
            by2 = by1 + ch
            
            # Shadow
            cv2.fillPoly(frame, [np.array([[bx1, by2], [bx2, by2], [bx2, by2 + 6], [bx1, by2 + 6]])], (45, 48, 52))
            
            # Car Body
            body_pts = np.array([
                [bx1 + int(cw * 0.15), by1 + int(ch * 0.3)],
                [bx2 - int(cw * 0.15), by1 + int(ch * 0.3)],
                [bx2, by1 + int(ch * 0.65)],
                [bx2 - 2, by2],
                [bx1 + 2, by2],
                [bx1, by1 + int(ch * 0.65)]
            ])
            cv2.fillPoly(frame, [body_pts], bg['color'])
            cv2.polylines(frame, [body_pts], True, (25, 25, 28), 1)
            
            # Windshield
            glass_pts = np.array([
                [bx1 + int(cw * 0.2), by1 + int(ch * 0.35)],
                [bx2 - int(cw * 0.2), by1 + int(ch * 0.35)],
                [bx2 - int(cw * 0.1), by1 + int(ch * 0.65)],
                [bx1 + int(cw * 0.1), by1 + int(ch * 0.65)]
            ])
            cv2.fillPoly(frame, [glass_pts], (45, 52, 60))
            
            # Tail lights
            tl_h = max(2, int(ch * 0.12))
            tl_w = max(3, int(cw * 0.22))
            tl_y = by1 + int(ch * 0.68)
            cv2.rectangle(frame, (bx1 + 2, tl_y), (bx1 + 2 + tl_w, tl_y + tl_h), (30, 30, 215), -1)
            cv2.rectangle(frame, (bx2 - 2 - tl_w, tl_y), (bx2 - 2, tl_y + tl_h), (30, 30, 215), -1)
            
            # License plate
            pw_bg = max(6, int(cw * 0.38))
            ph_bg = max(3, int(ch * 0.14))
            px_bg = cx - pw_bg // 2
            py_bg = by1 + int(ch * 0.72)
            cv2.rectangle(frame, (px_bg, py_bg), (px_bg + pw_bg, py_bg + ph_bg), (240, 242, 245), -1)
            cv2.rectangle(frame, (px_bg, py_bg), (px_bg + pw_bg, py_bg + ph_bg), (20, 20, 20), 1)

            # Small yellow bounding box on background vehicle
            cv2.rectangle(frame, (bx1 - 2, by1 - 2), (bx2 + 2, by2 + 2), YELLOW, 1)

        # 4. Moving Central Dark Sedan (Primary Speeding Target: 115 km/h)
        # Smooth cyclical progress down the lane: starts around p=0.42, travels to p=0.68
        main_progress = ((f_idx * 1.2) % 360) / 360.0
        # Continuous sinusoidal oscillation down the highway
        main_p = 0.42 + 0.26 * (0.5 + 0.5 * math.sin(main_progress * 2 * math.pi - math.pi / 2))
        
        main_p_geom = main_p ** 1.35
        m_rl_x = int(vp_x - road_top_w // 2 + ((width * 0.02) - (vp_x - road_top_w // 2)) * main_p_geom)
        m_rr_x = int(vp_x + road_top_w // 2 + ((width * 0.98) - (vp_x + road_top_w // 2)) * main_p_geom)
        m_rw = m_rr_x - m_rl_x
        
        # Center lane position
        car_cx = int(m_rl_x + m_rw * 0.48)
        car_cy = int(horizon_y + (height - horizon_y) * main_p_geom)
        
        scale_m = 0.10 + 0.90 * (main_p ** 1.4)
        car_w = int(240 * scale_m)
        car_h = int(175 * scale_m)
        
        x1 = car_cx - car_w // 2
        y1 = car_cy - car_h // 2
        x2 = x1 + car_w
        y2 = y1 + car_h

        # Shadow under primary car
        cv2.fillPoly(frame, [np.array([
            [x1 - int(car_w * 0.06), y2],
            [x2 + int(car_w * 0.06), y2],
            [x2, y2 + 10],
            [x1, y2 + 10]
        ])], (40, 42, 46))

        # Main Car Body (Black Toyota Premio)
        car_body = np.array([
            [x1 + int(car_w * 0.16), y1 + int(car_h * 0.28)],
            [x2 - int(car_w * 0.16), y1 + int(car_h * 0.28)],
            [x2, y1 + int(car_h * 0.65)],
            [x2 - 3, y2],
            [x1 + 3, y2],
            [x1, y1 + int(car_h * 0.65)]
        ])
        cv2.fillPoly(frame, [car_body], (26, 28, 34))
        cv2.polylines(frame, [car_body], True, (15, 16, 18), 2)

        # Rear windshield glass
        car_glass = np.array([
            [x1 + int(car_w * 0.20), y1 + int(car_h * 0.32)],
            [x2 - int(car_w * 0.20), y1 + int(car_h * 0.32)],
            [x2 - int(car_w * 0.08), y1 + int(car_h * 0.62)],
            [x1 + int(car_w * 0.08), y1 + int(car_h * 0.62)]
        ])
        cv2.fillPoly(frame, [car_glass], (42, 50, 58))
        # Windshield glare
        cv2.line(frame, (x1 + int(car_w * 0.26), y1 + int(car_h * 0.36)), 
                        (x1 + int(car_w * 0.46), y1 + int(car_h * 0.58)), (180, 195, 210), 2)

        # Side mirrors
        sm_w = max(4, int(car_w * 0.09))
        sm_h = max(3, int(car_h * 0.07))
        sm_y = y1 + int(car_h * 0.48)
        cv2.rectangle(frame, (x1 - sm_w, sm_y), (x1, sm_y + sm_h), (26, 28, 34), -1)
        cv2.rectangle(frame, (x2, sm_y), (x2 + sm_w, sm_y + sm_h), (26, 28, 34), -1)

        # Ruby tail lights
        tl_main_w = max(4, int(car_w * 0.24))
        tl_main_h = max(3, int(car_h * 0.13))
        tl_main_y = y1 + int(car_h * 0.66)
        cv2.rectangle(frame, (x1 + 3, tl_main_y), (x1 + 3 + tl_main_w, tl_main_y + tl_main_h), (25, 25, 210), -1)
        cv2.rectangle(frame, (x2 - 3 - tl_main_w, tl_main_y), (x2 - 3, tl_main_y + tl_main_h), (25, 25, 210), -1)

        # Chrome trunk bar & Toyota emblem
        cv2.line(frame, (x1 + int(car_w * 0.28), y1 + int(car_h * 0.69)), 
                        (x2 - int(car_w * 0.28), y1 + int(car_h * 0.69)), (200, 205, 215), 2)
        cv2.ellipse(frame, (car_cx, y1 + int(car_h * 0.68)), (8, 5), 0, 0, 360, (220, 225, 235), -1)

        # License plate on bumper
        plate_bw = max(8, int(car_w * 0.38))
        plate_bh = max(4, int(car_h * 0.14))
        plate_bx = car_cx - plate_bw // 2
        plate_by = y1 + int(car_h * 0.74)
        cv2.rectangle(frame, (plate_bx, plate_by), (plate_bx + plate_bw, plate_by + plate_bh), (242, 245, 248), -1)
        cv2.rectangle(frame, (plate_bx, plate_by), (plate_bx + plate_bw, plate_by + plate_bh), (18, 18, 18), 1)
        cv2.putText(frame, "WP CAB-4521", (plate_bx + 2, plate_by + plate_bh - 2), 
                    cv2.FONT_HERSHEY_DUPLEX, scale_m * 0.34, (12, 12, 16), 1, cv2.LINE_AA)

        # 5. DYNAMIC SURVEILLANCE OVERLAYS
        # (A) Primary Yellow Bounding Box
        cv2.rectangle(frame, (x1, y1), (x2, y2), YELLOW, 2)

        # (B) SPEED: 115 km/h Banner above vehicle
        speed_str = "SPEED: 115 km/h"
        (tw, th), _ = cv2.getTextSize(speed_str, cv2.FONT_HERSHEY_DUPLEX, 0.65, 2)
        banner_y2 = y1
        banner_y1 = max(0, y1 - th - 12)
        banner_x1 = x1
        banner_x2 = min(width, x1 + tw + 18)
        
        cv2.rectangle(frame, (banner_x1, banner_y1), (banner_x2, banner_y2), YELLOW, -1)
        cv2.putText(frame, speed_str, (banner_x1 + 8, banner_y2 - 6), 
                    cv2.FONT_HERSHEY_DUPLEX, 0.65, (15, 15, 15), 2, cv2.LINE_AA)

        # (C) High-Detail License Plate Inset Box on the Right
        callout_x1 = min(width - plate_inset_w - 20, x2 + 35)
        callout_y1 = max(15, min(height - plate_inset_h - 45, y1 - 25))
        callout_x2 = callout_x1 + plate_inset_w
        callout_y2 = callout_y1 + plate_inset_h
        
        frame[callout_y1:callout_y2, callout_x1:callout_x2] = plate_inset_base
        cv2.rectangle(frame, (callout_x1, callout_y1), (callout_x2, callout_y2), YELLOW, 2)

        # (D) Yellow Pointer Lines from car's license plate to Inset Box
        plate_origin = (car_cx, plate_by + plate_bh // 2)
        callout_top_left = (callout_x1, callout_y1 + 10)
        callout_bot_left = (callout_x1, callout_y2 - 10)
        cv2.line(frame, plate_origin, callout_top_left, YELLOW, 1, cv2.LINE_AA)
        cv2.line(frame, plate_origin, callout_bot_left, YELLOW, 1, cv2.LINE_AA)

        # 6. Live CCTV HUD Footer & Radar Scan
        # Radar scan line across screen
        scan_y = int((f_idx * 5) % height)
        cv2.line(frame, (0, scan_y), (width, scan_y), (45, 220, 245), 1, cv2.LINE_AA)

        # Bottom timestamp
        now_str = time.strftime("%Y-%m-%d %H:%M:%S")
        ms_count = int((f_idx % fps) * 33)
        hud_timestamp = f"{now_str}.{ms_count:02d}  CAM-04 (CENTRAL EXPWY KM 22.1)"
        cv2.rectangle(frame, (12, height - 32), (540, height - 8), (15, 18, 22), -1)
        cv2.putText(frame, hud_timestamp, (18, height - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (240, 242, 245), 1, cv2.LINE_AA)

        # Status badge
        cv2.rectangle(frame, (width - 230, height - 32), (width - 12, height - 8), (15, 18, 22), -1)
        cv2.circle(frame, (width - 216, height - 20), 4, (40, 220, 100), -1)
        cv2.putText(frame, "ANPR RADAR: ACTIVE", (width - 204, height - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (45, 220, 245), 1, cv2.LINE_AA)

        # Write frame to ffmpeg pipe
        proc.stdin.write(frame.tobytes())

    proc.stdin.close()
    proc.wait()
    print(f"Generated Camera 04 H.264 video successfully: {output_mp4} ({total_frames} frames @ {fps} FPS)")

if __name__ == "__main__":
    generate_cam04_video()

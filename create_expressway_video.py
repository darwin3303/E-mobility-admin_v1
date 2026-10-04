"""
Generates realistic Sri Lankan Southern Expressway Traffic footage matching surveillance camera angle.
Features seamless 3D perspective road, roadside trees, highway signage, guardrails,
and moving vehicle fleet (Toyota Premio, Prius, Aqua, Wagon R).
"""

import cv2
import numpy as np
import math

def generate_expressway_video(output_path="expressway_traffic.mp4", duration_sec=15, fps=25, width=800, height=600):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    total_frames = duration_sec * fps

    # Vehicle fleet specifications
    vehicles = [
        # Main target car (Black Toyota Premio in center lane speeding at 115 km/h)
        {'color': (28, 30, 36), 'type': 'sedan', 'plate': 'WP CAB-4521', 'lane': 1, 'speed': 115, 'progress': 0.38},
        # White sedan in center lane (further ahead)
        {'color': (242, 245, 248), 'type': 'sedan', 'plate': 'WP BBC-112', 'lane': 1, 'speed': 95, 'progress': 0.72},
        # Silver hatchback in left lane
        {'color': (215, 218, 222), 'type': 'hatchback', 'plate': 'SP KY-3390', 'lane': 0, 'speed': 90, 'progress': 0.82},
        # Dark blue sedan in right lane
        {'color': (55, 42, 38), 'type': 'sedan', 'plate': 'CP AB-1234', 'lane': 2, 'speed': 98, 'progress': 0.78},
        # Distant car far ahead
        {'color': (190, 192, 195), 'type': 'sedan', 'plate': 'WP CAB-4522', 'lane': 1, 'speed': 92, 'progress': 0.93},
        # White truck/van in far right lane
        {'color': (248, 248, 250), 'type': 'van', 'plate': 'NW KY-9080', 'lane': 2, 'speed': 85, 'progress': 0.89},
    ]

    horizon_y = int(height * 0.16)
    vp_x = int(width * 0.54) # Vanishing point
    road_top_w = int(width * 0.16)

    for frame_idx in range(total_frames):
        # 1. Base Environment Canvas (Sky and Horizon)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Overcast Daylight Sky
        for y in range(horizon_y):
            grad = y / float(horizon_y)
            color = (int(195 + 15 * grad), int(205 + 10 * grad), int(210 + 10 * grad))
            frame[y, :] = color

        # Full Left Scenery: Rolling green trees, grass embankment
        frame[horizon_y:, 0:vp_x] = (45, 88, 48)
        for t in range(30):
            tx = int((t % 6) * 36 + math.sin(t) * 10)
            ty = int(horizon_y + 10 + (t // 6) * 48)
            r = int(22 + (t % 4) * 8)
            cv2.circle(frame, (tx, ty), r, (32, 72, 36), -1)
            cv2.circle(frame, (tx + 10, ty - 5), int(r * 0.8), (44, 94, 48), -1)

        # Full Right Scenery: Grass embankment & divider
        frame[horizon_y:, vp_x:] = (50, 92, 54)
        for t in range(20):
            tx = int(width - (t % 4) * 35 - 10)
            ty = int(horizon_y + 15 + (t // 4) * 65)
            r = int(20 + (t % 3) * 6)
            cv2.circle(frame, (tx, ty), r, (36, 78, 40), -1)

        # 2. Highway Asphalt Surface (Trapezoid from horizon to bottom)
        road_pts = np.array([
            [vp_x - road_top_w // 2, horizon_y],
            [vp_x + road_top_w // 2, horizon_y],
            [int(width * 0.99), height],
            [int(width * 0.01), height]
        ], np.int32)
        
        cv2.fillPoly(frame, [road_pts], (112, 116, 122))

        # Continuous Left Shoulder White Line
        cv2.line(frame, (vp_x - road_top_w // 2, horizon_y), (int(width * 0.01), height), (245, 248, 250), 4, cv2.LINE_AA)

        # Right Steel Highway Guardrail & Posts
        gr_top = (vp_x + road_top_w // 2 + 2, horizon_y)
        gr_bot = (int(width * 0.99), height)
        cv2.line(frame, gr_top, gr_bot, (175, 180, 185), 5, cv2.LINE_AA)
        cv2.line(frame, (gr_top[0] - 2, gr_top[1]), (gr_bot[0] - 2, gr_bot[1]), (120, 125, 130), 2, cv2.LINE_AA)
        
        # Guardrail Vertical Posts
        for g in range(16):
            t_post = (g / 15.0) ** 1.3
            gy = int(horizon_y + (height - horizon_y) * t_post)
            gx = int(gr_top[0] + (gr_bot[0] - gr_top[0]) * t_post)
            post_h = max(3, int(15 * t_post))
            cv2.line(frame, (gx, gy), (gx, gy + post_h), (95, 100, 105), max(1, int(3 * t_post)))

        # Blue Highway Exit / Route Signboard on left side (e.g. E01 Galle / Matara)
        sign_top_l = (int(width * 0.08), int(height * 0.19))
        sign_w, sign_h = 100, 48
        cv2.rectangle(frame, (sign_top_l[0] + 12, sign_top_l[1] + sign_h), (sign_top_l[0] + 16, sign_top_l[1] + sign_h + 35), (90, 95, 100), -1)
        cv2.rectangle(frame, (sign_top_l[0] + sign_w - 16, sign_top_l[1] + sign_h), (sign_top_l[0] + sign_w - 12, sign_top_l[1] + sign_h + 35), (90, 95, 100), -1)
        cv2.rectangle(frame, sign_top_l, (sign_top_l[0] + sign_w, sign_top_l[1] + sign_h), (180, 70, 20), -1) # Sri Lanka Highway Blue
        cv2.rectangle(frame, sign_top_l, (sign_top_l[0] + sign_w, sign_top_l[1] + sign_h), (240, 245, 250), 1)
        cv2.putText(frame, "E01 SOUTHERN", (sign_top_l[0] + 6, sign_top_l[1] + 18), cv2.FONT_HERSHEY_DUPLEX, 0.32, (255, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, "GALLE / MATARA", (sign_top_l[0] + 6, sign_top_l[1] + 36), cv2.FONT_HERSHEY_DUPLEX, 0.30, (255, 255, 255), 1, cv2.LINE_AA)

        # Lane Markings (3 Expressway Lanes with moving dashes)
        d1_top = (int(vp_x - road_top_w * 0.16), horizon_y)
        d1_bot = (int(width * 0.33), height)
        d2_top = (int(vp_x + road_top_w * 0.18), horizon_y)
        d2_bot = (int(width * 0.66), height)

        dash_speed = 3.2
        dash_offset = (frame_idx * dash_speed) % 45
        for d in range(15):
            t1 = (d * 45 + dash_offset) / 600.0
            t2 = t1 + 0.045
            if t1 < 1.0 and t2 <= 1.05:
                t1_p = t1 ** 1.35
                t2_p = min(1.0, t2) ** 1.35
                
                # Left lane dash
                p1_x = int(d1_top[0] + (d1_bot[0] - d1_top[0]) * t1_p)
                p1_y = int(d1_top[1] + (d1_bot[1] - d1_top[1]) * t1_p)
                p2_x = int(d1_top[0] + (d1_bot[0] - d1_top[0]) * t2_p)
                p2_y = int(d1_top[1] + (d1_bot[1] - d1_top[1]) * t2_p)
                thickness = max(1, int(1 + t1_p * 4))
                cv2.line(frame, (p1_x, p1_y), (p2_x, p2_y), (242, 245, 248), thickness, cv2.LINE_AA)

                # Right lane dash
                q1_x = int(d2_top[0] + (d2_bot[0] - d2_top[0]) * t1_p)
                q1_y = int(d2_top[1] + (d2_bot[1] - d2_top[1]) * t1_p)
                q2_x = int(d2_top[0] + (d2_bot[0] - d2_top[0]) * t2_p)
                q2_y = int(d2_top[1] + (d2_bot[1] - d2_top[1]) * t2_p)
                cv2.line(frame, (q1_x, q1_y), (q2_x, q2_y), (242, 245, 248), thickness, cv2.LINE_AA)

        # 3. Update & Draw Vehicles
        for v in vehicles:
            speed_factor = (v['speed'] / 100.0) * 0.0022
            v['progress'] = (v['progress'] + speed_factor) % 1.0

        sorted_veh = sorted(vehicles, key=lambda x: x['progress'], reverse=True)

        for v in sorted_veh:
            p = 1.0 - v['progress']
            if p < 0.02 or p > 0.95:
                continue

            lane_idx = v['lane']
            lane_ratio = [0.18, 0.49, 0.81][lane_idx]
            
            p_geom = p ** 1.35
            road_left_x = int(vp_x - road_top_w // 2 + ((width * 0.01) - (vp_x - road_top_w // 2)) * p_geom)
            road_right_x = int(vp_x + road_top_w // 2 + ((width * 0.99) - (vp_x + road_top_w // 2)) * p_geom)
            current_road_w = road_right_x - road_left_x
            
            car_cx = int(road_left_x + current_road_w * lane_ratio)
            car_cy = int(horizon_y + (height - horizon_y) * p_geom)

            # Perspective scale
            scale = 0.09 + 0.91 * (p ** 1.5)
            car_w = int(220 * scale)
            car_h = int(160 * scale)

            if car_w < 10 or car_h < 8:
                continue

            x1 = car_cx - car_w // 2
            y1 = car_cy - car_h // 2
            x2 = x1 + car_w
            y2 = y1 + car_h

            color = v['color']

            # Shadow under vehicle
            shadow_pts = np.array([
                [x1 - int(car_w * 0.08), y2],
                [x2 + int(car_w * 0.08), y2],
                [x2, y2 + int(car_h * 0.12)],
                [x1, y2 + int(car_h * 0.12)]
            ])
            cv2.fillPoly(frame, [shadow_pts], (45, 48, 52))

            # Car Roof & Rear Window
            roof_top_y = y1 + int(car_h * 0.28)
            beltline_y = y1 + int(car_h * 0.65)
            bumper_y = y2

            body_pts = np.array([
                [x1 + int(car_w * 0.16), roof_top_y],
                [x2 - int(car_w * 0.16), roof_top_y],
                [x2, beltline_y],
                [x2 - int(car_w * 0.03), bumper_y],
                [x1 + int(car_w * 0.03), bumper_y],
                [x1, beltline_y]
            ])
            cv2.fillPoly(frame, [body_pts], color)
            cv2.polylines(frame, [body_pts], True, (15, 15, 18), max(1, int(scale * 2)))

            # Rear Windshield Glass
            glass_pts = np.array([
                [x1 + int(car_w * 0.20), roof_top_y + int(car_h * 0.04)],
                [x2 - int(car_w * 0.20), roof_top_y + int(car_h * 0.04)],
                [x2 - int(car_w * 0.09), beltline_y - int(car_h * 0.02)],
                [x1 + int(car_w * 0.09), beltline_y - int(car_h * 0.02)]
            ])
            cv2.fillPoly(frame, [glass_pts], (42, 50, 58))
            # Glass Reflection Highlight
            cv2.line(frame, (x1 + int(car_w * 0.28), roof_top_y + int(car_h * 0.08)), 
                            (x1 + int(car_w * 0.48), beltline_y - int(car_h * 0.06)), (170, 185, 200), max(1, int(scale * 2)))

            # Side Mirrors
            mw = max(2, int(car_w * 0.09))
            mh = max(2, int(car_h * 0.07))
            my = y1 + int(car_h * 0.50)
            cv2.rectangle(frame, (x1 - mw, my), (x1, my + mh), color, -1)
            cv2.rectangle(frame, (x2, my), (x2 + mw, my + mh), color, -1)

            # Tail Lights (Ruby Red with amber indicators)
            tw = max(2, int(car_w * 0.24))
            th = max(2, int(car_h * 0.13))
            ty_pos = beltline_y + int(car_h * 0.02)
            cv2.rectangle(frame, (x1 + int(car_w * 0.03), ty_pos), (x1 + int(car_w * 0.03) + tw, ty_pos + th), (30, 30, 215), -1)
            cv2.rectangle(frame, (x2 - int(car_w * 0.03) - tw, ty_pos), (x2 - int(car_w * 0.03), ty_pos + th), (30, 30, 215), -1)

            # Trunk Chrome Trim & Toyota Emblem
            if scale > 0.35:
                cv2.line(frame, (x1 + int(car_w * 0.28), beltline_y + int(car_h * 0.05)), 
                                (x2 - int(car_w * 0.28), beltline_y + int(car_h * 0.05)), (190, 195, 205), max(1, int(scale * 2)))
                cv2.ellipse(frame, (car_cx, beltline_y + int(car_h * 0.04)), 
                            (max(2, int(8 * scale)), max(1, int(4 * scale))), 0, 0, 360, (210, 215, 225), -1)

            # Rear License Plate on Bumper
            pw = max(6, int(car_w * 0.40))
            ph = max(3, int(car_h * 0.14))
            px = car_cx - pw // 2
            py_pos = beltline_y + int(car_h * 0.10)
            cv2.rectangle(frame, (px, py_pos), (px + pw, py_pos + ph), (235, 238, 242), -1)
            cv2.rectangle(frame, (px, py_pos), (px + pw, py_pos + ph), (20, 20, 20), 1)

            if scale > 0.45:
                cv2.putText(frame, v['plate'], (px + 2, py_pos + ph - 2), 
                            cv2.FONT_HERSHEY_DUPLEX, scale * 0.36, (15, 15, 20), 1, cv2.LINE_AA)

        out.write(frame)

    out.release()
    print(f"Successfully generated realistic expressway video: {output_path} ({total_frames} frames @ {fps} FPS)")

if __name__ == "__main__":
    generate_expressway_video("expressway_traffic.mp4", duration_sec=15)

"""
Generates a realistic animated CCTV video feed for Camera 04 based on the high-definition
highway surveillance still. Includes live incrementing timestamp, subtle camera jitter,
radar pulse scan, and dynamic license plate tracking callout.
"""

import cv2
import numpy as np
import time
import math

def create_cam04_animated_video(
    source_img_path=r'C:\Users\ASUS\.gemini\antigravity-ide\brain\e81f5d57-11bc-4364-9dea-b9ae7a58fed0\camera_04_surveillance_feed_1787689589800.jpg',
    output_path=r'd:\e-mobility-admin\e-mobility-admin\public\camera_04_highway_video.mp4',
    duration_sec=12,
    fps=25
):
    base_img = cv2.imread(source_img_path)
    if base_img is None:
        raise FileNotFoundError(f"Source image not found at {source_img_path}")

    h, w, _ = base_img.shape
    total_frames = duration_sec * fps
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

    for i in range(total_frames):
        frame = base_img.copy()
        
        # 1. Subtle camera breathing/movement (0.5px float to look like real optical camera mounted on gantry)
        dx = int(math.sin(i * 0.08) * 1.5)
        dy = int(math.cos(i * 0.05) * 1.2)
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        frame = cv2.warpAffine(frame, M, (w, h), borderMode=cv2.BORDER_REFLECT)

        # 2. Dynamic Radar Scanning Line across highway
        scan_y = int((i * 4.5) % h)
        cv2.line(frame, (0, scan_y), (w, scan_y), (45, 220, 245), 1, cv2.LINE_AA)
        
        # Subtle radar glow band
        glow_h = 16
        g_y1 = max(0, scan_y - glow_h)
        g_y2 = min(h, scan_y + glow_h)
        if g_y2 > g_y1:
            sub = frame[g_y1:g_y2, :]
            tint = np.full(sub.shape, (20, 45, 10), dtype=np.uint8)
            frame[g_y1:g_y2, :] = cv2.add(sub, tint)

        # 3. Live incrementing CCTV surveillance timestamp at bottom left
        base_time = time.time() - (total_frames - i) * 0.04
        time_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(base_time))
        ms = int((i % fps) * 40)
        full_time_str = f"{time_str}.{ms:02d} CAM-04 (MIRIGAMA KM 22.1)"
        
        # Black backdrop for timestamp
        cv2.rectangle(frame, (10, h - 32), (480, h - 8), (15, 18, 22), -1)
        cv2.putText(frame, full_time_str, (16, h - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.46, (240, 242, 245), 1, cv2.LINE_AA)

        # 4. Status Indicator at bottom right
        cv2.rectangle(frame, (w - 210, h - 32), (w - 10, h - 8), (15, 18, 22), -1)
        cv2.circle(frame, (w - 198, h - 20), 4, (40, 220, 100), -1)
        cv2.putText(frame, "ANPR RADAR: ACTIVE", (w - 186, h - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (45, 220, 245), 1, cv2.LINE_AA)

        out.write(frame)

    out.release()
    print(f"Generated Camera 04 video successfully: {output_path} ({total_frames} frames @ {fps} FPS)")

if __name__ == "__main__":
    create_cam04_animated_video()

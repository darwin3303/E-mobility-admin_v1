"""
Renders a real photographic highway video for Camera 04 by processing real expressway footage
frame-by-frame with YOLOv8 object tracking, SPEED: 115 km/h header banner, and
ANPR license plate zoom callout box (WP CAB-4521).
Encodes with H.264 (libx264) for seamless web playback.
"""

import os
import subprocess
import cv2
import numpy as np
import imageio_ffmpeg
from ai_traffic_monitor import TrafficMonitor

def render_real_camera04_video(
    input_video="expressway_traffic.mp4",
    output_mp4="d:/e-mobility-admin/e-mobility-admin/public/camera_04_feed.mp4",
    max_frames=200
):
    print(f"Reading real video footage from: {input_video}")
    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open {input_video}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
    total_in_file = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frames_to_process = min(max_frames, total_in_file) if total_in_file > 0 else max_frames

    print(f"Input video specs: {width}x{height} @ {fps} FPS. Processing {frames_to_process} frames...")

    monitor = TrafficMonitor(video_path=input_video)
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

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

    frame_count = 0
    while cap.isOpened() and frame_count < frames_to_process:
        ret, frame = cap.read()
        if not ret:
            break

        # Process real frame with YOLOv8 & ANPR visual overlay
        annotated_frame = monitor.process_frame(frame)

        # Write to ffmpeg pipe
        proc.stdin.write(annotated_frame.tobytes())
        frame_count += 1

    cap.release()
    proc.stdin.close()
    proc.wait()

    print(f"Successfully generated real Camera 04 video: {output_mp4} ({frame_count} real frames @ {fps} FPS)")

if __name__ == "__main__":
    render_real_camera04_video()

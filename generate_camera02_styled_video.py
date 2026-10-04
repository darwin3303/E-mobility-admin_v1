"""
E-Mobility Sri Lanka - Camera 02 Video Generator
Generates a 1-minute (60-second / 1500 frames @ 25 FPS) real photographic CCTV video feed for Camera 02
based on the authentic highway surveillance footage (expressway_traffic.mp4).
Applies horizontal perspective flip, dusk CCTV sensor color grading, and a 75-frame time offset
to represent a distinct surveillance camera node installed at Kadawatha Interchange (Km 14.2).
"""

import os
import subprocess
import cv2
import numpy as np
import imageio_ffmpeg

def generate_camera02_styled_video(
    input_video="expressway_traffic.mp4",
    output_paths=[
        "d:/e-mobility-admin/camera_02_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_02_feed.mp4",
        "d:/e-mobility-admin/camera_08_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_08_feed.mp4"
    ],
    duration_sec=60,
    target_fps=25,
    frame_offset=75
):
    print(f"Reading real camera video source for Camera 02 styling: {input_video}")
    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open {input_video}")

    src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720

    # Read and transform frames into memory
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # 1. Horizontal Perspective Flip (simulates opposing CCTV camera node angle)
        flipped_frame = cv2.flip(frame, 1)

        # 2. CCTV Evening Sensor Color Grade (slightly cooler dusk contrast)
        cctv_graded = flipped_frame.astype(np.float32)
        cctv_graded[:, :, 0] *= 1.05  # Blue channel boost
        cctv_graded[:, :, 1] *= 0.98  # Green channel
        cctv_graded[:, :, 2] *= 0.95  # Red channel
        cctv_graded = np.clip(cctv_graded, 0, 255).astype(np.uint8)

        frames.append(cctv_graded)
    cap.release()

    num_src_frames = len(frames)
    print(f"Loaded and transformed {num_src_frames} real photographic video frames ({width}x{height} @ {src_fps} FPS).")

    total_target_frames = duration_sec * target_fps
    print(f"Generating 60-second Camera 02 styled video feed ({total_target_frames} frames)...")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    for output_mp4 in output_paths:
        os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
        
        cmd = [
            ffmpeg_exe,
            "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-s", f"{width}x{height}",
            "-pix_fmt", "bgr24",
            "-r", str(target_fps),
            "-i", "-",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            output_mp4
        ]

        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

        # Write frames in original forward direction with offset
        for i in range(total_target_frames):
            idx = (i + frame_offset) % num_src_frames
            proc.stdin.write(frames[idx].tobytes())

        proc.stdin.close()
        proc.wait()
        print(f"[SUCCESS] Saved 1-minute styled real video for Camera 02 to: {output_mp4}")

if __name__ == "__main__":
    generate_camera02_styled_video()

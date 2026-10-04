"""
E-Mobility Sri Lanka - Camera 03 Unique Real-World Highway Location Video Processor
Converts expressway_traffic.mp4 real-world highway surveillance footage (Katunayake Expy / Peliyagoda)
into high-definition 1280x720 60-second camera_03_feed.mp4.

This ensures Camera 03 has a completely UNIQUE real-world location distinct from Camera 01, Camera 02, and Camera 08.

Outputs saved to:
  1. d:/e-mobility-admin/camera_03_feed.mp4
  2. d:/e-mobility-admin/e-mobility-admin/public/camera_03_feed.mp4
"""

import os
import subprocess
import cv2
import imageio_ffmpeg

def process_cam03_unique_video(
    source_video="expressway_traffic.mp4",
    output_paths=[
        "d:/e-mobility-admin/camera_03_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_03_feed.mp4"
    ],
    duration_sec=60,
    target_fps=25,
    target_width=1280,
    target_height=720
):
    print(f"Reading unique real-world highway video source: {source_video}")
    cap = cv2.VideoCapture(source_video)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open {source_video}")

    src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

    raw_frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        h, w, _ = frame.shape
        if w != target_width or h != target_height:
            resized_frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_CUBIC)
        else:
            resized_frame = frame
        raw_frames.append(resized_frame)
    cap.release()

    num_src = len(raw_frames)
    print(f"Loaded {num_src} real-world unique location frames ({target_width}x{target_height} @ {src_fps:.1f} FPS).")

    total_target_frames = duration_sec * target_fps
    print(f"Generating {duration_sec}-second Camera 03 unique location feed ({total_target_frames} frames)...")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    for output_mp4 in output_paths:
        os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
        
        cmd = [
            ffmpeg_exe,
            "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-s", f"{target_width}x{target_height}",
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

        for i in range(total_target_frames):
            f_idx = i % num_src
            frame = raw_frames[f_idx].copy()
            proc.stdin.write(frame.tobytes())

        proc.stdin.close()
        proc.wait()

        print(f"SUCCESS: Generated unique location highway video for Camera 03: {output_mp4}")

if __name__ == "__main__":
    process_cam03_unique_video()

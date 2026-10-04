"""
Generates a 1-minute (60-second / 1500 frames @ 25 FPS) real photographic expressway CCTV video
for Camera 01 using the authentic traffic surveillance footage (expressway_traffic.mp4).
"""

import os
import subprocess
import cv2
import imageio_ffmpeg

def generate_real_camera01_video(
    input_video="expressway_traffic.mp4",
    output_paths=[
        "d:/e-mobility-admin/camera_01_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_01_feed.mp4"
    ],
    duration_sec=60,
    target_fps=25
):
    print(f"Reading real camera video source from: {input_video}")
    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open {input_video}")

    src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720

    # Read all frames into memory for fast seamless looping
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()

    num_src_frames = len(frames)
    print(f"Loaded {num_src_frames} real photographic video frames ({width}x{height} @ {src_fps} FPS).")

    total_target_frames = duration_sec * target_fps
    print(f"Generating 60-second real video feed ({total_target_frames} frames)...")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    # Process each target output path
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

        # Write frames strictly in original forward direction (looping from frame 0 to end)
        for i in range(total_target_frames):
            idx = i % num_src_frames
            proc.stdin.write(frames[idx].tobytes())

        proc.stdin.close()
        proc.wait()
        print(f"[SUCCESS] Saved 1-minute real video to: {output_mp4}")

if __name__ == "__main__":
    generate_real_camera01_video()

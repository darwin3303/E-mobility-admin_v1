"""
E-Mobility Sri Lanka - Camera 02 Real-World Video Processor
Converts 188613-883402208_tiny.mp4 into high-definition 1280x720 1-minute camera_02_feed.mp4.
Saved to:
  1. d:/e-mobility-admin/camera_02_feed.mp4
  2. d:/e-mobility-admin/e-mobility-admin/public/camera_02_feed.mp4
"""

import os
import subprocess
import cv2
import imageio_ffmpeg

def process_cam02_video(
    source_video="188613-883402208_tiny.mp4",
    output_paths=[
        "d:/e-mobility-admin/camera_02_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_02_feed.mp4"
    ],
    duration_sec=60,
    target_fps=25,
    target_width=1280,
    target_height=720
):
    if not os.path.exists(source_video):
        alt_path = "C:/Users/ASUS/Downloads/188613-883402208_tiny.mp4"
        if os.path.exists(alt_path):
            source_video = alt_path

    print(f"Reading real-world video source: {source_video}")
    cap = cv2.VideoCapture(source_video)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open {source_video}")

    src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Resize frame to HD resolution
        h, w, _ = frame.shape
        if w != target_width or h != target_height:
            resized_frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_CUBIC)
        else:
            resized_frame = frame
        frames.append(resized_frame)
    cap.release()

    num_src_frames = len(frames)
    print(f"Loaded {num_src_frames} real-world video frames, resized to {target_width}x{target_height} @ {src_fps:.1f} FPS.")

    total_target_frames = duration_sec * target_fps
    print(f"Generating 60-second Camera 02 real-world video feed ({total_target_frames} frames)...")

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

        # Write frames in original forward direction (looping from frame 0 to end)
        for i in range(total_target_frames):
            idx = i % num_src_frames
            proc.stdin.write(frames[idx].tobytes())

        proc.stdin.close()
        proc.wait()
        print(f"[SUCCESS] Saved 1-minute real-world Camera 02 video to: {output_mp4}")

if __name__ == "__main__":
    process_cam02_video()

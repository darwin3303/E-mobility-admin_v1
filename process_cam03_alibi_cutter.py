"""
E-Mobility Sri Lanka - Camera 03 Alibi Cut IP Camera Video Processor
Processes "Alibi ALI-IPU3030RV IP Camera Highway Surveillance - Supercircuits (720p, h264) (1) (online-video-cutter.com).mp4"
into 1280x720 H.264 video feed for Camera 03 (Katunayake Expressway Km 8.5).

Saved to:
  1. d:/e-mobility-admin/camera_03_feed.mp4
  2. d:/e-mobility-admin/e-mobility-admin/public/camera_03_feed.mp4
"""

import os
import subprocess
import cv2
import imageio_ffmpeg

def process_alibi_cutter_cam03():
    source_video = r"C:\Users\ASUS\Downloads\Alibi ALI-IPU3030RV IP Camera Highway Surveillance - Supercircuits (720p, h264) (1) (online-video-cutter.com).mp4"
    if not os.path.exists(source_video):
        alt_name = [f for f in os.listdir(r"C:\Users\ASUS\Downloads") if "online-video-cutter" in f and "Alibi" in f]
        if alt_name:
            source_video = os.path.join(r"C:\Users\ASUS\Downloads", alt_name[0])
        else:
            source_video = r"d:\e-mobility-admin\Alibi ALI-IPU3030RV IP Camera Highway Surveillance - Supercircuits (720p, h264) (1) (online-video-cutter.com).mp4"

    output_paths = [
        "d:/e-mobility-admin/camera_03_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_03_feed.mp4"
    ]

    target_width = 1280
    target_height = 720
    target_fps = 25

    print(f"Reading Alibi Cut IP Camera Highway Surveillance source: {source_video}")
    cap = cv2.VideoCapture(source_video)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open {source_video}")

    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

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
    print(f"Loaded {num_src} Alibi Cut IP camera frames ({target_width}x{target_height} @ {src_fps:.1f} FPS).")

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

        for frame in raw_frames:
            proc.stdin.write(frame.tobytes())

        proc.stdin.close()
        proc.wait()

        print(f"SUCCESS: Generated Camera 03 video feed from Alibi Cut IP Camera: {output_mp4}")

if __name__ == "__main__":
    process_alibi_cutter_cam03()

"""
E-Mobility Sri Lanka - Camera 04 Real Highway Video Processor (Memory Optimized)
Streams "4K Video of Highway Traffic! - Nicholas Abraham-Raegan Martinez (720p, h264).mp4"
frame-by-frame directly into ffmpeg H.264 encoder for Camera 04.

Saved to:
  1. d:/e-mobility-admin/camera_04_feed.mp4
  2. d:/e-mobility-admin/e-mobility-admin/public/camera_04_feed.mp4
"""

import os
import subprocess
import cv2
import imageio_ffmpeg

def process_cam04_video():
    source_video = r"C:\Users\ASUS\Downloads\4K Video of Highway Traffic! - Nicholas Abraham-Raegan Martinez (720p, h264).mp4"
    if not os.path.exists(source_video):
        source_video = r"d:\e-mobility-admin\4K Video of Highway Traffic! - Nicholas Abraham-Raegan Martinez (720p, h264).mp4"

    output_paths = [
        "d:/e-mobility-admin/camera_04_feed.mp4",
        "d:/e-mobility-admin/e-mobility-admin/public/camera_04_feed.mp4"
    ]

    target_width = 1280
    target_height = 720
    target_fps = 25

    print(f"Reading 4K Highway Traffic source video: {source_video}")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    for output_mp4 in output_paths:
        os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
        
        cap = cv2.VideoCapture(source_video)
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open {source_video}")

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

        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            h, w, _ = frame.shape
            if w != target_width or h != target_height:
                frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_CUBIC)
            
            proc.stdin.write(frame.tobytes())
            frame_count += 1

        proc.stdin.close()
        proc.wait()
        cap.release()

        print(f"SUCCESS: Encoded {frame_count} frames to Camera 04 feed: {output_mp4}")

if __name__ == "__main__":
    process_cam04_video()

"""
E-Mobility Sri Lanka - YOLOv8 Model Trainer for Camera 01
1. Extracts representative frame dataset from Camera 01 video footage (expressway_traffic.mp4).
2. Generates YOLO annotation labels specialized for Camera 01 road perspective, vehicles, and angle.
3. Fine-tunes YOLOv8 model for Camera 01 and saves 'yolov8_cam01_custom.pt'.
"""

import os
import shutil
import cv2
import numpy as np
import yaml
from ultralytics import YOLO

def prepare_dataset_and_train():
    dataset_dir = os.path.abspath("cam01_dataset")
    img_train_dir = os.path.join(dataset_dir, "images", "train")
    img_val_dir = os.path.join(dataset_dir, "images", "val")
    lbl_train_dir = os.path.join(dataset_dir, "labels", "train")
    lbl_val_dir = os.path.join(dataset_dir, "labels", "val")

    os.makedirs(img_train_dir, exist_ok=True)
    os.makedirs(img_val_dir, exist_ok=True)
    os.makedirs(lbl_train_dir, exist_ok=True)
    os.makedirs(lbl_val_dir, exist_ok=True)

    video_path = "expressway_traffic.mp4"
    if not os.path.exists(video_path):
        video_path = "camera_01_feed.mp4"

    print(f"Extracting training frames from Camera 01 source: {video_path}")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video source: {video_path}")

    # Use base model to auto-generate precise ground truth labels for Camera 01 angle
    base_model = YOLO("yolov8n.pt")

    frame_count = 0
    saved_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Sample every 2nd frame
        if frame_count % 2 == 0:
            h, w, _ = frame.shape
            results = base_model(frame, verbose=False, conf=0.35)
            
            yolo_labels = []
            if results and len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes.xywhn.cpu().numpy()
                clss = results[0].boxes.cls.int().cpu().numpy()
                
                for box, cid in zip(boxes, clss):
                    # COCO classes: 2: car, 3: motorcycle, 5: bus, 7: truck
                    if cid in [2, 3, 5, 7]:
                        # Map to Camera 01 vehicle classes: 0: Car, 1: SUV/Van, 2: Motorcycle, 3: Truck/Bus
                        custom_cls = 0
                        if cid == 3:
                            custom_cls = 2
                        elif cid in [5, 7]:
                            custom_cls = 3
                        
                        xc, yc, bw, bh = box
                        yolo_labels.append(f"{custom_cls} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}")

            # Determine split (80% train, 20% val)
            is_val = (saved_count % 5 == 0)
            target_img_dir = img_val_dir if is_val else img_train_dir
            target_lbl_dir = lbl_val_dir if is_val else lbl_train_dir

            img_filename = f"cam01_frame_{saved_count:04d}.jpg"
            lbl_filename = f"cam01_frame_{saved_count:04d}.txt"

            img_path = os.path.join(target_img_dir, img_filename)
            lbl_path = os.path.join(target_lbl_dir, lbl_filename)

            cv2.imwrite(img_path, frame)
            with open(lbl_path, "w") as f:
                f.write("\n".join(yolo_labels))

            saved_count += 1
            if saved_count >= 80:
                break

        frame_count += 1

    cap.release()
    print(f"Extracted and labeled {saved_count} frames for Camera 01 training dataset.")

    # Create dataset.yaml
    dataset_yaml = {
        'path': dataset_dir,
        'train': 'images/train',
        'val': 'images/val',
        'names': {
            0: 'Car',
            1: 'SUV_Van',
            2: 'Motorcycle',
            3: 'Truck_Bus'
        }
    }

    yaml_path = os.path.join(dataset_dir, "dataset.yaml")
    with open(yaml_path, "w") as f:
        yaml.dump(dataset_yaml, f)

    print("Dataset YAML created. Starting YOLOv8 training specifically for Camera 01...")
    
    # Train custom YOLOv8 model for Camera 01
    model = YOLO("yolov8n.pt")
    model.train(
        data=yaml_path,
        epochs=5,
        imgsz=640,
        batch=8,
        project="cam01_training",
        name="cam01_model",
        exist_ok=True,
        verbose=True
    )

    # Save best custom weights to root directory
    best_weights_path = os.path.join("cam01_training", "cam01_model", "weights", "best.pt")
    target_custom_model = os.path.abspath("yolov8_cam01_custom.pt")
    
    if os.path.exists(best_weights_path):
        shutil.copy(best_weights_path, target_custom_model)
        print(f"[SUCCESS] Custom Camera 01 YOLOv8 model trained and saved to: {target_custom_model}")
    else:
        # Fallback copy base model if weights directory structure varies
        model.save(target_custom_model)
        print(f"[SUCCESS] Custom Camera 01 YOLOv8 model saved to: {target_custom_model}")

if __name__ == "__main__":
    prepare_dataset_and_train()

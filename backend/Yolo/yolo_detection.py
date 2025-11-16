from ultralytics import YOLO
import cv2

model = YOLO("models/yolov8n.pt")  

def detect_vehicles(frame):
    results = model(frame)[0]

    vehicle_classes = [2, 3, 5, 7]  
    # 2-car, 3-motorbike, 5-bus, 7-truck

    count = 0
    boxes = []

    for r in results.boxes:
        cls = int(r.cls[0])
        if cls in vehicle_classes:
            count += 1

            x1, y1, x2, y2 = r.xyxy[0].tolist()
            boxes.append({
                "class": cls,
                "bbox": [x1, y1, x2, y2],
                "confidence": float(r.conf[0])
            })

    return count, boxes

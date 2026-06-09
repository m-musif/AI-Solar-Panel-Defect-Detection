from ultralytics import YOLO


MODEL_PATH = "backend/app/model/weights/best.pt"


def predict_image(image_path):
    model = YOLO(MODEL_PATH)

    results = model.predict(
        source=image_path,
        conf=0.25,
        save=True
    )

    detections = []

    for result in results:
        boxes = result.boxes

        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "class": model.names[class_id],
                "confidence": round(confidence, 2)
            })

    return detections

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import uuid

app = FastAPI(title="AI Solar Panel Defect Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "backend/app/model/weights/best.pt"
UPLOAD_DIR = "backend/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

model = YOLO(MODEL_PATH)


@app.get("/")
def home():
    return {"message": "AI Solar Panel Defect Detection API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model(file_path)

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = model.names[class_id]

            detections.append({
                "class": class_name,
                "confidence": round(confidence, 2)
            })

    return {
        "filename": file.filename,
        "detections": detections
    }

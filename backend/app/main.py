from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

BASE_DIR = os.getcwd()

MODEL_PATH = os.path.join(BASE_DIR, "backend/app/model/weights/best.pt")
UPLOAD_DIR = os.path.join(BASE_DIR, "backend/uploads")
PREDICTION_DIR = os.path.join(BASE_DIR, "backend/predictions")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PREDICTION_DIR, exist_ok=True)

model = YOLO(MODEL_PATH)

app.mount("/predictions", StaticFiles(directory=PREDICTION_DIR), name="predictions")


@app.get("/")
def home():
    return {"message": "AI Solar Panel Defect Detection API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_ext = file.filename.split(".")[-1]
    unique_id = str(uuid.uuid4())
    file_name = f"{unique_id}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model(
        file_path,
        save=True,
        project=PREDICTION_DIR,
        name=unique_id,
        exist_ok=True
    )

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

    prediction_image = f"/predictions/{unique_id}/{file_name}"

    return {
        "filename": file.filename,
        "detections": detections,
        "prediction_image": prediction_image
    }

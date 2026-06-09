import os

BASE_DIR = os.getcwd()

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend/app/model/weights/best.pt"
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "backend/uploads"
)

PREDICTION_DIR = os.path.join(
    BASE_DIR,
    "backend/predictions"
)

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp"
}

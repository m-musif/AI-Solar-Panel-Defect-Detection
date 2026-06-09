from pydantic import BaseModel
from typing import List


class DetectionResult(BaseModel):
    class_name: str
    confidence: float


class PredictionResponse(BaseModel):
    filename: str
    detections: List[DetectionResult]
    prediction_image: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str


from fastapi import FastAPI
from pydantic import BaseModel

from src.crisis.crisis_detector import CrisisDetector
from src.crisis.crisis_escalation_service import CrisisEscalationService

app = FastAPI()

print("✅ NEW CRISIS API LOADED")

service = CrisisEscalationService()
detector = CrisisDetector()


class CrisisRequest(BaseModel):
    message: str


@app.post("/api/crisis/flag")
def flag_crisis(request: CrisisRequest):

    detector_result = detector.detect(request.message)

    # No crisis detected
    if not detector_result["crisis_detected"]:
        return {
            "status": "safe",
            "detector_result": detector_result,
            "message": "No crisis escalation required."
        }

    # Crisis detected
    result = service.handle_crisis(
        request.message,
        detector_result
    )

    return {
        "status": "crisis",
        "detector_result": detector_result,
        **result
    }
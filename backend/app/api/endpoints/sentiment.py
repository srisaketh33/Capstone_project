from fastapi import APIRouter, Depends
from app.core.sentiment import analyze_emotion
from app.core.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze_text_sentiment(request: SentimentRequest, current_user = Depends(get_current_user)):
    scores = analyze_emotion(request.text)
    return {"scores": scores}

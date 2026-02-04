from fastapi import APIRouter, Depends
from app.core.coherence import check_consistency
from app.core.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ValidationRequest(BaseModel):
    text: str
    context: str

@router.post("/check")
async def validate_narrative(request: ValidationRequest, current_user = Depends(get_current_user)):
    validation_json = await check_consistency(request.text, request.context)
    return validation_json

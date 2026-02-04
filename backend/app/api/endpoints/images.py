from fastapi import APIRouter, Depends, HTTPException
from app.core.image_prompts import generate_sd_prompt
from app.core.image_generation import generate_image_from_prompt
from app.core.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ImageRequest(BaseModel):
    description: str
    user_prompt: Optional[str] = None

@router.post("/generate")
async def generate_visual(request: ImageRequest, current_user = Depends(get_current_user)):
    sd_prompt = await generate_sd_prompt(request.description, user_prompt=request.user_prompt)
    image_b64 = await generate_image_from_prompt(sd_prompt)
    if not image_b64:
         raise HTTPException(status_code=500, detail="Image generation failed")
    return {"image_base64": image_b64, "prompt_used": sd_prompt}

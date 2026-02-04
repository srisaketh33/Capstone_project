from fastapi import APIRouter, Depends, HTTPException
from app.core.llm import generate_text
from app.core.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class GenerationRequest(BaseModel):
    prompt: str
    context: str = ""

class GenerationResponse(BaseModel):
    text: str

@router.post("/text", response_model=GenerationResponse)
async def generate_narrative(request: GenerationRequest, current_user = Depends(get_current_user)):
    """
    Stand-alone endpoint for LLM text generation.
    """
    full_prompt = f"Context:\n{request.context}\n\nPrompt: {request.prompt}"
    text = await generate_text(full_prompt)
    if not text:
        raise HTTPException(status_code=500, detail="Generation failed")
    return {"text": text}

from fastapi import APIRouter, Depends
from app.core.memory import memory_manager
from app.core.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class MemoryQuery(BaseModel):
    query: str
    n_results: int = 3

class MemoryAdd(BaseModel):
    text: str
    metadata: Optional[dict] = None

@router.post("/query")
async def query_memory(request: MemoryQuery, current_user = Depends(get_current_user)):
    context = memory_manager.get_relevant_context(request.query, n_results=request.n_results)
    return {"context": context}

@router.post("/add")
async def add_to_memory(request: MemoryAdd, current_user = Depends(get_current_user)):
    memory_manager.add_event(request.text, metadata=request.metadata)
    return {"status": "success"}

@router.get("/profiles")
async def get_profiles(filter_text: Optional[str] = None, current_user = Depends(get_current_user)):
    summary = memory_manager.get_all_profiles_summary(filter_text=filter_text)
    return {"summary": summary}

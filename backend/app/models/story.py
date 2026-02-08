from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class StoryRequest(BaseModel):
    user_id: str
    prompt: str # The core idea or the specific instruction for the next beat
    context_window_size: int = 3 # Number of past events to retrieve
    enable_sentiment: bool = True
    enable_plot_coherence: bool = True
    enable_image_generation: bool = False

class ValidationResult(BaseModel):
    plot_holes: List[str]
    character_inconsistencies: List[str]
    logic_errors: List[str]
    suggestions: List[str]

class StoryResponse(BaseModel):
    text: str
    title: str
    image_base64: Optional[str] = None
    sentiment_analysis: Dict[str, float]
    validation: ValidationResult

from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.story import StoryRequest, StoryResponse, ValidationResult
from app.core.memory import memory_manager
from app.core.sentiment import analyze_emotion
from app.core.image_prompts import generate_sd_prompt
from app.core.image_generation import generate_image_from_prompt
from app.core.coherence import check_consistency
from app.core.llm import generate_text
from app.core.prompts import NARRATIVE_WRITING_PROMPT # Simplified usage for now, or just generic generation

router = APIRouter()

@router.post("/generate", response_model=StoryResponse)
async def generate_story_segment(request: StoryRequest, background_tasks: BackgroundTasks):
    """
    Unified endpoint for generating a story segment.
    Triggers: LLM (Text), VectorDB (Context), Validator (Quality), Sentiment (Analysis), Stable Diffusion (Image).
    """
    
    # 1. Retrieve Context
    try:
        # We are keeping it simple: just fetching relevant events based on the prompt.
        past_context = memory_manager.get_relevant_context(request.prompt, n_results=request.context_window_size)
        # Ideally we'd also get active characters from the prompt, but that requires NER. 
        # For now, we'll fetch all profile summaries or just rely on the vector retrieval.
        # Let's append profile summary to context for robustness.
        profile_summary = memory_manager.get_all_profiles_summary()
        full_search_context = f"{profile_summary}\n{past_context}"
        
        # 2. Generate Text
        # We'll treat the user prompt as the scene beat or continuation instruction
        # Using a generic prompt structure for the endpoint simplicity
        generation_prompt = f"""
        Context:
        {full_search_context}
        
        Write the next scene based on: {request.prompt}
        """
        narrative_text = await generate_text(generation_prompt)
        
        if not narrative_text:
            raise HTTPException(status_code=500, detail="Text generation failed. Ensure your OPENAI_API_KEY is set correctly.")

    except Exception as e:
        print(f"Error in story generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    validation_json = await check_consistency(narrative_text, full_search_context)
    validation_result = ValidationResult(**validation_json)

    # 4. Analyze Sentiment
    sentiment_scores = analyze_emotion(narrative_text)

    # 5. Save to Memory (Process text to add to DB)
    # We add this to background tasks so it doesn't block response? 
    # Actually, we might want it immediately available for next turn. 
    # But for latency, let's do it here.
    memory_manager.add_event(narrative_text, metadata={"user_id": request.user_id, "type": "scene"})

    # 6. Generate Image
    # We do this last as it's the slowest. 
    # First generate the prompt
    sd_prompt = await generate_sd_prompt(narrative_text)
    image_b64 = await generate_image_from_prompt(sd_prompt)

    return StoryResponse(
        text=narrative_text,
        image_base64=image_b64,
        sentiment_analysis=sentiment_scores,
        validation=validation_result
    )

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from app.models.story import StoryRequest, StoryResponse, ValidationResult
from app.core.memory import memory_manager
from app.core.sentiment import analyze_emotion
from app.core.image_prompts import generate_sd_prompt
from app.core.image_generation import generate_image_from_prompt
from app.core.coherence import check_consistency
from app.core.llm import generate_text, generate_structured_story
from app.core.auth import get_current_user
import re
import traceback
import time

router = APIRouter()

@router.post("/generate", response_model=StoryResponse)
async def generate_story_segment(request: StoryRequest, background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    """
    Highly optimized unified endpoint.
    Uses consolidated LLM calls to meet 2-8s text and 10-20s image requirements.
    Consolidates Narrative, Title, Image Prompt, Sentiment, and Validation into ONE LLM call.
    """
    
    # 1. Retrieve Context
    try:
        past_context = memory_manager.get_relevant_context(request.prompt, n_results=request.context_window_size)
        profile_summary = memory_manager.get_all_profiles_summary(filter_text=f"{request.prompt} {past_context}")
        full_search_context = f"{profile_summary}\n{past_context}".strip()
        
        # 2. Consolidated Generation
        base_prompt = f"""
        System: You are an expert writer for a professional business audience. Your goal is to write a clear, sophisticated story segment.
        
        PAST CONTEXT:
        ---
        {full_search_context}
        ---
        
        LATEST USER PROMPT: {request.prompt}
        
        STRICT WRITING RULES:
        1. STYLE: Professional, intelligent, and flowy. Avoid overly choppy or childish sentences.
        2. TONE: Use business-appropriate language that remains accessible but feels high-quality.
        3. FLOW: Use varied sentence lengths to create a natural narrative rhythm.
        4. CHARACTERS: Give recurring characters (like Mark) specific, memorable physical traits to ensure they don't feel generic. Mention these traits subtly in the narrative.
        5. IMAGE PROMPT RULE: In the "image_prompt" field, do NOT include any instructions for text, logos, or words inside the image. Focus purely on visual atmosphere and character actions.
        6. NO META-TALK: Output only the story.
        """
        
        structured_data = await generate_structured_story(base_prompt)
        
        narrative_text = structured_data.get("narrative", "")
        if not narrative_text:
            narrative_text = await generate_text(base_prompt)
            if not narrative_text:
                 raise HTTPException(status_code=500, detail="Text generation returned empty.")

        # Sanitization
        FORBIDDEN_WORDS = ["Perplexity", "Shinchan", "Crayon Shin-chan", "search assistant", "as an AI"]
        narrative_text = re.sub(r'\[\d+\]', '', narrative_text)
        for word in FORBIDDEN_WORDS:
            narrative_text = re.sub(rf'\b{re.escape(word)}\b', '', narrative_text, flags=re.IGNORECASE)
        narrative_text = re.sub(r' +', ' ', narrative_text).strip()

        # 3. Process Metadata
        scene_title = structured_data.get("title", "New Scene").strip().strip('"')
        
        validation_json = structured_data.get("validation", {})
        validation_result = ValidationResult(
            plot_holes=validation_json.get("plot_holes", []),
            character_inconsistencies=validation_json.get("character_inconsistencies", []),
            logic_errors=validation_json.get("logic_errors", []),
            suggestions=validation_json.get("suggestions", [])
        )
        
        sentiment_scores = structured_data.get("sentiment", {})
        if not sentiment_scores and request.enable_sentiment:
            sentiment_scores = analyze_emotion(narrative_text)

        # 4. Save to Memory
        memory_manager.add_event(narrative_text, metadata={"user_id": request.user_id, "type": "scene", "prompt": request.prompt})

        # 5. Generate Image
        image_b64 = None
        if request.enable_image_generation:
            # Use the optimized prompt from LLM
            image_prompt = structured_data.get("image_prompt", narrative_text[:300])
            style_suffix = "cinematic lighting, concept art, 8k, highly detailed, dramatic atmosphere"
            
            if "crt" in request.prompt.lower():
                style_suffix += ", crt scanlines, retro glitch"
            
            final_image_prompt = f"{image_prompt}, {style_suffix}"
            image_b64 = await generate_image_from_prompt(final_image_prompt)

        return StoryResponse(
            text=narrative_text,
            title=scene_title,
            image_base64=image_b64,
            sentiment_analysis=sentiment_scores,
            validation=validation_result
        )

    except Exception as e:
        traceback.print_exc()
        err_msg = str(e).replace("https://generativelanguage.googleapis.com/v1beta/models/", "")
        if "429" in err_msg or "Quota" in err_msg:
             raise HTTPException(status_code=429, detail=f"Daily AI Quota Exceeded. {err_msg}")
        raise HTTPException(status_code=500, detail=f"Generation Error: {err_msg}")

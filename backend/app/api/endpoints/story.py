from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from app.models.story import StoryRequest, StoryResponse, ValidationResult
from app.core.memory import memory_manager
from app.core.sentiment import analyze_emotion
from app.core.image_prompts import generate_sd_prompt
from app.core.image_generation import generate_image_from_prompt
from app.core.coherence import check_consistency
from app.core.llm import generate_text
from app.core.auth import get_current_user
from app.core.prompts import NARRATIVE_WRITING_PROMPT # Simplified usage for now, or just generic generation

router = APIRouter()

@router.post("/generate", response_model=StoryResponse)
async def generate_story_segment(request: StoryRequest, background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    """
    Unified endpoint for generating a story segment.
    Triggers: LLM (Text), VectorDB (Context), Validator (Quality), Sentiment (Analysis), Stable Diffusion (Image).
    """
    
    
    # 1. Retrieve Context
    try:
        # We are keeping it simple: just fetching relevant events based on the prompt.
        past_context = memory_manager.get_relevant_context(request.prompt, n_results=request.context_window_size)
        
        # Only include profiles relevant to the current conversation/prompt
        profile_summary = memory_manager.get_all_profiles_summary(filter_text=f"{request.prompt} {past_context}")
        full_search_context = f"{profile_summary}\n{past_context}".strip()
        
        # 2. Generate Text
        generation_prompt = f"""
        System: You are a creative and professional novelist. Your goal is to write a high-quality, immersive story scene based on the user's latest prompt.
        
        PAST CONTEXT (For continuity only):
        ---
        {full_search_context}
        ---
        
        LATEST USER PROMPT: {request.prompt}
        
        STRICT RULES:
        1. OUTPUT ONLY PROSE: Do NOT include any technical words, model names (like LLM, BERT, GPT, Stable Diffusion), or meta-talk about the AI.
        2. NO STRUCTURAL LABELS: Do NOT include chapter headings, titles, or scene labels (e.g., avoid "Chapter 1", "Scene 2", "*Chapter 4: The Static*", etc.). Write only the flowing internal narrative.
        3. CLEAN STORYTELLING: Write only the narrative. No intros, no outros, no "Sure, here is your story".
        4. WORD COUNT: 
           - If the USER prompt specifies a length (e.g. "100 words"), follow it exactly.
           - Otherwise, target a standard scene length of 250 to 500 words.
        5. FOCUS: Prioritize the LATEST USER PROMPT while maintaining subtle continuity with PAST CONTEXT.
        6. STYLE: Use "Show, Don't Tell" with sensory details and realistic dialogue.
        """
        narrative_text = await generate_text(generation_prompt)
        
        if not narrative_text:
            print("Error: LLM returned empty text.")
            raise HTTPException(status_code=500, detail="Text generation returned empty. Check LLM provider logs.")

    except Exception as e:
        import traceback
        traceback.print_exc()
        # Clean up common Google API error strings for the user
        err_msg = str(e).replace("https://generativelanguage.googleapis.com/v1beta/models/", "")
        
        if "429" in err_msg or "Quota" in err_msg:
             raise HTTPException(status_code=429, detail=f"Daily AI Quota Exceeded. {err_msg}")
        
        raise HTTPException(status_code=500, detail=f"Backend Generation Error: {err_msg}")
    
    # 3. Validation (Conditional)
    validation_result = ValidationResult(plot_holes=[], character_inconsistencies=[], logic_errors=[], suggestions=[])
    if request.enable_plot_coherence:
        validation_json = await check_consistency(narrative_text, full_search_context)
        validation_result = ValidationResult(**validation_json)

    # 4. Analyze Sentiment (Conditional)
    sentiment_scores = {}
    if request.enable_sentiment:
        sentiment_scores = analyze_emotion(narrative_text)

    # 5. Save to Memory (Process text to add to DB)
    memory_manager.add_event(narrative_text, metadata={"user_id": request.user_id, "type": "scene"})

    # 6. Generate Image (Conditional)
    image_b64 = None
    if request.enable_image_generation:
        sd_prompt = await generate_sd_prompt(narrative_text, user_prompt=request.prompt)
        image_b64 = await generate_image_from_prompt(sd_prompt)

    # 7. Generate a short title for the mood board (User request: simple words only)
    title_prompt = f"Provide a simple, catchy 3-5 word title for this story scene. Output ONLY the title:\n\n{narrative_text[:500]}"
    scene_title = await generate_text(title_prompt)
    if not scene_title or len(scene_title.split()) > 10:
        scene_title = "New Scene"
    scene_title = scene_title.strip().strip('"')

    return StoryResponse(
        text=narrative_text,
        title=scene_title,
        image_base64=image_b64,
        sentiment_analysis=sentiment_scores,
        validation=validation_result
    )

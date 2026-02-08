from app.core.config import settings
# Removed circular import

# Actually, let's avoid imports from main. 
from app.core.prompts import NARRATIVE_WRITING_PROMPT # We might need a new prompt here

IMAGE_PROMPT_ENHANCER = """
You are an expert digital artist. Your task is to create a visualization STICKTLY BASED on the narrative provided.
The image must capture the specific mood, character appearance, and key objects mentioned in the story segment.
Output ONLY the comma-separated prompt for an AI image generator.

Scene Narrative: {description}
"""

# We need to access OpenAI Client. 
from app.core.llm import generate_text

async def generate_sd_prompt(description: str, user_prompt: str = None, style_keywords: list[str] = None) -> str:
    if style_keywords is None:
        style_keywords = ["cinematic lighting", "concept art", "8k", "highly detailed", "dramatic atmosphere"]
    
    # Check for specific aesthetic requests
    if user_prompt and "crt" in user_prompt.lower():
        style_keywords.extend(["crt monitor effect", "scanlines", "retro glitch", "vhs aesthetic", "glowing phosphor"])
    
    # We want to combine the user's specific request (like "pose") with the scene context
    context_instruction = f"Context: {description}"
    if user_prompt:
        context_instruction = f"Specific User Request: {user_prompt}\nScene Context: {description}"

    prompt = IMAGE_PROMPT_ENHANCER.format(description=context_instruction)
    
    try:
        base_prompt = await generate_text(prompt)
        
        # If user provided a specific prompt, prepend it to ensure it's prioritized
        prefix = ""
        if user_prompt:
            # Extract keywords from user prompt or just use it as a prefix
            prefix = f"{user_prompt}, "
            
        final_prompt = f"{prefix}{base_prompt}, {', '.join(style_keywords)}"
        return final_prompt
    except Exception as e:
        print(f"Error generating image prompt: {e}")
        return f"{description}, {', '.join(style_keywords)}"

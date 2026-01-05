from app.core.config import settings
# Removed circular import

# Actually, let's avoid imports from main. 
from app.core.prompts import NARRATIVE_WRITING_PROMPT # We might need a new prompt here

IMAGE_PROMPT_ENHANCER = """
You are an expert digital artist and prompt engineer for Stable Diffusion.
Convert the following scene description into a high-quality image generation prompt.
Include specific style keywords (lighting, composition, art style).
Output ONLY the comma-separated prompt.

Description: {description}
"""

# We need to access OpenAI Client. 
from app.core.llm import generate_text

async def generate_sd_prompt(description: str, style_keywords: list[str] = None) -> str:
    if style_keywords is None:
        style_keywords = ["cinematic lighting", "concept art", "8k", "highly detailed", "dramatic atmosphere"]
    
    prompt = IMAGE_PROMPT_ENHANCER.format(description=description)
    
    try:
        base_prompt = await generate_text(prompt)
        # Cleanup if necessary (sometimes LLMs are chatty)
        
        # improved prompt
        final_prompt = f"{base_prompt}, {', '.join(style_keywords)}"
        return final_prompt
    except Exception as e:
        print(f"Error generating image prompt: {e}")
        return f"{description}, {', '.join(style_keywords)}"

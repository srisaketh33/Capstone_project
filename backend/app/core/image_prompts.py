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
# It's better to have a shared module for the client or pass it in. 
# For now, I'll re-instantiate or assume usage of the generate_narrative.py's logic or a shared service.
# Let's create a simpler synchronous-like or async helper. 
# But let's just use the OpenAI client directly here for simplicity if needed, or better yet, pure string manipulation 
# if we want to save tokens, but the task asked for LLM-based prompting.

async def generate_sd_prompt(client, description: str, style_keywords: list[str] = None) -> str:
    if style_keywords is None:
        style_keywords = ["cinematic lighting", "concept art", "8k", "highly detailed", "dramatic atmosphere"]
    
    prompt = IMAGE_PROMPT_ENHANCER.format(description=description)
    
    try:
        response = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4", # or gpt-3.5-turbo
        )
        base_prompt = response.choices[0].message.content.strip()
        
        # improved prompt
        final_prompt = f"{base_prompt}, {', '.join(style_keywords)}"
        return final_prompt
    except Exception as e:
        print(f"Error generating image prompt: {e}")
        return f"{description}, {', '.join(style_keywords)}"

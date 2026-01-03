import httpx
import base64
import os
from app.core.config import settings

STABILITY_API_HOST = "https://api.stability.ai"

async def generate_image_from_prompt(prompt: str) -> str:
    """
    Generates an image from a prompt using Stability AI API.
    Returns the base64 encoded string of the image.
    """
    if not settings.STABILITY_API_KEY:
        print("Warning: STABILITY_API_KEY not set.")
        return ""

    url = f"{STABILITY_API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {settings.STABILITY_API_KEY}",
    }
    
    body = {
        "steps": 40,
        "width": 1024,
        "height": 1024,
        "seed": 0,
        "cfg_scale": 5,
        "samples": 1,
        "text_prompts": [
            {
                "text": prompt,
                "weight": 1
            }
        ],
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=body, timeout=30.0)
            if response.status_code != 200:
                print(f"Non-200 response: {response.text}")
                return ""
            
            data = response.json()
            # Stability AI returns 'artifacts' list with base64
            for i, image in enumerate(data["artifacts"]):
                return image["base64"] # Return the first one
                
        except Exception as e:
            print(f"Error generating image: {e}")
            return ""
    return ""

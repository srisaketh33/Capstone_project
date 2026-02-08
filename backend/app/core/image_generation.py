import httpx
import base64
import os
import json
from app.core.config import settings

STABILITY_API_HOST = "https://api.stability.ai"

async def generate_gemini_image(prompt: str, api_key: str) -> str:
    """
    Generates an image using Google Gemini (Imagen 3) API.
    Returns the base64 encoded string of the image.
    """
    # Models to try based on available models list and common Google Image models
    models = [
        "imagen-3.0-generate-001", 
        "imagen-3.0-fast-generate-001",
        "gemini-2.0-flash-exp-image-generation", # Exp model for 2.0
        "gemini-2.0-flash", # Some regions support native image gen in 2.0
    ]
    
    async with httpx.AsyncClient(verify=False) as client:
        for model in models:
            try:
                # Some models use :predict, others use :generateContent
                method = "predict" if "imagen" in model or "image-generation" in model else "generateContent"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:{method}?key={api_key}"
                
                if method == "predict":
                    payload = {
                        "instances": [{"prompt": prompt}],
                        "parameters": {"sampleCount": 1}
                    }
                else:
                    payload = {
                        "contents": [{"parts": [{"text": f"Generate an image based on this description: {prompt}"}]}],
                        "generationConfig": {"candidateCount": 1}
                    }
                
                print(f"Attempting Gemini Image Gen with {model} via {method}...")
                response = await client.post(url, json=payload, timeout=60.0)
                
                if response.status_code != 200:
                    print(f"Gemini {model} ({method}) failed: {response.status_code}")
                    continue
                
                data = response.json()
                
                # Check predict format
                if "predictions" in data and data["predictions"]:
                    b64 = data["predictions"][0].get("bytesBase64Encoded")
                    if b64:
                        return b64
                
                # Check generateContent format (inlineData)
                if "candidates" in data:
                    for cand in data["candidates"]:
                        for part in cand.get("content", {}).get("parts", []):
                            if "inlineData" in part:
                                return part["inlineData"].get("data")
                
                print(f"Gemini {model} returned success but no image data found.")
            except Exception as e:
                print(f"Gemini {model} error: {e}")
                continue
    return ""

async def generate_openai_image(prompt: str) -> str:
    """
    Generates an image using OpenAI DALL-E 3.
    """
    if not settings.OPENAI_API_KEY:
        return ""
    
    api_keys = [k.strip() for k in settings.OPENAI_API_KEY.split(",") if k.strip() and k.startswith("sk-") and "perplexity" not in k.lower()]
    
    async with httpx.AsyncClient(verify=False) as client:
        for api_key in api_keys:
            try:
                print(f"Attempting OpenAI DALL-E 3 Image Gen...")
                url = "https://api.openai.com/v1/images/generations"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                payload = {
                    "model": "dall-e-3",
                    "prompt": prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "response_format": "b64_json"
                }
                
                response = await client.post(url, headers=headers, json=payload, timeout=60.0)
                
                if response.status_code == 200:
                    data = response.json()
                    return data["data"][0]["b64_json"]
                else:
                    print(f"OpenAI Image Gen failed: {response.status_code} - {response.text[:100]}")
            except Exception as e:
                print(f"OpenAI Image Gen error: {e}")
                continue
    return ""

async def generate_stability_image(prompt: str) -> str:
    """
    Generates an image from a prompt using Stability AI API.
    Supports rotation across multiple keys if provided as a comma-separated list.
    """
    if not settings.STABILITY_API_KEY:
        return ""

    # Split keys if multiple are provided
    api_keys = [k.strip() for k in settings.STABILITY_API_KEY.split(",") if k.strip()]
    
    # Try multiple SDXL or Ultra endpoints
    endpoints = [
        f"{STABILITY_API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        f"{STABILITY_API_HOST}/v1/generation/stable-diffusion-v1-6/text-to-image",
        f"{STABILITY_API_HOST}/v2beta/stable-image/generate/ultra",
        f"{STABILITY_API_HOST}/v2beta/stable-image/generate/core",
    ]

    async with httpx.AsyncClient(verify=False) as client:
        for i, api_key in enumerate(api_keys):
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            }
            
            for url in endpoints:
                try:
                    print(f"Trying Stability AI at {url.split('/')[-1]}...")
                    
                    if "v2beta" in url:
                        # V2 API uses multipart/form-data
                        files = {"prompt": (None, prompt), "output_format": (None, "webp")}
                        headers.pop("Content-Type", None)
                        response = await client.post(url, headers=headers, files=files, timeout=60.0)
                        if response.status_code == 200:
                            # V2 returns binary, we need to convert to b64
                            return base64.b64encode(response.content).decode('utf-8')
                    else:
                        # V1 API uses JSON
                        headers["Content-Type"] = "application/json"
                        body = {
                            "steps": 30, "width": 1024 if "xl" in url else 512, "height": 1024 if "xl" in url else 512,
                            "seed": 0, "cfg_scale": 7, "samples": 1,
                            "text_prompts": [{"text": prompt, "weight": 1}],
                        }
                        response = await client.post(url, headers=headers, json=body, timeout=60.0)
                        if response.status_code == 200:
                            data = response.json()
                            return data["artifacts"][0]["base64"]
                    
                    print(f"Stability at {url.split('/')[-1]} failed: {response.status_code}")
                except Exception as e:
                    print(f"Stability error at {url.split('/')[-1]}: {e}")
                    continue
                
    return ""

async def generate_image_from_prompt(prompt: str) -> str:
    """
    Unified entry point for image generation.
    Tries Gemini, then OpenAI, then Stability as fallback.
    """
    print(f"--- Global Image Generation Start ---")
    
    # 1. Try Gemini (Google)
    gemini_keys = [k.strip() for k in settings.GEMINI_API_KEY.split(",") if k.strip()]
    import random
    random.shuffle(gemini_keys)
    
    for gkey in gemini_keys:
        image_b64 = await generate_gemini_image(prompt, gkey)
        if image_b64:
            print("Successfully generated image with Gemini.")
            return image_b64

    # 2. Try OpenAI (DALL-E)
    image_b64 = await generate_openai_image(prompt)
    if image_b64:
        print("Successfully generated image with OpenAI.")
        return image_b64

    # 3. Try Stability AI
    image_b64 = await generate_stability_image(prompt)
    if image_b64:
        print("Successfully generated image with Stability AI.")
        return image_b64

    print("!!! CRITICAL FAILURE: All Image Providers Exhausted !!!")
    return ""


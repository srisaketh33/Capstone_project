import httpx
import base64
import os
import json
import asyncio
import random
from app.core.config import settings

STABILITY_API_HOST = "https://api.stability.ai"

async def generate_gemini_image(prompt: str, api_key: str) -> str:
    """
    Generates an image using Google Gemini (Imagen 3) API.
    Returns the base64 encoded string of the image.
    """
    models = [
        "imagen-4.0-generate-001",
        "imagen-4.0-fast-generate-001",
        "imagen-3.0-generate-001",
        "imagen-3.0-fast-generate-001",
        "gemini-2.0-flash-exp-image-generation",
    ]
    
    async with httpx.AsyncClient(verify=False) as client:
        for model in models:
            try:
                if "imagen-4.0" in model or "imagen-3.0" in model:
                    method = "predict"
                    payload = {
                        "instances": [{"prompt": prompt}],
                        "parameters": {"sampleCount": 1}
                    }
                elif "image-generation" in model:
                    method = "generateContent"
                    payload = {
                        "contents": [{"parts": [{"text": f"Generate an image based on this description: {prompt}"}]}]
                    }
                else:
                    method = "predict"
                    payload = {
                        "instances": [{"prompt": prompt}],
                        "parameters": {"sampleCount": 1}
                    }
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:{method}?key={api_key}"
                response = await client.post(url, json=payload, timeout=15.0)
                
                if response.status_code == 200:
                    data = response.json()
                    # Check predict format
                    if "predictions" in data and data["predictions"]:
                        b64 = data["predictions"][0].get("bytesBase64Encoded")
                        if b64: return b64
                    
                    # Check generateContent format (inlineData)
                    if "candidates" in data:
                        for cand in data["candidates"]:
                            for part in cand.get("content", {}).get("parts", []):
                                if "inlineData" in part:
                                    return part["inlineData"].get("data")
            except Exception:
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
            except Exception:
                continue
    return ""

async def generate_stability_image(prompt: str) -> str:
    """
    Generates an image from a prompt using Stability AI API.
    """
    if not settings.STABILITY_API_KEY:
        return ""

    api_keys = [k.strip() for k in settings.STABILITY_API_KEY.split(",") if k.strip()]
    endpoints = [
        f"{STABILITY_API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        f"{STABILITY_API_HOST}/v1/generation/stable-diffusion-v1-6/text-to-image",
        f"{STABILITY_API_HOST}/v2beta/stable-image/generate/ultra",
        f"{STABILITY_API_HOST}/v2beta/stable-image/generate/core",
    ]

    async with httpx.AsyncClient(verify=False) as client:
        for api_key in api_keys:
            headers = {"Authorization": f"Bearer {api_key}", "Accept": "application/json"}
            for url in endpoints:
                try:
                    if "v2beta" in url:
                        files = {"prompt": (None, prompt), "output_format": (None, "webp")}
                        response = await client.post(url, headers=headers, files=files, timeout=60.0)
                        if response.status_code == 200:
                            return base64.b64encode(response.content).decode('utf-8')
                    else:
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
                except Exception:
                    continue
    return ""

async def generate_image_from_prompt(prompt: str) -> str:
    """
    Unified entry point for image generation.
    Tries Stability AI, then HuggingFace, then Gemini as fallback.
    """
    # 1. Try Stability AI (Stable Diffusion) - PRIMARY
    image_b64 = await generate_stability_image(prompt)
    if image_b64: return image_b64

    # 2. Try HuggingFace (Alternative)
    hf_keys = [k.strip() for k in settings.HUGGINGFACE_API_KEY.split(",") if k.strip()]
    random.shuffle(hf_keys)
    for hkey in hf_keys:
        image_b64 = await generate_huggingface_image(prompt, hkey)
        if image_b64: return image_b64

    # 3. Try Gemini (Google) - FALLBACK
    gemini_keys = [k.strip() for k in settings.GEMINI_API_KEY.split(",") if k.strip()]
    random.shuffle(gemini_keys)
    for gkey in gemini_keys:
        image_b64 = await generate_gemini_image(prompt, gkey)
        if image_b64: return image_b64

    # 4. Try OpenAI (DALL-E) - LAST RESORT
    image_b64 = await generate_openai_image(prompt)
    if image_b64: return image_b64

    return ""

async def generate_huggingface_image(prompt: str, api_key: str) -> str:
    """
    Generates an image using HuggingFace Inference API fallbacks.
    """
    models = [
        "stabilityai/stable-diffusion-xl-base-1.0",
        "runwayml/stable-diffusion-v1-5",
        "prompthero/openjourney"
    ]
    
    async with httpx.AsyncClient(verify=False) as client:
        for model in models:
            try:
                url = f"https://router.huggingface.co/hf-inference/models/{model}"
                headers = {"Authorization": f"Bearer {api_key}"}
                payload = {"inputs": prompt}
                response = await client.post(url, headers=headers, json=payload, timeout=45.0)
                if response.status_code == 200:
                    return base64.b64encode(response.content).decode('utf-8')
            except Exception:
                continue
    return ""

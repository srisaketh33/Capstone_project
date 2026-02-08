from openai import AsyncOpenAI
from app.core.config import settings
import httpx
import asyncio
import json

# Global client cache
_openai_clients = {}

def get_openai_client(api_key: str):
    if api_key in _openai_clients:
        return _openai_clients[api_key]
    
    # We use verify=False for OpenAI too just in case
    http_client = httpx.AsyncClient(verify=False) 
    client = AsyncOpenAI(
        api_key=api_key,
        http_client=http_client
    )
    _openai_clients[api_key] = client
    return client

async def generate_text(prompt: str, model: str = None) -> str:
    """
    Multi-Provider LLM Fallback System.
    Tries in order: Gemini -> OpenAI -> Perplexity
    """
    
    # 1. Gather Gemini Keys
    gemini_keys = [k.strip() for k in settings.GEMINI_API_KEY.split(",") if k.strip()]
    if settings.OPENAI_API_KEY:
        for k in settings.OPENAI_API_KEY.split(","):
            k = k.strip()
            if k.startswith("AIza") and k not in gemini_keys:
                gemini_keys.append(k)

    # 2. Gather OpenAI Keys
    openai_keys = []
    if settings.OPENAI_API_KEY:
        for k in settings.OPENAI_API_KEY.split(","):
            k = k.strip()
            if k.startswith("sk-") and "perplexity" not in k.lower():
                openai_keys.append(k)

    # 3. Gather Perplexity Keys
    perplexity_keys = [k.strip() for k in settings.PERPLEXITY_API_KEY.split(",") if k.strip()]

    import random
    random.shuffle(gemini_keys)
    random.shuffle(openai_keys)
    random.shuffle(perplexity_keys)

    print(f"--- LLM Generation Start (Keys: Perplexity={len(perplexity_keys)}, Gemini={len(gemini_keys)}, OpenAI={len(openai_keys)}) ---")
    
    # Strategy 1: Try Perplexity (Primary for text as requested)
    for i, key in enumerate(perplexity_keys):
        try:
            print(f"Trying Perplexity Key {i+1}/{len(perplexity_keys)}...")
            async with httpx.AsyncClient(verify=False) as http_client:
                client = AsyncOpenAI(api_key=key, base_url="https://api.perplexity.ai", http_client=http_client)
                response = await client.chat.completions.create(
                    messages=[{"role": "system", "content": "You are a helpful story writing assistant."}, {"role": "user", "content": prompt}],
                    model="sonar",
                    temperature=0.8,
                    timeout=20.0
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"Perplexity Key {i+1} Failed: {str(e)}")

    # Strategy 2: Try Gemini (Secondary)
    for i, key in enumerate(gemini_keys):
        try:
            print(f"Trying Gemini Key {i+1}/{len(gemini_keys)}...")
            res = await generate_gemini_text(prompt, key)
            if res: return res
        except Exception as e:
            print(f"Gemini Key {i+1} Failed: {str(e)[:100]}")

    # Strategy 3: Try OpenAI (Fallback)
    for i, key in enumerate(openai_keys):
        try:
            print(f"Trying OpenAI Key {i+1}/{len(openai_keys)}...")
            client = get_openai_client(key)
            response = await client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model or "gpt-4o",
                temperature=0.8,
                timeout=15.0
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Key {i+1} Failed: {str(e)[:100]}")

    print("!!! CRITICAL FAILURE: All Providers Exhausted !!!")
    return ""

async def generate_gemini_text(prompt: str, api_key: str) -> str:
    """
    Direct REST call to Gemini API to bypass SDK issues and SSL errors.
    Supports fallback across multiple Gemini models.
    """
    models_to_try = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
    ]
    
    last_exception = None
    
    # Use verify=False to handle SSL interception
    async with httpx.AsyncClient(verify=False) as client:
        # Try both v1 and v1beta as some keys/projects have different access levels
        for api_version in ["v1", "v1beta"]:
            for model in models_to_try:
                try:
                    url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent?key={api_key}"
                    
                    headers = {"Content-Type": "application/json"}
                    data = {
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.8,
                            "topP": 0.95,
                            "topK": 40,
                            "maxOutputTokens": 2048,
                        }
                    }
                    
                    response = await client.post(url, headers=headers, json=data, timeout=12.0)
                    
                    # Success! Parse and return
                    if response.status_code == 200:
                        result = response.json()
                        try:
                            text = result["candidates"][0]["content"]["parts"][0]["text"]
                            return text
                        except (KeyError, IndexError):
                            if result.get("promptFeedback", {}).get("blockReason"):
                                raise Exception(f"Blocked: {result['promptFeedback']['blockReason']}")
                            continue

                    # If we hit 429, this key might be rate limited for ALL models
                    if response.status_code == 429:
                        raise Exception(f"Quota Exceeded (429)")
                        
                    # If 404, this model/version combo is invalid, move to next
                    if response.status_code == 404:
                        continue
                        
                    # Other errors
                    err_json = response.json() if response.headers.get("content-type") == "application/json" else {}
                    err_msg = err_json.get("error", {}).get("message", response.text[:100])
                    last_exception = Exception(f"Gemini API Error ({model} {api_version}): {err_msg}")

                except Exception as e:
                    last_exception = e
                    if "Quota Exceeded" in str(e):
                        # Break inner loops to switch keys if quota is hit
                        raise e
                    continue
        
        # If we get here, all models and versions failed for this API key
        raise last_exception


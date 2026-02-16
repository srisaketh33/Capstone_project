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
    Tries in order: Gemini -> Perplexity -> OpenAI
    Optimized for Speed (Text in 2-5s).
    """
    
    # 1. Gather Keys
    gemini_keys = [k.strip() for k in settings.GEMINI_API_KEY.split(",") if k.strip()]
    if settings.OPENAI_API_KEY:
        for k in settings.OPENAI_API_KEY.split(","):
            k = k.strip()
            if k.startswith("AIza") and k not in gemini_keys:
                gemini_keys.append(k)

    openai_keys = []
    if settings.OPENAI_API_KEY:
        for k in settings.OPENAI_API_KEY.split(","):
            k = k.strip()
            if k.startswith("sk-") and "perplexity" not in k.lower():
                openai_keys.append(k)

    perplexity_keys = [k.strip() for k in settings.PERPLEXITY_API_KEY.split(",") if k.strip()]
    huggingface_keys = [k.strip() for k in settings.HUGGINGFACE_API_KEY.split(",") if k.strip()]

    import random
    random.shuffle(gemini_keys)
    random.shuffle(openai_keys)
    random.shuffle(perplexity_keys)
    random.shuffle(huggingface_keys)

    # Keys are shuffled for rotation balance
    pass
    
    global REFUSAL_KEYWORDS
    REFUSAL_KEYWORDS = [
        "I'm Perplexity", "Perplexity, a search assistant", "not a creative writing tool", 
        "cannot generate", "I clarify my role", "as an AI model", "search results provided",
        "I appreciate you sharing", "I need to clarify", "as a search-based"
    ]

    # Strategy 1: Try Gemini (Fastest & Accurate for Creative)
    for i, key in enumerate(gemini_keys):
        try:
            res = await generate_gemini_text(prompt, key)
            if res:
                if any(kw.lower() in res.lower() for kw in REFUSAL_KEYWORDS):
                    continue
                return res
        except Exception as e:
            pass

    # Strategy 2: Try Perplexity (Secondary)
    for i, key in enumerate(perplexity_keys):
        try:
            print(f"Trying Perplexity Key {i+1}/{len(perplexity_keys)}...")
            async with httpx.AsyncClient(verify=False) as http_client:
                client = AsyncOpenAI(api_key=key, base_url="https://api.perplexity.ai", http_client=http_client)
                
                system_msg = "You are a professional fiction writer. Output ONLY the story prose using basic English and simple vocabulary. Do NOT provide search results, citations, or summaries. Do NOT mention being an AI or Perplexity."
                
                response = await client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_msg}, 
                        {"role": "user", "content": prompt}
                    ],
                    model="sonar",
                    temperature=0.8,
                    timeout=10.0 # Reduced timeout for faster fallback
                )
                
                content = response.choices[0].message.content
                if not any(kw.lower() in content.lower() for kw in REFUSAL_KEYWORDS):
                    return content
        except Exception as e:
            pass

    # Strategy 4: Try HuggingFace (Last Resort)
    for i, key in enumerate(huggingface_keys):
        try:
            res = await generate_huggingface_text(prompt, key)
            if res:
                return res
        except Exception as e:
            pass

    return ""

async def generate_huggingface_text(prompt: str, api_key: str) -> str:
    """
    Call HuggingFace Inference API as a fallback using the new OpenAI-compatible endpoint.
    """
    models = [
        "mistralai/Mistral-7B-Instruct-v0.3",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "meta-llama/Llama-3.2-3B-Instruct",
        "Qwen/Qwen2.5-72B-Instruct-AWQ"
    ]
    
    async with httpx.AsyncClient(verify=False) as client:
        for model in models:
            try:
                # Use the new OpenAI-compatible endpoint
                url = "https://router.huggingface.co/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a professional fiction writer."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                }
                
                response = await client.post(url, headers=headers, json=payload, timeout=25.0)
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                elif response.status_code == 503:
                    print(f"HuggingFace {model} is loading, skipping...")
                    continue
                else:
                    print(f"HuggingFace {model} Error: {response.status_code} - {response.text[:100]}")
            except Exception as e:
                print(f"HuggingFace {model} failed: {e}")
                continue
    return ""

async def generate_structured_story(prompt: str) -> dict:
    """
    Consolidated LLM call to get narrative, title, and image prompt in one go.
    Optimizes for accuracy and speed by reducing round-trips.
    """
    import re
    
    structured_prompt = f"""
    {prompt}
    
    CRITICAL: RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN, NO EXPLANATION, NO CONVERSATION.
    
    JSON STRUCTURE:
    {{
      "narrative": "Professional story text with smooth flow and sophisticated vocabulary (200-400 words).",
      "title": "3-5 word professional title.",
      "image_prompt": "Pure visual description. NO TEXT, NO LOGOS, NO WRITING. Focus on lighting, atmosphere, and characters.",
      "sentiment": {{ "joy": 0.5, "sadness": 0.1, "anger": 0.0, "fear": 0.0, "surprise": 0.1 }},
      "validation": {{ "plot_holes": [], "character_inconsistencies": [], "logic_errors": [], "suggestions": [] }}
    }}
    """
    
    raw_response = await generate_text(structured_prompt)
    if not raw_response:
        return {}
    
    try:
        # Robust JSON extraction
        clean_json = raw_response.strip()
        
        # 1. Remove Markdown Code Blocks if present
        if "```" in clean_json:
            clean_json = re.sub(r'```(?:json)?\s*(.*?)\s*```', r'\1', clean_json, flags=re.DOTALL).strip()
        
        # 2. If it still doesn't start with '{', find the first '{'
        if not clean_json.startswith('{'):
            start_index = clean_json.find('{')
            if start_index != -1:
                clean_json = clean_json[start_index:]
        
        # 3. Find the last '}' to handle trailing text
        end_index = clean_json.rfind('}')
        if end_index != -1:
            clean_json = clean_json[:end_index+1]
            
        data = json.loads(clean_json)
        
        # Final cleanup for fields: ensure no JSON noise in the narrative itself
        if "narrative" in data and isinstance(data["narrative"], str):
            # If the LLM put JSON inside the narrative field by mistake, clean it
            if data["narrative"].strip().startswith('{'):
                 try:
                     inner_data = json.loads(data["narrative"])
                     if "narrative" in inner_data:
                         data["narrative"] = inner_data["narrative"]
                 except:
                     pass
        
        if "image_prompt" in data and isinstance(data["image_prompt"], str):
             data["image_prompt"] = re.sub(r'^(Image prompt|Prompt|Here is the prompt):', '', data["image_prompt"], flags=re.IGNORECASE).strip()
        
        return data
    except Exception as e:
        # If parsing fails, the response might be raw text OR a broken JSON. 
        # We try to extract just the narrative if it's there.
        narrative_match = re.search(r'"narrative":\s*"(.*?)"', raw_response, re.DOTALL)
        if narrative_match:
            return {"narrative": narrative_match.group(1), "title": "New Scene", "image_prompt": "cinematic illustration"}
        
        # Last resort: Clean the raw response of any obvious JSON/Markdown junk
        fallback_text = raw_response.replace("```json", "").replace("```", "").strip()
        if fallback_text.startswith('{'):
            # It's a broken JSON, try to get at least the prose
            lines = fallback_text.split('\n')
            story_lines = [l for l in lines if not any(k in l for k in ['{', '}', '"title":', '"image_prompt":', '"sentiment":', '"validation":'])]
            fallback_text = " ".join(story_lines).replace('"narrative":', '').replace('"', '').strip()
            
        return {"narrative": fallback_text, "title": "New Scene", "image_prompt": "cinematic illustration"}

async def generate_gemini_text(prompt: str, api_key: str) -> str:
    """
    Direct REST call to Gemini API to bypass SDK issues and SSL errors.
    Supports fallback across multiple Gemini models.
    """
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
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


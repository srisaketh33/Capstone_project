from openai import AsyncOpenAI
import google.generativeai as genai
from app.core.config import settings

# Initialize OpenAI Client (Lazy initialization or conditional based on key)
openai_client = None
if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("AIza"):
    openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Initialize Gemini if key looks like Google's
if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("AIza"):
    genai.configure(api_key=settings.OPENAI_API_KEY)

async def generate_text(prompt: str, model: str = "gpt-4") -> str:
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        print("Error: OPENAI_API_KEY is not set.")
        return ""

    try:
        # Check for Google Key
        if api_key.startswith("AIza"):
            # Use Gemini
            model_name = "models/gemini-1.5-flash" # Use full path as per list_models()
            gemini_model = genai.GenerativeModel(model_name)
            response = await gemini_model.generate_content_async(prompt)
            return response.text
        
        # Fallback to OpenAI
        elif openai_client:
            response = await openai_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model,
            )
            return response.choices[0].message.content
        else:
            print("Error: Valid client not initialized.")
            return ""

    except Exception as e:
        print(f"Error calling LLM Provider: {e}")
        # Re-raise to let the caller handle specifics if needed, or return empty string with logged error
        raise e

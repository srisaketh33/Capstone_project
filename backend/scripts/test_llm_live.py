
import asyncio
import os
import sys
from dotenv import load_dotenv

# Load .env from the project root
load_dotenv(os.path.join(os.getcwd(), ".env"))

# Add the backend directory to sys.path to import app
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Check if keys are loaded, if not, try to read from .env manually for this test
from app.core.config import settings
if not settings.OPENAI_API_KEY and os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if "STABILITY_API_KEY" in line:
                settings.OPENAI_API_KEY = line.split("=")[1].strip()
            if "Huggingface_API_KEY" in line:
                settings.HUGGINGFACE_API_KEY = line.split("=")[1].strip()

from app.core.llm import generate_text

from app.core.config import settings

async def test_all_providers():
    test_prompt = "Write a one-sentence story about a lonely robot on Mars."
    print("Testing generate_text with current fallback logic...\n")
    
    print(f"DEBUG: GEMINI_API_KEY: {settings.GEMINI_API_KEY[:10]}...")
    print(f"DEBUG: OPENAI_API_KEY: {settings.OPENAI_API_KEY[:10]}...")
    print(f"DEBUG: PERPLEXITY_API_KEY: {settings.PERPLEXITY_API_KEY[:10] if settings.PERPLEXITY_API_KEY else 'N/A'}")
    print(f"DEBUG: HUGGINGFACE_API_KEY: {settings.HUGGINGFACE_API_KEY[:10] if settings.HUGGINGFACE_API_KEY else 'N/A'}")
    
    try:
        result = await generate_text(test_prompt)
        print("\n--- FINAL RESULT ---")
        if result:
            print(f"SUCCESS! Response: {result}")
        else:
            print("FAILED: No response.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_all_providers())

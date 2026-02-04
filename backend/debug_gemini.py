
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env explicitly to be sure
load_dotenv("../.env")

api_key = os.getenv("OPENAI_API_KEY") # We hijacked this var for the Google Key
print(f"API Key found: {bool(api_key)} (Starts with: {api_key[:4] if api_key else 'None'})")

if not api_key:
    # Try local .env
    load_dotenv(".env")
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"API Key (local .env): {bool(api_key)}")

if api_key and api_key.startswith("AIza"):
    genai.configure(api_key=api_key)
    try:
        print("\nListing available models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
else:
    print("No valid Google API key found in OPENAI_API_KEY environment variable.")

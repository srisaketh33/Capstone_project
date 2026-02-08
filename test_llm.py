
import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.core.llm import generate_text

async def test_llm():
    print("Testing LLM generation...")
    try:
        res = await generate_text("Write a short sentence about a cat.")
        if res:
            print(f"SUCCESS: {res}")
        else:
            print("FAILURE: Returned empty string")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())

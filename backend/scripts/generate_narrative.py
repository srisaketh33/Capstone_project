import os
import sys
import asyncio
from openai import AsyncOpenAI

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.prompts import (
    STORY_EXPANSION_PROMPT,
    CHARACTER_DEVELOPMENT_PROMPT,
    SCENE_BEAT_PROMPT,
    NARRATIVE_WRITING_PROMPT
)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_response(prompt: str, model: str = "gpt-4") -> str:
    try:
        response = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return ""

async def generate_narrative_flow(idea: str):
    print(f"--- Processing Idea: {idea} ---\n")

    # 1. Expand Idea to Outline
    print("Generating Outline...")
    outline_prompt = STORY_EXPANSION_PROMPT.format(idea=idea)
    outline = await generate_response(outline_prompt)
    print(f"--- Outline ---\n{outline[:500]}...\n")

    # 2. Develop Characters
    print("Developing Characters...")
    char_prompt = CHARACTER_DEVELOPMENT_PROMPT.format(outline=outline)
    characters = await generate_response(char_prompt)
    print(f"--- Characters ---\n{characters[:500]}...\n")

    # 3. Create Scene Beats (for Act 1)
    print("Creating Beats for Act 1...")
    # Extract Act 1 (simple heuristic for this script)
    act_1_summary = "Act 1 content derived from outline..." # Simplified for demo
    beat_prompt = SCENE_BEAT_PROMPT.format(act_summary=outline) # Using full outline for context in this demo
    beats = await generate_response(beat_prompt)
    print(f"--- Beats ---\n{beats[:500]}...\n")

    # 4. Write First Scene
    print("Writing First Scene...")
    scene_prompt = NARRATIVE_WRITING_PROMPT.format(
        scene_beat="Opening scene from the beats above",
        characters="Protagonist",
        tone="Dark, Atmospheric"
    )
    story_text = await generate_response(scene_prompt)
    print(f"--- Story Text ---\n{story_text}\n")

    return story_text

if __name__ == "__main__":
    if len(sys.argv) > 1:
        idea = sys.argv[1]
    else:
        idea = "A lonely astronaut discovers a flower growing on the moon."
    
    asyncio.run(generate_narrative_flow(idea))

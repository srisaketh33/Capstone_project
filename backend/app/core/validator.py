import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import NARRATIVE_CONSISTENCY_CHECK_PROMPT

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def check_consistency(chapter_text: str, context_summary: str) -> dict:
    """
    Checks the chapter for consistency against the provided context.
    """
    prompt = NARRATIVE_CONSISTENCY_CHECK_PROMPT.format(
        context=context_summary,
        chapter=chapter_text
    )

    try:
        response = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4",
            response_format={ "type": "json_object" } # Force JSON output if updated library supports it, else prompt engineer
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error validating consistency: {e}")
        return {
            "plot_holes": [],
            "character_inconsistencies": [],
            "logic_errors": [],
            "suggestions": ["Validation failed due to API error."]
        }

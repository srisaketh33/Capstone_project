import json
from app.core.llm import generate_text
from app.core.prompts import NARRATIVE_CONSISTENCY_CHECK_PROMPT

async def check_consistency(chapter_text: str, context_summary: str) -> dict:
    """
    Checks the chapter for consistency against the provided context.
    """
    prompt = NARRATIVE_CONSISTENCY_CHECK_PROMPT.format(
        context=context_summary,
        chapter=chapter_text
    )

    try:
        # Request JSON format in prompt if model supports it, or just rely on robust prompt
        content = await generate_text(prompt)
        
        # Clean up code blocks if present (common with Gemini)
        if "```json" in content:
            content = content.replace("```json", "").replace("```", "")
        elif "```" in content:
            content = content.replace("```", "")
            
        result = json.loads(content)
        
        # Ensure all required keys exist to prevent Pydantic validation errors
        defaults = {
            "plot_holes": [],
            "character_inconsistencies": [],
            "logic_errors": [],
            "suggestions": []
        }
        
        for key, value in defaults.items():
            if key not in result:
                result[key] = value
                
        return result
    except Exception as e:
        print(f"Error validating consistency: {e}")
        return {
            "plot_holes": [],
            "character_inconsistencies": [],
            "logic_errors": [],
            "suggestions": ["Validation failed due to API error."]
        }

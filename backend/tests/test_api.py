import pytest
from unittest.mock import patch, MagicMock

@pytest.mark.anyio
async def test_generate_story_endpoint(client):
    # Mock external services to avoid real API calls during tests
    with patch("app.api.endpoints.story.generate_text", return_value="A long time ago..."):
        with patch("app.api.endpoints.story.check_consistency", return_value={"plot_holes": [], "character_inconsistencies": [], "logic_errors": [], "suggestions": []}):
            with patch("app.api.endpoints.story.generate_image_from_prompt", return_value="base64string..."):
                with patch("app.api.endpoints.story.analyze_emotion", return_value={"joy": 0.8}):
                    
                    response = await client.post("/story/generate", json={
                        "user_id": "test_user",
                        "prompt": "Test prompt",
                        "context_window_size": 3
                    })
                    
                    assert response.status_code == 200
                    data = response.json()
                    assert data["text"] == "A long time ago..."
                    assert data["sentiment_analysis"]["joy"] == 0.8
                    assert data["validation"]["plot_holes"] == []

@pytest.mark.anyio
async def test_empty_prompt(client):
    # Depending on how we validate, this might just pass or fail if Pydantic requires min_length.
    # Our model defines prompt as str. Let's assume empty string is valid but might result in empty generation if not handled.
    # But for now, let's just check 200 OK or specific behavior.
    
    with patch("app.api.endpoints.story.generate_text", return_value=""):
         # If LLM returns empty, we raise 500 in the endpoint
         response = await client.post("/story/generate", json={
            "user_id": "test_user",
            "prompt": "   ", # whitespace
            "context_window_size": 3
         })
         # Expected behavior depends on implementation. 
         # Current implementation raises HTTPException 500 if text is empty.
         assert response.status_code == 500

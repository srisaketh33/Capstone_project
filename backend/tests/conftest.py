import pytest
import os

# Set mock env vars before importing app to avoid Pydantic validation errors
os.environ["OPENAI_API_KEY"] = "sk-test-key"
os.environ["STABILITY_API_KEY"] = "sk-test-stability-key"

from httpx import AsyncClient
from app.main import app

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

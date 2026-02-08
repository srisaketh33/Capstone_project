import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    STABILITY_API_KEY: str = ""
    PERPLEXITY_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    PROJECT_NAME: str = "Story Forge"

    class Config:
        # Look for .env in the project root (one level up from backend/)
        # Using a list of paths for better robustness
        env_file = [".env", "../.env", "../../.env", "../../../.env"]
        extra = "ignore"

settings = Settings()

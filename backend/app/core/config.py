import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    STABILITY_API_KEY: str = ""
    PERPLEXITY_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    PROJECT_NAME: str = "Story Forge"

    class Config:
        case_sensitive = False
        env_file = [".env", "../.env", "../../.env", "../../../.env"]
        extra = "ignore"

settings = Settings()

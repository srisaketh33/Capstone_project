import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    STABILITY_API_KEY: str = ""
    PROJECT_NAME: str = "Story Forge"

    class Config:
        env_file = ".env"

settings = Settings()

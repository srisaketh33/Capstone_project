import os
from dotenv import load_dotenv
# Ensure the local .env is loaded first
load_dotenv(override=True)

import certifi
# Fix for SSL certificate issues on Windows
os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = certifi.where()
os.environ["SSL_CERT_FILE"] = certifi.where()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import story, auth, generation, memory, sentiment, validator, images, admin

app = FastAPI(title=settings.PROJECT_NAME)

# CORS (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(story.router, prefix="/story", tags=["unified-story"])
app.include_router(generation.router, prefix="/generation", tags=["llm"])
app.include_router(memory.router, prefix="/memory", tags=["vector-db"])
app.include_router(sentiment.router, prefix="/sentiment", tags=["analysis"])
app.include_router(validator.router, prefix="/validator", tags=["quality"])
app.include_router(images.router, prefix="/images", tags=["image-generation"])
app.include_router(admin.router, prefix="/admin", tags=["admin-dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Story Forge AI Narrative Engine"}

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "llm_key_configured": bool(settings.OPENAI_API_KEY or settings.GEMINI_API_KEY),
        "image_key_configured": bool(settings.STABILITY_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY.startswith("AIza"))
    }

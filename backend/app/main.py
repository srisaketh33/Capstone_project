from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import story

app = FastAPI(title=settings.PROJECT_NAME)

# CORS (Allow Frontend)
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(story.router, prefix="/story", tags=["story"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Story Forge API"}

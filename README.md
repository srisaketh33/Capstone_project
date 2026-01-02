# Story Forge

**Story Forge** is a multi-modal AI assistant designed to help creative writers overcome writer's block and maintain narrative consistency.

## Features
*   **AI Narrative Generation**: Continuations, plot twists, and character dialogues.
*   **Sentiment Analysis**: Real-time emotional tone monitoring.
*   **Visual Generation**: Create character portraits and scene mood boards on the fly.

## Tech Stack
*   **Backend**: FastAPI (Python)
*   **Frontend**: React + Vite
*   **AI**: OpenAI GPT / Anthropic Claude (Text), Stable Diffusion (Images)

## Setup
### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

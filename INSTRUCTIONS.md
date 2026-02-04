# Project Setup and Run Instructions

This document provides step-by-step instructions on how to set up and run the Story Forge application.

## Prerequisites
Ensure you have the following installed on your system:
- **Python** (version 3.8 or higher)
- **Node.js** (LTS version recommended)
- **npm** (usually comes with Node.js)

---

## 1. Environment Configuration
The backend application requires API keys to function (specifically for OpenAI).

1.  Navigate to the root directory of the project (`Capstone/`).
2.  Create a new file named `.env` if it does not already exist.
3.  Open `.env` and add the following configuration:

    ```env
    # Required for text generation
    OPENAI_API_KEY=your_openai_api_key_here

    # Optional: Required if you want image generation features
    STABILITY_API_KEY=your_stability_api_key_here
    
    # Project Settings (Defaults are usually fine)
    PROJECT_NAME="Story Forge"
    ```

> **Note**: Replace `your_openai_api_key_here` with your actual OpenAI API key.

---

## 2. Backend Setup (FastAPI)
The backend handles the core logic and AI processing.

1.  Open a terminal and navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  (Recommended) Create a virtual environment to isolate dependencies:
    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment:
    *   **Windows**:
        ```bash
        .\venv\Scripts\activate
        ```
    *   **Mac/Linux**:
        ```bash
        source venv/bin/activate
        ```

4.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

5.  Start the backend server:
    ```bash
    uvicorn app.main:app --reload
    ```

    *   The server will start at `http://127.0.0.1:8000`.
    *   You can view the interactive API docs at `http://127.0.0.1:8000/docs`.

---

## 3. Frontend Setup (React + Vite)
The frontend provides the user interface.

1.  Open a **new** terminal window (keep the backend running in the first one).

2.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

3.  Install the Node.js dependencies:
    ```bash
    npm install
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

    *   The application should now be accessible at `http://localhost:5173`.

---

## 4. Running the Application
Once both servers are running:
1.  Open your web browser.
2.  Go to `http://localhost:5173`.
3.  You should see the Story Forge interface.

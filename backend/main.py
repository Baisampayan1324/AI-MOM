import uvicorn
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import HOST, PORT  # Loads dotenv automatically
from app.api.routes import router as api_router
from app.api.websocket import router as websocket_router

# Create FastAPI application
app = FastAPI(
    title="Meeting Minutes Real-time System",
    description="A system for real-time transcription and summarization of meeting audio",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static frontend (if exists)
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/frontend", StaticFiles(directory=frontend_path), name="frontend")

# Include routers
app.include_router(api_router, prefix="/api", tags=["api"])
app.include_router(websocket_router, tags=["websocket"])

# -----------------------------------------------------------
# ✅ Extension-friendly endpoint for audio chunk transcription
# -----------------------------------------------------------
@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Accepts audio chunks (WebM/PCM/etc.) from browser extension,
    runs transcription (Whisper, Deepgram, Groq, etc.), and returns text.
    """
    try:
        # TODO: Replace with actual model (Whisper/Groq/Deepgram)
        contents = await file.read()
        size_kb = len(contents) / 1024

        # Placeholder result
        transcript = f"Received {file.filename} ({size_kb:.1f} KB). [Transcription pending]"

        return {"text": transcript}
    except Exception as e:
        return {"error": str(e)}

# -----------------------------------------------------------

@app.get("/")
async def root():
    return {"message": "Meeting Minutes Real-time System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Server startup
if __name__ == "__main__":
    uvicorn.run(
        "main:app",  # Use import string for reload support
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )

FROM python:3.11-slim

# Install system dependencies
# libsndfile1 is required by soundfile/librosa
# build-essential is required for some python packages that need to compile C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# NOTE: Pre-downloading models at build time can create very large images and
# long build times. Models (Whisper, torch weights) are best downloaded at
# runtime or stored in a mounted cache. Removed pre-download to keep image small.

# Copy entire backend application
COPY backend/ .

# Expose port (Render will use the PORT environment variable)
EXPOSE 8000

# Run the application with uvicorn, using environment variables if provided.
# Uses ${PORT} and ${UVICORN_WORKERS} if set; defaults to 8000 and 4 workers.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${UVICORN_WORKERS:-4}"]

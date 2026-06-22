FROM python:3.10-slim

# Install system dependencies (ffmpeg is needed for audio processing)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set up a new user named "user" with user ID 1000 (Required by HF Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements and install
COPY --chown=user:user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY --chown=user:user backend/ .

# HF Spaces expose port 7860
EXPOSE 7860
ENV PORT=7860
ENV HOST=0.0.0.0

# Start the application
CMD ["python", "main.py"]

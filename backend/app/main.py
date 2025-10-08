from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
import os
import asyncio
import signal
import sys
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler  # type: ignore
    from slowapi.util import get_remote_address  # type: ignore
    from slowapi.errors import RateLimitExceeded  # type: ignore
    slowapi_available = True
except ImportError:
    slowapi_available = False
    Limiter = None
    _rate_limit_exceeded_handler = None
    get_remote_address = None
    RateLimitExceeded = Exception  # type: ignore
import time
import logging
from contextlib import asynccontextmanager
from app.api.routes import router as api_router
from app.api.websocket import router as websocket_router

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize rate limiter
if slowapi_available and Limiter and get_remote_address:
    limiter = Limiter(key_func=get_remote_address)
else:
    limiter = None

# Custom rate limit exceeded handler
def rate_limit_exceeded_handler(request: Request, exc: Exception) -> Response:
    return Response(
        content="Rate limit exceeded. Please try again later.",
        status_code=429,
        media_type="text/plain"
    )

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 AI MOM Backend starting up...")
    try:
        # Add any startup logic here
        yield
    finally:
        # Shutdown
        logger.info("🛑 AI MOM Backend shutting down...")
        try:
            # Clean up any resources
            await asyncio.sleep(0.1)  # Give time for connections to close
            logger.info("✅ Graceful shutdown completed")
        except Exception as e:
            logger.error(f"❌ Error during shutdown: {e}")

app = FastAPI(
    title="Advanced Meeting Minutes Real-time System",
    description="Multi-API optimized system for real-time transcription and summarization of meeting audio",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)
if limiter:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Add CORS middleware with WebSocket support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers for CORS detection
    allow_origin_regex="https?://.*",  # Allow WebSocket connections from any origin
)

# Add request/response logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request
    logger.info(f"📨 {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")

    # Process request
    response = await call_next(request)

    # Log response
    process_time = time.time() - start_time
    logger.info(f"✅ {response.status_code} in {process_time:.3f}s")

    return response

# Include routers
app.include_router(api_router, prefix="/api", tags=["api"])
app.include_router(websocket_router, tags=["websocket"])

# Serve frontend files
# frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend")
# if os.path.exists(frontend_path):
#     app.mount("/", StaticFiles(directory=frontend_path), name="frontend")
# else:
#     logger.warning(f"Frontend directory not found at {frontend_path}, serving API only")

@app.get("/")
async def root():
    return {"message": "Advanced Meeting Minutes Real-time System API v2.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}
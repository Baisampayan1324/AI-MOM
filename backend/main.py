import uvicorn
import os
import sys
import signal
import asyncio
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def signal_handler(signum, frame):
    print("\n🛑 Received shutdown signal. Shutting down gracefully...")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    host = os.getenv("HOST", "0.0.0.0")  # Listen on all interfaces
    port = int(os.getenv("PORT", "8000"))

    print("=" * 60)
    print("🚀 AI MOM Backend Server Starting...")
    print("=" * 60)
    print(f"📡 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🌐 Access at: http://localhost:{port}")
    print(f"📚 API Docs: http://localhost:{port}/docs")
    print(f"🔧 Health Check: http://localhost:{port}/health")
    print("=" * 60)
    print("\n💡 The server is now running. It will stay active until you press CTRL+C")
    print("   This is NORMAL behavior - the server is waiting for requests.\n")
    
    try:
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,  # Enable reload for development
            log_level="info",
            ws="websockets",  # Explicitly specify WebSocket implementation
            ws_ping_interval=20,  # Ping interval in seconds
            ws_ping_timeout=20,   # Ping timeout in seconds
            access_log=False,  # Reduce log noise
        )
    except KeyboardInterrupt:
        print("\n✅ Server stopped gracefully")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)
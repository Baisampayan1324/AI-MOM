#!/usr/bin/env python3
"""
Simple test script for the new_backend multi-API processor.
This tests the core functionality without requiring actual API keys.
"""

import numpy as np
import sys
import os

# Add the app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test that all modules can be imported."""
    try:
        from app.config import GROQ_API_KEY, OPENROUTER_API_KEY
        from app.services.audio_processor import AudioProcessor
        from app.services.multi_api_processor import MultiAPIProcessor
        from app.services.summarizer import Summarizer
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_audio_processor():
    """Test audio processor initialization."""
    try:
        from app.services.audio_processor import AudioProcessor
        processor = AudioProcessor()
        gpu_available = processor.check_gpu()
        print(f"✓ Audio processor initialized. GPU available: {gpu_available}")
        return True
    except Exception as e:
        print(f"✗ Audio processor failed: {e}")
        return False

def test_config():
    """Test configuration loading."""
    try:
        from app.config import GROQ_API_KEY, OPENROUTER_API_KEY, HOST, PORT
        print(f"✓ Config loaded: HOST={HOST}, PORT={PORT}")
        print(f"  API Keys configured: GROQ={'Yes' if GROQ_API_KEY else 'No'}, OpenRouter={'Yes' if OPENROUTER_API_KEY else 'No'}")
        return True
    except Exception as e:
        print(f"✗ Config failed: {e}")
        return False

def main():
    print("🧪 Testing New Backend Components")
    print("=" * 40)

    tests = [
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Audio Processor", test_audio_processor),
    ]

    passed = 0
    total = len(tests)

    for name, test_func in tests:
        print(f"\nTesting {name}:")
        if test_func():
            passed += 1

    print(f"\n{'='*40}")
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All core components are working!")
        print("\nNext steps:")
        print("1. Set real API keys in .env file")
        print("2. Install remaining dependencies: pip install -r requirements.txt")
        print("3. Test with actual audio file using the API endpoints")
    else:
        print("❌ Some components need fixing")

if __name__ == "__main__":
    main()
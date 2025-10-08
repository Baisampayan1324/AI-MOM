#!/usr/bin/env python3
"""
Test script for the 5-model multi-API transcription system.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.services.multi_api_processor import MultiAPIProcessor
    from app.services.summarizer import Summarizer
    print("✓ All imports successful")

    # Test initialization
    processor = MultiAPIProcessor()
    summarizer = Summarizer()
    print("✓ Services initialized successfully")

    # Test API checks
    api_status = processor.check_apis()
    print(f"✓ API status check completed: {api_status}")

    print("✓ 5-model multi-API system is ready!")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
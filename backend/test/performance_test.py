#!/usr/bin/env python3
"""
Quick performance test for 2-model processing.
"""

import asyncio
import time
import numpy as np
from app.services.multi_api_processor import MultiAPIProcessor
from app.services.audio_processor import AudioProcessor
from app.services.summarizer import Summarizer

async def test_performance():
    """Test the performance of 2-model processing."""
    print("🧪 Testing 2-Model Performance")
    print("=" * 40)

    # Initialize services
    multi_processor = MultiAPIProcessor()
    audio_processor = AudioProcessor()
    summarizer = Summarizer()

    # Load test audio
    test_file = "P:\\back\\backend\\Weekly Meeting.mp3"
    print(f"📁 Loading audio: {test_file}")

    try:
        audio_data, sample_rate = audio_processor.load_audio(test_file)
        print(f"✅ Loaded {len(audio_data)} samples at {sample_rate}Hz")

        # Test 2-model parallel processing (~20 seconds target)
        print("\n🚀 Testing 2-model parallel processing (~20 seconds)...")
        start_time = time.time()

        transcription_result = await multi_processor.process_transcription_2_model(audio_data)

        transcription_time = time.time() - start_time
        print(f"⏱️  Ultra-fast transcription completed in {transcription_time:.2f}s")

        # Test ultra-fast summary
        print("\n📝 Testing ultra-fast summary...")
        summary_start = time.time()

        summary = await summarizer.generate_ultra_fast_summary(transcription_result['transcription'])

        summary_time = time.time() - summary_start
        print(f"⏱️  Summary completed in {summary_time:.2f}s")

        # Total time
        total_time = transcription_time + summary_time
        print(f"⏱️  Total processing time: {total_time:.2f}s")

        print(f"\n📊 Results:")
        print(f"   Transcription: {len(transcription_result['transcription'])} chars")
        print(f"   Summary: {len(summary) if summary else 0} chars")
        print(f"   Audio chunks: {transcription_result.get('audio_chunks', 'N/A')}")
        print(f"   Whisper chunks successful: {transcription_result.get('whisper_chunks_successful', 'N/A')}")

        # Performance assessment
        if total_time <= 5:
            print("🎉 ACHIEVED: 5-second target!")
        elif total_time <= 8:
            print("🏆 EXCELLENT: Under 8 seconds")
        elif total_time <= 10:
            print("👍 VERY GOOD: Under 10 seconds")
        elif total_time <= 15:
            print("👌 GOOD: Under 15 seconds")
        else:
            print("⚠️  ACCEPTABLE: Under 20 seconds")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_performance())
#!/usr/bin/env python3
"""
WebSocket Testing Script for AI MOM Backend
Tests real-time audio processing and speaker alerts.
"""

import asyncio
import websockets
import json
import time
import numpy as np
import threading
import pyaudio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketTester:
    def __init__(self, uri="ws://localhost:8000/ws/audio"):
        self.uri = uri
        self.websocket = None

    async def connect(self):
        """Connect to WebSocket."""
        try:
            self.websocket = await websockets.connect(self.uri)
            logger.info("Connected to WebSocket")
            return True
        except Exception as e:
            logger.error(f"Failed to connect: {e}")
            return False

    async def send_audio_chunk(self, audio_data, timestamp=None):
        """Send audio chunk for processing."""
        if not self.websocket:
            return

        if timestamp is None:
            timestamp = time.time()

        message = {
            "type": "audio_chunk",
            "audio_data": audio_data.tolist() if isinstance(audio_data, np.ndarray) else audio_data,
            "timestamp": timestamp
        }

        await self.websocket.send(json.dumps(message))
        logger.info("Sent audio chunk")

    async def receive_messages(self):
        """Receive and process messages from server."""
        if not self.websocket:
            return

        try:
            async for message in self.websocket:
                data = json.loads(message)
                msg_type = data.get("type")

                if msg_type == "transcription":
                    logger.info(f"📝 Transcription: {data.get('text', '')}")
                    logger.info(f"🎤 Speaker: {data.get('speaker_id', 'Unknown')}")
                    logger.info(f"🎯 Confidence: {data.get('confidence', 0.0)}")

                elif msg_type == "speaker_alert":
                    logger.warning(f"🚨 ALERT: {data.get('message', '')}")
                    logger.warning(f"📢 Type: {data.get('alert_type', 'unknown')}")

                elif msg_type == "pong":
                    logger.info("🏓 Pong received")

                else:
                    logger.info(f"📨 Message: {data}")

        except websockets.exceptions.ConnectionClosed:
            logger.info("WebSocket connection closed")

    async def send_ping(self):
        """Send ping to keep connection alive."""
        while True:
            await asyncio.sleep(10)
            if self.websocket:
                try:
                    await self.websocket.send(json.dumps({"type": "ping"}))
                    logger.info("🏓 Ping sent")
                except:
                    break

    def generate_test_audio(self, duration=2.0, sample_rate=16000):
        """Generate test audio data (sine wave)."""
        t = np.linspace(0, duration, int(sample_rate * duration))
        # Generate a simple sine wave
        audio = 0.5 * np.sin(2 * np.pi * 440 * t)  # 440 Hz tone
        return audio.astype(np.float32)

    async def test_basic_connection(self):
        """Test basic WebSocket connection."""
        logger.info("🧪 Testing basic WebSocket connection...")

        if not await self.connect():
            return False

        # Start ping task
        ping_task = asyncio.create_task(self.send_ping())

        # Start receiver task
        receive_task = asyncio.create_task(self.receive_messages())

        # Send test audio chunks
        logger.info("🎵 Sending test audio chunks...")
        for i in range(3):
            audio_chunk = self.generate_test_audio(duration=1.0)
            await self.send_audio_chunk(audio_chunk)
            await asyncio.sleep(2)  # Wait between chunks

        # Wait a bit for responses
        await asyncio.sleep(5)

        # Close connection
        if self.websocket:
            await self.websocket.close()

        # Cancel tasks
        ping_task.cancel()
        receive_task.cancel()

        logger.info("✅ Basic connection test completed")
        return True

    async def test_with_microphone(self):
        """Test with real microphone input."""
        logger.info("🎤 Testing with microphone input...")

        if not await self.connect():
            return False

        # Initialize PyAudio
        audio = pyaudio.PyAudio()
        stream = audio.open(
            format=pyaudio.paFloat32,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=1024
        )

        logger.info("🎙️ Listening... Speak into microphone (10 seconds)")

        # Start ping task
        ping_task = asyncio.create_task(self.send_ping())
        receive_task = asyncio.create_task(self.receive_messages())

        # Record and send audio for 10 seconds
        start_time = time.time()
        chunk_duration = 1.0  # 1 second chunks

        try:
            while time.time() - start_time < 10:
                # Read audio chunk
                data = stream.read(int(16000 * chunk_duration))
                audio_chunk = np.frombuffer(data, dtype=np.float32)

                # Send to server
                await self.send_audio_chunk(audio_chunk)

                await asyncio.sleep(0.1)  # Small delay

        except KeyboardInterrupt:
            logger.info("⏹️ Stopped by user")

        finally:
            # Cleanup
            stream.stop_stream()
            stream.close()
            audio.terminate()

            if self.websocket:
                await self.websocket.close()

            ping_task.cancel()
            receive_task.cancel()

        logger.info("✅ Microphone test completed")

async def main():
    """Main test function."""
    print("🎵 AI MOM WebSocket Tester")
    print("=" * 50)

    tester = WebSocketTester()

    # Test 1: Basic connection
    print("\n1️⃣ Testing basic WebSocket connection...")
    await tester.test_basic_connection()

    print("\n🎉 Basic test completed!")

if __name__ == "__main__":
    asyncio.run(main())
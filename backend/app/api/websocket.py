from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # Store active connections per meeting
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []
        self.active_connections[meeting_id].append(websocket)

    def disconnect(self, websocket: WebSocket, meeting_id: str):
        if meeting_id in self.active_connections:
            self.active_connections[meeting_id].remove(websocket)
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, meeting_id: str, message: dict):
        if meeting_id in self.active_connections:
            # Send to all connections in this meeting
            for connection in self.active_connections[meeting_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    # Remove dead connections
                    self.active_connections[meeting_id].remove(connection)

# Initialize connection manager
manager = ConnectionManager()

# Store browser extension connections separately
browser_extension_connections: List[WebSocket] = []

# Create router
router = APIRouter()

@router.websocket("/ws/meeting/{meeting_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str):
    await manager.connect(websocket, meeting_id)
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            # Echo back for testing
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_id)

@router.websocket("/ws/browser-extension")
async def browser_extension_websocket(websocket: WebSocket):
    await websocket.accept()
    browser_extension_connections.append(websocket)
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            # Echo back for testing
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        if websocket in browser_extension_connections:
            browser_extension_connections.remove(websocket)

async def broadcast_to_browser_extensions(message: dict):
    """Broadcast message to all connected browser extensions"""
    for connection in browser_extension_connections:
        try:
            await connection.send_text(json.dumps(message))
        except:
            # Remove dead connections
            browser_extension_connections.remove(connection)
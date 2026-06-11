from fastapi import WebSocket
from typing import Dict, Any
import json, asyncio
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections[client_id] = websocket

    async def disconnect(self, client_id: str):
        async with self._lock:
            self.active_connections.pop(client_id, None)

    async def broadcast(self, message_type: str, payload: Any):
        message = json.dumps({"type": message_type, "payload": payload,
            "timestamp": datetime.utcnow().isoformat()}, default=str)
        dead = []
        async with self._lock:
            connections = list(self.active_connections.items())
        for cid, ws in connections:
            try:
                await ws.send_text(message)
            except:
                dead.append(cid)
        for cid in dead:
            await self.disconnect(cid)

    @property
    def connection_count(self): return len(self.active_connections)

ws_manager = ConnectionManager()

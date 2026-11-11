import asyncio
from datetime import UTC, datetime

from fastapi import WebSocket, WebSocketDisconnect


class OperationsHub:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)

    async def broadcast(self, event: str, data: dict) -> None:
        message = {
            "evento": event,
            "creado_en": datetime.now(UTC).isoformat(),
            "datos": data,
        }
        async with self._lock:
            connections = tuple(self._connections)
        disconnected = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except (WebSocketDisconnect, OSError, RuntimeError):
                disconnected.append(connection)
        for connection in disconnected:
            await self.disconnect(connection)


operations_hub = OperationsHub()

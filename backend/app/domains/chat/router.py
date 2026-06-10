import json
import logging
from datetime import datetime
from typing import Set, Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger("fitnaija.chat")

message_history: Dict[str, List[dict]] = {}

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}
        self.user_map: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str, channel: str = "general"):
        await websocket.accept()
        if channel not in self.active:
            self.active[channel] = set()
        self.active[channel].add(websocket)
        self.user_map[id(websocket)] = user_id

    def disconnect(self, websocket: WebSocket, channel: str = "general"):
        if channel in self.active:
            self.active[channel].discard(websocket)
        self.user_map.pop(id(websocket), None)

    async def broadcast(self, message: str, channel: str = "general"):
        if channel not in self.active:
            return
        dead = set()
        for ws in self.active[channel]:
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.active[channel].discard(ws)
            self.user_map.pop(id(ws), None)

manager = ConnectionManager()


@router.websocket("/ws")
async def chat_websocket(websocket: WebSocket, token: str = "", channel: str = "general"):
    from backend.app.core.security import decode_token
    claims = decode_token(token)
    if not claims or claims.get("type") != "access":
        await websocket.close(code=4001)
        return

    user_id = claims.get("sub")
    if not user_id:
        await websocket.close(code=4001)
        return

    if channel not in message_history:
        message_history[channel] = []

    # Send existing history to the newly connected user
    await websocket.send_text(json.dumps({
        "type": "history",
        "messages": message_history[channel][-50:]
    }))

    await manager.connect(websocket, user_id, channel)

    # Broadcast join message
    await manager.broadcast(json.dumps({
        "type": "system",
        "content": f"User joined {channel}",
        "created_at": datetime.utcnow().isoformat(),
    }), channel)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            content = msg.get("content", "").strip()
            display_name = msg.get("display_name", "Anonymous")
            if not content:
                continue

            payload = {
                "type": "message",
                "user_id": user_id,
                "display_name": display_name,
                "content": content,
                "created_at": datetime.utcnow().isoformat(),
            }
            message_history[channel].append(payload)
            # Keep only last 200 messages per channel
            if len(message_history[channel]) > 200:
                message_history[channel] = message_history[channel][-200:]

            await manager.broadcast(json.dumps(payload), channel)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
        await manager.broadcast(json.dumps({
            "type": "system",
            "content": f"User left {channel}",
            "created_at": datetime.utcnow().isoformat(),
        }), channel)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, channel)

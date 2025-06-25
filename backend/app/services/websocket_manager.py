import asyncio
import json
from typing import Dict, List
from fastapi import WebSocket

from app.services.redis_service import redis_service

class WebSocketManager:
    def __init__(self):
        self.user_connections: Dict[int, List[WebSocket]] = {}
        self.cli_connections: Dict[str, WebSocket] = {}

    async def connect_user(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect_user(self, user_id: int, websocket: WebSocket):
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def connect_cli(self, device_code: str, websocket: WebSocket):
        await websocket.accept()
        self.cli_connections[device_code] = websocket

    def disconnect_cli(self, device_code: str):
        if device_code in self.cli_connections:
            del self.cli_connections[device_code]

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.user_connections:
            websockets = self.user_connections[user_id]
            for websocket in websockets:
                await websocket.send_json(message)

    async def send_to_cli(self, device_code: str, message: dict):
        if device_code in self.cli_connections:
            websocket = self.cli_connections[device_code]
            await websocket.send_json(message)

    async def listen_for_redis_messages(self):
        pubsub = redis_service.ar.pubsub()
        await pubsub.psubscribe("user-updates:*", "cli-auth-success:*")
        
        while True:
            try:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    channel = message['channel']
                    data = json.loads(message['data'])
                    
                    if channel.startswith("user-updates:"):
                        user_id = int(channel.split(":")[1])
                        await self.broadcast_to_user(user_id, data)
                    
                    elif channel.startswith("cli-auth-success:"):
                        device_code = channel.split(":")[1]
                        await self.send_to_cli(device_code, data)
                await asyncio.sleep(0.01)
            except Exception as e:
                print(f"Redis Pub/Sub listener error: {e}")
                await asyncio.sleep(5)

manager = WebSocketManager()
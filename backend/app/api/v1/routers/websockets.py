import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.websocket_manager import manager
from app.api.v1 import dependencies
from app.db import models

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/cli/authorize/{device_code}")
async def websocket_cli_authorize(websocket: WebSocket, device_code: str):
    await manager.connect_cli(device_code, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_cli(device_code)

@router.websocket("/user/updates")
async def websocket_user_updates(
    websocket: WebSocket,
    user: models.User = Depends(dependencies.get_current_user_from_ws)
):
    await manager.connect_user(user.id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_user(user.id, websocket)
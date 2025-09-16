import asyncio
from typing import Dict
from fastapi import WebSocket
from models import InitMessage, Room, Shape, WSMessage

class RoomManager():
    def __init__(self) -> None:
        self.rooms: Dict[str, Room] = {}
    
    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = Room(connections=[], chat=[], shapes=[])
        self.rooms[room_id].connections.append(websocket)

        message = InitMessage(type="init", payload=self.rooms[room_id].shapes)

        await websocket.send_json(message.model_dump())
    
    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id].connections.remove(websocket)
            if not self.rooms[room_id].connections:
                del self.rooms[room_id]
    
    async def broadcast(self, room_id: str, message: dict, exclude: WebSocket | None = None):
        if room_id not in self.rooms:
            return
        tasks = [ws.send_json(message) for ws in self.rooms[room_id].connections if ws != exclude]
        await asyncio.gather(*tasks)
    
    def update_shapes(self, room_id: str, shape: Shape):
        shapes = self.rooms[room_id].shapes
        for i, s in enumerate(shapes):
            if s.id == shape.id:
                shapes[i] = shape
                return
        shapes.append(shape)
    
    def reset_shapes(self, room_id: str):
        self.rooms[room_id].shapes = []
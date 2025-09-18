import uuid
from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import TypeAdapter
from ws_manager import RoomManager
from models import ChatMessage, Message, ResetMessage, Shape, ShapeMessage, WSMessage
from pathlib import Path

app = FastAPI()
api_router = APIRouter(prefix="/api")
room_manager = RoomManager()

wsmessage_adapter = TypeAdapter(WSMessage)
frontend_path = Path(__file__).parent.parent / "collab" / "dist"

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(room_id: str, websocket: WebSocket):
    await room_manager.connect(room_id=room_id, websocket=websocket)
    try:
        while True:
            data = await websocket.receive_json()

            try:
                safe_data = wsmessage_adapter.validate_python(data)
            except Exception:
                continue

            shape_adapter = TypeAdapter(Shape)
            chat_adapter = TypeAdapter(Message)

            type = safe_data.type

            if type == "shape":
                payload = safe_data.payload
                shape = shape_adapter.validate_python(payload)
                room_manager.update_shapes(room_id=room_id, shape=shape)
                await room_manager.broadcast(room_id=room_id, message=ShapeMessage(type="shape", payload=shape).model_dump(), exclude=websocket)

            elif type == "reset":
                #reset has no payload
                room_manager.reset_shapes(room_id=room_id)
                await room_manager.broadcast(room_id=room_id, message=ResetMessage(type="reset").model_dump(), exclude=websocket)

            elif type == "chat":
                payload = safe_data.payload
                msg = chat_adapter.validate_python(payload)
                room_manager.rooms[room_id].chat.append(msg)
                await room_manager.broadcast(room_id=room_id, message=ChatMessage(type="chat", payload=msg).model_dump(), exclude=websocket)
            
    except WebSocketDisconnect:
        room_manager.disconnect(room_id=room_id, websocket=websocket)

@api_router.post("/rooms")
def create_room():
    room_id = str(uuid.uuid4())[:8]
    return {"room_id": room_id}

@api_router.get("/rooms/{room_id}")
def check_room(room_id: str):
    return {"room_id": room_id}

app.include_router(api_router)

app.mount("/assets", StaticFiles(directory=frontend_path / "assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    return FileResponse(frontend_path / "index.html")
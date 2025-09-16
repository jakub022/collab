from typing import Literal, List, Union
from pydantic import BaseModel

class SquareShape(BaseModel):
    id: str
    type: Literal["square"]
    x: float
    y: float

class TextShape(BaseModel):
    id: str
    type: Literal["text"]
    x: float
    y: float
    text: str

class PenShape(BaseModel):
    id: str
    type: Literal["pen"]
    points: List[float]

class ArrowShape(BaseModel):
    id: str
    type: Literal["arrow"]
    points: List[float]

Shape = Union[SquareShape, TextShape, PenShape, ArrowShape]

class Message(BaseModel):
    id: str
    text: str
    username: str

class Room(BaseModel):
    connections: List
    shapes: List[Shape] = []
    chat: List[Message] = []

class ShapeMessage(BaseModel):
    type: Literal["shape"]
    payload: Shape

class ResetMessage(BaseModel):
    type: Literal["reset"]

class ChatMessage(BaseModel):
    type: Literal["chat"]
    payload: Message

class InitMessage(BaseModel):
    type: Literal["init"]
    payload: List[Shape]

WSMessage = Union[ShapeMessage, ResetMessage, ChatMessage, InitMessage]
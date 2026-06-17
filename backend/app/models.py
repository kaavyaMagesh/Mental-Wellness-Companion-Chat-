from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class ChatSessionCreate(BaseModel):
    title: Optional[str] = Field(None, description="Optional title for the chat session")
    system_context: Optional[str] = Field(None, description="System context or persona instructions")

class ChatSessionUpdate(BaseModel):
    title: str = Field(..., description="The new title for the chat session")


class ChatSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: Optional[str] = None
    system_context: Optional[str] = None
    risk_level: str
    is_active: bool
    last_message_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    message: str = Field(..., description="The user's message content")

class MessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    user_id: UUID
    sender: str
    message: str
    tokens_used: int
    risk_flag: bool
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

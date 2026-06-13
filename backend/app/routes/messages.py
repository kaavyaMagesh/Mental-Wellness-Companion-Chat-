from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from uuid import UUID
import asyncio
from app.models import MessageCreate, MessageResponse
from app.database import get_supabase_client
from supabase import Client

router = APIRouter()

MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

from app.context_manager import build_llm_context

async def mock_generate_ai_reply(context: list) -> dict:
    """Mock AI Service simulating a fast response."""
    await asyncio.sleep(1) # Simulate network latency
    
    # Extract the last user message from context to drive the mock logic
    user_message = context[-1]["content"] if context else ""
    
    # Very simple mock logic matching the blueprint's sample response
    if "anxious" in user_message.lower() or "placement" in user_message.lower():
        reply = "That is a common pressure point for final-year students. Let us slow this down a bit. What feels most uncertain right now?"
    else:
        reply = "I hear you. Tell me more about how that makes you feel."
        
    return {
        "reply": reply,
        "tokens_used": 42,
        "risk_flag": False
    }

@router.post("/sessions/{session_id}/messages", response_model=List[MessageResponse], status_code=status.HTTP_201_CREATED)
async def send_message(session_id: UUID, payload: MessageCreate, db: Client = Depends(get_supabase_client)):
    try:
        # 1. Build LLM Context Window
        llm_context = build_llm_context(db, session_id, payload.message)

        # 2. Insert User Message
        user_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "user",
            "message": payload.message,
            "tokens_used": 0,
            "risk_flag": False,
            "metadata": {}
        }
        
        user_res = db.table("chat_messages").insert(user_msg_data).execute()
        if not user_res.data:
            raise HTTPException(status_code=500, detail="Failed to save user message")
            
        user_message_row = user_res.data[0]
        
        # 3. Call AI Service (Mock) using the full context window
        ai_response = await mock_generate_ai_reply(llm_context)
        
        # 3. Insert AI Message
        ai_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "assistant",
            "message": ai_response["reply"],
            "tokens_used": ai_response["tokens_used"],
            "risk_flag": ai_response["risk_flag"],
            "metadata": {"agent": "mock-ai"}
        }
        
        ai_res = db.table("chat_messages").insert(ai_msg_data).execute()
        if not ai_res.data:
            raise HTTPException(status_code=500, detail="Failed to save AI message")
            
        ai_message_row = ai_res.data[0]
        
        # 4. Update Session timestamp
        # Using a raw query payload for last_message_at isn't trivial in supabase-py without RPC,
        # so we will rely on the default timestamp if possible or skip the exact now() for the mock.
        # Let's skip the exact time update for now or just fetch current ISO time:
        from datetime import datetime, timezone
        now_iso = datetime.now(timezone.utc).isoformat()
        db.table("chat_sessions").update({"last_message_at": now_iso}).eq("id", str(session_id)).execute()
        
        # 5. Return both messages
        return [user_message_row, ai_message_row]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    session_id: UUID, 
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Client = Depends(get_supabase_client)
):
    try:
        response = db.table("chat_messages")\
            .select("*")\
            .eq("session_id", str(session_id))\
            .eq("user_id", MOCK_USER_ID)\
            .order("created_at", desc=False)\
            .range(offset, offset + limit - 1)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

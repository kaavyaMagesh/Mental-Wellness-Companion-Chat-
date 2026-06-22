from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from uuid import UUID
import asyncio
from app.models import MessageCreate, MessageResponse
from app.database import get_supabase_client
from supabase import Client

router = APIRouter()

MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

import os
import google.generativeai as genai
from sse_starlette.sse import EventSourceResponse
from app.context_manager import build_llm_context
from app.rate_limiter import check_rate_limits

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

@router.post("/sessions/{session_id}/messages", response_model=List[MessageResponse], status_code=status.HTTP_201_CREATED, dependencies=[Depends(check_rate_limits)])
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

@router.post("/sessions/{session_id}/stream", dependencies=[Depends(check_rate_limits)])
async def stream_message(session_id: UUID, payload: MessageCreate, db: Client = Depends(get_supabase_client)):
    """
    Server-Sent Events endpoint that proxies Gemini stream to the client.
    Handles backpressure and client disconnects natively via sse-starlette.
    """
    try:
        # 1. Build Context
        llm_context = build_llm_context(db, session_id, payload.message)
        
        # 2. Save User Message
        user_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "user",
            "message": payload.message,
            "tokens_used": 0,
            "risk_flag": False,
            "metadata": {}
        }
        db.table("chat_messages").insert(user_msg_data).execute()
        
        # 3. Setup Gemini API
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        async def event_generator():
            full_response = ""
            tokens_used = 0
            
            if gemini_key:
                genai.configure(api_key=gemini_key)
                # Convert context array to Gemini format
                # Gemini format: [{'role': 'user'|'model', 'parts': ['text']}]
                # System prompt needs to be passed to model init or prepended
                gemini_history = []
                system_instruction = ""
                
                for msg in llm_context:
                    if msg["role"] == "system":
                        system_instruction += msg["content"] + "\n"
                    elif msg["role"] == "user":
                        gemini_history.append({"role": "user", "parts": [msg["content"]]})
                    elif msg["role"] == "assistant":
                        gemini_history.append({"role": "model", "parts": [msg["content"]]})
                
                # Gemini strictly alternates user/model. If history ends with model and new message is user, we are fine.
                # Actually, the last message in llm_context is the new user message. We pop it out to send as `send_message`.
                new_msg_str = ""
                if gemini_history and gemini_history[-1]["role"] == "user":
                    new_msg_str = gemini_history.pop()["parts"][0]
                
                model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
                chat = model.start_chat(history=gemini_history)
                
                try:
                    response = chat.send_message(new_msg_str, stream=True)
                    for chunk in response:
                        if chunk.text:
                            full_response += chunk.text
                            # Approx token tracking
                            tokens_used += len(chunk.text.split()) * 1.3
                            yield {"data": chunk.text}
                            await asyncio.sleep(0.01) # Small sleep for yielding control
                except Exception as e:
                    yield {"event": "error", "data": str(e)}
            else:
                # Mock Streaming fallback
                await asyncio.sleep(0.5)
                chunks = ["This ", "is ", "a ", "mock ", "streaming ", "response ", "from ", "the ", "backend."]
                for chunk in chunks:
                    full_response += chunk
                    tokens_used += 2
                    yield {"data": chunk}
                    await asyncio.sleep(0.1)
            
            # 4. Save AI Response post-stream
            if full_response:
                ai_msg_data = {
                    "session_id": str(session_id),
                    "user_id": MOCK_USER_ID,
                    "sender": "assistant",
                    "message": full_response,
                    "tokens_used": int(tokens_used),
                    "risk_flag": False,
                    "metadata": {"agent": "gemini" if gemini_key else "mock-stream"}
                }
                db.table("chat_messages").insert(ai_msg_data).execute()
                
                # Update Session timestamp
                from datetime import datetime, timezone
                db.table("chat_sessions").update({"last_message_at": datetime.now(timezone.utc).isoformat()}).eq("id", str(session_id)).execute()
                
            yield {"event": "done", "data": "[DONE]"}

        return EventSourceResponse(event_generator())
        
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

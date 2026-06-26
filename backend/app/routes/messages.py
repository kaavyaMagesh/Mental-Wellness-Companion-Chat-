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
from sse_starlette.sse import EventSourceResponse
from app.context_manager import build_llm_context
from app.rate_limiter import check_rate_limits
from app.llm.memory_manager import MemoryManager
from app.llm.agents import generate_chat_response, summarize_history
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Global dictionary to cache MemoryManager instances
memory_managers = {}

def get_memory_manager(user_id: str) -> MemoryManager:
    if user_id not in memory_managers:
        memory_managers[user_id] = MemoryManager(user_id=user_id)
    return memory_managers[user_id]


@router.post("/sessions/{session_id}/messages", response_model=List[MessageResponse], status_code=status.HTTP_201_CREATED, dependencies=[Depends(check_rate_limits)])
async def send_message(session_id: UUID, payload: MessageCreate, db: Client = Depends(get_supabase_client)):
    try:
        # 1. Get Memory Manager
        memory_manager = get_memory_manager(MOCK_USER_ID)
        
        # 2. Fetch System Context
        session_res = db.table("chat_sessions").select("system_context").eq("id", str(session_id)).execute()
        system_context = session_res.data[0].get("system_context", "") if session_res.data else ""

        # 3. Retrieve holistic memory context
        context = memory_manager.get_context(current_query=payload.message)

        # 4. Generate response via LangChain Agent
        response_text = generate_chat_response(payload.message, context, system_context)

        # 5. Add messages to MemoryManager
        memory_manager.add_message(role="user", content=payload.message)
        memory_manager.add_message(role="assistant", content=response_text)

        # 6. Trigger background summarization if short-term memory is getting too long
        memory_manager.trigger_summary_if_needed(llm_summarizer_func=summarize_history)

        # 7. Insert User Message to Supabase
        user_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "user",
            "message": payload.message,
            "tokens_used": int(len(payload.message.split()) * 1.3),
            "risk_flag": False,
            "metadata": {}
        }
        
        user_res = db.table("chat_messages").insert(user_msg_data).execute()
        if not user_res.data:
            raise HTTPException(status_code=500, detail="Failed to save user message")
            
        user_message_row = user_res.data[0]
        
        # 8. Insert AI Message to Supabase
        ai_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "assistant",
            "message": response_text,
            "tokens_used": int(len(response_text.split()) * 1.3),
            "risk_flag": False,
            "metadata": {"agent": "langchain"}
        }
        
        ai_res = db.table("chat_messages").insert(ai_msg_data).execute()
        if not ai_res.data:
            raise HTTPException(status_code=500, detail="Failed to save AI message")
            
        ai_message_row = ai_res.data[0]
        
        # 9. Update Session timestamp
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
    Server-Sent Events endpoint that proxies Groq stream to the client.
    Handles backpressure and client disconnects natively via sse-starlette.
    """
    try:
        # 1. Get Memory Manager
        memory_manager = get_memory_manager(MOCK_USER_ID)
        
        # 2. Fetch System Context
        session_res = db.table("chat_sessions").select("system_context").eq("id", str(session_id)).execute()
        system_context = session_res.data[0].get("system_context", "") if session_res.data else ""

        # 3. Retrieve holistic memory context
        context = memory_manager.get_context(current_query=payload.message)
        
        # 4. Save User Message
        user_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "user",
            "message": payload.message,
            "tokens_used": int(len(payload.message.split()) * 1.3),
            "risk_flag": False,
            "metadata": {}
        }
        db.table("chat_messages").insert(user_msg_data).execute()
        
        # 5. Setup Gemini 2.5 Flash API
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        async def event_generator():
            full_response = ""
            tokens_used = 0
            
            if gemini_key:
                system_prompt = f"""You are a highly capable AI assistant with infinite memory capability.
You have access to the user's conversational history. Use it to provide highly personalized, accurate responses.

{system_context}

[MID-TERM MEMORY: ROLLING SUMMARY]
{context['rolling_summary'] if context['rolling_summary'] else 'No earlier summary available.'}

[LONG-TERM MEMORY: RELEVANT PAST MESSAGES]
The following past messages are semantically related to the user's current query:
{chr(10).join(context['relevant_past']) if context['relevant_past'] else 'None found.'}

Always naturally weave this past context into your responses when relevant, but do not explicitly state "according to my long-term memory".
"""
                
                # Format memory into a single structured prompt for Gemini Flash
                full_prompt = f"{system_prompt}\n\n[CONVERSATION HISTORY]\n"
                for msg in context['short_term']:
                    role_name = "User" if msg['role'] == "user" else "Assistant"
                    full_prompt += f"{role_name}: {msg['content']}\n"
                
                full_prompt += f"\nUser: {payload.message}\nAssistant:"

                from google import genai
                client = genai.Client(api_key=gemini_key)
                
                try:
                    stream = await client.aio.models.generate_content_stream(
                        model="gemini-2.5-flash",
                        contents=full_prompt
                    )
                    async for chunk in stream:
                        if chunk.text:
                            full_response += chunk.text
                            tokens_used += len(chunk.text.split()) * 1.3
                            yield {"data": chunk.text}
                            await asyncio.sleep(0.01) # Yield control
                except Exception as e:
                    yield {"event": "error", "data": str(e)}
            else:
                # Mock Streaming fallback
                await asyncio.sleep(0.5)
                chunks = ["System Error: LLM API key not configured. ", "Please set ", "GEMINI_API_KEY ", "in .env"]
                for chunk in chunks:
                    full_response += chunk
                    tokens_used += 2
                    yield {"data": chunk}
                    await asyncio.sleep(0.1)
            
            # 6. Save to MemoryManager
            if full_response:
                memory_manager.add_message(role="user", content=payload.message)
                memory_manager.add_message(role="assistant", content=full_response)
                memory_manager.trigger_summary_if_needed(llm_summarizer_func=summarize_history)

            # 7. Save AI Response post-stream to Supabase
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

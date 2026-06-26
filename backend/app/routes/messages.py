from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from uuid import UUID
import asyncio
import os
import sys
from pathlib import Path

from app.models import MessageCreate, MessageResponse
from app.database import get_supabase_client
from supabase import Client
from sse_starlette.sse import EventSourceResponse
from app.context_manager import build_llm_context
from app.rate_limiter import check_rate_limits
from app.llm.memory_manager import MemoryManager
from app.llm.agents import generate_chat_response, summarize_history
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# ─────────────────────────────────────────────
# Wire in AI-2 modules (RAG + Crisis Detection)
# ─────────────────────────────────────────────
AI2_PATH = Path(__file__).resolve().parents[3] / "AI-2"
if str(AI2_PATH) not in sys.path:
    sys.path.insert(0, str(AI2_PATH))

try:
    from src.rag.rag_search import search_knowledge_base
    from src.crisis.crisis_detector import CrisisDetector
    from src.crisis.crisis_escalation_service import CrisisEscalationService
    crisis_detector = CrisisDetector()
    crisis_escalation = CrisisEscalationService()
    AI2_AVAILABLE = True
    print("✅ AI-2 modules loaded: RAG + Crisis Detection active.")
except Exception as e:
    crisis_detector = None
    crisis_escalation = None
    AI2_AVAILABLE = False
    print(f"⚠️  AI-2 modules unavailable (continuing without them): {e}")

router = APIRouter()

MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

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

        # 2. Crisis Detection (AI-2)
        risk_flag = False
        crisis_result = None
        if AI2_AVAILABLE:
            crisis_result = await asyncio.to_thread(crisis_detector.detect, payload.message)
            risk_flag = crisis_result.get("crisis_detected", False) or crisis_result.get("needs_support", False)

        # 3. Fetch System Context
        session_res = db.table("chat_sessions").select("system_context").eq("id", str(session_id)).execute()
        system_context = session_res.data[0].get("system_context", "") if session_res.data else ""

        # 4. If crisis detected, short-circuit with safety response
        if crisis_result and crisis_result.get("crisis_detected"):
            escalation = await asyncio.to_thread(
                crisis_escalation.handle_crisis, payload.message, crisis_result
            )
            response_text = escalation["escalation_response"]
        else:
            # 5. Retrieve holistic memory context
            context = memory_manager.get_context(current_query=payload.message)

            # 6. Generate response via LangChain Agent
            response_text = generate_chat_response(payload.message, context, system_context)

            # 7. Add messages to MemoryManager
            memory_manager.add_message(role="user", content=payload.message)
            memory_manager.add_message(role="assistant", content=response_text)

            # 8. Trigger background summarization if needed
            memory_manager.trigger_summary_if_needed(llm_summarizer_func=summarize_history)

        # 9. Insert User Message to Supabase
        user_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "user",
            "message": payload.message,
            "tokens_used": int(len(payload.message.split()) * 1.3),
            "risk_flag": risk_flag,
            "metadata": {"crisis": crisis_result} if crisis_result else {}
        }

        user_res = db.table("chat_messages").insert(user_msg_data).execute()
        if not user_res.data:
            raise HTTPException(status_code=500, detail="Failed to save user message")
        user_message_row = user_res.data[0]

        # 10. Insert AI Message to Supabase
        ai_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "assistant",
            "message": response_text,
            "tokens_used": int(len(response_text.split()) * 1.3),
            "risk_flag": risk_flag,
            "metadata": {"agent": "crisis-escalation" if (crisis_result and crisis_result.get("crisis_detected")) else "langchain"}
        }

        ai_res = db.table("chat_messages").insert(ai_msg_data).execute()
        if not ai_res.data:
            raise HTTPException(status_code=500, detail="Failed to save AI message")
        ai_message_row = ai_res.data[0]

        # 11. Update Session timestamp
        from datetime import datetime, timezone
        now_iso = datetime.now(timezone.utc).isoformat()
        db.table("chat_sessions").update({"last_message_at": now_iso}).eq("id", str(session_id)).execute()

        return [user_message_row, ai_message_row]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/stream", dependencies=[Depends(check_rate_limits)])
async def stream_message(session_id: UUID, payload: MessageCreate, db: Client = Depends(get_supabase_client)):
    """
    Server-Sent Events endpoint that proxies Gemini 2.5 Flash stream to the client.
    Integrates AI-2 RAG knowledge retrieval and crisis detection pipeline.
    Handles backpressure and client disconnects natively via sse-starlette.
    """
    try:
        # 1. Get Memory Manager
        memory_manager = get_memory_manager(MOCK_USER_ID)

        # 2. Crisis Detection (AI-2) — runs before anything else
        risk_flag = False
        crisis_result = None
        if AI2_AVAILABLE:
            crisis_result = await asyncio.to_thread(crisis_detector.detect, payload.message)
            risk_flag = crisis_result.get("crisis_detected", False) or crisis_result.get("needs_support", False)

        # 3. Fetch System Context
        session_res = db.table("chat_sessions").select("system_context").eq("id", str(session_id)).execute()
        system_context = session_res.data[0].get("system_context", "") if session_res.data else ""

        # 4. RAG Search — retrieve relevant KB chunks (AI-2), skip if crisis
        kb_context = ""
        if AI2_AVAILABLE and not (crisis_result and crisis_result.get("crisis_detected")):
            try:
                chunks = await asyncio.to_thread(search_knowledge_base, payload.message, 3)
                if chunks:
                    kb_context = "\n\n[KNOWLEDGE BASE]\nThe following relevant information was retrieved from the mental wellness knowledge base:\n"
                    for i, chunk in enumerate(chunks, 1):
                        kb_context += f"\n--- Source {i} (topic: {chunk.get('topic', 'general')}, relevance: {chunk.get('similarity', 0):.2f}) ---\n{chunk['content']}\n"
            except Exception as kb_err:
                kb_context = ""
                print(f"⚠️  RAG search failed (continuing without KB): {kb_err}")

        # 5. Retrieve holistic memory context
        context = memory_manager.get_context(current_query=payload.message)

        # 6. Save User Message (with crisis metadata)
        user_msg_data = {
            "session_id": str(session_id),
            "user_id": MOCK_USER_ID,
            "sender": "user",
            "message": payload.message,
            "tokens_used": int(len(payload.message.split()) * 1.3),
            "risk_flag": risk_flag,
            "metadata": {"crisis": crisis_result} if crisis_result else {}
        }
        db.table("chat_messages").insert(user_msg_data).execute()

        # 7. Setup Gemini 2.5 Flash API
        gemini_key = os.getenv("GEMINI_API_KEY")

        async def event_generator():
            full_response = ""
            tokens_used = 0

            # ── CRISIS ESCALATION PATH ───────────────────────────────────────
            if crisis_result and crisis_result.get("crisis_detected"):
                escalation = await asyncio.to_thread(
                    crisis_escalation.handle_crisis, payload.message, crisis_result
                )
                safe_response = escalation["escalation_response"]
                # Stream word by word for natural feel
                for word in safe_response.split(" "):
                    token = word + " "
                    full_response += token
                    tokens_used += 1
                    yield {"data": token}
                    await asyncio.sleep(0.05)

            # ── NORMAL GEMINI PATH ────────────────────────────────────────────
            elif gemini_key:
                system_prompt = f"""You are a compassionate mental wellness AI assistant with deep knowledge of psychology and evidence-based wellness practices.
You have access to the user's conversational history. Use it to provide highly personalized, accurate responses.

{system_context}

[MID-TERM MEMORY: ROLLING SUMMARY]
{context['rolling_summary'] if context['rolling_summary'] else 'No earlier summary available.'}

[LONG-TERM MEMORY: RELEVANT PAST MESSAGES]
The following past messages are semantically related to the user's current query:
{chr(10).join(context['relevant_past']) if context['relevant_past'] else 'None found.'}
{kb_context}
Always naturally weave past context and knowledge base information into your responses when relevant.
Do not explicitly cite "according to my long-term memory" or "according to the knowledge base".
"""

                # Format conversation history for Gemini
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
                            await asyncio.sleep(0.01)
                except Exception as e:
                    yield {"event": "error", "data": str(e)}

            # ── FALLBACK PATH ─────────────────────────────────────────────────
            else:
                await asyncio.sleep(0.5)
                chunks = ["System Error: LLM API key not configured. ", "Please set ", "GEMINI_API_KEY ", "in .env"]
                for chunk in chunks:
                    full_response += chunk
                    tokens_used += 2
                    yield {"data": chunk}
                    await asyncio.sleep(0.1)

            # 8. Save to MemoryManager (skip for crisis responses)
            if full_response and not (crisis_result and crisis_result.get("crisis_detected")):
                memory_manager.add_message(role="user", content=payload.message)
                memory_manager.add_message(role="assistant", content=full_response)
                memory_manager.trigger_summary_if_needed(llm_summarizer_func=summarize_history)

            # 9. Save AI Response to Supabase
            if full_response:
                agent_label = "crisis-escalation" if (crisis_result and crisis_result.get("crisis_detected")) else ("gemini" if gemini_key else "mock-stream")
                ai_msg_data = {
                    "session_id": str(session_id),
                    "user_id": MOCK_USER_ID,
                    "sender": "assistant",
                    "message": full_response,
                    "tokens_used": int(tokens_used),
                    "risk_flag": risk_flag,
                    "metadata": {
                        "agent": agent_label,
                        "kb_chunks_used": len(chunks) if AI2_AVAILABLE and kb_context else 0
                    }
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

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.models import ChatSessionCreate, ChatSessionResponse, ChatSessionUpdate
from app.database import get_supabase_client
from supabase import Client

router = APIRouter()

# Mock user_id for testing until Auth is implemented
MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(session: ChatSessionCreate, db: Client = Depends(get_supabase_client)):
    try:
        data = {
            "user_id": MOCK_USER_ID,
            "title": session.title,
            "system_context": session.system_context,
            "risk_level": "low",
            "is_active": True
        }
        
        response = db.table("chat_sessions").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create session")
            
        return response.data[0]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=repr(e))

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_sessions(db: Client = Depends(get_supabase_client)):
    try:
        response = db.table("chat_sessions").select("*").eq("user_id", MOCK_USER_ID).eq("is_active", True).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session(session_id: UUID, db: Client = Depends(get_supabase_client)):
    try:
        response = db.table("chat_sessions").select("*").eq("id", str(session_id)).eq("user_id", MOCK_USER_ID).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Session not found")
            
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: UUID, db: Client = Depends(get_supabase_client)):
    try:
        # Soft delete — set is_active = False.
        # Supabase may return empty .data when RLS restricts SELECT after update,
        # so we do NOT check .data here — trust the update executed without error.
        db.table("chat_sessions").update({"is_active": False}).eq("id", str(session_id)).eq("user_id", MOCK_USER_ID).execute()
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_session(session_id: UUID, payload: ChatSessionUpdate, db: Client = Depends(get_supabase_client)):
    try:
        response = db.table("chat_sessions").update({"title": payload.title}).eq("id", str(session_id)).eq("user_id", MOCK_USER_ID).execute()
        if response.data:
            return response.data[0]
        # If Supabase returns no data (RLS / SELECT not allowed after update),
        # do a fresh GET to return the row instead of a 404.
        get_res = db.table("chat_sessions").select("*").eq("id", str(session_id)).eq("user_id", MOCK_USER_ID).execute()
        if not get_res.data:
            raise HTTPException(status_code=404, detail="Session not found")
        return get_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

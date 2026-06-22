from fastapi import HTTPException, Depends, Request, status
from supabase import Client
from datetime import datetime, timedelta, timezone
from app.database import get_supabase_client
import logging

logger = logging.getLogger(__name__)

# Constants
MAX_SESSION_MESSAGES = 20
MAX_DAILY_MESSAGES = 100

def check_rate_limits(request: Request, db: Client = Depends(get_supabase_client)):
    """
    FastAPI dependency to enforce rate limits per user:
    - 20 messages per session
    - 100 messages per day
    """
    # Extract session_id from path params if it exists
    session_id = request.path_params.get("session_id")
    
    # In a real app with auth, we'd get user_id from the JWT token in request.state
    # For now, use the mock user ID we've been using
    user_id = "00000000-0000-0000-0000-000000000000"
    
    now = datetime.now(timezone.utc)
    one_day_ago = (now - timedelta(days=1)).isoformat()
    
    try:
        # 1. Check Daily Limit (100 per day)
        # We query count of messages for this user in the last 24 hours
        daily_res = db.table("chat_messages") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .gte("created_at", one_day_ago) \
            .execute()
            
        daily_count = daily_res.count if daily_res.count is not None else 0
        
        if daily_count >= MAX_DAILY_MESSAGES:
            logger.warning(f"User {user_id} exceeded daily message limit ({daily_count}/{MAX_DAILY_MESSAGES})")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily message limit exceeded. Please try again tomorrow.",
                headers={"Retry-After": "86400"}
            )
            
        # 2. Check Session Limit (20 per session)
        if session_id:
            session_res = db.table("chat_messages") \
                .select("id", count="exact") \
                .eq("session_id", session_id) \
                .execute()
                
            session_count = session_res.count if session_res.count is not None else 0
            
            # Note: session_count includes both user and AI messages. 
            # If the requirement is 20 *user* messages, we should add `.eq("sender", "user")`
            # Let's count only user messages to give them 20 prompts.
            user_session_res = db.table("chat_messages") \
                .select("id", count="exact") \
                .eq("session_id", session_id) \
                .eq("sender", "user") \
                .execute()
                
            user_session_count = user_session_res.count if user_session_res.count is not None else 0
            
            if user_session_count >= MAX_SESSION_MESSAGES:
                logger.warning(f"Session {session_id} exceeded message limit ({user_session_count}/{MAX_SESSION_MESSAGES})")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Session message limit exceeded. Please start a new session.",
                    headers={"Retry-After": "3600"}
                )
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rate limiting check failed: {e}")
        # Fail open or closed? Usually fail closed for rate limiters, but for demo let's fail open or log it
        # Actually, let's just raise 500 so we know it broke
        raise HTTPException(status_code=500, detail="Internal server error during rate limit check")

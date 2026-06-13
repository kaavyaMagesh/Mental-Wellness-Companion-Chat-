from supabase import Client
from uuid import UUID
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Constants for context window
MAX_CONTEXT_MESSAGES = 10
MAX_TOKEN_BUDGET = 2000

def estimate_tokens(text: str) -> int:
    """
    Very basic heuristic token estimator. 
    Assumes 1 word is roughly 1.3 tokens.
    In production, this should be replaced with tiktoken.
    """
    if not text:
        return 0
    words = text.split()
    return int(len(words) * 1.3)

def build_llm_context(db: Client, session_id: UUID, new_message: str) -> List[Dict[str, Any]]:
    """
    Builds the context window for the LLM.
    - Prepends system_context
    - Fetches the last N messages
    - Ensures total token count is within MAX_TOKEN_BUDGET
    - Appends the new user message
    """
    # 1. Fetch Session for system_context
    session_res = db.table("chat_sessions").select("system_context").eq("id", str(session_id)).execute()
    system_context = ""
    if session_res.data and session_res.data[0].get("system_context"):
        system_context = session_res.data[0]["system_context"]

    # 2. Fetch last N messages
    msg_res = db.table("chat_messages") \
        .select("sender, message") \
        .eq("session_id", str(session_id)) \
        .order("created_at", desc=True) \
        .limit(MAX_CONTEXT_MESSAGES) \
        .execute()
    
    # Reverse to make chronological
    history = list(reversed(msg_res.data)) if msg_res.data else []

    # 3. Assemble full context
    context = []
    
    # Always include system context if present
    if system_context:
        context.append({"role": "system", "content": system_context})
        
    for msg in history:
        # map 'assistant' to 'assistant', 'user' to 'user'
        context.append({
            "role": msg["sender"],
            "content": msg["message"]
        })
        
    # Append the newest message
    context.append({"role": "user", "content": new_message})
    
    # 4. Enforce Token Budget
    total_tokens = sum(estimate_tokens(c["content"]) for c in context)
    
    # If over budget, drop oldest history messages (keep system prompt and newest message)
    # The system prompt is at index 0 (if exists), the newest is at index -1.
    system_idx = 0 if system_context else -1
    
    while total_tokens > MAX_TOKEN_BUDGET and len(context) > 2:
        # Drop the oldest message after the system prompt
        drop_idx = 1 if system_context else 0
        dropped_msg = context.pop(drop_idx)
        dropped_tokens = estimate_tokens(dropped_msg["content"])
        total_tokens -= dropped_tokens
        logger.info(f"Dropped message from context to fit budget. Freed {dropped_tokens} tokens.")
        
    return context

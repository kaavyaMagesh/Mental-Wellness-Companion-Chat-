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
    - Fetches the user's recent moods and journals
    - Prepends system_context enriched with user data
    - Fetches the last N messages
    - Ensures total token count is within MAX_TOKEN_BUDGET
    - Appends the new user message
    """
    # 1. Fetch Session for system_context and user_id
    session_res = db.table("chat_sessions").select("system_context, user_id").eq("id", str(session_id)).execute()
    system_context = ""
    user_id = None
    if session_res.data:
        system_context = session_res.data[0].get("system_context", "")
        user_id = session_res.data[0].get("user_id")

    # 2. Refine Context Window (Moods, Journals, Name)
    user_data_prompt = "\n\nUser Data Context:"
    if user_id:
        # Fetch user name from auth.users (if possible, but we're mocking name since Supabase auth isn't fully integrated here)
        user_name = "User"
        user_data_prompt += f"\n- Name: {user_name}"
        
        # Fetch last 3 mood scores
        moods_res = db.table("mood_entries").select("score, created_at").eq("user_id", str(user_id)).order("created_at", desc=True).limit(3).execute()
        if moods_res.data:
            mood_scores = [str(m["score"]) for m in moods_res.data]
            user_data_prompt += f"\n- Recent Mood Scores (1-10): {', '.join(mood_scores)}"
            
        # Fetch last journal snippet
        journal_res = db.table("journal_entries").select("content").eq("user_id", str(user_id)).order("created_at", desc=True).limit(1).execute()
        if journal_res.data and journal_res.data[0].get("content"):
            content = journal_res.data[0]["content"]
            # Truncate to ~50 words
            words = content.split()
            if len(words) > 50:
                snippet = " ".join(words[:50]) + "..."
            else:
                snippet = content
            user_data_prompt += f"\n- Latest Journal Snippet: \"{snippet}\""
            
    # Combine original system context with refined user data
    enriched_system_context = system_context + user_data_prompt

    # 3. Fetch last N messages
    msg_res = db.table("chat_messages") \
        .select("sender, message") \
        .eq("session_id", str(session_id)) \
        .order("created_at", desc=True) \
        .limit(MAX_CONTEXT_MESSAGES) \
        .execute()
    
    # Reverse to make chronological
    history = list(reversed(msg_res.data)) if msg_res.data else []

    # 4. Assemble full context
    context = []
    
    # Always include enriched system context if present
    if enriched_system_context.strip():
        context.append({"role": "system", "content": enriched_system_context.strip()})
        
    for msg in history:
        # map 'assistant' to 'assistant', 'user' to 'user'
        context.append({
            "role": msg["sender"],
            "content": msg["message"]
        })
        
    # Append the newest message
    context.append({"role": "user", "content": new_message})
    
    # 5. Enforce Token Budget
    total_tokens = sum(estimate_tokens(c["content"]) for c in context)
    
    # If over budget, drop oldest history messages (keep system prompt and newest message)
    # The system prompt is at index 0 (if exists), the newest is at index -1.
    system_idx = 0 if enriched_system_context.strip() else -1
    
    while total_tokens > MAX_TOKEN_BUDGET and len(context) > 2:
        # Drop the oldest message after the system prompt
        drop_idx = 1 if enriched_system_context.strip() else 0
        dropped_msg = context.pop(drop_idx)
        dropped_tokens = estimate_tokens(dropped_msg["content"])
        total_tokens -= dropped_tokens
        logger.info(f"Dropped message from context to fit budget. Freed {dropped_tokens} tokens.")
        
    return context

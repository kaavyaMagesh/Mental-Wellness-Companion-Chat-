import os
import json
import chromadb
from chromadb.config import Settings
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Settings for memory manager
SHORT_TERM_LIMIT = 10  # Number of recent messages to keep in raw format

class Message(BaseModel):
    role: str
    content: str
    id: str

class MemoryManager:
    def __init__(self, user_id: str, db_path: str = "chroma_db"):
        self.user_id = user_id
        
        # Ensure db_path is an absolute path or relative to the backend root
        self.chroma_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.chroma_client.get_or_create_collection(
            name=f"user_memory_{user_id}",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Store state files in a safe directory within the target backend
        os.makedirs("storage", exist_ok=True)
        self.state_file = f"storage/state_{user_id}.json"
        self._load_state()

    def _load_state(self):
        if os.path.exists(self.state_file):
            with open(self.state_file, 'r', encoding='utf-8') as f:
                state = json.load(f)
                self.short_term_buffer = state.get("short_term_buffer", [])
                self.rolling_summary = state.get("rolling_summary", "")
        else:
            self.short_term_buffer = []
            self.rolling_summary = ""

    def _save_state(self):
        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump({
                "short_term_buffer": self.short_term_buffer,
                "rolling_summary": self.rolling_summary
            }, f, ensure_ascii=False)

    def add_message(self, role: str, content: str):
        """Adds a message to all memory layers."""
        msg_id = f"msg_{len(self.short_term_buffer) + self.collection.count()}"
        
        # 1. Add to Short-Term Memory
        message_data = {"role": role, "content": content, "id": msg_id}
        self.short_term_buffer.append(message_data)
        
        # 2. Add to Long-Term Memory (Vector DB)
        self.collection.add(
            documents=[content],
            metadatas=[{"role": role, "user_id": self.user_id}],
            ids=[msg_id]
        )
        
        self._save_state()

    def get_context(self, current_query: str) -> Dict[str, Any]:
        """Retrieves the unified context for the LLM prompt."""
        # Retrieve relevant past messages (Long-term)
        long_term_results = self.collection.query(
            query_texts=[current_query],
            n_results=5
        )
        
        relevant_past_messages = []
        if long_term_results and long_term_results['documents'] and len(long_term_results['documents'][0]) > 0:
            for doc, meta in zip(long_term_results['documents'][0], long_term_results['metadatas'][0]):
                # Skip messages that are already in the short-term buffer
                if doc not in [m['content'] for m in self.short_term_buffer]:
                    relevant_past_messages.append(f"{meta['role'].upper()}: {doc}")

        return {
            "short_term": self.short_term_buffer,
            "rolling_summary": self.rolling_summary,
            "relevant_past": relevant_past_messages
        }

    def trigger_summary_if_needed(self, llm_summarizer_func):
        """Checks if buffer is too large and summarizes older messages."""
        if len(self.short_term_buffer) > SHORT_TERM_LIMIT:
            # We keep the latest 4 messages, summarize the older ones
            messages_to_summarize = self.short_term_buffer[:-4]
            self.short_term_buffer = self.short_term_buffer[-4:]
            
            # Combine current summary + old messages into a new summary
            text_to_summarize = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages_to_summarize])
            
            new_summary = llm_summarizer_func(self.rolling_summary, text_to_summarize)
            self.rolling_summary = new_summary
            
            self._save_state()

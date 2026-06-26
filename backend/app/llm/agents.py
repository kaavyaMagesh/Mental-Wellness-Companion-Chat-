import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "")

if api_key:
    main_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, google_api_key=api_key, convert_system_message_to_human=True)
    fast_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, google_api_key=api_key, convert_system_message_to_human=True)
else:
    # Fallback to dummy if key not set
    main_llm = None
    fast_llm = None

def generate_chat_response(user_message: str, memory_context: dict, system_context: str = "") -> str:
    """Generates a response using the unified memory context."""
    if not main_llm:
        return "System Error: LLM API key not configured. Please set GEMINI_API_KEY in .env"

    system_prompt = f"""You are a highly capable AI assistant with infinite memory capability.
You have access to the user's conversational history. Use it to provide highly personalized, accurate responses.

{system_context}

[MID-TERM MEMORY: ROLLING SUMMARY]
{memory_context['rolling_summary'] if memory_context['rolling_summary'] else 'No earlier summary available.'}

[LONG-TERM MEMORY: RELEVANT PAST MESSAGES]
The following past messages are semantically related to the user's current query:
{chr(10).join(memory_context['relevant_past']) if memory_context['relevant_past'] else 'None found.'}

Always naturally weave this past context into your responses when relevant, but do not explicitly state "according to my long-term memory".
"""

    messages = [SystemMessage(content=system_prompt)]
    
    # Add short-term buffer history
    for msg in memory_context['short_term']:
        if msg['role'] == 'user':
            messages.append(HumanMessage(content=msg['content']))
        else:
            messages.append(AIMessage(content=msg['content']))
            
    # Add current message
    messages.append(HumanMessage(content=user_message))
    
    response = main_llm.invoke(messages)
    return response.content

def summarize_history(old_summary: str, new_messages: str) -> str:
    """Uses a fast LLM to continuously compress older messages."""
    if not fast_llm:
        return ""
        
    prompt = f"""You are a conversational memory compressor. 
Below is an existing summary of a conversation, followed by a transcript of new messages.
Combine them into a single, concise, up-to-date summary. Capture key facts, user preferences, and emotional states. Do NOT output a transcript, only a summary paragraph.

[EXISTING SUMMARY]
{old_summary}

[NEW MESSAGES]
{new_messages}

NEW COMPRESSED SUMMARY:"""

    response = fast_llm.invoke([HumanMessage(content=prompt)])
    return response.content

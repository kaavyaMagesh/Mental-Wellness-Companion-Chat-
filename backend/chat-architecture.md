# InnerWhispers: AI Chat Architecture Design Document

## 1. Chat Session Lifecycle Management
The InnerWhispers chat architecture is built around discrete, isolated conversational threads designed to maintain contextual boundary and user privacy.

- **Initialization (Provisioning)**: When a user initiates a chat, a new `chat_sessions` entity is provisioned. This entity acts as the parent container, capturing foundational metadata including the `title` and a localized `system_context` (a structural prompt dictating the AI's persona, boundaries, and therapeutic constraints).
- **Asynchronous Interaction & Safety Validation**: Every inbound user message triggers an asynchronous, non-blocking pipeline via FastAPI. The payload is first authenticated via JWT, then immediately intercepted by the **Safety Gateway** (a rule-based/classification layer designed to detect crisis language or self-harm intent). Only validated payloads proceed to database persistence.
- **Contextual Assembly & Generation**: Following persistence, the backend aggregates the user's historical context via a sliding window strategy, augments it with wellness data via RAG (Retrieval-Augmented Generation), and dispatches the payload to the LLM. The resulting assistant message is subsequently persisted with token consumption metrics.
- **Termination & Archival (Soft Deletion)**: Sessions are rarely hard-deleted to preserve institutional analytics. Instead, they are marked via a boolean flag (`is_active = false`), effectively archiving them from the user's immediate UI while retaining the relational history for audit and analysis purposes.

## 2. Context Window Strategy (Token Optimization)
To enforce strict boundaries on LLM API costs, mitigate context-window overflow, and maintain high relevance, the system employs a deterministic **Sliding Window Strategy**:

- **Bounded Retrieval**: Upon receiving a new message, the backend queries the database for strictly the most recent N messages (e.g., N=6) belonging to the active session. This query is heavily optimized using chronological indices on `created_at`.
- **Prompt Construction**: The LLM prompt is dynamically assembled by concatenating three core pillars:
  1. The immutable `system_context` (establishing persona).
  2. The semantic payload retrieved from the `resource_embeddings` vector store via pgvector (RAG).
  3. The sliding window of recent conversation history.
- **Cost Efficacy**: Older messages are intentionally truncated from the active context payload. They remain securely stored in the relational database for user review, but are excluded from the tokenized request, guaranteeing predictable O(1) token consumption per interaction.

## 3. System Request/Response Flow Diagram
The following sequence details the end-to-end traversal of a message payload, incorporating the Safety Gateway and RAG retrieval pipelines.

```text
+----------+      1. Sends Message      +-------------------+
|   User   | -------------------------> |  FastAPI Backend  |
+----------+                            +-------------------+
     ^                                            |
     |                                            | 2. Validate Risk
     |                                            v
     |                                  +-------------------+
     |                                  |   Safety Gateway  |
     |                                  +-------------------+
     |                                            |
     | 7. Return Reply                            | 3. If Safe (Else trigger Emergency UI)
     |                                            v
     |                                  +-------------------+
     |                                  |    Supabase DB    |
     | 6. Save AI Reply                 |   (Fetch Context) |
     |                                  +-------------------+
     |                                            |
     |                                            | 4. Context + Message
     |                                            v
+-------------------+                   +-------------------+
|  FastAPI Backend  | <---------------- |    AI Provider    |
+-------------------+  5. AI Response   +-------------------+
```

## 4. Database Schema

### `chat_sessions`
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | FK `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `title` | `VARCHAR(255)` | Session title (optional) |
| `system_context` | `TEXT` | Context or prompt instructions for the session |
| `risk_level` | `TEXT` | `DEFAULT 'low'` |
| `is_active` | `BOOLEAN` | `DEFAULT true` |
| `last_message_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` |

### `chat_messages`
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, `DEFAULT gen_random_uuid()` |
| `session_id` | `UUID` | FK `REFERENCES chat_sessions(id) ON DELETE CASCADE` |
| `user_id` | `UUID` | FK `REFERENCES auth.users(id) ON DELETE CASCADE` (Denormalized for RLS) |
| `sender` | `TEXT` | `'user'`, `'assistant'`, or `'system'` |
| `message` | `TEXT` | Not null (the actual message content) |
| `tokens_used` | `INTEGER` | `DEFAULT 0` (for AI cost tracking) |
| `risk_flag` | `BOOLEAN` | `DEFAULT false` (true if crisis detected) |
| `metadata` | `JSONB` | Optional (for reasoning steps, agents, etc.) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` |

## 5. API Routing Design (Asynchronous)
The chat module exposes the following `async` endpoints under the `/api/chat` prefix to ensure non-blocking I/O operations for database and LLM calls:

### `POST /api/chat/session`
**Purpose**: Initialize a new chat session.

### `POST /api/chat/message`
**Purpose**: Submit a new user message, pass it through the Safety Gateway, execute the RAG/LLM pipeline, and return the AI's reply.

**Sample Request Body:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "I have been feeling anxious about placements"
}
```

**Sample Response (Safe Message):**
```json
{
  "reply": "That is a common pressure point for final-year students. Let us slow this down a bit. What feels most uncertain right now?",
  "risk_level": "low"
}
```
*(Note: The `reply` maps to the `message` field when saved to the database, and `risk_level` informs the frontend if an emergency UI needs to be rendered).*

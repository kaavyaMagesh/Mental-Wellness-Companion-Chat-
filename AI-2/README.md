# Inner Whispers - AI & RAG Subproject (AI-2)

This directory contains the AI, Retrieval-Augmented Generation (RAG), and Safety Gateways of the **Inner Whispers** mental wellness platform.

---

## Getting Started

### 1. Prerequisites
Ensure you have **Python 3.10+** installed.

### 2. Environment Configuration
Since `.env` containing API credentials is ignored by Git, you must create a local configuration:
1. Copy the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your keys:
   * `GEMINI_API_KEY`: Get your key from Google AI Studio.
   * `DATABASE_URL`: Your Supabase PostgreSQL connection string.

### 3. Virtual Environment & Dependencies
Set up a clean virtual environment and install all dependencies:
```bash
# Create virtual environment
python -m venv .venv

# Activate it (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate it (Mac/Linux)
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

---

## Database Schema Setup
You must enable `pgvector` and create the required tables in your Supabase SQL Editor:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create production knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    embedding   VECTOR(768) NOT NULL,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create evaluation knowledge base table (Required for tests)
CREATE TABLE IF NOT EXISTS knowledge_base_eval (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    embedding   VECTOR(768) NOT NULL,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Running the Retrieval Accuracy Tests (30 Queries)

To run the RAG evaluation suite:
1. Generate the evaluation content:
   ```bash
   python scripts/generate_eval_kb.py
   ```
2. Chunk the evaluation knowledge base:
   ```bash
   python src/chunking/chunk_eval_kb.py
   ```
3. Generate vectors and insert them into Supabase:
   ```bash
   python src/embeddings/embed_eval_kb.py
   ```
4. Execute the evaluation queries:
   ```bash
   python tests/evaluate_retrieval.py
   ```
   *Detailed results will be output to `retrieval_results.txt`.*

---

## Running the API Server
Start the FastAPI server (exposing `/api/rag/search` and `/api/crisis/flag` endpoints):
```bash
uvicorn src.rag.api:app --reload
```

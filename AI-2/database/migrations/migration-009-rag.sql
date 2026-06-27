-- ==========================================
-- migration-009-rag.sql
-- Mental Wellness AI
-- RAG Knowledge Base Setup
-- ==========================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- Knowledge Base Table
-- ==========================================

CREATE TABLE IF NOT EXISTS knowledge_base (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    embedding   VECTOR(768) NOT NULL,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- Indexes
-- ==========================================

-- Metadata filtering (GIN Index for optimal JSONB searching)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata
ON knowledge_base
USING GIN (metadata);

-- Timestamp queries for system syncs / pagination
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at
ON knowledge_base(created_at DESC);

-- High-performance HNSW vector index for production scaling
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding_hnsw
ON knowledge_base
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ==========================================
-- Comments
-- ==========================================

COMMENT ON TABLE knowledge_base IS
'Mental Wellness RAG knowledge chunks';

COMMENT ON COLUMN knowledge_base.content IS
'Chunk text content';

COMMENT ON COLUMN knowledge_base.embedding IS
'768 dimensional embedding vector';

COMMENT ON COLUMN knowledge_base.metadata IS
'Chunk metadata stored as JSONB';

COMMENT ON COLUMN knowledge_base.created_at IS
'Timestamp of insertion';

-- ==========================================
-- Example Metadata Structure
-- ==========================================

/*
{
  "topic": "stress-management",
  "section": "coping-strategies",
  "source": "STRESS-001",
  "reading_level": "general",
  "version": "v1"
}
*/

-- ==========================================
-- Example Similarity Query
-- ==========================================

/*
SELECT 
    id,
    content,
    metadata,
    1 - (embedding <=> :query_embedding) AS similarity
FROM knowledge_base
ORDER BY embedding <=> :query_embedding
LIMIT 5;
*/
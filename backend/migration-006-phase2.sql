-- 1. Performance Optimization: Composite Index on chat_messages
-- Accelerates query filtering by session_id and sorting by created_at
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created 
ON chat_messages (session_id, created_at DESC);

-- 2. New Table: mood_entries (for Context Refinement)
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying recent moods by user
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created 
ON mood_entries (user_id, created_at DESC);

-- 3. New Table: journal_entries (for Context Refinement)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying recent journals by user
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created 
ON journal_entries (user_id, created_at DESC);

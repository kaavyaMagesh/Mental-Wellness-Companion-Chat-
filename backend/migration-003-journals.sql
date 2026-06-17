-- ============================================================================
-- PROJECT: InnerWhispers AI Wellness Companion
-- MODULE: Database Migration - Journal Entries Table (Sprint 1, Day 3)
-- DESCRIPTION: Sets up the journal_entries table, related constraints, indexes, 
--              and Row Level Security (RLS) policies for Supabase.
-- ============================================================================

-- 1. Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT, -- Optional short summary or header entered by the student
    content TEXT NOT NULL, -- Core reflective text body
    mood_link UUID, -- FK to mood logs (optional, set NULL if mood log is deleted)
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL, -- User-defined context tags
    ai_summary TEXT, -- Automated AI summary generated in background
    emotion_tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL, -- Automated AI emotion tags
    is_private BOOLEAN DEFAULT TRUE NOT NULL, -- True ensures it remains fully private
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- Logical creation timestamp
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- Last updated timestamp
    
    -- Relationships & Referential Integrity Constraints
    CONSTRAINT fk_user_journal FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mood_link FOREIGN KEY (mood_link) REFERENCES mood_entries(id) ON DELETE SET NULL
);

COMMENT ON TABLE journal_entries IS 'Student journal entries containing text reflections, AI summaries, and links to mood logs.';

-- 2. Performance Indexes
-- Index on user_id ensures prompt recovery of journals for the authenticated user.
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id 
    ON journal_entries(user_id);

-- Index on mood_link speeds up lookups checking which journals associate with specific mood entries.
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood_link 
    ON journal_entries(mood_link) 
    WHERE mood_link IS NOT NULL;

-- Composite Index for fetching user journals sorted chronologically.
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created 
    ON journal_entries(user_id, created_at DESC);

-- 3. Trigger to Update updated_at Timestamp automatically
CREATE OR REPLACE FUNCTION update_journal_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_journal_entries_modtime
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_modified_column();


-- 4. Row-Level Security (RLS) Configuration
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can insert their own journal logs only.
CREATE POLICY "Users can create their own journals"
    ON journal_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own journal logs only.
CREATE POLICY "Users can view their own journals"
    ON journal_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 3: Users can update their own journal logs only.
CREATE POLICY "Users can update their own journals"
    ON journal_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own journal logs only.
CREATE POLICY "Users can delete their own journals"
    ON journal_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- PROJECT: InnerWhispers AI Wellness Companion
-- MODULE: Database Migration - Mood Entries Table (Sprint 1, Day 2)
-- DESCRIPTION: Sets up the mood_entries table, related constraints, indexes, 
--              and configures Row Level Security (RLS) policies for Supabase.
-- ============================================================================

-- 1. Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mood TEXT NOT NULL, -- e.g., 'Anxious', 'Joyful', 'Sad', 'Calm', 'Stressed'
    mood_score INT NOT NULL, -- General mood feeling scaled 1 to 10
    stress_level INT NOT NULL, -- Stress level scaled 1 to 10
    sleep_quality INT NOT NULL, -- Sleep quality scaled 1 to 10
    energy_level INT NOT NULL, -- Energy level scaled 1 to 10
    note TEXT, -- Optional personal text log reflections
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL, -- Context tags, e.g., ['exams', 'placement']
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- Time of reflection
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- System logging timestamp
    
    -- Integrity Constraints to prevent invalid telemetry values
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_mood_score CHECK (mood_score BETWEEN 1 AND 10),
    CONSTRAINT chk_stress_level CHECK (stress_level BETWEEN 1 AND 10),
    CONSTRAINT chk_sleep_quality CHECK (sleep_quality BETWEEN 1 AND 10),
    CONSTRAINT chk_energy_level CHECK (energy_level BETWEEN 1 AND 10)
);

COMMENT ON TABLE mood_entries IS 'Telemetry table recording multi-dimensional mood and wellness stats for students.';

-- 2. Performance Indexes
-- Index on user_id allows rapid lookups for a single user's history.
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id 
    ON mood_entries(user_id);

-- Index on recorded_at facilitates range queries (e.g., mood tracking over the last 7 days).
CREATE INDEX IF NOT EXISTS idx_mood_entries_recorded_at 
    ON mood_entries(recorded_at DESC);

-- Composite Index for optimized lookups where a specific user's logs are fetched chronologically.
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_recorded 
    ON mood_entries(user_id, recorded_at DESC);


-- 3. Row-Level Security (RLS) Config for Supabase
-- RLS prevents users from reading or writing other users' data, enforced directly by PostgreSQL.
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can insert their own mood entries only.
CREATE POLICY "Users can create their own mood entries"
    ON mood_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own mood history only.
CREATE POLICY "Users can view their own mood entries"
    ON mood_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 3: Users can update their own mood entries.
CREATE POLICY "Users can update their own mood entries"
    ON mood_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own mood entries.
CREATE POLICY "Users can delete their own mood entries"
    ON mood_entries
    FOR DELETE
    USING (auth.uid() = user_id);

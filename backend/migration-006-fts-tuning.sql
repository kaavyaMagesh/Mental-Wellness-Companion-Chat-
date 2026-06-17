-- ============================================================================
-- PROJECT: InnerWhispers AI Wellness Companion
-- MODULE: Database Migration - FTS Tuning & Persistent tsvector (Sprint 2, Day 3)
-- DESCRIPTION: Adds a persistent search_vector column, configures auto-update
--              triggers, and updates the search RPC to use this new index.
-- ============================================================================

-- 1. Add persistent search_vector column to journal_entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;


-- 2. Populate existing entries with computed search vectors
UPDATE journal_entries 
SET search_vector = to_tsvector('english', coalesce(title, '') || ' ' || content)
WHERE search_vector IS NULL;


-- 3. Create GIN index on the search_vector column
-- A GIN index on a precomputed tsvector column is much faster than dynamic vector indexing.
CREATE INDEX IF NOT EXISTS idx_journal_entries_search_vector 
ON journal_entries USING gin(search_vector);


-- 4. Create trigger function to automatically compute search vectors
CREATE OR REPLACE FUNCTION journal_entries_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english', coalesce(NEW.title, '') || ' ' || NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 5. Attach the trigger to execute before inserts or updates
DROP TRIGGER IF EXISTS trigger_update_journal_search_vector ON journal_entries;
CREATE TRIGGER trigger_update_journal_search_vector
    BEFORE INSERT OR UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION journal_entries_update_search_vector();


-- 6. Update the search RPC function to utilize the persistent search_vector column
CREATE OR REPLACE FUNCTION search_user_journals(
    p_user_id UUID,
    p_query TEXT
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    snippet TEXT,
    rank REAL,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tsquery tsquery;
BEGIN
    -- Parse user query terms
    v_tsquery := websearch_to_tsquery('english', p_query);
    
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.content,
        -- Generate hit snippet using ts_headline
        ts_headline(
            'english', 
            j.content, 
            v_tsquery, 
            'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15, MaxFragments=1'
        ) AS snippet,
        -- Use the precomputed search_vector column for ranking and matching
        ts_rank(j.search_vector, v_tsquery) AS rank,
        j.created_at
    FROM 
        journal_entries j
    WHERE 
        j.user_id = p_user_id
        AND j.search_vector @@ v_tsquery
    ORDER BY 
        rank DESC, 
        j.created_at DESC;
END;
$$;

COMMENT ON FUNCTION search_user_journals IS 'Performs tuned full-text searches leveraging persistent precomputed search vectors.';

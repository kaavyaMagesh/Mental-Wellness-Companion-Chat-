-- ============================================================================
-- PROJECT: InnerWhispers AI Wellness Companion
-- MODULE: Database Migration - Full-Text Search RPC (Sprint 2, Day 4)
-- DESCRIPTION: Sets up a GIN search index on journal title and content, 
--              and compiles a PostgreSQL function (RPC) to return ranked 
--              search results and highlighted snippet headlines.
-- ============================================================================

-- 1. Create a Generalized Inverted Index (GIN) on the text fields
-- This index enables the database to execute full-text matches in logarithmic time.
CREATE INDEX IF NOT EXISTS idx_journal_entries_search 
    ON journal_entries 
    USING gin(to_tsvector('english', coalesce(title, '') || ' ' || content));


-- 2. Create the Remote Procedure Call (RPC) search function
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
SECURITY DEFINER -- Runs with elevated permissions to bypass raw table blocks if needed
AS $$
DECLARE
    v_tsquery tsquery;
BEGIN
    -- 1. Convert user search input to standard tsquery search tokens.
    -- websearch_to_tsquery handles search operators like quotes ("") and minus (-) safely.
    v_tsquery := websearch_to_tsquery('english', p_query);
    
    -- 2. Query journals matching the query, calculating ranked scores and highlighting snippets.
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.content,
        -- Generate a highlight snippet using the matching keywords (wrapped in <b> tags)
        ts_headline(
            'english', 
            j.content, 
            v_tsquery, 
            'StartSel=<b>, StopSel=</b>, MaxWords=35, MinWords=15, MaxFragments=1'
        ) AS snippet,
        -- Rank relevance based on hit frequencies
        ts_rank(
            to_tsvector('english', coalesce(j.title, '') || ' ' || j.content), 
            v_tsquery
        ) AS rank,
        j.created_at
    FROM 
        journal_entries j
    WHERE 
        j.user_id = p_user_id
        AND to_tsvector('english', coalesce(j.title, '') || ' ' || j.content) @@ v_tsquery
    ORDER BY 
        rank DESC, 
        j.created_at DESC;
END;
$$;

COMMENT ON FUNCTION search_user_journals IS 'Performs full-text indexing queries returning relevance ranks and hit-highlighted snippets.';

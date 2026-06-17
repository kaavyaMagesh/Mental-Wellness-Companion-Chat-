-- ============================================================================
-- PROJECT: InnerWhispers AI Wellness Companion
-- MODULE: Database Migration - Mood Tags & Trend Aggregates (Sprint 2, Days 1 & 2)
-- DESCRIPTION: Establishes a GIN index on mood tags array for search autocomplete
--              and creates a PostgreSQL window function to calculate rolling 7-day averages.
-- ============================================================================

-- 1. Create a GIN (Generalized Inverted Index) on the tags array column
-- Enables high-performance search queries filtering by elements of the array.
CREATE INDEX IF NOT EXISTS idx_mood_entries_tags 
    ON mood_entries 
    USING gin(tags);


-- 2. Create the Remote Procedure Call (RPC) for calculating 30-day aggregates
-- Computes the daily average and uses a window function to generate a 7-day rolling average.
CREATE OR REPLACE FUNCTION get_user_mood_trend(p_user_id UUID)
RETURNS TABLE (
    log_date DATE,
    avg_mood_score NUMERIC,
    rolling_avg_7day NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH daily_stats AS (
        -- Step A: Calculate the flat average mood score per day over the last 30 days
        SELECT 
            (recorded_at AT TIME ZONE 'UTC')::date AS d_date,
            AVG(mood_score) AS d_avg
        FROM 
            mood_entries
        WHERE 
            user_id = p_user_id
            AND recorded_at >= NOW() - INTERVAL '30 days'
        GROUP BY 
            (recorded_at AT TIME ZONE 'UTC')::date
    )
    -- Step B: Use SQL window functions OVER(...) to compute 7-day moving averages
    SELECT 
        d_date,
        ROUND(d_avg, 2)::NUMERIC AS avg_mood_score,
        ROUND(
            AVG(d_avg) OVER(
                ORDER BY d_date 
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW -- Include 6 previous days and today
            ), 
            2
        )::NUMERIC AS rolling_avg_7day
    FROM 
        daily_stats
    ORDER BY 
        d_date ASC;
END;
$$;

COMMENT ON FUNCTION get_user_mood_trend IS 'Retrieves 30-day chronological average mood logs and rolling 7-day window metrics.';

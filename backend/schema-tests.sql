-- ============================================================================
-- PROJECT: InnerWhispers AI Wellness Companion
-- MODULE: Schema Integrity & Constraint Tests (Sprint 1, Day 4)
-- DESCRIPTION: Automated PL/pgSQL assertion checks validating database 
--              constraints, cascade behaviors, and index usage via EXPLAIN.
-- ============================================================================

-- Turn on server message logging
SET client_min_messages = NOTICE;

-- 1. Test Setup: Insert a temporary mock user to test relationships
DO $$
BEGIN
    INSERT INTO users (id, name, email, role)
    VALUES (
        '00000000-0000-0000-0000-000000000001', 
        'Test Student', 
        'test.student@university.edu', 
        'user'
    ) ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'SUCCESS: Test environment initialized with mock user.';
END $$;


-- 2. Test Case 1: Foreign Key constraint validation on mood_entries
-- Inserting a mood entry referencing a non-existent user should fail.
DO $$
BEGIN
    INSERT INTO mood_entries (user_id, mood, mood_score, stress_level, sleep_quality, energy_level)
    VALUES (
        '99999999-9999-9999-9999-999999999999', -- Non-existent user UUID
        'Joyful', 8, 2, 7, 8
    );
    RAISE EXCEPTION 'FAIL: Inserted mood log with invalid user ID without throwing a foreign key violation!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Foreign Key constraint blocked invalid user assignment in mood_entries.';
END $$;


-- 3. Test Case 2: Range Check validation on mood score limits (1-10)
-- Score of 11 should violate CHECK constraint.
DO $$
BEGIN
    INSERT INTO mood_entries (user_id, mood, mood_score, stress_level, sleep_quality, energy_level)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Elated',
        11, -- Over maximum limit 10
        4, 7, 7
    );
    RAISE EXCEPTION 'FAIL: Inserted mood score of 11 without throwing a check constraint violation!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Check constraint successfully prevented mood_score out of range (1-10).';
END $$;


-- 4. Test Case 3: Null constraint validation on required content
DO $$
BEGIN
    INSERT INTO journal_entries (user_id, title, content)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'My Journal',
        NULL -- Content must not be null
    );
    RAISE EXCEPTION 'FAIL: Inserted journal with NULL content without throwing a not null violation!';
EXCEPTION
    WHEN not_null_violation THEN
        RAISE NOTICE 'PASS: Null check constraint successfully blocked empty journal content.';
END $$;


-- 5. Test Case 4: ON DELETE SET NULL behavior on journal entries' mood_link
-- Deleting a mood log should set the linked journal's mood_link to NULL, but NOT delete the journal.
DO $$
DECLARE
    v_mood_id UUID;
    v_journal_id UUID;
    v_linked_id UUID;
    v_journal_exists BOOLEAN;
BEGIN
    -- 1. Insert a mock mood entry
    INSERT INTO mood_entries (user_id, mood, mood_score, stress_level, sleep_quality, energy_level)
    VALUES ('00000000-0000-0000-0000-000000000001', 'Anxious', 4, 8, 4, 3)
    RETURNING id INTO v_mood_id;

    -- 2. Insert a journal referencing that mood entry
    INSERT INTO journal_entries (user_id, title, content, mood_link)
    VALUES ('00000000-0000-0000-0000-000000000001', 'Exam Prep Notes', 'Stressed about the upcoming midterms.', v_mood_id)
    RETURNING id INTO v_journal_id;

    -- 3. Delete the mood entry
    DELETE FROM mood_entries WHERE id = v_mood_id;

    -- 4. Query the journal entry to see if it remains and if mood_link is NULL
    SELECT mood_link INTO v_linked_id FROM journal_entries WHERE id = v_journal_id;
    SELECT EXISTS(SELECT 1 FROM journal_entries WHERE id = v_journal_id) INTO v_journal_exists;

    IF v_journal_exists = FALSE THEN
        RAISE EXCEPTION 'FAIL: Journal entry was deleted when its linked mood entry was removed!';
    ELSIF v_linked_id IS NOT NULL THEN
        RAISE EXCEPTION 'FAIL: mood_link was not nullified after mood entry deletion!';
    ELSE
        RAISE NOTICE 'PASS: ON DELETE SET NULL successfully nullified mood_link and preserved the journal entry.';
    END IF;

    -- Clean up test journal
    DELETE FROM journal_entries WHERE id = v_journal_id;
END $$;


-- 6. Test Case 5: ON DELETE CASCADE verification on user accounts
-- Deleting a user must wipe all subordinate journals and moods.
DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000002';
    v_moods_count INT;
    v_journals_count INT;
BEGIN
    -- 1. Create a second test user
    INSERT INTO users (id, name, email, role)
    VALUES (v_user_id, 'Cascade User', 'cascade@test.edu', 'user');

    -- 2. Create mood and journal logs for them
    INSERT INTO mood_entries (user_id, mood, mood_score, stress_level, sleep_quality, energy_level)
    VALUES (v_user_id, 'Happy', 9, 1, 9, 8);

    INSERT INTO journal_entries (user_id, title, content)
    VALUES (v_user_id, 'My Day', 'Had a great lunch with friends.');

    -- 3. Delete the user
    DELETE FROM users WHERE id = v_user_id;

    -- 4. Count remaining entries associated with that user
    SELECT COUNT(*) INTO v_moods_count FROM mood_entries WHERE user_id = v_user_id;
    SELECT COUNT(*) INTO v_journals_count FROM journal_entries WHERE user_id = v_user_id;

    IF v_moods_count > 0 OR v_journals_count > 0 THEN
        RAISE EXCEPTION 'FAIL: Cascade deletion did not remove dependent logs (Moods: %, Journals: %).', 
            v_moods_count, v_journals_count;
    ELSE
        RAISE NOTICE 'PASS: Cascade deletion successfully cleared all logs for the deleted user account.';
    END IF;
END $$;


-- 7. Query Execution Plan Testing (EXPLAIN)
-- These queries analyze whether performance indexes are utilized instead of Sequential Scans.
-- Note: EXPLAIN output will vary based on planner stats and table sizes, but these demonstrate the syntax to test.

RAISE NOTICE 'EXPLAIN PLAN 1: Chronological Mood Retrieval for User';
EXPLAIN SELECT id, mood, mood_score, recorded_at 
FROM mood_entries 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
ORDER BY recorded_at DESC;

RAISE NOTICE 'EXPLAIN PLAN 2: Chronological Journal Retrieval for User';
EXPLAIN SELECT id, title, content, created_at 
FROM journal_entries 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
ORDER BY created_at DESC;

-- Fix Database User Isolation Issues
-- This script identifies and fixes data isolation problems

-- 1. Find records with NULL user_id (should not exist)
SELECT 'entries' as table_name, COUNT(*) as null_count 
FROM entries WHERE user_id IS NULL
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks WHERE user_id IS NULL
UNION ALL
SELECT 'todos', COUNT(*) FROM todos WHERE user_id IS NULL
UNION ALL
SELECT 'moods', COUNT(*) FROM moods WHERE user_id IS NULL
UNION ALL
SELECT 'notes', COUNT(*) FROM notes WHERE user_id IS NULL;

-- 2. Find records with user_id that doesn't exist in users table
SELECT 'entries' as table_name, COUNT(*) as orphaned_count
FROM entries e
LEFT JOIN users u ON e.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'tasks', COUNT(*)
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'todos', COUNT(*)
FROM todos t
LEFT JOIN users u ON t.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'moods', COUNT(*)
FROM moods m
LEFT JOIN users u ON m.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'notes', COUNT(*)
FROM notes n
LEFT JOIN users u ON n.user_id = u.id
WHERE u.id IS NULL;

-- 3. Show distribution of records by user_id
SELECT 'entries' as table_name, user_id, COUNT(*) as count
FROM entries
GROUP BY user_id
ORDER BY user_id
UNION ALL
SELECT 'tasks', user_id, COUNT(*)
FROM tasks
GROUP BY user_id
ORDER BY user_id
UNION ALL
SELECT 'todos', user_id, COUNT(*)
FROM todos
GROUP BY user_id
ORDER BY user_id
UNION ALL
SELECT 'moods', user_id, COUNT(*)
FROM moods
GROUP BY user_id
ORDER BY user_id
UNION ALL
SELECT 'notes', user_id, COUNT(*)
FROM notes
GROUP BY user_id
ORDER BY user_id;

-- 4. DELETE orphaned records (records with invalid user_id)
-- WARNING: Only run this if you're sure you want to delete orphaned data!
-- Uncomment to execute:

/*
DELETE FROM entries WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM tasks WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM todos WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM moods WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM notes WHERE user_id NOT IN (SELECT id FROM users);
*/

-- 5. Ensure user_id is NOT NULL (if not already enforced)
-- These should already be in your schema, but verify:
ALTER TABLE entries ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE todos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE moods ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;

-- 6. Remove DEFAULT 1 from user_id columns (if they exist)
-- This prevents new records from defaulting to user_id=1
ALTER TABLE entries ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE todos ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE moods ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE notes ALTER COLUMN user_id DROP DEFAULT;


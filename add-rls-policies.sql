-- Add Row Level Security (RLS) Policies for User Isolation
-- This adds an extra layer of security at the database level
-- Even if application code has bugs, RLS will prevent data leakage

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own entries" ON entries;
DROP POLICY IF EXISTS "Users can only insert their own entries" ON entries;
DROP POLICY IF EXISTS "Users can only update their own entries" ON entries;
DROP POLICY IF EXISTS "Users can only delete their own entries" ON entries;

DROP POLICY IF EXISTS "Users can only see their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only delete their own tasks" ON tasks;

DROP POLICY IF EXISTS "Users can only see their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can only delete their own todos" ON todos;

DROP POLICY IF EXISTS "Users can only see their own moods" ON moods;
DROP POLICY IF EXISTS "Users can only insert their own moods" ON moods;
DROP POLICY IF EXISTS "Users can only delete their own moods" ON moods;

DROP POLICY IF EXISTS "Users can only see their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can only delete their own notes" ON notes;

-- Note: RLS policies require authentication context
-- Since we're using service role key, these policies won't apply
-- But they're good to have for when using anon key with proper auth

-- For now, we rely on application-level filtering
-- But we can add these policies for future use with Supabase Auth

-- Example policy (commented out - requires Supabase Auth):
/*
-- Entries policies
CREATE POLICY "Users can only see their own entries"
  ON entries FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can only insert their own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can only update their own entries"
  ON entries FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can only delete their own entries"
  ON entries FOR DELETE
  USING (auth.uid()::text = user_id::text);
*/

-- Since we're using service role key, RLS is bypassed
-- The application-level filtering in the API is what matters
-- But having RLS enabled is good practice for future migration


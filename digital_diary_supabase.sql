-- Supabase/PostgreSQL Compatible SQL
-- Converted from MySQL/MariaDB to PostgreSQL
-- Digital Diary Database Schema

-- Enable UUID extension (optional, for better ID generation)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  join_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_join_date ON users(join_date);

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_updated on users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: entries
-- ============================================
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for entries table
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);

-- Trigger to auto-update updated_at on entries
CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: moods
-- ============================================
CREATE TABLE IF NOT EXISTS moods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  mood VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL,
  CONSTRAINT fk_moods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for moods table
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);

-- ============================================
-- Table: notes
-- ============================================
-- Note: Audio files should be stored in Supabase Storage, not as BLOB
-- The audio column has been removed; use audio_filename to reference storage bucket files
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT NULL,
  tags TEXT DEFAULT NULL,
  priority VARCHAR(10) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  is_favorite BOOLEAN DEFAULT FALSE,
  audio_filename VARCHAR(255) DEFAULT NULL,
  audio_duration INTEGER DEFAULT NULL,
  audio_size BIGINT DEFAULT NULL,
  has_audio BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for notes table
CREATE INDEX IF NOT EXISTS idx_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_priority ON notes(priority);
CREATE INDEX IF NOT EXISTS idx_is_favorite ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_updated_at ON notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_has_audio ON notes(has_audio);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Trigger to auto-update updated_at on notes
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: tasks
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  deadline TIMESTAMP NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- ============================================
-- Table: todos
-- ============================================
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_todos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for todos table
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_deleted ON todos(is_deleted);
CREATE INDEX IF NOT EXISTS idx_todos_created ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Trigger to auto-update updated_at on todos
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - Remove if you want to start fresh)
-- ============================================
-- Note: ID values are auto-generated by SERIAL, so we don't specify them
-- Adjust user_id values based on your actual user IDs

-- Insert sample users (passwords are bcrypt hashed - you'll need to create new ones)
-- INSERT INTO users (username, email, password, join_date, last_updated) VALUES
-- ('mwangi', 'admin@mail.com', '$2b$10$HaYcXGUdfUg8/MPI87CZWO9USpt/Jh3bDKBxYKK1eetbZ0wpJGMJy', '2025-09-20 13:43:19', '2025-09-20 13:43:19');

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Enable RLS on all tables for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your auth setup)
-- These policies allow users to only see/modify their own data
-- You'll need to adjust these based on your authentication method

-- Policy for users table (users can read their own profile)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy for entries
CREATE POLICY "Users can manage own entries" ON entries
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Policy for moods
CREATE POLICY "Users can manage own moods" ON moods
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Policy for notes
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Policy for tasks
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Policy for todos
CREATE POLICY "Users can manage own todos" ON todos
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Note: If you're using custom authentication (not Supabase Auth),
-- you'll need to modify these policies or disable RLS and handle auth in your application layer


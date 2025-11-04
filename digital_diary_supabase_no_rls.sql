-- Supabase/PostgreSQL Compatible SQL (No RLS - for Custom Authentication)
-- Converted from MySQL/MariaDB to PostgreSQL
-- Digital Diary Database Schema
-- Use this version if you're NOT using Supabase Auth
-- This file can be run multiple times safely (idempotent)

-- ============================================
-- Function to update updated_at/last_updated timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Update updated_at column if it exists
  IF TG_TABLE_NAME = 'users' THEN
    NEW.last_updated = NOW();
  ELSE
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: moods
-- ============================================
CREATE TABLE IF NOT EXISTS moods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
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
  user_id INTEGER NOT NULL,
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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: tasks
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
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
  user_id INTEGER NOT NULL,
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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Note: Row Level Security (RLS) is NOT enabled
-- Handle authentication and authorization in your application layer
-- ============================================


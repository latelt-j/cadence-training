-- Supabase Schema for Cadence Training Planner
-- Run this in the SQL Editor of your Supabase dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport TEXT NOT NULL CHECK (sport IN ('cycling', 'running', 'strength')),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  duration_min INTEGER NOT NULL,
  description TEXT DEFAULT '',
  structure JSONB DEFAULT '[]'::jsonb,
  actual_km DECIMAL(10,2),
  actual_elevation INTEGER,
  -- Strava detailed data
  strava_id BIGINT UNIQUE,
  laps JSONB DEFAULT '[]'::jsonb,
  average_heartrate INTEGER,
  max_heartrate INTEGER,
  average_watts INTEGER,
  max_watts INTEGER,
  average_cadence INTEGER,
  coach_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster date queries
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_sport ON sessions(sport);

-- User settings table (single row for personal app)
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  theme TEXT DEFAULT 'dracula',
  intervals_athlete_id TEXT,
  intervals_api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO user_settings (id, theme) VALUES (1, 'dracula');

-- OAuth tokens table
CREATE TABLE oauth_tokens (
  id INTEGER PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('strava', 'google')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER oauth_tokens_updated_at
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Disable RLS for personal app (single user)
-- If you want multi-user support later, enable RLS and add policies
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens DISABLE ROW LEVEL SECURITY;

-- =============================================
-- MIGRATION: Add Strava detailed data columns
-- Run this if you already have the sessions table
-- =============================================
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS strava_id BIGINT UNIQUE;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS laps JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS average_heartrate INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS max_heartrate INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS average_watts INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS max_watts INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS average_cadence INTEGER;

-- =============================================
-- MIGRATION: Add coach feedback column
-- Run this if you already have the sessions table
-- =============================================
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS coach_feedback TEXT;

-- =============================================
-- MIGRATION: Add training phases to user_settings
-- Run this if you already have the user_settings table
-- =============================================
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS training_phases JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS training_objectives JSONB DEFAULT '[]'::jsonb;

-- =============================================
-- MIGRATION: Add planned session info to sessions
-- Run this if you already have the sessions table
-- =============================================
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS planned_title TEXT;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS planned_description TEXT;

-- =============================================
-- MIGRATION: Add cycling metrics to sessions
-- Run this if you already have the sessions table
-- =============================================
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS normalized_power INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_watts BOOLEAN DEFAULT false;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS suffer_score INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS kilojoules DECIMAL(10,2);
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS calories INTEGER;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intensity_factor DECIMAL(4,2);
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS variability_index DECIMAL(4,2);
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS aerobic_decoupling DECIMAL(5,2);
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS average_vam INTEGER;

-- =============================================
-- MIGRATION: Add athlete profile to user_settings
-- Run this if you already have the user_settings table
-- =============================================
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS ftp INTEGER;
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS max_hr INTEGER;
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS resting_hr INTEGER;
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS environment TEXT;

-- =============================================
-- MIGRATION: Add planned intensity to sessions
-- Run this if you already have the sessions table
-- =============================================
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intensity INTEGER;

-- =============================================
-- MIGRATION: Add Gemini API key to user_settings
-- Run this if you already have the user_settings table
-- =============================================
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;

-- =============================================
-- MIGRATION: Add Zwift workout and planned session info
-- Run this if you already have the sessions table
-- =============================================
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS zwift_workout TEXT;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS planned_title TEXT;
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS planned_description TEXT;

-- =============================================
-- Weekly Guidelines table
-- Stores coach guidelines/directives per week
-- =============================================
CREATE TABLE IF NOT EXISTS weekly_guidelines (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  guidelines TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_guidelines_week ON weekly_guidelines(week_start);

CREATE TRIGGER weekly_guidelines_updated_at
  BEFORE UPDATE ON weekly_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE weekly_guidelines DISABLE ROW LEVEL SECURITY;

-- =============================================
-- MIGRATION: Multi-user support
-- Run this to enable user isolation
-- =============================================

-- 1. Add user_id to sessions
-- ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id BIGINT;
-- CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 2. Refactor user_settings from single-row to per-user
-- ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_pkey;
-- ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_id_check;
-- ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id BIGINT;
-- -- Migrate existing row (will be updated by migrate-data function)
-- UPDATE user_settings SET user_id = 0 WHERE user_id IS NULL;
-- ALTER TABLE user_settings DROP COLUMN IF EXISTS id;
-- ALTER TABLE user_settings ADD PRIMARY KEY (user_id);

-- 3. Add user_id to oauth_tokens
-- ALTER TABLE oauth_tokens ADD COLUMN IF NOT EXISTS user_id BIGINT;
-- ALTER TABLE oauth_tokens DROP CONSTRAINT IF EXISTS oauth_tokens_provider_key;
-- DROP INDEX IF EXISTS idx_oauth_tokens_user_provider;
-- CREATE UNIQUE INDEX idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);

-- 4. Add user_id to weekly_guidelines
-- ALTER TABLE weekly_guidelines ADD COLUMN IF NOT EXISTS user_id BIGINT;
-- ALTER TABLE weekly_guidelines DROP CONSTRAINT IF EXISTS weekly_guidelines_week_start_key;
-- DROP INDEX IF EXISTS idx_weekly_guidelines_user_week;
-- CREATE UNIQUE INDEX idx_weekly_guidelines_user_week ON weekly_guidelines(user_id, week_start);

-- 5. Enable Row Level Security
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weekly_guidelines ENABLE ROW LEVEL SECURITY;

-- 6. Create function to get user_id from request header
-- CREATE OR REPLACE FUNCTION public.get_user_id() RETURNS BIGINT AS $$
-- BEGIN
--   RETURN NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::BIGINT;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create RLS policies for sessions
-- DROP POLICY IF EXISTS "sessions_select" ON sessions;
-- DROP POLICY IF EXISTS "sessions_insert" ON sessions;
-- DROP POLICY IF EXISTS "sessions_update" ON sessions;
-- DROP POLICY IF EXISTS "sessions_delete" ON sessions;
-- CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (user_id = public.get_user_id());
-- CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (user_id = public.get_user_id());
-- CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (user_id = public.get_user_id());
-- CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (user_id = public.get_user_id());

-- 8. Create RLS policies for user_settings
-- DROP POLICY IF EXISTS "user_settings_select" ON user_settings;
-- DROP POLICY IF EXISTS "user_settings_insert" ON user_settings;
-- DROP POLICY IF EXISTS "user_settings_update" ON user_settings;
-- DROP POLICY IF EXISTS "user_settings_delete" ON user_settings;
-- CREATE POLICY "user_settings_select" ON user_settings FOR SELECT USING (user_id = public.get_user_id());
-- CREATE POLICY "user_settings_insert" ON user_settings FOR INSERT WITH CHECK (user_id = public.get_user_id());
-- CREATE POLICY "user_settings_update" ON user_settings FOR UPDATE USING (user_id = public.get_user_id());
-- CREATE POLICY "user_settings_delete" ON user_settings FOR DELETE USING (user_id = public.get_user_id());

-- 9. Create RLS policies for oauth_tokens
-- DROP POLICY IF EXISTS "oauth_tokens_select" ON oauth_tokens;
-- DROP POLICY IF EXISTS "oauth_tokens_insert" ON oauth_tokens;
-- DROP POLICY IF EXISTS "oauth_tokens_update" ON oauth_tokens;
-- DROP POLICY IF EXISTS "oauth_tokens_delete" ON oauth_tokens;
-- CREATE POLICY "oauth_tokens_select" ON oauth_tokens FOR SELECT USING (user_id = public.get_user_id());
-- CREATE POLICY "oauth_tokens_insert" ON oauth_tokens FOR INSERT WITH CHECK (user_id = public.get_user_id());
-- CREATE POLICY "oauth_tokens_update" ON oauth_tokens FOR UPDATE USING (user_id = public.get_user_id());
-- CREATE POLICY "oauth_tokens_delete" ON oauth_tokens FOR DELETE USING (user_id = public.get_user_id());

-- 10. Create RLS policies for weekly_guidelines
-- DROP POLICY IF EXISTS "weekly_guidelines_select" ON weekly_guidelines;
-- DROP POLICY IF EXISTS "weekly_guidelines_insert" ON weekly_guidelines;
-- DROP POLICY IF EXISTS "weekly_guidelines_update" ON weekly_guidelines;
-- DROP POLICY IF EXISTS "weekly_guidelines_delete" ON weekly_guidelines;
-- CREATE POLICY "weekly_guidelines_select" ON weekly_guidelines FOR SELECT USING (user_id = public.get_user_id());
-- CREATE POLICY "weekly_guidelines_insert" ON weekly_guidelines FOR INSERT WITH CHECK (user_id = public.get_user_id());
-- CREATE POLICY "weekly_guidelines_update" ON weekly_guidelines FOR UPDATE USING (user_id = public.get_user_id());
-- CREATE POLICY "weekly_guidelines_delete" ON weekly_guidelines FOR DELETE USING (user_id = public.get_user_id());

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

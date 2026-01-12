-- =============================================
-- MIGRATION: Multi-user support
-- Run this in Supabase SQL Editor to enable user isolation
-- =============================================

-- 1. Add user_id to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 2. Refactor user_settings from single-row to per-user
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_pkey;
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_id_check;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id BIGINT;
-- Temporarily set user_id to 0 for existing row (will be updated by migrate-data function)
UPDATE user_settings SET user_id = 0 WHERE user_id IS NULL;
ALTER TABLE user_settings DROP COLUMN IF EXISTS id;
ALTER TABLE user_settings ADD PRIMARY KEY (user_id);

-- 3. Add user_id to oauth_tokens
ALTER TABLE oauth_tokens ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE oauth_tokens DROP CONSTRAINT IF EXISTS oauth_tokens_provider_key;
DROP INDEX IF EXISTS idx_oauth_tokens_user_provider;
CREATE UNIQUE INDEX idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);

-- 4. Add user_id to weekly_guidelines
ALTER TABLE weekly_guidelines ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE weekly_guidelines DROP CONSTRAINT IF EXISTS weekly_guidelines_week_start_key;
DROP INDEX IF EXISTS idx_weekly_guidelines_user_week;
CREATE UNIQUE INDEX idx_weekly_guidelines_user_week ON weekly_guidelines(user_id, week_start);

-- 5. Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_guidelines ENABLE ROW LEVEL SECURITY;

-- 6. Create function to get user_id from request header
CREATE OR REPLACE FUNCTION public.get_user_id() RETURNS BIGINT AS $$
BEGIN
  RETURN NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create RLS policies for sessions
DROP POLICY IF EXISTS "sessions_select" ON sessions;
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
DROP POLICY IF EXISTS "sessions_update" ON sessions;
DROP POLICY IF EXISTS "sessions_delete" ON sessions;
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (user_id = public.get_user_id());
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (user_id = public.get_user_id());
CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (user_id = public.get_user_id());
CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (user_id = public.get_user_id());

-- 8. Create RLS policies for user_settings
DROP POLICY IF EXISTS "user_settings_select" ON user_settings;
DROP POLICY IF EXISTS "user_settings_insert" ON user_settings;
DROP POLICY IF EXISTS "user_settings_update" ON user_settings;
DROP POLICY IF EXISTS "user_settings_delete" ON user_settings;
CREATE POLICY "user_settings_select" ON user_settings FOR SELECT USING (user_id = public.get_user_id());
CREATE POLICY "user_settings_insert" ON user_settings FOR INSERT WITH CHECK (user_id = public.get_user_id());
CREATE POLICY "user_settings_update" ON user_settings FOR UPDATE USING (user_id = public.get_user_id());
CREATE POLICY "user_settings_delete" ON user_settings FOR DELETE USING (user_id = public.get_user_id());

-- 9. Create RLS policies for oauth_tokens
DROP POLICY IF EXISTS "oauth_tokens_select" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_insert" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_update" ON oauth_tokens;
DROP POLICY IF EXISTS "oauth_tokens_delete" ON oauth_tokens;
CREATE POLICY "oauth_tokens_select" ON oauth_tokens FOR SELECT USING (user_id = public.get_user_id());
CREATE POLICY "oauth_tokens_insert" ON oauth_tokens FOR INSERT WITH CHECK (user_id = public.get_user_id());
CREATE POLICY "oauth_tokens_update" ON oauth_tokens FOR UPDATE USING (user_id = public.get_user_id());
CREATE POLICY "oauth_tokens_delete" ON oauth_tokens FOR DELETE USING (user_id = public.get_user_id());

-- 10. Create RLS policies for weekly_guidelines
DROP POLICY IF EXISTS "weekly_guidelines_select" ON weekly_guidelines;
DROP POLICY IF EXISTS "weekly_guidelines_insert" ON weekly_guidelines;
DROP POLICY IF EXISTS "weekly_guidelines_update" ON weekly_guidelines;
DROP POLICY IF EXISTS "weekly_guidelines_delete" ON weekly_guidelines;
CREATE POLICY "weekly_guidelines_select" ON weekly_guidelines FOR SELECT USING (user_id = public.get_user_id());
CREATE POLICY "weekly_guidelines_insert" ON weekly_guidelines FOR INSERT WITH CHECK (user_id = public.get_user_id());
CREATE POLICY "weekly_guidelines_update" ON weekly_guidelines FOR UPDATE USING (user_id = public.get_user_id());
CREATE POLICY "weekly_guidelines_delete" ON weekly_guidelines FOR DELETE USING (user_id = public.get_user_id());

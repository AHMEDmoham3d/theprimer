/*
# Add trial subject access and API usage tracking

## Changes

### 1. Add `trial_subjects` column to `students`
- New text[] column `trial_subjects` on `students` table
- Stores which subjects a student can access during their trial period
- Defaults to all subjects ('{math,chemistry,physics,biology,english,history,geography}')
- Admin can selectively open specific subjects for a student's trial

### 2. New table: `api_usage_logs`
- Tracks every AI interaction in the system (chat messages, whiteboard generations, voice queries)
- Columns: id, student_id, student_name, interaction_type, subject, tokens_used, cost_usd, model, created_at
- interaction_type: 'chat' | 'voice' | 'whiteboard' | 'exam_generation' | 'progress_analysis'
- This is a single-tenant app (no auth screen), so policies use TO anon, authenticated

### 3. New table: `api_usage_daily`
- Aggregated daily API costs per student
- Columns: id, student_id, student_name, date, total_tokens, total_cost_usd, request_count
- Used for the admin API consumption dashboard

### Security
- RLS enabled on both new tables
- TO anon, authenticated (no-auth app pattern matching existing tables)
- Students table gets the new column with no additional policy changes needed
*/

-- 1. Add trial_subjects to students
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'trial_subjects'
  ) THEN
    ALTER TABLE students
      ADD COLUMN trial_subjects text[] DEFAULT '{math,chemistry,physics,biology,english,history,geography}';
  END IF;
END $$;

-- 2. Create api_usage_logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text,
  student_name text,
  interaction_type text NOT NULL DEFAULT 'chat',
  subject text,
  tokens_used integer NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  model text NOT NULL DEFAULT 'gpt-4o-mini',
  content_preview text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_api_usage_logs" ON api_usage_logs;
CREATE POLICY "anon_select_api_usage_logs" ON api_usage_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_api_usage_logs" ON api_usage_logs;
CREATE POLICY "anon_insert_api_usage_logs" ON api_usage_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_api_usage_logs" ON api_usage_logs;
CREATE POLICY "anon_update_api_usage_logs" ON api_usage_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_api_usage_logs" ON api_usage_logs;
CREATE POLICY "anon_delete_api_usage_logs" ON api_usage_logs FOR DELETE
  TO anon, authenticated USING (true);

-- 3. Create api_usage_daily table
CREATE TABLE IF NOT EXISTS api_usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text,
  student_name text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_tokens integer NOT NULL DEFAULT 0,
  total_cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  request_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE api_usage_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_api_usage_daily" ON api_usage_daily;
CREATE POLICY "anon_select_api_usage_daily" ON api_usage_daily FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_api_usage_daily" ON api_usage_daily;
CREATE POLICY "anon_insert_api_usage_daily" ON api_usage_daily FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_api_usage_daily" ON api_usage_daily;
CREATE POLICY "anon_update_api_usage_daily" ON api_usage_daily FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_api_usage_daily" ON api_usage_daily;
CREATE POLICY "anon_delete_api_usage_daily" ON api_usage_daily FOR DELETE
  TO anon, authenticated USING (true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_student_id ON api_usage_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_daily_date ON api_usage_daily(date DESC);

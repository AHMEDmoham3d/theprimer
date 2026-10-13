/*
# Create student_progress and study_schedule tables

1. New Tables
- `student_progress` — tracks per-student per-subject mastery, questions answered, sessions completed, strengths, weaknesses, recent topics. One row per student+subject.
- `study_schedule` — auto-generated weekly study slots per student. The system builds these based on curriculum and student level, not student-chosen times.

2. Security
- Enable RLS on both tables.
- This is a no-auth app (anon key), so policies use `TO anon, authenticated` with `USING (true)` since data is intentionally shared for demo.

3. Seed Data
- Seeds progress rows for the first student (أحمد محمد) across 4 subjects.
- Seeds a weekly schedule with 10 slots mixing review/new/practice/exam-prep across all curriculum subjects.
*/

CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  mastery integer NOT NULL DEFAULT 0,
  questions_answered integer NOT NULL DEFAULT 0,
  sessions_completed integer NOT NULL DEFAULT 0,
  strengths text[] NOT NULL DEFAULT '{}',
  weaknesses text[] NOT NULL DEFAULT '{}',
  recent_topics text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject)
);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_progress" ON student_progress;
CREATE POLICY "anon_select_progress" ON student_progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON student_progress;
CREATE POLICY "anon_insert_progress" ON student_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON student_progress;
CREATE POLICY "anon_update_progress" ON student_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_progress" ON student_progress;
CREATE POLICY "anon_delete_progress" ON student_progress FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS study_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  day_name text NOT NULL,
  day_name_en text NOT NULL,
  scheduled_time text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 25,
  slot_type text NOT NULL DEFAULT 'new',
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_schedule" ON study_schedule;
CREATE POLICY "anon_select_schedule" ON study_schedule FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_schedule" ON study_schedule;
CREATE POLICY "anon_insert_schedule" ON study_schedule FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_schedule" ON study_schedule;
CREATE POLICY "anon_update_schedule" ON study_schedule FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_schedule" ON study_schedule;
CREATE POLICY "anon_delete_schedule" ON study_schedule FOR DELETE
  TO anon, authenticated USING (true);

-- Seed progress for first student
INSERT INTO student_progress (student_id, subject, mastery, questions_answered, sessions_completed, strengths, weaknesses, recent_topics)
SELECT 'dfb49b28-c914-4711-91b6-12016f1e34a5', 'math', 78, 142, 12, ARRAY['الجبر', 'حساب التفاضل'], ARRAY['المعادلات التفاضلية'], ARRAY['sin وcos', 'التفاضل', 'الكسور المتشابكة']
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = 'dfb49b28-c914-4711-91b6-12016f1e34a5' AND subject = 'math');

INSERT INTO student_progress (student_id, subject, mastery, questions_answered, sessions_completed, strengths, weaknesses, recent_topics)
SELECT 'dfb49b28-c914-4711-91b6-12016f1e34a5', 'physics', 65, 88, 8, ARRAY['قوانين نيوتن'], ARRAY['الحركة الدائرية'], ARRAY['قوانين نيوتن', 'القوى']
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = 'dfb49b28-c914-4711-91b6-12016f1e34a5' AND subject = 'physics');

INSERT INTO student_progress (student_id, subject, mastery, questions_answered, sessions_completed, strengths, weaknesses, recent_topics)
SELECT 'dfb49b28-c914-4711-91b6-12016f1e34a5', 'chemistry', 52, 45, 4, ARRAY['الجدول الدوري'], ARRAY['الروابط الكيميائية'], ARRAY['الروابط', 'المعادلات']
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = 'dfb49b28-c914-4711-91b6-12016f1e34a5' AND subject = 'chemistry');

INSERT INTO student_progress (student_id, subject, mastery, questions_answered, sessions_completed, strengths, weaknesses, recent_topics)
SELECT 'dfb49b28-c914-4711-91b6-12016f1e34a5', 'biology', 70, 60, 6, ARRAY['الخلية'], ARRAY['الانقسام المنصف'], ARRAY['الانقسام المتساوي', 'الخلية']
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = 'dfb49b28-c914-4711-91b6-12016f1e34a5' AND subject = 'biology');

-- Seed study schedule for first student
INSERT INTO study_schedule (student_id, day_of_week, day_name, day_name_en, scheduled_time, subject, topic, duration_minutes, slot_type, status)
SELECT 'dfb49b28-c914-4711-91b6-12016f1e34a5', v.dow, v.day_ar, v.day_en, v.time, v.subject, v.topic, v.dur, v.type, v.status
FROM (VALUES
  (6, 'السبت', 'Saturday', '16:00', 'math', 'المعادلات التفاضلية', 30, 'new', 'done'),
  (6, 'السبت', 'Saturday', '18:00', 'physics', 'قوانين نيوتن — مراجعة', 20, 'review', 'done'),
  (0, 'الأحد', 'Sunday', '16:00', 'chemistry', 'الروابط الكيميائية', 25, 'new', 'done'),
  (0, 'الأحد', 'Sunday', '18:30', 'english', 'Grammar — Tenses', 20, 'practice', 'upcoming'),
  (1, 'الإثنين', 'Monday', '17:00', 'math', 'حساب التفاضل — تطبيقات', 30, 'new', 'upcoming'),
  (2, 'الثلاثاء', 'Tuesday', '16:00', 'biology', 'الانقسام الخلوي', 25, 'new', 'upcoming'),
  (2, 'الثلاثاء', 'Tuesday', '18:00', 'history', 'ثورة 1919 — الأسباب', 20, 'review', 'upcoming'),
  (3, 'الأربعاء', 'Wednesday', '17:00', 'math', 'مراجعة شاملة + امتحان', 35, 'exam-prep', 'upcoming'),
  (4, 'الخميس', 'Thursday', '16:00', 'physics', 'الحركة الدائرية', 25, 'new', 'upcoming'),
  (4, 'الخميس', 'Thursday', '18:00', 'geography', 'خرائط مصر', 20, 'review', 'upcoming')
) AS v(dow, day_ar, day_en, time, subject, topic, dur, type, status)
WHERE NOT EXISTS (SELECT 1 FROM study_schedule WHERE student_id = 'dfb49b28-c914-4711-91b6-12016f1e34a5');

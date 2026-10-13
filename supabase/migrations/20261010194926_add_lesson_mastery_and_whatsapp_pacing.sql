/*
# Add lesson_mastery table for lesson progression locking

1. New Tables
- `lesson_mastery` — tracks per-student per-lesson mastery percentage and exam score.
  A lesson is "unlocked" only when the previous lesson in the same subject has mastery >= 100
  AND the associated exam score >= 70 (passing grade).

2. Security
- Enable RLS on lesson_mastery.
- No-auth app: TO anon, authenticated with USING (true).

3. Seed Data
- Seeds mastery for the demo student: first 2 math lessons at 100%, third at 45% (locked next).
- Seeds first physics lesson at 100%.
*/

CREATE TABLE IF NOT EXISTS lesson_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject text NOT NULL,
  lesson_id text NOT NULL,
  lesson_title text NOT NULL,
  lesson_order integer NOT NULL DEFAULT 0,
  mastery integer NOT NULL DEFAULT 0,
  exam_score integer,
  exam_passed boolean NOT NULL DEFAULT false,
  unlocked boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE lesson_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lesson_mastery" ON lesson_mastery;
CREATE POLICY "anon_select_lesson_mastery" ON lesson_mastery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lesson_mastery" ON lesson_mastery;
CREATE POLICY "anon_insert_lesson_mastery" ON lesson_mastery FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lesson_mastery" ON lesson_mastery;
CREATE POLICY "anon_update_lesson_mastery" ON lesson_mastery FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lesson_mastery" ON lesson_mastery;
CREATE POLICY "anon_delete_lesson_mastery" ON lesson_mastery FOR DELETE
  TO anon, authenticated USING (true);

-- Seed: math lessons 1-2 mastered, lesson 3 in progress (45%), lessons 4-5 locked
INSERT INTO lesson_mastery (student_id, subject, lesson_id, lesson_title, lesson_order, mastery, exam_score, exam_passed, unlocked)
SELECT 'dfb49b28-c914-4711-91b6-12016f1e34a5', v.subject, v.lesson_id, v.title, v.ord, v.mastery, v.exam_score, v.exam_passed, v.unlocked
FROM (VALUES
  ('math', 'm1', 'الجبر الخطي', 1, 100, 85, true, true),
  ('math', 'm2', 'حساب التفاضل', 2, 100, 92, true, true),
  ('math', 'm3', 'الكسيور المتشابكة', 3, 45, null, false, true),
  ('math', 'm4', 'المعادلات التفاضلية', 4, 0, null, false, false),
  ('math', 'm5', 'حساب التكامل', 5, 0, null, false, false),
  ('physics', 'p1', 'قوانين نيوتن', 1, 100, 78, true, true),
  ('physics', 'p2', 'الحركة الدائرية', 2, 65, null, false, true),
  ('physics', 'p3', 'الشغل والطاقة', 3, 0, null, false, false),
  ('physics', 'p4', 'الكهرباء الساكنة', 4, 0, null, false, false),
  ('chemistry', 'c1', 'الجدول الدوري', 1, 100, 70, true, true),
  ('chemistry', 'c2', 'الروابط الكيميائية', 2, 52, null, false, true),
  ('chemistry', 'c3', 'التفاعلات الكيميائية', 3, 0, null, false, false),
  ('chemistry', 'c4', 'الكيمياء العضوية', 4, 0, null, false, false),
  ('biology', 'b1', 'الخلية', 1, 100, 88, true, true),
  ('biology', 'b2', 'الانقسام المتساوي', 2, 70, null, false, true),
  ('biology', 'b3', 'الانقسام المنصف', 3, 0, null, false, false),
  ('biology', 'b4', 'الوراثة والجينات', 4, 0, null, false, false)
) AS v(subject, lesson_id, title, ord, mastery, exam_score, exam_passed, unlocked)
WHERE NOT EXISTS (SELECT 1 FROM lesson_mastery WHERE student_id = 'dfb49b28-c914-4711-91b6-12016f1e34a5');

-- Add last_whatsapp_sent column to students for pacing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'last_whatsapp_sent') THEN
    ALTER TABLE students ADD COLUMN last_whatsapp_sent timestamptz DEFAULT '2026-01-01T00:00:00Z'::timestamptz;
  END IF;
END $$;

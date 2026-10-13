/*
# Summer course recommendations + subscription management

1. New Tables
- `summer_course_recommendations` — AI-generated summer course suggestions per student.
  Each row stores: student, recommended courses, AI reasoning, evidence (factors that led to the choice),
  status (pending/confirmed/hidden), confirmed_at.
- `subscription_settings` — single-row table controlling auto vs manual renewal mode.

2. Security
- Enable RLS. No-auth app: TO anon, authenticated.
*/

CREATE TABLE IF NOT EXISTS summer_course_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  courses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_reasoning text NOT NULL DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'hidden')),
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE summer_course_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scr" ON summer_course_recommendations;
CREATE POLICY "anon_select_scr" ON summer_course_recommendations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scr" ON summer_course_recommendations;
CREATE POLICY "anon_insert_scr" ON summer_course_recommendations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scr" ON summer_course_recommendations;
CREATE POLICY "anon_update_scr" ON summer_course_recommendations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scr" ON summer_course_recommendations;
CREATE POLICY "anon_delete_scr" ON summer_course_recommendations
  FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS subscription_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_mode text NOT NULL DEFAULT 'manual' CHECK (renewal_mode IN ('auto', 'manual')),
  trial_duration_days integer NOT NULL DEFAULT 14,
  monthly_fee numeric NOT NULL DEFAULT 400,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ss" ON subscription_settings;
CREATE POLICY "anon_select_ss" ON subscription_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ss" ON subscription_settings;
CREATE POLICY "anon_insert_ss" ON subscription_settings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ss" ON subscription_settings;
CREATE POLICY "anon_update_ss" ON subscription_settings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Ensure one row exists in subscription_settings
INSERT INTO subscription_settings (renewal_mode, trial_duration_days, monthly_fee)
SELECT 'manual', 14, 400
WHERE NOT EXISTS (SELECT 1 FROM subscription_settings);

-- Add subscription_end_date column to students if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'subscription_end_date') THEN
    ALTER TABLE students ADD COLUMN subscription_end_date date;
  END IF;
END $$;

-- Set subscription_end_date for existing students based on status
UPDATE students
SET subscription_end_date = CASE
  WHEN subscription_status = 'active' THEN CURRENT_DATE + INTERVAL '30 days'
  WHEN subscription_status = 'trial' THEN CURRENT_DATE + INTERVAL '14 days'
  WHEN subscription_status = 'expired' THEN CURRENT_DATE - INTERVAL '10 days'
END
WHERE subscription_end_date IS NULL;

-- Seed summer course recommendations for demo students
INSERT INTO summer_course_recommendations (student_id, student_name, courses, ai_reasoning, evidence, status)
SELECT s.id, s.name,
  jsonb_build_array(
    jsonb_build_object(
      'title', 'كورس الرياضيات المكثف — جبر وتفاضل',
      'description', 'تركيز على الجبر الخطي وحساب التفاضل مع تطبيقات عملية',
      'duration', '6 أسابيع',
      'reason', 'الطالب أظهر تفوق في الجبر ولكن يحتاج تعمق في التفاضل',
      'match_score', 92
    ),
    jsonb_build_object(
      'title', 'كورس الفيزياء التطبيقي',
      'description', 'قوانين نيوتن مع تجارب عملية وأمثلة من الحياة اليومية',
      'duration', '4 أسابيع',
      'reason', 'الطالب بيحب الفيزياء التطبيقية وأظهر اهتمام في الحركة الدائرية',
      'match_score', 85
    )
  ),
  'بناءً على تحليل 3 شهور من بيانات المذاكرة، الطالب بيظهر نمط تعلم بصري وقوي في الجبر، ويحتاج تعمق في التفاضل والفيزياء التطبيقية. الكورسات دي بتستهدف نقاط القوة وتطوّرها وتعالج نقاط الضعف.',
  jsonb_build_array(
    jsonb_build_object('factor', 'نقاط القوة', 'detail', 'الجبر الخطي — 100% إتقان'),
    jsonb_build_object('factor', 'نقاط تحتاج تركيز', 'detail', 'حساب التفاضل — 45% إتقان'),
    jsonb_build_object('factor', 'نمط التعلم', 'detail', 'بصري — بيستفيد من السبورة والرسوم'),
    jsonb_build_object('factor', 'معدل التفاعل', 'detail', 'عالي في الرياضيات، متوسط في الفيزياء'),
    jsonb_build_object('factor', 'عدد الجلسات', 'detail', '24 جلسة في 3 شهور — انتظام ممتاز')
  ),
  'pending'
FROM students s
WHERE NOT EXISTS (
  SELECT 1 FROM summer_course_recommendations WHERE student_id = s.id
);

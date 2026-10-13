/*
# Core Schema: Schools, Teachers, Students, Curricula, WhatsApp

## Overview
Creates foundational tables for The Primer education platform.
All tables use anon+authenticated RLS since there's no end-user auth yet.

## Tables
1. curricula — named curricula per school type
2. schools — school registry with unique slug for links
3. teachers — teachers linked to schools
4. students — students with optional school link, curriculum assignment
5. curriculum_subjects — subjects per curriculum
6. curriculum_units — units per subject
7. curriculum_lessons — lessons per unit
8. whatsapp_templates — message templates with company sending number
9. whatsapp_messages — sent message log
10. blocked_users — blocked accounts
*/

-- Curricula (must come before students FK)
CREATE TABLE IF NOT EXISTS curricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  school_type text NOT NULL DEFAULT 'national' CHECK (school_type IN ('international', 'national', 'private')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE curricula ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_curricula" ON curricula;
CREATE POLICY "anon_select_curricula" ON curricula FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_curricula" ON curricula;
CREATE POLICY "anon_insert_curricula" ON curricula FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_curricula" ON curricula;
CREATE POLICY "anon_update_curricula" ON curricula FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_curricula" ON curricula;
CREATE POLICY "anon_delete_curricula" ON curricula FOR DELETE TO anon, authenticated USING (true);

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  location text NOT NULL DEFAULT '',
  school_type text NOT NULL DEFAULT 'national' CHECK (school_type IN ('international', 'national', 'private')),
  contract_status text NOT NULL DEFAULT 'pending' CHECK (contract_status IN ('active', 'pending', 'trial', 'expired')),
  students_count int NOT NULL DEFAULT 0,
  teachers_count int NOT NULL DEFAULT 0,
  monthly_referral_fee numeric NOT NULL DEFAULT 0,
  referral_per_student numeric NOT NULL DEFAULT 80,
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_schools" ON schools;
CREATE POLICY "anon_select_schools" ON schools FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_schools" ON schools;
CREATE POLICY "anon_insert_schools" ON schools FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_schools" ON schools;
CREATE POLICY "anon_update_schools" ON schools FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_schools" ON schools;
CREATE POLICY "anon_delete_schools" ON schools FOR DELETE TO anon, authenticated USING (true);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  school_name text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT 'math',
  avatar text NOT NULL DEFAULT '',
  students_count int NOT NULL DEFAULT 0,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE TO anon, authenticated USING (true);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text NOT NULL DEFAULT '',
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  school_name text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  active_subject text NOT NULL DEFAULT 'math',
  last_active text NOT NULL DEFAULT '',
  streak_days int NOT NULL DEFAULT 0,
  weekly_goal int NOT NULL DEFAULT 10,
  weekly_progress int NOT NULL DEFAULT 0,
  subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('active', 'trial', 'expired')),
  subscription_start timestamptz DEFAULT now(),
  monthly_fee numeric NOT NULL DEFAULT 500,
  parent_name text NOT NULL DEFAULT '',
  parent_phone text NOT NULL DEFAULT '',
  parent_email text NOT NULL DEFAULT '',
  student_phone text NOT NULL DEFAULT '',
  student_email text NOT NULL DEFAULT '',
  curriculum_id uuid REFERENCES curricula(id) ON DELETE SET NULL,
  curriculum_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);

-- Curriculum subjects
CREATE TABLE IF NOT EXISTS curriculum_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id uuid REFERENCES curricula(id) ON DELETE CASCADE,
  subject_key text NOT NULL,
  subject_name text NOT NULL,
  subject_name_ar text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE curriculum_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_cs" ON curriculum_subjects;
CREATE POLICY "anon_select_cs" ON curriculum_subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cs" ON curriculum_subjects;
CREATE POLICY "anon_insert_cs" ON curriculum_subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cs" ON curriculum_subjects;
CREATE POLICY "anon_update_cs" ON curriculum_subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cs" ON curriculum_subjects;
CREATE POLICY "anon_delete_cs" ON curriculum_subjects FOR DELETE TO anon, authenticated USING (true);

-- Curriculum units
CREATE TABLE IF NOT EXISTS curriculum_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES curriculum_subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE curriculum_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_cu" ON curriculum_units;
CREATE POLICY "anon_select_cu" ON curriculum_units FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cu" ON curriculum_units;
CREATE POLICY "anon_insert_cu" ON curriculum_units FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cu" ON curriculum_units;
CREATE POLICY "anon_update_cu" ON curriculum_units FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cu" ON curriculum_units;
CREATE POLICY "anon_delete_cu" ON curriculum_units FOR DELETE TO anon, authenticated USING (true);

-- Curriculum lessons
CREATE TABLE IF NOT EXISTS curriculum_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES curriculum_units(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_cl" ON curriculum_lessons;
CREATE POLICY "anon_select_cl" ON curriculum_lessons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cl" ON curriculum_lessons;
CREATE POLICY "anon_insert_cl" ON curriculum_lessons FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cl" ON curriculum_lessons;
CREATE POLICY "anon_update_cl" ON curriculum_lessons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cl" ON curriculum_lessons;
CREATE POLICY "anon_delete_cl" ON curriculum_lessons FOR DELETE TO anon, authenticated USING (true);

-- WhatsApp templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type text NOT NULL,
  recipient text NOT NULL CHECK (recipient IN ('student', 'parent')),
  template text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  variables text[] NOT NULL DEFAULT '{}',
  company_sending_number text NOT NULL DEFAULT '+20 100 000 0000',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_wt" ON whatsapp_templates;
CREATE POLICY "anon_select_wt" ON whatsapp_templates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_wt" ON whatsapp_templates;
CREATE POLICY "anon_insert_wt" ON whatsapp_templates FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_wt" ON whatsapp_templates;
CREATE POLICY "anon_update_wt" ON whatsapp_templates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_wt" ON whatsapp_templates;
CREATE POLICY "anon_delete_wt" ON whatsapp_templates FOR DELETE TO anon, authenticated USING (true);

-- WhatsApp messages log
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  student_name text NOT NULL DEFAULT '',
  recipient text NOT NULL CHECK (recipient IN ('student', 'parent')),
  recipient_phone text NOT NULL,
  recipient_name text NOT NULL DEFAULT '',
  recipient_email text NOT NULL DEFAULT '',
  content text NOT NULL,
  trigger_type text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'pending', 'failed')),
  company_sending_number text NOT NULL DEFAULT '+20 100 000 0000',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_wm" ON whatsapp_messages;
CREATE POLICY "anon_select_wm" ON whatsapp_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_wm" ON whatsapp_messages;
CREATE POLICY "anon_insert_wm" ON whatsapp_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_wm" ON whatsapp_messages;
CREATE POLICY "anon_update_wm" ON whatsapp_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_wm" ON whatsapp_messages;
CREATE POLICY "anon_delete_wm" ON whatsapp_messages FOR DELETE TO anon, authenticated USING (true);

-- Blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  reason text NOT NULL DEFAULT '',
  blocked_at timestamptz DEFAULT now(),
  blocked_by text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_bu" ON blocked_users;
CREATE POLICY "anon_select_bu" ON blocked_users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bu" ON blocked_users;
CREATE POLICY "anon_insert_bu" ON blocked_users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bu" ON blocked_users;
CREATE POLICY "anon_update_bu" ON blocked_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_bu" ON blocked_users;
CREATE POLICY "anon_delete_bu" ON blocked_users FOR DELETE TO anon, authenticated USING (true);

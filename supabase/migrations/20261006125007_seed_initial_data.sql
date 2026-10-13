/*
# Seed Initial Data

Populates curricula, schools, teachers, students, and WhatsApp templates.
*/

-- Curricula
INSERT INTO curricula (name, name_ar, school_type, description) VALUES
  ('British IGCSE', 'بريتيش IGCSE', 'international', 'British international curriculum'),
  ('American Diploma', 'الدبلومة الأمريكية', 'international', 'American international curriculum'),
  ('IB', 'البكالوريا الدولية', 'international', 'International Baccalaureate'),
  ('National Egyptian', 'المنهج المصري', 'national', 'Egyptian national curriculum'),
  ('Egyptian Private', 'المدارس الخاصة المصرية', 'private', 'Egyptian private school curriculum')
ON CONFLICT DO NOTHING;

-- Schools
INSERT INTO schools (name, name_en, slug, location, school_type, contract_status, students_count, teachers_count, monthly_referral_fee, referral_per_student, join_date) VALUES
  ('مدرسة المستقبل الدولية', 'Future International School', 'future-international', 'القاهرة — مدينة نصر', 'international', 'active', 42, 6, 3360, 80, '2026-05-12'),
  ('مدارس النيل الخاصة', 'Nile Private Schools', 'nile-private', 'القاهرة — المعادي', 'private', 'active', 28, 4, 2240, 80, '2026-06-01'),
  ('مدرسة الأهرام الدولية', 'Pyramids International School', 'pyramids-international', 'الجيزة — 6 أكتوبر', 'international', 'trial', 15, 3, 0, 80, '2026-09-15'),
  ('مدارس الإسكندرية الحديثة', 'Alexandria Modern Schools', 'alexandria-modern', 'الإسكندرية — سموحة', 'national', 'pending', 8, 2, 0, 80, '2026-09-28'),
  ('مدرسة المنصورة للغات', 'Mansoura Language School', 'mansoura-language', 'الدقهلية — المنصورة', 'national', 'pending', 0, 0, 0, 80, '2026-10-01')
ON CONFLICT (slug) DO NOTHING;

-- Teachers (linked via subquery)
INSERT INTO teachers (name, school_id, school_name, subject, avatar, students_count, phone, email)
SELECT 'أ. محمود سعيد', id, 'مدرسة المستقبل الدولية', 'math', 'MS', 18, '01011112222', 'mahmoud@future-intl.edu' FROM schools WHERE slug = 'future-international'
ON CONFLICT DO NOTHING;

INSERT INTO teachers (name, school_id, school_name, subject, avatar, students_count, phone, email)
SELECT 'أ. سارة عبد الله', id, 'مدرسة المستقبل الدولية', 'chemistry', 'SA', 12, '01022223333', 'sara@future-intl.edu' FROM schools WHERE slug = 'future-international'
ON CONFLICT DO NOTHING;

INSERT INTO teachers (name, school_id, school_name, subject, avatar, students_count, phone, email)
SELECT 'أ. خالد فؤاد', id, 'مدرسة المستقبل الدولية', 'physics', 'KF', 8, '01033334444', 'khaled@future-intl.edu' FROM schools WHERE slug = 'future-international'
ON CONFLICT DO NOTHING;

INSERT INTO teachers (name, school_id, school_name, subject, avatar, students_count, phone, email)
SELECT 'أ. منى رشاد', id, 'مدارس النيل الخاصة', 'biology', 'MR', 15, '01044445555', 'mona@nile-private.edu' FROM schools WHERE slug = 'nile-private'
ON CONFLICT DO NOTHING;

INSERT INTO teachers (name, school_id, school_name, subject, avatar, students_count, phone, email)
SELECT 'أ. أحمد زكي', id, 'مدارس النيل الخاصة', 'english', 'AZ', 13, '01055556666', 'ahmed@nile-private.edu' FROM schools WHERE slug = 'nile-private'
ON CONFLICT DO NOTHING;

-- Students
INSERT INTO students (name, grade, school_id, school_name, avatar, active_subject, last_active, streak_days, weekly_goal, weekly_progress, subscription_status, subscription_start, monthly_fee, parent_name, parent_phone, parent_email, student_phone, student_email, curriculum_id, curriculum_name)
SELECT 'أحمد محمد', 'الصف الأول الثانوي', s.id, 'مدرسة المستقبل الدولية', 'AM', 'math', 'منذ 5 دقائق', 12, 10, 7, 'active', '2026-07-01', 500, 'محمد عبد الرحمن', '01012345678', 'mohamed@email.com', '01000000001', 'ahmed@student.edu', c.id, 'British IGCSE'
FROM schools s, curricula c WHERE s.slug = 'future-international' AND c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;

INSERT INTO students (name, grade, school_id, school_name, avatar, active_subject, last_active, streak_days, weekly_goal, weekly_progress, subscription_status, subscription_start, monthly_fee, parent_name, parent_phone, parent_email, student_phone, student_email, curriculum_id, curriculum_name)
SELECT 'فاطمة خالد', 'الصف الثاني الثانوي', s.id, 'مدرسة المستقبل الدولية', 'FK', 'chemistry', 'منذ 20 دقيقة', 8, 10, 5, 'active', '2026-07-15', 500, 'فاطمة الزهراء', '01098765432', 'fatima@email.com', '01000000002', 'fatima@student.edu', c.id, 'British IGCSE'
FROM schools s, curricula c WHERE s.slug = 'future-international' AND c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;

INSERT INTO students (name, grade, school_id, school_name, avatar, active_subject, last_active, streak_days, weekly_goal, weekly_progress, subscription_status, subscription_start, monthly_fee, parent_name, parent_phone, parent_email, student_phone, student_email, curriculum_id, curriculum_name)
SELECT 'يوسف عماد', 'الصف الثالث الثانوي', s.id, 'مدرسة المستقبل الدولية', 'YE', 'physics', 'منذ ساعة', 3, 10, 3, 'trial', '2026-09-20', 500, 'خالد إبراهيم', '01155667788', 'khaled@email.com', '01000000003', 'youssef@student.edu', c.id, 'American Diploma'
FROM schools s, curricula c WHERE s.slug = 'future-international' AND c.name = 'American Diploma'
ON CONFLICT DO NOTHING;

INSERT INTO students (name, grade, school_id, school_name, avatar, active_subject, last_active, streak_days, weekly_goal, weekly_progress, subscription_status, subscription_start, monthly_fee, parent_name, parent_phone, parent_email, student_phone, student_email, curriculum_id, curriculum_name)
SELECT 'مريم حسام', 'الصف الأول الثانوي', s.id, 'مدارس النيل الخاصة', 'MH', 'biology', 'منذ 3 ساعات', 15, 10, 9, 'active', '2026-08-01', 500, 'نورا حسن', '01233445566', 'nora@email.com', '01000000004', 'maryam@student.edu', c.id, 'Egyptian Private'
FROM schools s, curricula c WHERE s.slug = 'nile-private' AND c.name = 'Egyptian Private'
ON CONFLICT DO NOTHING;

INSERT INTO students (name, grade, school_id, school_name, avatar, active_subject, last_active, streak_days, weekly_goal, weekly_progress, subscription_status, subscription_start, monthly_fee, parent_name, parent_phone, parent_email, student_phone, student_email, curriculum_id, curriculum_name)
SELECT 'عمر أيمن', 'الصف الثاني الثانوي', s.id, 'مدارس النيل الخاصة', 'OA', 'english', 'منذ يوم', 0, 10, 2, 'trial', '2026-09-25', 500, 'عمرو شعبان', '01099887766', 'amro@email.com', '01000000005', 'omar@student.edu', c.id, 'Egyptian Private'
FROM schools s, curricula c WHERE s.slug = 'nile-private' AND c.name = 'Egyptian Private'
ON CONFLICT DO NOTHING;

-- WhatsApp templates
INSERT INTO whatsapp_templates (trigger_type, recipient, template, enabled, variables, company_sending_number) VALUES
  ('post-study', 'parent', 'عزيزي ولي الأمر، {{student_name}} أنهى للتو جلسة {{subject}} لمدة {{duration}} دقيقة. ملاحظات: {{notes}}', true, ARRAY['student_name', 'subject', 'duration', 'notes'], '+20 100 123 4567'),
  ('pre-session-reminder', 'student', 'مرحباً {{student_name}}، لديك جلسة {{subject}} خلال 15 دقيقة. استعد!', true, ARRAY['student_name', 'subject'], '+20 100 123 4567'),
  ('post-session-report', 'parent', 'تقرير الجلسة: {{student_name}} — {{topic}}. مستوى الفهم: {{understanding_level}}%. النقاط: {{key_points}}', true, ARRAY['student_name', 'topic', 'understanding_level', 'key_points'], '+20 100 123 4567'),
  ('exam-result', 'parent', 'نتيجة امتحان {{student_name}} في {{subject}}: {{score}} من {{total}}. {{pass_fail}}', true, ARRAY['student_name', 'subject', 'score', 'total', 'pass_fail'], '+20 100 123 4567'),
  ('weekly-progress', 'parent', 'تقرير أسبوعي: {{student_name}} أكمل {{sessions_count}} جلسات هذا الأسبوع. أفضل موضوع: {{best_subject}}', true, ARRAY['student_name', 'sessions_count', 'best_subject'], '+20 100 123 4567'),
  ('welcome', 'student', 'أهلاً بك في The Primer يا {{student_name}}! مدرّسك الشخصي جاهز 24/7. ابدأ بأول سؤال!', true, ARRAY['student_name'], '+20 100 123 4567')
ON CONFLICT DO NOTHING;

-- Curriculum subjects for National Egyptian
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'math', 'Mathematics', 'الرياضيات', 1 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'physics', 'Physics', 'الفيزياء', 2 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'chemistry', 'Chemistry', 'الكيمياء', 3 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'biology', 'Biology', 'الأحياء', 4 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'english', 'English', 'الإنجليزية', 5 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'history', 'History', 'التاريخ', 6 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'geography', 'Geography', 'الجغرافيا', 7 FROM curricula c WHERE c.name = 'National Egyptian'
ON CONFLICT DO NOTHING;

-- Curriculum subjects for British IGCSE
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'math', 'Mathematics', 'الرياضيات', 1 FROM curricula c WHERE c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'physics', 'Physics', 'الفيزياء', 2 FROM curricula c WHERE c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'chemistry', 'Chemistry', 'الكيمياء', 3 FROM curricula c WHERE c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'biology', 'Biology', 'الأحياء', 4 FROM curricula c WHERE c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;
INSERT INTO curriculum_subjects (curriculum_id, subject_key, subject_name, subject_name_ar, sort_order)
SELECT c.id, 'english', 'English Language', 'اللغة الإنجليزية', 5 FROM curricula c WHERE c.name = 'British IGCSE'
ON CONFLICT DO NOTHING;

-- Sample units for National Egyptian Math
INSERT INTO curriculum_units (subject_id, name, name_ar, sort_order)
SELECT cs.id, 'Algebra', 'الجبر', 1 FROM curriculum_subjects cs
JOIN curricula c ON cs.curriculum_id = c.id
WHERE c.name = 'National Egyptian' AND cs.subject_key = 'math'
ON CONFLICT DO NOTHING;

INSERT INTO curriculum_units (subject_id, name, name_ar, sort_order)
SELECT cs.id, 'Calculus', 'حساب التفاضل والتكامل', 2 FROM curriculum_subjects cs
JOIN curricula c ON cs.curriculum_id = c.id
WHERE c.name = 'National Egyptian' AND cs.subject_key = 'math'
ON CONFLICT DO NOTHING;

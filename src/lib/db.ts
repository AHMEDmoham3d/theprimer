
import { supabase } from '@/lib/supabase';

export interface SchoolRow {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  location: string;
  school_type: 'international' | 'national' | 'private';
  contract_status: 'active' | 'pending' | 'trial' | 'expired';
  students_count: number;
  teachers_count: number;
  monthly_referral_fee: number;
  referral_per_student: number;
  join_date: string;
}

export interface TeacherRow {
  id: string;
  name: string;
  school_id: string | null;
  school_name: string;
  subject: string;
  avatar: string;
  students_count: number;
  phone: string;
  email: string;
}

export interface StudentRow {
  id: string;
  name: string;
  grade: string;
  stage?: string | null;
  grade_code?: string | null;
  school_id: string | null;
  school_name: string;
  avatar: string;
  active_subject: string;
  last_active: string;
  streak_days: number;
  weekly_goal: number;
  weekly_progress: number;
  subscription_status: 'active' | 'trial' | 'expired';
  subscription_start: string;
  monthly_fee: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_phone: string;
  student_email: string;
  curriculum_id: string | null;
  curriculum_name: string;
  subscription_end_date: string | null;
  last_whatsapp_sent: string | null;
  trial_subjects: string[] | null;
}

export interface CurriculumRow {
  id: string;
  name: string;
  name_ar: string | null;
  grade: string | null;
  stage: string | null;
  description: string | null;
  created_at?: string;
}

export interface CurriculumSubjectRow {
  id: string;
  curriculum_id: string;
  stage: string;
  grade: string;
  subject_key: string;
  subject_name: string;
  subject_name_ar: string;
  sort_order: number;
  is_active?: boolean;
}

export interface CurriculumGradeRow {
  id: string;
  curriculum_id: string;
  stage: string;
  grade_code: string;
  grade_name: string;
  grade_name_ar: string;
  sort_order: number;
  is_active: boolean;
}

export interface CurriculumUnitRow {
  id: string;
  subject_id: string;
  name: string;
  name_ar: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CurriculumLessonRow {
  id: string;
  unit_id: string;
  name: string;
  name_ar: string | null;
  content: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface WhatsAppTemplateRow {
  id: string;
  trigger_type: string;
  recipient: 'student' | 'parent';
  template: string;
  enabled: boolean;
  variables: string[];
  company_sending_number: string;
}

export interface WhatsAppMessageRow {
  id: string;
  student_id: string | null;
  student_name: string;
  recipient: 'student' | 'parent';
  recipient_phone: string;
  recipient_name: string;
  recipient_email: string;
  content: string;
  trigger_type: string;
  status: 'sent' | 'pending' | 'failed';
  company_sending_number: string;
  created_at: string;
}

export interface BlockedUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  reason: string;
  blocked_at: string;
  blocked_by: string;
}

function slugify(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 40);
}

export async function fetchSchools(): Promise<SchoolRow[]> {
  try {
    const { data, error } = await supabase.from('schools').select('*').order('join_date', { ascending: false });
    if (error) { console.warn('fetchSchools warning:', error.message); return []; }
    return (data || []) as SchoolRow[];
  } catch {
    return [];
  }
}

export async function createSchool(input: {
  name: string;
  name_en: string;
  location: string;
  school_type: 'international' | 'national' | 'private';
  contract_status: 'active' | 'pending' | 'trial' | 'expired';
  referral_per_student: number;
}): Promise<SchoolRow | null> {
  try {
    const slug = slugify(input.name_en || input.name);
    const { data, error } = await supabase.from('schools').insert({
      name: input.name,
      name_en: input.name_en,
      slug,
      location: input.location,
      school_type: input.school_type,
      contract_status: input.contract_status,
      referral_per_student: input.referral_per_student,
    }).select().single();
    if (error) { console.warn('createSchool warning:', error.message); return null; }
    return data as SchoolRow;
  } catch {
    return null;
  }
}

export async function fetchTeachers(): Promise<TeacherRow[]> {
  try {
    const { data, error } = await supabase.from('teachers').select('*').order('name');
    if (error) { console.warn('fetchTeachers warning:', error.message); return []; }
    return (data || []) as TeacherRow[];
  } catch {
    return [];
  }
}

export async function createTeacher(input: {
  name: string;
  school_id: string | null;
  school_name: string;
  subject: string;
  phone: string;
  email: string;
}): Promise<TeacherRow | null> {
  try {
    const avatar = input.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const { data, error } = await supabase.from('teachers').insert({
      name: input.name,
      school_id: input.school_id,
      school_name: input.school_name,
      subject: input.subject,
      avatar,
      phone: input.phone,
      email: input.email,
    }).select().single();
    if (error) { console.warn('createTeacher warning:', error.message); return null; }
    return data as TeacherRow;
  } catch {
    return null;
  }
}

export async function fetchStudents(): Promise<StudentRow[]> {
  try {
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error) { console.warn('fetchStudents warning:', error.message); return []; }
    return (data || []) as StudentRow[];
  } catch {
    return [];
  }
}

export async function createStudent(input: {
  name: string;
  grade: string;
  stage?: string;
  grade_code?: string;
  school_id: string | null;
  school_name: string;
  curriculum_id: string | null;
  curriculum_name: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_phone: string;
  student_email: string;
}): Promise<StudentRow | null> {
  try {
    const avatar = input.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

    const { data, error } = await supabase.from('students').insert({
      name: input.name,
      grade: input.grade,
      stage: input.stage ?? null,
      grade_code: input.grade_code ?? null,
      school_id: input.school_id,
      school_name: input.school_name,
      avatar,
      active_subject: 'math',
      last_active: 'الآن',
      subscription_status: 'trial',
      parent_name: input.parent_name,
      parent_phone: input.parent_phone,
      parent_email: input.parent_email,
      student_phone: input.student_phone,
      student_email: input.student_email,
      curriculum_id: input.curriculum_id,
      curriculum_name: input.curriculum_name,
    }).select().single();

    if (error) {
      console.warn('createStudent warning:', error.message);
      return null;
    }

    return data as StudentRow;
  } catch {
    return null;
  }
}

export async function fetchCurricula(): Promise<CurriculumRow[]> {
  const { data, error } = await supabase.from('curricula').select('*').order('name');
  if (error) throw error;
  return (data || []) as CurriculumRow[];
}

export async function createCurriculum(input: {
  name: string; name_ar?: string | null; grade?: string | null;
  stage?: string | null; description?: string | null;
}): Promise<CurriculumRow> {
  const { data, error } = await supabase.from('curricula').insert({
    name: input.name.trim(), name_ar: input.name_ar?.trim() || null,
    grade: input.grade?.trim() || null, stage: input.stage?.trim() || null,
    description: input.description?.trim() || null,
  }).select('*').single();
  if (error) throw error;
  return data as CurriculumRow;
}

export async function updateCurriculum(id: string, input: Partial<Omit<CurriculumRow, 'id' | 'created_at'>>): Promise<CurriculumRow> {
  const { data, error } = await supabase.from('curricula').update(input).eq('id', id).select('*').single();
  if (error) throw error;
  return data as CurriculumRow;
}

export async function deleteCurriculum(id: string): Promise<void> {
  const { error } = await supabase.from('curricula').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCurriculumGrades(curriculumId: string): Promise<CurriculumGradeRow[]> {
  const { data, error } = await supabase.from('curriculum_grades').select('*')
    .eq('curriculum_id', curriculumId).eq('is_active', true).order('sort_order');
  if (error) throw error;
  return (data || []) as CurriculumGradeRow[];
}

export async function createCurriculumGrade(input: Omit<CurriculumGradeRow, 'id' | 'is_active'> & { is_active?: boolean }): Promise<CurriculumGradeRow> {
  const { data, error } = await supabase.from('curriculum_grades').insert({ ...input, is_active: input.is_active ?? true }).select('*').single();
  if (error) throw error;
  return data as CurriculumGradeRow;
}

export async function updateCurriculumGrade(id: string, input: Partial<Omit<CurriculumGradeRow, 'id'>>): Promise<CurriculumGradeRow> {
  const { data, error } = await supabase.from('curriculum_grades').update(input).eq('id', id).select('*').single();
  if (error) throw error;
  return data as CurriculumGradeRow;
}

export async function deleteCurriculumGrade(id: string): Promise<void> {
  const { error } = await supabase.from('curriculum_grades').delete().eq('id', id);
  if (error) throw error;
}

export async function updateStudentCurriculum(studentId: string, curriculumId: string, curriculumName: string): Promise<boolean> {
  const { error } = await supabase.from('students').update({ curriculum_id: curriculumId, curriculum_name: curriculumName }).eq('id', studentId);
  if (error) { console.warn('updateStudentCurriculum warning:', error.message); return false; }
  return true;
}

export async function fetchCurriculumSubjects(curriculumId: string, stage?: string, gradeCode?: string): Promise<CurriculumSubjectRow[]> {
  let query = supabase.from('curriculum_grade_subjects').select('*').eq('curriculum_id', curriculumId).eq('is_active', true);
  if (stage) query = query.eq('stage', stage);
  if (gradeCode) query = query.eq('grade', gradeCode);
  const { data, error } = await query.order('sort_order');
  if (error) throw error;
  return (data || []) as CurriculumSubjectRow[];
}

export async function createCurriculumSubject(input: Omit<CurriculumSubjectRow, 'id' | 'is_active'> & { is_active?: boolean }): Promise<CurriculumSubjectRow> {
  const { data, error } = await supabase.from('curriculum_grade_subjects').insert({ ...input, is_active: input.is_active ?? true }).select('*').single();
  if (error) throw error;
  return data as CurriculumSubjectRow;
}

export async function updateCurriculumSubject(id: string, input: Partial<Omit<CurriculumSubjectRow, 'id'>>): Promise<CurriculumSubjectRow> {
  const { data, error } = await supabase.from('curriculum_grade_subjects').update(input).eq('id', id).select('*').single();
  if (error) throw error;
  return data as CurriculumSubjectRow;
}

export async function deleteCurriculumSubject(id: string): Promise<void> {
  const { error } = await supabase.from('curriculum_grade_subjects').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchUnits(subjectId: string): Promise<CurriculumUnitRow[]> {
  const { data, error } = await supabase.from('curriculum_units').select('*').eq('subject_id', subjectId).order('sort_order');
  if (error) throw error;
  return (data || []) as CurriculumUnitRow[];
}

export async function createCurriculumUnit(input: Omit<CurriculumUnitRow, 'id' | 'created_at' | 'updated_at'>): Promise<CurriculumUnitRow> {
  const { data, error } = await supabase.from('curriculum_units').insert(input).select('*').single();
  if (error) throw error;
  return data as CurriculumUnitRow;
}

export async function updateCurriculumUnit(id: string, input: Partial<Omit<CurriculumUnitRow, 'id'>>): Promise<CurriculumUnitRow> {
  const { data, error } = await supabase.from('curriculum_units').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data as CurriculumUnitRow;
}

export async function deleteCurriculumUnit(id: string): Promise<void> {
  const { error } = await supabase.from('curriculum_units').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchLessons(unitId: string): Promise<CurriculumLessonRow[]> {
  const { data, error } = await supabase.from('curriculum_lessons').select('*').eq('unit_id', unitId).order('sort_order');
  if (error) throw error;
  return (data || []) as CurriculumLessonRow[];
}

export async function createCurriculumLesson(input: Omit<CurriculumLessonRow, 'id' | 'created_at' | 'updated_at'>): Promise<CurriculumLessonRow> {
  const { data, error } = await supabase.from('curriculum_lessons').insert(input).select('*').single();
  if (error) throw error;
  return data as CurriculumLessonRow;
}

export async function updateCurriculumLesson(id: string, input: Partial<Omit<CurriculumLessonRow, 'id'>>): Promise<CurriculumLessonRow> {
  const { data, error } = await supabase.from('curriculum_lessons').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data as CurriculumLessonRow;
}

export async function deleteCurriculumLesson(id: string): Promise<void> {
  const { error } = await supabase.from('curriculum_lessons').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchWhatsAppTemplates(): Promise<WhatsAppTemplateRow[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('trigger_type');

    if (error) {
      console.warn('fetchWhatsAppTemplates warning:', error.message);
      return [];
    }

    return (data || []) as WhatsAppTemplateRow[];
  } catch {
    return [];
  }
}

export async function updateWhatsAppTemplate(
  id: string,
  updates: Partial<WhatsAppTemplateRow>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('whatsapp_templates')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('updateWhatsAppTemplate warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function fetchWhatsAppMessages(): Promise<WhatsAppMessageRow[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('fetchWhatsAppMessages warning:', error.message);
      return [];
    }

    return (data || []) as WhatsAppMessageRow[];
  } catch {
    return [];
  }
}

export async function sendWhatsAppMessage(input: {
  student_id: string | null;
  student_name: string;
  recipient: 'student' | 'parent';
  recipient_phone: string;
  recipient_name: string;
  recipient_email: string;
  content: string;
  trigger_type: string;
  company_sending_number: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('whatsapp_messages').insert({
      ...input,
      status: 'sent',
    });

    if (error) {
      console.warn('sendWhatsAppMessage warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function fetchBlockedUsers(): Promise<BlockedUserRow[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('*')
      .order('blocked_at', { ascending: false });

    if (error) {
      console.warn('fetchBlockedUsers warning:', error.message);
      return [];
    }

    return (data || []) as BlockedUserRow[];
  } catch {
    return [];
  }
}

export async function blockUser(input: {
  email: string;
  name: string;
  role: string;
  reason: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('blocked_users').insert({
      email: input.email,
      name: input.name,
      role: input.role,
      reason: input.reason,
      blocked_by: 'admin',
    });

    if (error) {
      console.warn('blockUser warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function unblockUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('unblockUser warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export interface StudentProgressRow {
  id: string;
  student_id: string;
  subject: string;
  mastery: number;
  questions_answered: number;
  sessions_completed: number;
  strengths: string[];
  weaknesses: string[];
  recent_topics: string[];
  created_at: string;
  updated_at: string;
}

export async function fetchStudentProgress(
  studentId: string
): Promise<StudentProgressRow[]> {
  try {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('subject');

    if (error || !data || data.length === 0) {
      return [];
    }

    return data as StudentProgressRow[];
  } catch {
    return [];
  }
}

export async function updateStudentProgress(
  id: string,
  updates: Partial<StudentProgressRow>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('student_progress')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.warn('updateStudentProgress warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export interface ScheduleSlotRow {
  id: string;
  student_id: string;
  day_of_week: number;
  day_name: string;
  day_name_en: string;
  scheduled_time: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  slot_type: string;
  status: string;
  created_at: string;
}

export async function fetchStudentSchedule(
  studentId: string
): Promise<ScheduleSlotRow[]> {
  try {
    const { data, error } = await supabase
      .from('study_schedule')
      .select('*')
      .eq('student_id', studentId)
      .order('day_of_week')
      .order('scheduled_time');

    if (error || !data || data.length === 0) {
      return [];
    }

    return data as ScheduleSlotRow[];
  } catch {
    return [];
  }
}

export async function updateScheduleSlotStatus(
  id: string,
  status: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_schedule')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.warn('updateScheduleSlotStatus warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function fetchStudentById(
  id: string
): Promise<StudentRow | null> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('fetchStudentById warning:', error.message);
      return null;
    }

    return data as StudentRow;
  } catch {
    return null;
  }
}

export interface LessonMasteryRow {
  id: string;
  student_id: string;
  subject: string;
  lesson_id: string;
  lesson_title: string;
  lesson_order: number;
  mastery: number;
  exam_score: number | null;
  exam_passed: boolean;
  unlocked: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchLessonMastery(
  studentId: string
): Promise<LessonMasteryRow[]> {
  try {
    const { data, error } = await supabase
      .from('lesson_mastery')
      .select('*')
      .eq('student_id', studentId)
      .order('subject')
      .order('lesson_order');

    if (error || !data || data.length === 0) {
      return [];
    }

    return data as LessonMasteryRow[];
  } catch {
    return [];
  }
}

export async function fetchLessonMasteryBySubject(
  studentId: string,
  subject: string
): Promise<LessonMasteryRow[]> {
  try {
    const { data, error } = await supabase
      .from('lesson_mastery')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .order('lesson_order');

    if (error) {
      console.warn('fetchLessonMasteryBySubject warning:', error.message);
      return [];
    }

    return (data || []) as LessonMasteryRow[];
  } catch {
    return [];
  }
}

export async function updateLessonMastery(
  id: string,
  updates: Partial<LessonMasteryRow>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('lesson_mastery')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.warn('updateLessonMastery warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function unlockNextLesson(
  studentId: string,
  subject: string,
  currentOrder: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('lesson_mastery')
      .update({
        unlocked: true,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('subject', subject)
      .eq('lesson_order', currentOrder + 1);

    if (error) {
      console.warn('unlockNextLesson warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

const WHATSAPP_MIN_INTERVAL_HOURS = 6;

export async function canSendWhatsApp(
  studentId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('last_whatsapp_sent')
      .eq('id', studentId)
      .maybeSingle();

    if (error || !data || !data.last_whatsapp_sent) {
      return true;
    }

    const lastSent = new Date(data.last_whatsapp_sent).getTime();
    const now = Date.now();
    const hoursSince = (now - lastSent) / (1000 * 60 * 60);

    return hoursSince >= WHATSAPP_MIN_INTERVAL_HOURS;
  } catch {
    return true;
  }
}

export async function sendWhatsAppMessagePaced(input: {
  student_id: string | null;
  student_name: string;
  recipient: 'student' | 'parent';
  recipient_phone: string;
  recipient_name: string;
  recipient_email: string;
  content: string;
  trigger_type: string;
  company_sending_number: string;
}): Promise<{ sent: boolean; reason: string }> {
  try {
    if (input.student_id) {
      const allowed = await canSendWhatsApp(input.student_id);

      if (!allowed) {
        return { sent: false, reason: 'pacing_throttled' };
      }
    }

    const ok = await sendWhatsAppMessage(input);

    if (ok && input.student_id) {
      await supabase
        .from('students')
        .update({ last_whatsapp_sent: new Date().toISOString() })
        .eq('id', input.student_id);
    }

    return {
      sent: ok,
      reason: ok ? 'sent' : 'insert_failed',
    };
  } catch {
    return { sent: false, reason: 'error' };
  }
}

export interface SummerCourseRecommendation {
  id: string;
  student_id: string;
  student_name: string;
  courses: Array<{
    title: string;
    description: string;
    duration: string;
    reason: string;
    match_score: number;
  }>;
  ai_reasoning: string;
  evidence: Array<{
    factor: string;
    detail: string;
  }>;
  status: 'pending' | 'confirmed' | 'hidden';
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchAllRecommendations(): Promise<SummerCourseRecommendation[]> {
  try {
    const { data, error } = await supabase
      .from('summer_course_recommendations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchAllRecommendations warning:', error.message);
      return [];
    }

    return (data || []) as SummerCourseRecommendation[];
  } catch {
    return [];
  }
}

export async function fetchStudentRecommendations(
  studentId: string
): Promise<SummerCourseRecommendation[]> {
  try {
    const { data, error } = await supabase
      .from('summer_course_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('fetchStudentRecommendations warning:', error.message);
      return [];
    }

    return (data || []) as SummerCourseRecommendation[];
  } catch {
    return [];
  }
}

export async function updateRecommendationStatus(
  id: string,
  status: 'confirmed' | 'hidden'
): Promise<boolean> {
  try {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('summer_course_recommendations')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('updateRecommendationStatus warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export interface SubscriptionSettingsRow {
  id: string;
  renewal_mode: 'auto' | 'manual';
  trial_duration_days: number;
  monthly_fee: number;
  updated_at: string;
}

export async function fetchSubscriptionSettings(): Promise<SubscriptionSettingsRow | null> {
  try {
    const { data, error } = await supabase
      .from('subscription_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('fetchSubscriptionSettings warning:', error.message);
      return null;
    }

    return data as SubscriptionSettingsRow;
  } catch {
    return null;
  }
}

export async function updateSubscriptionSettings(
  id: string,
  updates: Partial<SubscriptionSettingsRow>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscription_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.warn('updateSubscriptionSettings warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function renewStudentSubscription(
  studentId: string,
  days: number = 30
): Promise<boolean> {
  try {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + days);

    const { error } = await supabase
      .from('students')
      .update({
        subscription_status: 'active',
        subscription_end_date: newEndDate.toISOString().split('T')[0],
      })
      .eq('id', studentId);

    if (error) {
      console.warn('renewStudentSubscription warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function grantTrial(
  studentId: string,
  days: number,
  subjects: string[]
): Promise<boolean> {
  try {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + days);

    const { error } = await supabase
      .from('students')
      .update({
        subscription_status: 'trial',
        subscription_end_date: newEndDate.toISOString().split('T')[0],
        trial_subjects: subjects,
      })
      .eq('id', studentId);

    if (error) {
      console.warn('grantTrial warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function extendTrial(
  studentId: string,
  additionalDays: number
): Promise<boolean> {
  try {
    const { data: student } = await supabase
      .from('students')
      .select('subscription_end_date')
      .eq('id', studentId)
      .maybeSingle();

    if (!student) return false;

    const currentEnd = student.subscription_end_date
      ? new Date(student.subscription_end_date)
      : new Date();

    const base = currentEnd > new Date() ? currentEnd : new Date();
    base.setDate(base.getDate() + additionalDays);

    const { error } = await supabase
      .from('students')
      .update({
        subscription_status: 'trial',
        subscription_end_date: base.toISOString().split('T')[0],
      })
      .eq('id', studentId);

    if (error) {
      console.warn('extendTrial warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function revokeTrial(studentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('students')
      .update({
        subscription_status: 'expired',
        subscription_end_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', studentId);

    if (error) {
      console.warn('revokeTrial warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function updateTrialSubjects(
  studentId: string,
  subjects: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('students')
      .update({ trial_subjects: subjects })
      .eq('id', studentId);

    if (error) {
      console.warn('updateTrialSubjects warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function activateStudent(studentId: string): Promise<boolean> {
  try {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 365);

    const { error } = await supabase
      .from('students')
      .update({
        subscription_status: 'active',
        subscription_end_date: newEndDate.toISOString().split('T')[0],
      })
      .eq('id', studentId);

    if (error) {
      console.warn('activateStudent warning:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function isTrialExpired(student: {
  subscription_status: string;
  subscription_end_date: string | null;
}): boolean {
  if (student.subscription_status === 'expired') return true;

  if (student.subscription_end_date) {
    const end = new Date(student.subscription_end_date);

    if (end < new Date() && student.subscription_status !== 'active') {
      return true;
    }
  }

  return false;
}

export function getTrialDaysLeft(student: {
  subscription_end_date: string | null;
}): number {
  if (!student.subscription_end_date) return 0;

  const end = new Date(student.subscription_end_date);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, diff);
}

export interface ApiUsageLogRow {
  id: string;
  student_id: string | null;
  student_name: string;
  interaction_type: string;
  subject: string | null;
  tokens_used: number;
  cost_usd: number;
  model: string;
  content_preview: string | null;
  created_at: string;
}

export interface ApiUsageDailyRow {
  id: string;
  student_id: string | null;
  student_name: string;
  date: string;
  total_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

export async function logApiUsage(input: {
  student_id: string | null;
  student_name: string;
  interaction_type: string;
  subject: string | null;
  tokens_used: number;
  cost_usd: number;
  model?: string;
  content_preview?: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from('api_usage_logs').insert({
      student_id: input.student_id,
      student_name: input.student_name,
      interaction_type: input.interaction_type,
      subject: input.subject,
      tokens_used: input.tokens_used,
      cost_usd: input.cost_usd,
      model: input.model ?? 'gpt-4o-mini',
      content_preview: input.content_preview ?? null,
    });

    if (error) {
      console.warn('logApiUsage warning:', error.message);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('api_usage_daily')
      .select('*')
      .eq('student_id', input.student_id ?? '')
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('api_usage_daily')
        .update({
          total_tokens:
            (existing as ApiUsageDailyRow).total_tokens + input.tokens_used,
          total_cost_usd:
            Number((existing as ApiUsageDailyRow).total_cost_usd) +
            input.cost_usd,
          request_count:
            (existing as ApiUsageDailyRow).request_count + 1,
        })
        .eq('id', (existing as ApiUsageDailyRow).id);
    } else {
      await supabase.from('api_usage_daily').insert({
        student_id: input.student_id,
        student_name: input.student_name,
        date: today,
        total_tokens: input.tokens_used,
        total_cost_usd: input.cost_usd,
        request_count: 1,
      });
    }
  } catch {
    // suppress
  }
}

export async function fetchApiUsageDaily(): Promise<ApiUsageDailyRow[]> {
  try {
    const { data, error } = await supabase
      .from('api_usage_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('fetchApiUsageDaily warning:', error.message);
      return [];
    }

    return (data || []) as ApiUsageDailyRow[];
  } catch {
    return [];
  }
}

export async function fetchApiUsageLogs(
  limit: number = 50
): Promise<ApiUsageLogRow[]> {
  try {
    const { data, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('fetchApiUsageLogs warning:', error.message);
      return [];
    }

    return (data || []) as ApiUsageLogRow[];
  } catch {
    return [];
  }
}

export async function fetchApiUsageSummary(): Promise<{
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  topConsumers: Array<{
    student_name: string;
    total_cost: number;
    total_tokens: number;
    request_count: number;
  }>;
  bySubject: Array<{
    subject: string;
    total_cost: number;
    total_tokens: number;
  }>;
  byType: Array<{
    interaction_type: string;
    total_cost: number;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    cost: number;
    tokens: number;
  }>;
}> {
  try {
    const { data: daily } = await supabase
      .from('api_usage_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (!daily) {
      return {
        totalCost: 0,
        totalTokens: 0,
        totalRequests: 0,
        topConsumers: [],
        bySubject: [],
        byType: [],
        dailyTrend: [],
      };
    }

    const rows = daily as ApiUsageDailyRow[];
    const totalCost = rows.reduce(
      (sum, row) => sum + Number(row.total_cost_usd),
      0
    );
    const totalTokens = rows.reduce(
      (sum, row) => sum + row.total_tokens,
      0
    );
    const totalRequests = rows.reduce(
      (sum, row) => sum + row.request_count,
      0
    );

    const consumerMap = new Map<
      string,
      {
        student_name: string;
        total_cost: number;
        total_tokens: number;
        request_count: number;
      }
    >();

    for (const row of rows) {
      const key = row.student_id ?? 'unknown';
      const existing = consumerMap.get(key);

      if (existing) {
        existing.total_cost += Number(row.total_cost_usd);
        existing.total_tokens += row.total_tokens;
        existing.request_count += row.request_count;
      } else {
        consumerMap.set(key, {
          student_name: row.student_name,
          total_cost: Number(row.total_cost_usd),
          total_tokens: row.total_tokens,
          request_count: row.request_count,
        });
      }
    }

    const topConsumers = Array.from(consumerMap.values())
      .sort((a, b) => b.total_cost - a.total_cost)
      .slice(0, 10);

    const { data: logs } = await supabase
      .from('api_usage_logs')
      .select('subject, interaction_type, cost_usd, tokens_used')
      .order('created_at', { ascending: false })
      .limit(200);

    const logRows = (logs ?? []) as Array<{
      subject: string | null;
      interaction_type: string;
      cost_usd: number;
      tokens_used: number;
    }>;

    const subjectMap = new Map<
      string,
      { total_cost: number; total_tokens: number }
    >();

    for (const log of logRows) {
      const key = log.subject ?? 'general';
      const existing = subjectMap.get(key);

      if (existing) {
        existing.total_cost += Number(log.cost_usd);
        existing.total_tokens += log.tokens_used;
      } else {
        subjectMap.set(key, {
          total_cost: Number(log.cost_usd),
          total_tokens: log.tokens_used,
        });
      }
    }

    const bySubject = Array.from(subjectMap.entries())
      .map(([subject, values]) => ({ subject, ...values }))
      .sort((a, b) => b.total_cost - a.total_cost);

    const typeMap = new Map<
      string,
      { total_cost: number; count: number }
    >();

    for (const log of logRows) {
      const existing = typeMap.get(log.interaction_type);

      if (existing) {
        existing.total_cost += Number(log.cost_usd);
        existing.count += 1;
      } else {
        typeMap.set(log.interaction_type, {
          total_cost: Number(log.cost_usd),
          count: 1,
        });
      }
    }

    const byType = Array.from(typeMap.entries())
      .map(([interaction_type, values]) => ({
        interaction_type,
        ...values,
      }))
      .sort((a, b) => b.count - a.count);

    const dailyTrend = rows.slice().reverse().map(row => ({
      date: row.date,
      cost: Number(row.total_cost_usd),
      tokens: row.total_tokens,
    }));

    return {
      totalCost,
      totalTokens,
      totalRequests,
      topConsumers,
      bySubject,
      byType,
      dailyTrend,
    };
  } catch {
    return {
      totalCost: 0,
      totalTokens: 0,
      totalRequests: 0,
      topConsumers: [],
      bySubject: [],
      byType: [],
      dailyTrend: [],
    };
  }
}

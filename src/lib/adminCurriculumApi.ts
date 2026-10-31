import { supabase } from '@/lib/supabase';

import type {
  CurriculumRow,
  CurriculumGradeRow,
  CurriculumSubjectRow,
  CurriculumUnitRow,
  CurriculumLessonRow,
} from '@/lib/db';

type Resource =
  | 'curricula'
  | 'curriculum_grades'
  | 'curriculum_grade_subjects'
  | 'curriculum_units'
  | 'curriculum_lessons';

type Action =
  | 'create'
  | 'update'
  | 'delete';

async function adminRequest<T>(payload: {
  action: Action;
  resource: Resource;
  id?: string;
  data?: object;
}): Promise<T> {
  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const accessToken =
    sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error(
      'انتهت جلسة دخول الأدمن. سجّل الدخول مرة أخرى.'
    );
  }

  const response = await fetch(
    '/api/admin-curriculum',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      await supabase.auth.signOut();

      throw new Error(
        'جلسة الأدمن غير صالحة أو انتهت. سجّل الدخول مرة أخرى.'
      );
    }

    throw new Error(
      typeof result.error === 'string'
        ? result.error
        : 'فشل تنفيذ العملية الإدارية.'
    );
  }

  return result.data as T;
}

export const adminCreateCurriculum = (
  data:
    Pick<CurriculumRow, 'name'> &
    Partial<
      Omit<
        CurriculumRow,
        'id' | 'created_at' | 'name'
      >
    >
) =>
  adminRequest<CurriculumRow>({
    action: 'create',
    resource: 'curricula',
    data,
  });

export const adminUpdateCurriculum = (
  id: string,
  data: Partial<
    Omit<CurriculumRow, 'id' | 'created_at'>
  >
) =>
  adminRequest<CurriculumRow>({
    action: 'update',
    resource: 'curricula',
    id,
    data,
  });

export const adminDeleteCurriculum = (
  id: string
) =>
  adminRequest<void>({
    action: 'delete',
    resource: 'curricula',
    id,
  });

export const adminCreateGrade = (
  data:
    Omit<CurriculumGradeRow, 'id' | 'is_active'> &
    { is_active?: boolean }
) =>
  adminRequest<CurriculumGradeRow>({
    action: 'create',
    resource: 'curriculum_grades',
    data,
  });

export const adminUpdateGrade = (
  id: string,
  data: Partial<
    Omit<CurriculumGradeRow, 'id'>
  >
) =>
  adminRequest<CurriculumGradeRow>({
    action: 'update',
    resource: 'curriculum_grades',
    id,
    data,
  });

export const adminDeleteGrade = (
  id: string
) =>
  adminRequest<void>({
    action: 'delete',
    resource: 'curriculum_grades',
    id,
  });

export const adminCreateSubject = (
  data:
    Omit<CurriculumSubjectRow, 'id' | 'is_active'> &
    { is_active?: boolean }
) =>
  adminRequest<CurriculumSubjectRow>({
    action: 'create',
    resource: 'curriculum_grade_subjects',
    data,
  });

export const adminUpdateSubject = (
  id: string,
  data: Partial<
    Omit<CurriculumSubjectRow, 'id'>
  >
) =>
  adminRequest<CurriculumSubjectRow>({
    action: 'update',
    resource: 'curriculum_grade_subjects',
    id,
    data,
  });

export const adminDeleteSubject = (
  id: string
) =>
  adminRequest<void>({
    action: 'delete',
    resource: 'curriculum_grade_subjects',
    id,
  });

export const adminCreateUnit = (
  data: Omit<
    CurriculumUnitRow,
    'id' | 'created_at' | 'updated_at'
  >
) =>
  adminRequest<CurriculumUnitRow>({
    action: 'create',
    resource: 'curriculum_units',
    data,
  });

export const adminUpdateUnit = (
  id: string,
  data: Partial<
    Omit<CurriculumUnitRow, 'id'>
  >
) =>
  adminRequest<CurriculumUnitRow>({
    action: 'update',
    resource: 'curriculum_units',
    id,
    data,
  });

export const adminDeleteUnit = (
  id: string
) =>
  adminRequest<void>({
    action: 'delete',
    resource: 'curriculum_units',
    id,
  });

export const adminCreateLesson = (
  data: Omit<
    CurriculumLessonRow,
    'id' | 'created_at' | 'updated_at'
  >
) =>
  adminRequest<CurriculumLessonRow>({
    action: 'create',
    resource: 'curriculum_lessons',
    data,
  });

export const adminUpdateLesson = (
  id: string,
  data: Partial<
    Omit<CurriculumLessonRow, 'id'>
  >
) =>
  adminRequest<CurriculumLessonRow>({
    action: 'update',
    resource: 'curriculum_lessons',
    id,
    data,
  });

export const adminDeleteLesson = (
  id: string
) =>
  adminRequest<void>({
    action: 'delete',
    resource: 'curriculum_lessons',
    id,
  });

export async function verifyAdminSession(
  accessToken: string
): Promise<{ ok: true; email: string }> {
  const response = await fetch(
    '/api/admin-curriculum',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: 'verify',
      }),
    }
  );

  const result = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof result.error === 'string'
        ? result.error
        : 'تعذر التحقق من صلاحية الأدمن.'
    );
  }

  return result as {
    ok: true;
    email: string;
  };
}
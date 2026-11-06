
import { supabase } from '@/lib/supabase';

import {
  fetchStudentById,
  fetchCurriculumSubjects,
  fetchUnits,
  fetchLessons,
  fetchCurriculumPublicationSettings,
  fetchLessonMastery,
  type StudentRow,
  type CurriculumSubjectRow,
  type CurriculumUnitRow,
  type CurriculumLessonRow,
  type LessonMasteryRow,
} from '@/lib/db';

export interface StudentCurriculumData {
  student: StudentRow;
  subjects: CurriculumSubjectRow[];
}

export interface StudentExamData extends StudentCurriculumData {
  lessons: Array<{
    lesson: CurriculumLessonRow;
    unit: CurriculumUnitRow;
    subject: CurriculumSubjectRow;
    mastery: LessonMasteryRow | null;
  }>;
  masteryRows: LessonMasteryRow[];
}

function isFullYearThirdSecondary(student: StudentRow): boolean {
  const curriculumName = (student.curriculum_name || '').trim().toLowerCase();

  const isThirdSecondary =
    student.stage === 'secondary' &&
    student.grade_code === 'secondary_3';

  if (!isThirdSecondary) {
    return false;
  }

  const supportedCurricula = [
    'البكالوريا المصرية',
    'التعليم الأزهري',
    'المنهج المصري العام',
    'شهادة مدارس النيل الدولية',
    'egyptian baccalaureate',
    'al-azhar education',
    'egyptian national curriculum',
    'nile international schools',
  ];

  return supportedCurricula.some((name) =>
    curriculumName.includes(name.toLowerCase())
  );
}

/**
 * Loads the student's saved curriculum and its active subjects.
 */
export async function fetchStudentCurriculum(
  studentId: string
): Promise<StudentCurriculumData | null> {
  const normalizedStudentId = studentId.trim();

  if (!normalizedStudentId) {
    console.warn('fetchStudentCurriculum: Student ID is missing.');
    return null;
  }

  try {
    const student = await fetchStudentById(normalizedStudentId);

    if (!student) {
      console.warn('fetchStudentCurriculum: Student was not found.');
      return null;
    }

    if (!student.curriculum_id) {
      console.warn('fetchStudentCurriculum: No curriculum assigned.');

      return {
        student,
        subjects: [],
      };
    }

    const subjects = await fetchCurriculumSubjects(
      student.curriculum_id,
      student.stage || undefined,
      student.grade_code || undefined
    );

    return {
      student,
      subjects: subjects.filter(
        (subject) =>
          subject.is_active !== false &&
          Boolean(subject.subject_key?.trim())
      ),
    };
  } catch (error) {
    console.error('fetchStudentCurriculum failed:', error);
    return null;
  }
}

/**
 * Loads the student's published curriculum lessons and makes sure
 * every lesson has a progress record in lesson_mastery.
 */
export async function fetchStudentExamData(
  studentId: string
): Promise<StudentExamData | null> {
  const curriculumData = await fetchStudentCurriculum(studentId);

  if (!curriculumData) {
    return null;
  }

  const { student, subjects } = curriculumData;

  if (!student.curriculum_id || subjects.length === 0) {
    return {
      student,
      subjects,
      lessons: [],
      masteryRows: [],
    };
  }

  try {
    const publicationSettings =
      await fetchCurriculumPublicationSettings();

    const currentTerm = publicationSettings.current_term;
    const fullYear = isFullYearThirdSecondary(student);

    const subjectResults = await Promise.all(
      subjects.map(async (subject) => {
        const units = await fetchUnits(subject.id);

        const publishedUnits = units.filter((unit) => {
          if (fullYear) {
            return unit.term === 'full_year';
          }

          return unit.term === currentTerm;
        });

        const unitResults = await Promise.all(
          publishedUnits.map(async (unit) => {
            const lessons = await fetchLessons(unit.id);

            return lessons.map((lesson) => ({
              lesson,
              unit,
              subject,
            }));
          })
        );

        return unitResults.flat();
      })
    );

    const curriculumLessons = subjectResults
      .flat()
      .sort((a, b) => {
        const subjectOrder =
          a.subject.sort_order - b.subject.sort_order;

        if (subjectOrder !== 0) {
          return subjectOrder;
        }

        const unitOrder =
          a.unit.sort_order - b.unit.sort_order;

        if (unitOrder !== 0) {
          return unitOrder;
        }

        return a.lesson.sort_order - b.lesson.sort_order;
      });

    const existingMastery = await fetchLessonMastery(studentId);

    const existingLessonIds = new Set(
      existingMastery.map((row) => row.lesson_id)
    );

    const lessonOrderBySubject: Record<string, number> = {};

    const masteryRecords = curriculumLessons
      .map((item) => {
        const subjectKey = item.subject.subject_key;

        lessonOrderBySubject[subjectKey] =
          (lessonOrderBySubject[subjectKey] || 0) + 1;

        return {
          student_id: studentId,
          subject: subjectKey,
          lesson_id: item.lesson.id,
          lesson_title:
            item.lesson.name_ar ||
            item.lesson.name ||
            'درس بدون اسم',
          lesson_order: lessonOrderBySubject[subjectKey],
          mastery: 0,
          exam_score: null,
          exam_passed: false,
          unlocked: lessonOrderBySubject[subjectKey] === 1,
        };
      })
      .filter((record) => !existingLessonIds.has(record.lesson_id));

    if (masteryRecords.length > 0) {
      const { error } = await supabase
        .from('lesson_mastery')
        .upsert(masteryRecords, {
          onConflict: 'student_id,lesson_id',
          ignoreDuplicates: true,
        });

      if (error) {
        throw error;
      }
    }

    const updatedMasteryRows = await fetchLessonMastery(studentId);

    const masteryByLessonId = new Map(
      updatedMasteryRows.map((row) => [row.lesson_id, row])
    );

    const lessons = curriculumLessons.map((item) => ({
      ...item,
      mastery: masteryByLessonId.get(item.lesson.id) || null,
    }));

    return {
      student,
      subjects,
      lessons,
      masteryRows: updatedMasteryRows,
    };
  } catch (error) {
    console.error('fetchStudentExamData failed:', error);
    throw error;
  }
}

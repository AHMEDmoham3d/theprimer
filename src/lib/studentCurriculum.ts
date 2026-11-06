
import {
  fetchStudentById,
  fetchCurriculumSubjects,
  type StudentRow,
  type CurriculumSubjectRow,
} from '@/lib/db';

export interface StudentCurriculumData {
  student: StudentRow;
  subjects: CurriculumSubjectRow[];
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
    // Get the student's saved profile.
    const student = await fetchStudentById(normalizedStudentId);

    if (!student) {
      console.warn('fetchStudentCurriculum: Student was not found.');
      return null;
    }

    // Make sure the student has a curriculum assigned.
    if (!student.curriculum_id) {
      console.warn('fetchStudentCurriculum: No curriculum assigned.');
      return {
        student,
        subjects: [],
      };
    }

    // Load active subjects using the student's saved curriculum details.
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

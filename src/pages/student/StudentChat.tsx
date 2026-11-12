
import { useState, useEffect } from 'react';
import { TeacherChat } from '@/components/chat/TeacherChat';
import { fetchStudentById, type StudentRow } from '@/lib/db';
import { Loader2, MessageSquare } from 'lucide-react';

export function StudentChat({ studentId }: { studentId?: string }) {
  const storedStudentId =
    typeof window !== 'undefined'
      ? localStorage.getItem('current_student_id')
      : null;

  const activeStudentId = studentId || storedStudentId || '';

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStudent() {
      setLoading(true);
      setError(false);
      setStudent(null);

      if (!activeStudentId) {
        setLoading(false);
        return;
      }

      try {
        const studentData = await fetchStudentById(activeStudentId);

        if (!cancelled) {
          setStudent(studentData);
        }
      } catch (err) {
        console.error('Failed to load student:', err);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStudent();

    return () => {
      cancelled = true;
    };
  }, [activeStudentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!activeStudentId || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <MessageSquare size={40} className="mb-4 text-neutral-400" />

        <h2 className="text-lg font-semibold text-neutral-800">
          لا يوجد طالب مسجل
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          سجل دخولك بحساب الطالب أولاً حتى تتمكن من استخدام المدرس الذكي.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold text-neutral-800">
          تعذر تحميل بيانات الطالب
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          حصلت مشكلة أثناء الاتصال. حاول تحديث الصفحة مرة أخرى.
        </p>
      </div>
    );
  }

  const studentName = student.name
    ? student.name.split(' ')[0]
    : 'طالب';

  return (
    <TeacherChat
      messages={[]}
      studentName={studentName}
    />
  );
}

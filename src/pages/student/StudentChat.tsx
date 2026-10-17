import { useState, useEffect } from 'react';
import { TeacherChat } from '@/components/chat/TeacherChat';
import { CHAT_MESSAGES } from '@/data/mockData';
import { fetchStudentById, type StudentRow } from '@/lib/db';
import { Loader2 } from 'lucide-react';

export function StudentChat({ studentId }: { studentId?: string }) {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') : null;
    const resolvedId = studentId || storedId;
    if (resolvedId) {
      setActiveStudentId(resolvedId);
    }
  }, [studentId]);

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStudentId) return;
    (async () => {
      setLoading(true);
      const s = await fetchStudentById(activeStudentId);
      setStudent(s);
      setLoading(false);
    })();
  }, [activeStudentId]);

  if (loading || !activeStudentId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  // جلب اسم الطالب الحقيقي المسجل وعرضه للمدرس الذكي بشكل ديناميكي
  const studentName = student?.name ? student.name.split(' ')[0] : 'طالب';

  return <TeacherChat messages={CHAT_MESSAGES} studentName={studentName} />;
}
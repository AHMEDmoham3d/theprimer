import { useState, useEffect } from 'react';
import { TeacherChat } from '@/components/chat/TeacherChat';
import { CHAT_MESSAGES } from '@/data/mockData';
import { fetchStudentById, type StudentRow } from '@/lib/db';
import { Loader2 } from 'lucide-react';

const FALLBACK_DEMO_ID = 'dfb49b28-c914-4711-91b6-12016f1e34a5';

export function StudentChat({ studentId }: { studentId?: string }) {
  const storedStudentId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') : null;
  const activeStudentId = studentId || storedStudentId || FALLBACK_DEMO_ID;

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await fetchStudentById(activeStudentId);
      setStudent(s);
      setLoading(false);
    })();
  }, [activeStudentId]);

  if (loading) {
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
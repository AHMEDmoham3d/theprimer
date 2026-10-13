import { Card, Badge, Avatar, StatCard } from '@/components/ui';
import { TEACHERS, STUDENTS, SESSIONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import { Users, BookOpen, Activity, CheckCircle2 } from 'lucide-react';
import type { SchoolPortalPageProps } from './types';

export function SchoolPortalTeachers({ schoolId }: SchoolPortalPageProps) {
  const schoolTeachers = TEACHERS.filter((t) => t.schoolId === schoolId);
  const schoolStudents = STUDENTS.filter((s) => s.schoolId === schoolId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="مدرّسون" value={schoolTeachers.length} icon={<BookOpen size={20} />} />
        <StatCard label="طلاب تحت إشرافهم" value={schoolTeachers.reduce((a, t) => a + t.studentsCount, 0)} icon={<Users size={20} />} />
        <StatCard label="جلسات مكتملة" value={SESSIONS.filter((s) => s.status === 'completed' && schoolStudents.some((st) => st.id === s.studentId)).length} icon={<CheckCircle2 size={20} />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {schoolTeachers.map((t) => {
          const meta = SUBJECT_META[t.subject];
          const teacherStudents = schoolStudents.slice(0, t.studentsCount);
          return (
            <Card key={t.id}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={t.avatar} size="lg" />
                <div className="flex-1">
                  <h3 className="font-bold text-white">{t.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-4 w-4 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                      <meta.icon size={10} />
                    </div>
                    <span className="text-xs text-neutral-500">{meta.labelAr}</span>
                  </div>
                </div>
                <Badge variant="info">{t.studentsCount} طالب</Badge>
              </div>

              <div className="mb-3">
                <p className="text-xs text-neutral-500 mb-2">طلابه:</p>
                <div className="flex flex-wrap gap-1.5">
                  {teacherStudents.slice(0, 6).map((s) => (
                    <div key={s.id} className="flex items-center gap-1 rounded-lg bg-[#141414] px-2 py-1">
                      <Avatar initials={s.avatar} size="sm" className="!w-5 !h-5 !text-[9px]" />
                      <span className="text-[10px] text-neutral-300">{s.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2a2a2a]">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Activity size={12} /> نشط اليوم
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle2 size={12} /> {Math.floor(t.studentsCount * 0.7)} فهموا
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

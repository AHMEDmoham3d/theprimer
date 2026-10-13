import { ClipboardCheck, Plus, TrendingUp, Award, Clock, Eye } from 'lucide-react';
import { Card, StatCard, Badge, Avatar, ProgressBar } from '@/components/ui';
import { EXAMS, STUDENTS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { AdminPageProps } from './types';

export function AdminExams({ onNavigate }: AdminPageProps) {
  const completed = EXAMS.filter((e) => e.status === 'completed');
  const pending = EXAMS.filter((e) => e.status === 'pending');
  const inProgress = EXAMS.filter((e) => e.status === 'in-progress');
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((a, e) => a + (e.score ?? 0), 0) / completed.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">إدارة الامتحانات</h2>
        <button className="btn-primary text-xs"><Plus size={16} /> إنشاء امتحان</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="امتحانات مكتملة" value={completed.length} icon={<Award size={20} />} />
        <StatCard label="منتظرة" value={pending.length} icon={<Clock size={20} />} />
        <StatCard label="قيد التقدم" value={inProgress.length} icon={<TrendingUp size={20} />} />
        <StatCard label="متوسط الدرجات" value={`${avgScore}%`} icon={<TrendingUp size={20} />} trend="up" />
      </div>

      <Card>
        <h3 className="mb-4 font-bold text-white">كل الامتحانات</h3>
        <div className="space-y-3">
          {EXAMS.map((exam) => {
            const meta = SUBJECT_META[exam.subject];
            const student = STUDENTS.find((s) => s.id === exam.studentId);
            return (
              <div key={exam.id} className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <ClipboardCheck size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{exam.topic}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar initials={student?.avatar ?? 'ST'} size="sm" className="!w-6 !h-6 !text-[10px]" />
                    <span className="text-xs text-neutral-400">{exam.studentName}</span>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="neutral" className="text-[10px]">
                    {exam.type === 'pre-session' ? 'قبل الجلسة' : 'بعد الجلسة'}
                  </Badge>
                  <p className="text-[10px] text-neutral-500 mt-1">{exam.questions.length} أسئلة</p>
                </div>
                <div className="text-left">
                  {exam.status === 'completed' ? (
                    <>
                      <p className="text-2xl font-bold text-white">{exam.score}</p>
                      <p className="text-[10px] text-neutral-500">من {exam.totalPoints}</p>
                    </>
                  ) : (
                    <Badge variant={exam.status === 'pending' ? 'warning' : 'info'}>
                      {exam.status === 'pending' ? 'منتظر' : 'قيد التقدم'}
                    </Badge>
                  )}
                </div>
                {exam.status === 'completed' && (
                  <div className="w-20">
                    <ProgressBar value={((exam.score ?? 0) / exam.totalPoints) * 100} color={exam.score && exam.score >= 60 ? '#16a34a' : '#dc2626'} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

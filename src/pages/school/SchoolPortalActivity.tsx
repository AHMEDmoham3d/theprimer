import { Activity, Clock, TrendingUp } from 'lucide-react';
import { Card, StatCard, Badge, Avatar, ProgressBar } from '@/components/ui';
import { STUDENTS, STUDY_LOGS, SESSIONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { SchoolPortalPageProps } from './types';

export function SchoolPortalActivity({ schoolId }: SchoolPortalPageProps) {
  const schoolStudents = STUDENTS.filter((s) => s.schoolId === schoolId);
  const logs = STUDY_LOGS.filter((l) => schoolStudents.some((s) => s.id === l.studentId));
  const sessions = SESSIONS.filter((s) => schoolStudents.some((st) => st.id === s.studentId));
  const completed = sessions.filter((s) => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="جلسات اليوم" value={logs.length} icon={<Activity size={20} />} />
        <StatCard label="جلسات مكتملة" value={completed.length} icon={<Clock size={20} />} />
        <StatCard label="إجمالي وقت المذاكرة" value={`${logs.reduce((a, l) => a + l.duration, 0)}د`} icon={<Clock size={20} />} />
        <StatCard label="معدل النشاط" value={`${Math.round((logs.length / schoolStudents.length) * 100)}%`} icon={<TrendingUp size={20} />} />
      </div>

      <Card>
        <h3 className="mb-4 font-bold text-white">سجل النشاط — من بيدرس ومن لأ</h3>
        <div className="space-y-2">
          {schoolStudents.map((s) => {
            const log = logs.find((l) => l.studentId === s.id);
            const meta = SUBJECT_META[s.activeSubject];
            const isStudying = log && (log.studiedAt.includes('دقيقة') || log.studiedAt.includes('ساعة'));
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-[#141414] p-3">
                <Avatar initials={s.avatar} size="sm" />
                <div className="flex-1">
                  <p className="text-sm text-white">{s.name}</p>
                  <p className="text-xs text-neutral-500">{s.grade}</p>
                </div>
                {log ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                        <meta.icon size={11} />
                      </div>
                      <span className="text-xs text-neutral-300">{log.topic}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{log.duration}د</span>
                    <Badge variant={isStudying ? 'success' : 'neutral'}>{log.studiedAt}</Badge>
                  </>
                ) : (
                  <Badge variant="warning">لم يدرس اليوم</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-bold text-white">معدل نشاط الطلاب</h3>
        <div className="space-y-3">
          {schoolStudents.map((s) => {
            const log = logs.find((l) => l.studentId === s.id);
            const activity = log ? 100 : (s.weeklyProgress / s.weeklyGoal) * 100;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 w-24 truncate">{s.name.split(' ')[0]}</span>
                <div className="flex-1">
                  <ProgressBar value={activity} color={activity > 70 ? '#16a34a' : activity > 40 ? '#b45309' : '#dc2626'} />
                </div>
                <span className="text-xs text-neutral-500 w-12 text-left">{Math.round(activity)}%</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

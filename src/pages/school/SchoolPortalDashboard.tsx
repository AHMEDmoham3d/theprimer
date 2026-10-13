import { Users, TrendingUp, Activity, Clock, BookOpen, Flame, CheckCircle2 } from 'lucide-react';
import { Card, StatCard, Badge, Avatar, ProgressBar } from '@/components/ui';
import { STUDENTS, TEACHERS, SESSIONS, STUDY_LOGS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { SchoolPortalPageProps } from './types';

export function SchoolPortalDashboard({ schoolId, onNavigate }: SchoolPortalPageProps) {
  const schoolStudents = STUDENTS.filter((s) => s.schoolId === schoolId);
  const schoolTeachers = TEACHERS.filter((t) => t.schoolId === schoolId);
  const schoolSessions = SESSIONS.filter((s) => schoolStudents.some((st) => st.id === s.studentId));
  const studyingNow = STUDY_LOGS.filter((l) => schoolStudents.some((st) => st.id === l.studentId));
  const activeCount = schoolStudents.filter((s) => s.subscriptionStatus === 'active').length;
  const trialCount = schoolStudents.filter((s) => s.subscriptionStatus === 'trial').length;
  const totalSessions = schoolSessions.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black font-bold text-xl">
            {schoolStudents[0]?.schoolName?.[0] ?? 'P'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{schoolStudents[0]?.schoolName ?? 'المدرسة'}</h2>
            <p className="text-sm text-neutral-400 mt-1">بوابة إدارة المدرسة — نظرة شاملة</p>
          </div>
          <Badge variant="success" className="mr-auto">فعال</Badge>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="طلاب نشطون" value={activeCount + trialCount} icon={<Users size={20} />} change={`${activeCount} مشترك — ${trialCount} تجربة`} trend="up" />
        <StatCard label="مدرّسون" value={schoolTeachers.length} icon={<BookOpen size={20} />} />
        <StatCard label="جلسات مكتملة" value={totalSessions} icon={<CheckCircle2 size={20} />} change="هذا الشهر" trend="up" />
        <StatCard label="بيدرسون الآن" value={studyingNow.length} icon={<Activity size={20} />} change="مباشر" trend="up" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white">الطلاب بيدرسوا الآن</h3>
            <button onClick={() => onNavigate('portal-activity')} className="text-xs text-neutral-400 hover:text-white">عرض الكل</button>
          </div>
          <div className="space-y-3">
            {studyingNow.length > 0 ? studyingNow.map((log) => {
              const meta = SUBJECT_META[log.subject];
              return (
                <div key={log.studentId} className="flex items-center gap-3 rounded-xl bg-[#141414] p-3">
                  <div className="relative">
                    <Avatar initials={schoolStudents.find((s) => s.id === log.studentId)?.avatar ?? 'ST'} size="sm" />
                    <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#141414] bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{log.studentName}</p>
                    <p className="text-xs text-neutral-500">{log.topic} — {log.duration}د</p>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={14} />
                  </div>
                </div>
              );
            }) : (
              <p className="py-6 text-center text-sm text-neutral-500">مفيش طلاب بيدرسوا دلوقتي</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white">المدرّسون النشطون</h3>
            <button onClick={() => onNavigate('portal-teachers')} className="text-xs text-neutral-400 hover:text-white">عرض الكل</button>
          </div>
          <div className="space-y-3">
            {schoolTeachers.map((t) => {
              const meta = SUBJECT_META[t.subject];
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl bg-[#141414] p-3">
                  <Avatar initials={t.avatar} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{t.name}</p>
                    <p className="text-xs text-neutral-500">{meta.labelAr}</p>
                  </div>
                  <Badge variant="info">{t.studentsCount} طالب</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">تقدم الطلاب</h3>
          <button onClick={() => onNavigate('portal-students')} className="text-xs text-neutral-400 hover:text-white">إدارة الطلاب</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {schoolStudents.map((s) => (
            <div key={s.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={s.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-neutral-500">{s.grade}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Flame size={12} /> {s.streakDays}
                </div>
              </div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                <span>الهدف الأسبوعي</span>
                <span>{s.weeklyProgress}/{s.weeklyGoal}</span>
              </div>
              <ProgressBar value={(s.weeklyProgress / s.weeklyGoal) * 100} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

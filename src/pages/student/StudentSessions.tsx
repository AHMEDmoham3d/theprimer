import { useState, useEffect } from 'react';
import { Video, Clock, Calendar, CheckCircle2, X, Play, Loader2 } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import { fetchStudentSchedule, type ScheduleSlotRow } from '@/lib/db';

export function StudentSessions({ studentId }: { studentId?: string }) {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') : null;
    const resolvedId = studentId || storedId;
    if (resolvedId) {
      setActiveStudentId(resolvedId);
    }
  }, [studentId]);

  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStudentId) return;
    (async () => {
      setLoading(true);
      const slots = await fetchStudentSchedule(activeStudentId);
      setScheduleSlots(slots);
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

  // الجلسات القادمة والمكتملة مبنية على جدول الطالب الحقيقي في قاعدة البيانات
  const upcoming = scheduleSlots.filter((s) => s.status !== 'done');
  const completed = scheduleSlots.filter((s) => s.status === 'done');
  const totalMinutes = completed.reduce((a, s) => a + (s.duration_minutes || 25), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><div className="text-center"><p className="text-3xl font-bold text-white">{upcoming.length}</p><p className="text-xs text-neutral-400 mt-1">جلسات قادمة</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-white">{completed.length}</p><p className="text-xs text-neutral-400 mt-1">جلسات مكتملة</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-white">{totalMinutes}د</p><p className="text-xs text-neutral-400 mt-1">إجمالي الوقت</p></div></Card>
      </div>

      {/* Upcoming */}
      <Card>
        <h3 className="mb-4 font-bold text-white">الجلسات القادمة</h3>
        <div className="space-y-3">
          {upcoming.map((s) => {
            const meta = SUBJECT_META[s.subject as keyof typeof SUBJECT_META] || SUBJECT_META.math;
            const Icon = meta.icon;
            return (
              <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{s.topic}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{meta.labelAr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Calendar size={14} />
                    {s.day_name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Clock size={14} /> {s.scheduled_time} ({s.duration_minutes}د)
                  </div>
                  <Badge variant="info">مجدولة</Badge>
                </div>
              </div>
            );
          })}
          {upcoming.length === 0 && (
            <EmptyState icon={<Calendar size={28} />} title="مفيش جلسات مجدولة" description="النظام هيقترح جلسة لما يحس إنك محتاجها" />
          )}
        </div>
      </Card>

      {/* Completed */}
      <Card>
        <h3 className="mb-4 font-bold text-white">الجلسات المكتملة</h3>
        <div className="space-y-2">
          {completed.map((s) => {
            const meta = SUBJECT_META[s.subject as keyof typeof SUBJECT_META] || SUBJECT_META.math;
            const Icon = meta.icon;
            return (
              <div key={s.id} className="flex items-center gap-4 rounded-xl bg-[#141414] p-3 hover:border-[#333] border border-[#2a2a2a] transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{s.topic}</h4>
                  <p className="text-xs text-neutral-500">{meta.labelAr} — {s.day_name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle2 size={14} className="text-green-400" /> {s.duration_minutes}د
                </div>
                <button className="flex items-center gap-1 rounded-lg bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white transition">
                  <Play size={12} /> مراجعة
                </button>
              </div>
            );
          })}
          {completed.length === 0 && (
            <EmptyState icon={<CheckCircle2 size={28} />} title="مفيش جلسات مكتملة بعد" />
          )}
        </div>
      </Card>
    </div>
  );
}
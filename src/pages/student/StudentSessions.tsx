
import { useState, useEffect } from 'react';
import {
  Video,
  Clock,
  Calendar,
  CheckCircle2,
  Play,
  Loader2,
} from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import {
  fetchStudentById,
  fetchCurriculumSubjects,
  fetchStudentSchedule,
  type ScheduleSlotRow,
} from '@/lib/db';

export function StudentSessions({ studentId }: { studentId?: string }) {
  const storedId =
    typeof window !== 'undefined'
      ? localStorage.getItem('current_student_id')
      : null;

  const activeStudentId = studentId || storedId || '';

  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotRow[]>([]);
  const [allowedSubjects, setAllowedSubjects] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      if (!activeStudentId) {
        setScheduleSlots([]);
        setAllowedSubjects({});
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get the actual student record.
        const student = await fetchStudentById(activeStudentId);

        if (
          !student ||
          !student.curriculum_id ||
          !student.stage ||
          !student.grade_code
        ) {
          if (!cancelled) {
            setScheduleSlots([]);
            setAllowedSubjects({});
          }

          return;
        }

        // Get only active subjects assigned to this student's exact grade.
        const subjects = await fetchCurriculumSubjects(
          student.curriculum_id,
          student.stage,
          student.grade_code,
        );

        const subjectMap: Record<string, string> = {};

        subjects.forEach((subject) => {
          if (subject.subject_key) {
            subjectMap[subject.subject_key] =
              subject.subject_name_ar ||
              subject.subject_name ||
              subject.subject_key;
          }
        });

        // Get the student's schedule.
        const slots = await fetchStudentSchedule(activeStudentId);

        if (!cancelled) {
          setAllowedSubjects(subjectMap);

          // Show sessions only for subjects currently assigned to the student.
          setScheduleSlots(
            slots.filter((slot) =>
              Boolean(subjectMap[slot.subject]),
            ),
          );
        }
      } catch (error) {
        console.error('Failed to load student sessions:', error);

        if (!cancelled) {
          setScheduleSlots([]);
          setAllowedSubjects({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSessions();

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

  if (!activeStudentId) {
    return (
      <EmptyState
        icon={<Calendar size={28} />}
        title="مفيش بيانات طالب"
        description="سجّل دخولك الأول علشان نقدر نعرض جلساتك."
      />
    );
  }

  // Separate upcoming and completed sessions.
  const upcoming = scheduleSlots.filter(
    (slot) => slot.status !== 'done',
  );

  const completed = scheduleSlots.filter(
    (slot) => slot.status === 'done',
  );

  const totalMinutes = completed.reduce(
    (total, slot) => total + (slot.duration_minutes || 25),
    0,
  );

  // Get subject display information without using a default subject.
  function getSubjectDisplay(subjectKey: string) {
    const meta =
      SUBJECT_META[subjectKey as keyof typeof SUBJECT_META];

    return {
      name: allowedSubjects[subjectKey] || subjectKey,
      icon: meta?.icon || Video,
      accent: meta?.accent || '#9CA3AF',
      accentSoft:
        meta?.accentSoft || 'rgba(156, 163, 175, 0.12)',
    };
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {upcoming.length}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              جلسات قادمة
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {completed.length}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              جلسات مكتملة
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {totalMinutes}د
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              إجمالي الوقت
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-bold text-white">
          الجلسات القادمة
        </h3>

        <div className="space-y-3">
          {upcoming.map((slot) => {
            const subject = getSubjectDisplay(slot.subject);
            const Icon = subject.icon;

            return (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: subject.accentSoft,
                      color: subject.accent,
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {slot.topic}
                    </h4>

                    <p className="mt-0.5 text-xs text-neutral-400">
                      {subject.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Calendar size={14} />
                    {slot.day_name}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Clock size={14} />
                    {slot.scheduled_time} ({slot.duration_minutes}د)
                  </div>

                  <Badge variant="info">مجدولة</Badge>
                </div>
              </div>
            );
          })}

          {upcoming.length === 0 && (
            <EmptyState
              icon={<Calendar size={28} />}
              title="مفيش جلسات مجدولة"
              description="لما يكون عندك جلسات مرتبطة بموادك الحالية هتظهر هنا."
            />
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-bold text-white">
          الجلسات المكتملة
        </h3>

        <div className="space-y-2">
          {completed.map((slot) => {
            const subject = getSubjectDisplay(slot.subject);
            const Icon = subject.icon;

            return (
              <div
                key={slot.id}
                className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-3 transition hover:border-[#333]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: subject.accentSoft,
                    color: subject.accent,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">
                    {slot.topic}
                  </h4>

                  <p className="text-xs text-neutral-500">
                    {subject.name} — {slot.day_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <CheckCircle2
                    size={14}
                    className="text-green-400"
                  />
                  {slot.duration_minutes}د
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:text-white"
                >
                  <Play size={12} />
                  مراجعة
                </button>
              </div>
            );
          })}

          {completed.length === 0 && (
            <EmptyState
              icon={<CheckCircle2 size={28} />}
              title="مفيش جلسات مكتملة بعد"
            />
          )}
        </div>
      </Card>
    </div>
  );
}

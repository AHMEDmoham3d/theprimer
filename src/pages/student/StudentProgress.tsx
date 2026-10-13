import { useState, useEffect } from 'react';
import { TrendingUp, Star, AlertCircle, Award, Lock, CheckCircle2, Play, Loader2, Brain, ChevronLeft } from 'lucide-react';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { CURRENT_STUDENT, PROGRESS_DATA, CURRICULUM_LESSONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { Subject } from '@/types';
import { cn } from '@/lib/utils';
import {
  fetchLessonMastery, updateLessonMastery, unlockNextLesson,
  type LessonMasteryRow,
} from '@/lib/db';

const DEMO_STUDENT_ID = 'dfb49b28-c914-4711-91b6-12016f1e34a5';

export function StudentProgress() {
  const [mastery, setMastery] = useState<LessonMasteryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLessonMastery(DEMO_STUDENT_ID).then((m) => {
      setMastery(m);
      setLoading(false);
    });
  }, []);

  const completeLesson = async (lesson: LessonMasteryRow) => {
    if (lesson.mastery >= 100 && lesson.exam_passed) return;
    setUpdatingId(lesson.id);
    const newMastery = 100;
    const newScore = 85;
    const passed = newScore >= 70;
    const ok = await updateLessonMastery(lesson.id, {
      mastery: newMastery,
      exam_score: newScore,
      exam_passed: passed,
    });
    if (ok && passed) {
      await unlockNextLesson(DEMO_STUDENT_ID, lesson.subject, lesson.lesson_order);
      const refreshed = await fetchLessonMastery(DEMO_STUDENT_ID);
      setMastery(refreshed);
    } else {
      setMastery((prev) => prev.map((m) => m.id === lesson.id ? { ...m, mastery: newMastery, exam_score: newScore, exam_passed: passed } : m));
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  const subjectMastery = mastery.filter((m) => m.subject === selectedSubject);
  const activeMeta = SUBJECT_META[selectedSubject];
  const ActiveIcon = activeMeta.icon;

  const completedCount = subjectMastery.filter((m) => m.mastery >= 100 && m.exam_passed).length;
  const totalCount = subjectMastery.length;
  const subjectPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall */}
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">تقدمك العام</h2>
            <p className="text-sm text-neutral-400 mt-1">{CURRENT_STUDENT.name} — {CURRENT_STUDENT.grade}</p>
          </div>
          <div className="text-left">
            <p className="text-4xl font-bold text-white">{Math.round(PROGRESS_DATA.reduce((a, p) => a + p.mastery, 0) / PROGRESS_DATA.length)}%</p>
            <p className="text-xs text-green-400 mt-1">+12% هذا الشهر</p>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar value={72} showLabel />
        </div>
      </Card>

      {/* Subject breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PROGRESS_DATA.map((p) => {
          const meta = SUBJECT_META[p.subject];
          const Icon = meta.icon;
          const subjLessons = mastery.filter((m) => m.subject === p.subject);
          const subjCompleted = subjLessons.filter((m) => m.mastery >= 100 && m.exam_passed).length;
          const subjTotal = subjLessons.length;
          return (
            <Card key={p.subject}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{meta.labelAr}</h3>
                  <p className="text-xs text-neutral-500">{p.questionsAnswered} سؤال — {p.sessionsCompleted} جلسة</p>
                </div>
                <span className="text-2xl font-bold text-white">{p.mastery}%</span>
              </div>
              <ProgressBar value={p.mastery} color={meta.accent} className="mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-medium text-green-400">
                    <Star size={12} /> نقاط القوة
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.strengths.map((s) => (
                      <Badge key={s} variant="success" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-400">
                    <AlertCircle size={12} /> يحتاج تركيز
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.weaknesses.map((w) => (
                      <Badge key={w} variant="warning" className="text-[10px]">{w}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-[#0f0f0f] px-3 py-2">
                <span className="text-[10px] text-neutral-500">دروس مكتملة</span>
                <span className="text-xs font-bold text-white">{subjCompleted}/{subjTotal}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Lesson Progression — the key feature */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white">مسار الدروس</h3>
          </div>
          <span className="text-xs text-neutral-400">
            لازم تكمّل الدرس الحالي 100% وتمتحن كويس علشان يفتح اللي بعده
          </span>
        </div>

        {/* Subject tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {CURRICULUM_LESSONS.map((lp) => {
            const meta = SUBJECT_META[lp.subject];
            const isActive = selectedSubject === lp.subject;
            return (
              <button
                key={lp.subject}
                onClick={() => setSelectedSubject(lp.subject)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition',
                  isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                )}
                style={isActive ? { background: meta.accent + '15', color: meta.accent, border: `1px solid ${meta.accent}30` } : { border: '1px solid #2a2a2a' }}
              >
                <meta.icon size={14} />
                {meta.labelAr}
              </button>
            );
          })}
        </div>

        {/* Subject progress bar */}
        <div className="mb-5 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: activeMeta.accent + '20', color: activeMeta.accent }}>
              <ActiveIcon size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{activeMeta.labelAr}</p>
              <p className="text-xs text-neutral-500">{completedCount} من {totalCount} دروس مكتملة</p>
            </div>
            <span className="text-2xl font-bold" style={{ color: activeMeta.accent }}>{subjectPct}%</span>
          </div>
          <ProgressBar value={subjectPct} color={activeMeta.accent} />
        </div>

        {/* Lesson path — vertical with locks */}
        <div className="space-y-2">
          {subjectMastery.map((lesson, i) => {
            const isComplete = lesson.mastery >= 100 && lesson.exam_passed;
            const isLocked = !lesson.unlocked;
            const isInProgress = lesson.unlocked && !isComplete;
            const isNext = isInProgress && subjectMastery.findIndex((m) => m.unlocked && !(m.mastery >= 100 && m.exam_passed)) === i;
            const prevComplete = i === 0 || (subjectMastery[i - 1].mastery >= 100 && subjectMastery[i - 1].exam_passed);

            return (
              <div
                key={lesson.id}
                className={cn(
                  'relative rounded-xl border p-4 transition',
                  isLocked && 'border-[#222] bg-[#0a0a0a] opacity-70',
                  isComplete && 'border-emerald-500/20 bg-emerald-500/5',
                  isInProgress && 'border-[#2a2a2a] bg-[#141414] hover:border-[#444]',
                )}
              >
                {/* Connector line */}
                {i < subjectMastery.length - 1 && (
                  <div className={cn(
                    'absolute bottom-0 left-1/2 translate-y-full h-2 w-0.5 -translate-x-1/2',
                    isComplete ? 'bg-emerald-500/40' : 'bg-[#2a2a2a]'
                  )} />
                )}

                <div className="flex items-center gap-4">
                  {/* Status icon */}
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    isComplete && 'bg-emerald-500/15 text-emerald-400',
                    isLocked && 'bg-neutral-800/50 text-neutral-600',
                    isInProgress && 'text-white',
                  )} style={isInProgress ? { background: activeMeta.accent + '20', color: activeMeta.accent } : undefined}>
                    {isLocked ? (
                      <Lock size={18} />
                    ) : isComplete ? (
                      <CheckCircle2 size={18} />
                    ) : updatingId === lesson.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-medium', isLocked ? 'text-neutral-600' : 'text-white')}>
                        {lesson.lesson_title}
                      </p>
                      {isComplete && (
                        <Badge variant="success" className="text-[9px] shrink-0">
                          <CheckCircle2 size={10} /> مكتمل
                        </Badge>
                      )}
                      {isNext && (
                        <Badge variant="info" className="text-[9px] shrink-0">الدرس الحالي</Badge>
                      )}
                      {isLocked && (
                        <Badge variant="neutral" className="text-[9px] shrink-0">
                          <Lock size={10} /> مقفل
                        </Badge>
                      )}
                    </div>

                    {/* Mastery bar */}
                    {!isLocked && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 max-w-xs">
                          <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${lesson.mastery}%`, background: isComplete ? '#10b981' : activeMeta.accent }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500">{lesson.mastery}%</span>
                        {lesson.exam_score !== null && (
                          <span className={cn('text-[10px]', lesson.exam_passed ? 'text-emerald-400' : 'text-red-400')}>
                            امتحان: {lesson.exam_score}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Lock explanation */}
                    {isLocked && (
                      <p className="text-[10px] text-neutral-600 mt-1">
                        يفتح لما تكمّل الدرس اللي قبله بنجاح 100% وتمتحن كويس
                      </p>
                    )}
                  </div>

                  {/* Action button */}
                  {isNext && !isComplete && (
                    <button
                      onClick={() => completeLesson(lesson)}
                      disabled={updatingId === lesson.id}
                      className="btn-primary text-xs whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      {updatingId === lesson.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      ادرس وامتحن
                    </button>
                  )}
                  {isComplete && (
                    <button className="btn-secondary text-xs whitespace-nowrap shrink-0">
                      <Play size={12} /> مراجعة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {subjectMastery.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">جاري تحميل الدروس...</p>
          )}
        </div>

        {/* Rule explanation */}
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-300">قواعد التقدم في الدروس</p>
              <ul className="text-[10px] text-neutral-400 space-y-1 leading-relaxed">
                <li>1. لازم تكمّل الدرس الحالي بنسبة 100%</li>
                <li>2. لازم تمتحن في الدرس وتجيب 70% أو أكتر</li>
                <li>3. لما تكمّل الاتنين، الدرس اللي بعده بيفتح تلقائياً</li>
                <li>4. تقدر تراجع أي درس اتعلمت قبل كده في أي وقت</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent topics */}
      <Card>
        <h3 className="mb-4 font-bold text-white">مواضيع درستها مؤخراً</h3>
        <div className="space-y-2">
          {PROGRESS_DATA.flatMap((p) => p.recentTopics.map((t, i) => ({ topic: t, subject: p.subject, mastery: p.mastery + i * 3 })))
            .slice(0, 6)
            .map((item, i) => {
              const meta = SUBJECT_META[item.subject];
              return (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-[#141414] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={16} />
                  </div>
                  <span className="flex-1 text-sm text-white">{item.topic}</span>
                  <div className="w-32">
                    <ProgressBar value={item.mastery} color={meta.accent} />
                  </div>
                  <span className="text-xs text-neutral-400">{item.mastery}%</span>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Skill discovery preview */}
      <Card className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-[#141414]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <Award size={22} />
          </div>
          <div>
            <h3 className="font-bold text-white">اكتشاف المهارة</h3>
            <p className="text-sm text-neutral-300 mt-1">
              بعد 3 شهور من البيانات، النظام هيولّدلك تقرير بيقولك إيه مهارتك الطبيعية وكورس صيفي مخصص.
            </p>
            <Badge variant="info" className="mt-3">هيكون جاهز في آخر الترم</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

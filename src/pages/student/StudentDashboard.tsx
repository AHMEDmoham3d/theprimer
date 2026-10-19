import { useState, useEffect } from 'react';
import { Flame, Target, Clock, TrendingUp, MessageSquare, Calendar, Video, Sparkles, ChevronLeft, CheckCircle2, Circle, Brain, Send, Loader2, Sun, GraduationCap, Lock, CreditCard, X } from 'lucide-react';
import { Card, StatCard, Badge, ProgressBar, Avatar } from '@/components/ui';
import { NOTIFICATIONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import { CurriculumSelector } from '@/components/CurriculumSelector';
import type { StudentPageProps } from './types';
import { cn } from '@/lib/utils';
import {
  fetchStudentById, fetchStudentProgress, fetchStudentSchedule,
  updateScheduleSlotStatus, fetchStudentRecommendations,
  fetchSubscriptionSettings,
  isTrialExpired, getTrialDaysLeft,
  type StudentRow, type StudentProgressRow, type ScheduleSlotRow,
  type SummerCourseRecommendation, type SubscriptionSettingsRow,
} from '@/lib/db';

// Fallback demo student ID only if no student has registered or logged in
const DEMO_STUDENT_ID = 'dfb49b28-c914-4711-91b6-12016f1e34a5';

export function StudentDashboard({ studentId, onNavigate }: StudentPageProps & { studentId?: string }) {
  // التقاط المعرّف الحقيقي للطالب المسجل بشكل مباشر وسريع لمنع أي تعليق في الـ Loading
  const storedStudentId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') : null;
  const activeStudentId = studentId || storedStudentId || DEMO_STUDENT_ID;

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [progress, setProgress] = useState<StudentProgressRow[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlotRow[]>([]);
  const [courses, setCourses] = useState<SummerCourseRecommendation[]>([]);
  const [subSettings, setSubSettings] = useState<SubscriptionSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingSlotId, setUpdatingSlotId] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, p, sch, c, ss] = await Promise.all([
        fetchStudentById(activeStudentId),
        fetchStudentProgress(activeStudentId),
        fetchStudentSchedule(activeStudentId),
        fetchStudentRecommendations(activeStudentId),
        fetchSubscriptionSettings(),
      ]);
      setStudent(s);
      setProgress(p);
      setSchedule(sch);
      setCourses(c.filter((r) => r.status === 'confirmed'));
      setSubSettings(ss);
      setLoading(false);
    })();
  }, [activeStudentId]);

  const toggleSlotStatus = async (slot: ScheduleSlotRow) => {
    setUpdatingSlotId(slot.id);
    const newStatus = slot.status === 'done' ? 'upcoming' : 'done';
    const ok = await updateScheduleSlotStatus(slot.id, newStatus);
    if (ok) {
      setSchedule((prev) => prev.map((s) => s.id === slot.id ? { ...s, status: newStatus } : s));
    }
    setUpdatingSlotId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  // Use real student data exclusively
  const studentData = student ?? null;
  const studentName = studentData?.name ?? 'طالب جديد';
  const studentGrade = studentData?.grade ?? 'الصف الثاني الثانوي';
  const studentSchool = studentData?.school_name ?? 'مذاكرة فردية';
  const studentAvatar = studentData?.avatar ?? 'ط';
  const streakDays = studentData?.streak_days ?? 1;
  const weeklyGoal = studentData?.weekly_goal ?? 5;
  const weeklyProgress = studentData?.weekly_progress ?? 0;
  const lastActive = studentData?.last_active ?? 'منذ قليل';

  // Use real progress from DB
  const progressData = progress.length > 0 ? progress : [];
  const totalQuestions = progressData.reduce((sum, p) => sum + p.questions_answered, 0);
  const totalSessions = progressData.reduce((sum, p) => sum + p.sessions_completed, 0);
  const avgMastery = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + p.mastery, 0) / progressData.length)
    : 0;

  // Calculate learning hours dynamically based on completed sessions (each session ~ 25 mins)
  const totalLearningHours = ((totalSessions * 25) / 60).toFixed(1);

  // Use real schedule from DB
  const scheduleData = schedule.length > 0 ? schedule : [];
  const doneSlots = scheduleData.filter((s) => s.status === 'done').length;
  const totalSlots = scheduleData.length;

  // Subscription enforcement
  const subStatus = studentData?.subscription_status ?? 'trial';
  const subEndDate = studentData?.subscription_end_date;
  const expired = isTrialExpired({ subscription_status: subStatus, subscription_end_date: subEndDate ?? null });
  const daysLeft = getTrialDaysLeft({ subscription_end_date: subEndDate ?? null });
  const trialSubjects = studentData?.trial_subjects ?? null;
  const isTrial = subStatus === 'trial' && !expired;

  if (expired) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800">
            <Lock size={28} className="text-neutral-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">انتهت فترة التجربة</h2>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            فترتك التجريبية خلصت. اشترك دلوقتي علشان تكمّل مذاكرة وتفتح كل المواد.
            النظام متاح فوراً بعد الاشتراك.
          </p>
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <CreditCard size={18} />
            اشترك الآن
          </button>
          <p className="text-[10px] text-neutral-600 mt-4">
            {subSettings?.renewal_mode === 'auto'
              ? 'النظام في وضع التجديد التلقائي'
              : 'تواصل مع المدير للتفعيل'}
          </p>
        </Card>
      </div>
    );
  }

  const confirmedCourses = courses.flatMap((r) => r.courses.map((c) => ({ ...c, recId: r.id, studentName: r.student_name })));

  return (
    <div className="space-y-6">
      {/* Trial banner */}
      {isTrial && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-[#141414]">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                فترة تجريبية — باقي {daysLeft} يوم
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                المواد المتاحة: {trialSubjects
                  ? trialSubjects.map((s) => SUBJECT_META[s as keyof typeof SUBJECT_META]?.labelAr).filter(Boolean).join('، ')
                  : 'كل المواد'}
              </p>
            </div>
            <button onClick={() => onNavigate('progress')} className="btn-secondary text-xs hidden sm:flex">
              اشترك الآن
            </button>
          </div>
        </Card>
      )}

      {/* Greeting */}
      <Card className="border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-4">
          <Avatar initials={studentAvatar} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-white">أهلاً، {studentName}</h2>
            <p className="text-sm text-neutral-400 mt-1">{studentGrade} — {studentSchool}</p>
          </div>
          <div className="mr-auto flex flex-col items-end gap-2">
            <Badge variant="warning">
              <Flame size={12} /> {streakDays} يوم متتالي
            </Badge>
            <span className="text-xs text-neutral-500">{lastActive}</span>
          </div>
        </div>
      </Card>

      {/* Curriculum Selector Integration */}
      <CurriculumSelector
        studentId={activeStudentId}
        currentCurriculumId={studentData?.curriculum_id}
        onCurriculumUpdated={(updatedName) => {
          console.log('تم تحديث المنهج إلى:', updatedName);
        }}
      />

      {/* Stats - Real data */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="الهدف الأسبوعي" value={`${weeklyProgress}/${weeklyGoal}`} icon={<Target size={20} />} change={`متبقي ${Math.max(0, weeklyGoal - weeklyProgress)} جلسات`} trend="up" />
        <StatCard label="أيام الموالاة" value={streakDays} icon={<Flame size={20} />} change="استمرار متواصل" trend="up" />
        <StatCard label="جلسات مكتملة" value={totalSessions} icon={<Clock size={20} />} change={`${totalLearningHours} ساعة تعلم`} trend="up" />
        <StatCard label="معدل التقدم" value={`${avgMastery}%`} icon={<TrendingUp size={20} />} change="تحسن مستمر" trend="up" />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card hover onClick={() => onNavigate('chat')} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-white">مدرّسي الشخصي</h3>
            <p className="text-xs text-neutral-400">اكتب أو اسأل بصوتك</p>
          </div>
          <ChevronLeft size={20} className="mr-auto text-neutral-500" />
        </Card>
        <Card hover onClick={() => onNavigate('sessions')} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white">
            <Video size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-white">ابدأ جلسة</h3>
            <p className="text-xs text-neutral-400">جلسة تفاعلية كاملة</p>
          </div>
          <ChevronLeft size={20} className="mr-auto text-neutral-500" />
        </Card>
        <Card hover onClick={() => onNavigate('progress')} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white">
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-white">شوف تقدمك</h3>
            <p className="text-xs text-neutral-400">تحليل أدائك</p>
          </div>
          <ChevronLeft size={20} className="mr-auto text-neutral-500" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upcoming sessions from schedule or real slots */}
        <Card className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white">الجلسات والدروس القادمة</h3>
            <button onClick={() => onNavigate('sessions')} className="text-xs text-neutral-400 hover:text-white">عرض الكل</button>
          </div>
          <div className="space-y-3">
            {scheduleData.filter((s) => s.status === 'upcoming').slice(0, 4).map((slot) => {
              const meta = SUBJECT_META[slot.subject as keyof typeof SUBJECT_META] ?? SUBJECT_META.math;
              const Icon = meta.icon;
              return (
                <div key={slot.id} className="flex items-center gap-4 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 hover:border-[#444] transition">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{slot.topic}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{meta.labelAr} — {slot.duration_minutes} دقيقة</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-neutral-300">{slot.day_name}</p>
                    <p className="text-xs text-neutral-500">{slot.scheduled_time}</p>
                  </div>
                  <Badge variant="info">مجدولة</Badge>
                </div>
              );
            })}
            {scheduleData.filter((s) => s.status === 'upcoming').length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-500">مفيش جلسات مجدولة حالياً</p>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="mb-4 font-bold text-white">الإشعارات</h3>
          <div className="space-y-3">
            {NOTIFICATIONS.filter((n) => n.forRole === 'student').map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl bg-[#141414] p-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full ${n.read ? 'bg-neutral-600' : 'bg-white'}`} />
                <div>
                  <p className="text-xs font-semibold text-white">{n.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-neutral-600 mt-1">{n.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Progress overview — real data from DB */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">تقدمك في المواد</h3>
          <button onClick={() => onNavigate('progress')} className="text-xs text-neutral-400 hover:text-white">تفاصيل أكثر</button>
        </div>
        {progressData.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {progressData.map((p) => {
              const meta = SUBJECT_META[p.subject as keyof typeof SUBJECT_META] ?? SUBJECT_META.math;
              const Icon = meta.icon;
              return (
                <div key={p.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{meta.labelAr}</h4>
                      <p className="text-xs text-neutral-500">{p.questions_answered} سؤال — {p.sessions_completed} جلسة</p>
                    </div>
                    <span className="mr-auto text-2xl font-bold text-white">{p.mastery}%</span>
                  </div>
                  <ProgressBar value={p.mastery} color={meta.accent} />
                  {p.weaknesses && p.weaknesses.length > 0 && (
                    <p className="text-[10px] text-neutral-500 mt-2 flex items-center gap-1">
                      <Target size={10} className="text-amber-400" />
                      محتاج شغل على: {p.weaknesses.join('، ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-500">جاري تحميل بيانات التقدم...</p>
        )}
      </Card>

      {/* Auto-generated study schedule — real data from DB, toggleable */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white">جدول مذاكرتك هذا الأسبوع</h3>
          </div>
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-400" />
            جدول تلقائي — النظام عمله علشانك
          </span>
        </div>
        <p className="text-xs text-neutral-500 mb-4">
          النظام بيبني الجدول ده تلقائياً بناء على منهجك ومستواك — مش محتاج تحدد أوقات بنفسك. بيبعتولك تذكير قبل كل جلسة، ولي ولي الأمر كمان بيوصله الجدول. اضغط على أي خانة علشان تعلمها كمكتملة.
        </p>
        {scheduleData.length > 0 ? (
          <div className="space-y-2">
            {scheduleData.map((slot) => {
              const meta = SUBJECT_META[slot.subject as keyof typeof SUBJECT_META] ?? SUBJECT_META.math;
              const Icon = meta.icon;
              const typeLabels: Record<string, string> = { review: 'مراجعة', new: 'درس جديد', practice: 'تدريب', 'exam-prep': 'استعداد امتحان' };
              const typeColors: Record<string, string> = { review: 'bg-blue-500/10 text-blue-400', new: 'bg-emerald-500/10 text-emerald-400', practice: 'bg-amber-500/10 text-amber-400', 'exam-prep': 'bg-red-500/10 text-red-400' };
              return (
                <button
                  key={slot.id}
                  onClick={() => toggleSlotStatus(slot)}
                  disabled={updatingSlotId === slot.id}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 transition text-right',
                    slot.status === 'done' ? 'border-[#2a2a2a] bg-[#0f0f0f] opacity-60' : 'border-[#2a2a2a] bg-[#141414] hover:border-[#444]'
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5 w-14 shrink-0">
                    <span className="text-xs font-bold text-white">{slot.day_name}</span>
                    <span className="text-[10px] text-neutral-500">{slot.scheduled_time}</span>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: meta.accentSoft + '20', color: meta.accent }}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', slot.status === 'done' ? 'text-neutral-500 line-through' : 'text-white')}>{slot.topic}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded', typeColors[slot.slot_type])}>{typeLabels[slot.slot_type] ?? slot.slot_type}</span>
                      <span className="text-[10px] text-neutral-500">{slot.duration_minutes} دقيقة</span>
                    </div>
                  </div>
                  {updatingSlotId === slot.id ? (
                    <Loader2 size={18} className="text-neutral-500 shrink-0 animate-spin" />
                  ) : slot.status === 'done' ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-neutral-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-500">جاري تحميل الجدول...</p>
        )}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#0f0f0f] p-3">
          <div className="flex items-center gap-2">
            <Send size={14} className="text-emerald-400" />
            <span className="text-xs text-neutral-400">الجدول بيتبعت لولي الأمر كمان على واتساب</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">
            {doneSlots}/{totalSlots} مكتمل
          </span>
        </div>
      </Card>

      {/* Summer courses — confirmed by admin, shown to student */}
      {confirmedCourses.length > 0 && (
        <Card className="border-amber-500/20 bg-gradient-to-br from-[#1a1a1a] to-[#141414]">
          <div className="mb-4 flex items-center gap-2">
            <Sun size={18} className="text-amber-400" />
            <h3 className="font-bold text-white">كورسات الصيف — مخصصة ليك</h3>
            <Badge variant="warning">جديد</Badge>
          </div>
          <div className="space-y-3">
            {confirmedCourses.map((course, i) => (
              <div key={i} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-amber-400" />
                    <h4 className="text-sm font-bold text-white">{course.title}</h4>
                  </div>
                  <Badge variant="neutral">{course.duration}</Badge>
                </div>
                <p className="text-xs text-neutral-400 mb-2">{course.description}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
                  <Sparkles size={12} className="text-emerald-400 shrink-0" />
                  <p className="text-xs text-neutral-500">{course.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI proactive message */}
      {showSuggestion && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 md:static md:inset-auto md:p-0 md:z-auto">
          <Card className="border-emerald-500/40 bg-gradient-to-br from-[#0f1f1a] to-[#141414] shadow-2xl shadow-emerald-500/10 md:border-white/20 md:shadow-none md:from-[#1a1a1a]">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-black animate-float-avatar md:h-12 md:w-12 md:bg-white">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-200 md:text-neutral-300">
                  <span className="font-semibold text-white">رسالة من مدرّسك:</span> يا {studentName.split(' ')[0]}،
                  {progressData.length > 0 && progressData[0]?.weaknesses?.length > 0
                    ? ` لاحظت إنك بتتعسر في ${progressData[0].weaknesses[0]} — عايز جلسة 25 دقيقة نخلّص الموضوع ده؟`
                    : ' لاحظت إنك بتسأل كتير في المناهج والأيام دي — عايز سيشن 25 دقيقة نخلّص الموضوع ده؟'}
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => onNavigate('chat')} className="btn-primary text-xs">أيوة، خليني أبدأ</button>
                  <button onClick={() => setShowSuggestion(false)} className="btn-secondary text-xs">مش دلوقتي</button>
                </div>
              </div>
              <button onClick={() => setShowSuggestion(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition md:hidden">
                <X size={18} />
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
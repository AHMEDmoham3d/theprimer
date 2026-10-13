import { Users, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, ArrowLeft } from 'lucide-react';
import { Card, StatCard, Badge, ProgressBar, Avatar } from '@/components/ui';
import { STUDENTS, SESSIONS, TEACHERS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { TeacherPageProps } from './types';

export function TeacherDashboard({ onNavigate }: TeacherPageProps) {
  const teacher = TEACHERS[0];
  const myStudents = STUDENTS.filter((s) => s.schoolId === teacher.schoolId);
  const understood = myStudents.slice(0, 4);
  const struggling = myStudents.slice(4, 7);
  const topQuestions = ['المعادلات التفاضلية', 'حساب التفاضل', 'الكسور المتشابكة', 'قوانين نيوتن'];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-4">
          <Avatar initials={teacher.avatar} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-white">{teacher.name}</h2>
            <p className="text-sm text-neutral-400 mt-1">{teacher.schoolName} — {SUBJECT_META[teacher.subject].labelAr}</p>
          </div>
          <Badge variant="info" className="mr-auto">{myStudents.length} طالب</Badge>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="طلاب فاهمين" value={understood.length} icon={<CheckCircle2 size={20} />} change="دخلوا الحصة مستعدين" trend="up" />
        <StatCard label="طلاب متعثرين" value={struggling.length} icon={<AlertTriangle size={20} />} change="محتاجين تركيز" trend="down" />
        <StatCard label="جلسات هذا الأسبوع" value="14" icon={<TrendingUp size={20} />} change="+4 عن الأسبوع الماضي" trend="up" />
        <StatCard label="أسئلة مكررة" value="23" icon={<Lightbulb size={20} />} change="النظام رد عليها تلقائياً" trend="up" />
      </div>

      {/* Weekly insights — the key teacher feature */}
      <Card className="md:col-span-2 border-white/10 bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb size={18} className="text-white" />
          <h3 className="font-bold text-white">رؤى هذا الأسبوع — الداشبورد الذكي</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs font-medium text-green-400 mb-2">فهموا المفهوم — مفيش حاجة تضيع وقتك فيهم</p>
            <div className="flex flex-wrap gap-2">
              {understood.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-1">
                  <Avatar initials={s.avatar} size="sm" className="!w-6 !h-6 !text-[10px]" />
                  <span className="text-xs text-green-300">{s.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs font-medium text-amber-400 mb-2">لسه متعثرين — ركّز وقتك هنا</p>
            <div className="flex flex-wrap gap-2">
              {struggling.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2 py-1">
                  <Avatar initials={s.avatar} size="sm" className="!w-6 !h-6 !text-[10px]" />
                  <span className="text-xs text-amber-300">{s.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top questions */}
        <Card>
          <h3 className="mb-4 font-bold text-white">أكثر الأسئلة تكراراً هذا الأسبوع</h3>
          <div className="space-y-3">
            {topQuestions.map((q, i) => (
              <div key={q} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-xs font-bold text-white">{i + 1}</span>
                <span className="flex-1 text-sm text-white">{q}</span>
                <Badge variant="neutral">{Math.floor(Math.random() * 15) + 5} مرة</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's schedule */}
        <Card>
          <h3 className="mb-4 font-bold text-white">جدول اليوم</h3>
          <div className="space-y-3">
            {SESSIONS.filter((s) => s.status !== 'cancelled').slice(0, 5).map((s) => {
              const meta = SUBJECT_META[s.subject];
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-lg bg-[#141414] p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{s.studentName}</p>
                    <p className="text-xs text-neutral-500">{s.topic}</p>
                  </div>
                  <Badge variant={s.status === 'live' ? 'error' : s.status === 'completed' ? 'success' : 'info'}>
                    {s.status === 'live' ? 'مباشر' : s.status === 'completed' ? 'مكتملة' : 'مجدولة'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* CTA */}
      <Card hover onClick={() => onNavigate('insights')} className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
          <Lightbulb size={22} />
        </div>
        <div>
          <h3 className="font-semibold text-white">شوف الرؤى التعليمية الكاملة</h3>
          <p className="text-xs text-neutral-400">تحليل عميق لأداء كل طالب واقتراحات للحصة</p>
        </div>
        <ArrowLeft size={20} className="mr-auto text-neutral-500" />
      </Card>
    </div>
  );
}

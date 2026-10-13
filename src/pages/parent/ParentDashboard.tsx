import { TrendingUp, Clock, Calendar, FileText, Wallet, Sparkles, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Card, StatCard, Badge, Avatar, ProgressBar } from '@/components/ui';
import { CURRENT_STUDENT, SESSIONS, PROGRESS_DATA, PROGRESS_REPORTS, NOTIFICATIONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { ParentPageProps } from './types';

export function ParentDashboard({ onNavigate }: ParentPageProps) {
  const child = CURRENT_STUDENT;
  const upcomingSessions = SESSIONS.filter((s) => s.studentId === child.id && s.status === 'scheduled');
  const completedSessions = SESSIONS.filter((s) => s.studentId === child.id && s.status === 'completed');
  const report = PROGRESS_REPORTS.find((r) => r.studentId === child.id);
  const parentNotifs = NOTIFICATIONS.filter((n) => n.forRole === 'parent');

  return (
    <div className="space-y-6">
      {/* Child overview */}
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-4">
          <Avatar initials={child.avatar} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-white">{child.name}</h2>
            <p className="text-sm text-neutral-400 mt-1">{child.grade} — {child.schoolName}</p>
          </div>
          <div className="mr-auto flex flex-col items-end gap-2">
            <Badge variant={child.subscriptionStatus === 'active' ? 'success' : 'warning'}>
              {child.subscriptionStatus === 'active' ? 'مشترك' : 'فترة تجريبية'}
            </Badge>
            <span className="text-xs text-neutral-500">آخر نشاط: {child.lastActive}</span>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="جلسات مكتملة" value={completedSessions.length} icon={<CheckCircle2 size={20} />} change="هذا الشهر" trend="up" />
        <StatCard label="ساعات التعلم" value="18.5س" icon={<Clock size={20} />} change="وقت فعلي" trend="up" />
        <StatCard label="نسبة الحضور" value="92%" icon={<TrendingUp size={20} />} change="+5% عن الشهر الماضي" trend="up" />
        <StatCard label="أيام متتالية" value={child.streakDays} icon={<Sparkles size={20} />} change="مذاكرة منتظمة" trend="up" />
      </div>

      {/* Progress summary */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">تقدم {child.name.split(' ')[0]} في المواد</h3>
          <button onClick={() => onNavigate('reports')} className="text-xs text-neutral-400 hover:text-white">التقارير الكاملة</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROGRESS_DATA.map((p) => {
            const meta = SUBJECT_META[p.subject];
            return (
              <div key={p.subject} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{meta.labelAr}</h4>
                    <p className="text-xs text-neutral-500">{p.sessionsCompleted} جلسة</p>
                  </div>
                  <span className="text-xl font-bold text-white">{p.mastery}%</span>
                </div>
                <ProgressBar value={p.mastery} color={meta.accent} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming sessions */}
        <Card>
          <h3 className="mb-4 font-bold text-white">الجلسات القادمة</h3>
          <div className="space-y-3">
            {upcomingSessions.map((s) => {
              const meta = SUBJECT_META[s.subject];
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-[#141414] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{s.topic}</p>
                    <p className="text-xs text-neutral-500">{meta.labelAr} — {s.duration}د</p>
                  </div>
                  <div className="text-left text-xs text-neutral-400">
                    {new Date(s.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              );
            })}
            {upcomingSessions.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">مفيش جلسات مجدولة</p>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h3 className="mb-4 font-bold text-white">إشعارات عن ابنك</h3>
          <div className="space-y-3">
            {parentNotifs.map((n) => (
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

      {/* Skill discovery report preview */}
      {report && (
        <Card className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-[#141414]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
              <Sparkles size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">تقرير اكتشاف المهارة — {report.term}</h3>
              <p className="text-sm text-neutral-300 mt-1">
                لاحظنا إن {child.name.split(' ')[0]} عنده <span className="font-semibold text-white">{report.naturalIntuitionAreas.join(' و')}</span>.
                المهارة المقترحة: <span className="font-semibold text-white">{report.suggestedSkill}</span>.
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => onNavigate('reports')} className="btn-primary text-xs">شوف التقرير الكامل</button>
                <button onClick={() => onNavigate('billing')} className="btn-secondary text-xs">كورس الصيف</button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Billing CTA */}
      <Card hover onClick={() => onNavigate('billing')} className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white">
          <Wallet size={22} />
        </div>
        <div>
          <h3 className="font-semibold text-white">إدارة الاشتراك</h3>
          <p className="text-xs text-neutral-400">500 جنيه شهرياً — التجديد القادم بعد 12 يوم</p>
        </div>
        <ChevronLeft size={20} className="mr-auto text-neutral-500" />
      </Card>
    </div>
  );
}

import { TrendingUp, Users, Clock, Zap, BarChart3, Activity } from 'lucide-react';
import { Card, StatCard, Badge, ProgressBar } from '@/components/ui';
import { STUDENTS, SESSIONS, ACTIVITY_FEED, REVENUE_DATA, PROGRESS_DATA } from '@/data/mockData';
import { SUBJECT_META, ALL_SUBJECTS } from '@/data/subjects';
import { formatNumber } from '@/lib/utils';
import type { AdminPageProps } from './types';

export function AdminAnalytics({ onNavigate }: AdminPageProps) {
  const totalQuestions = PROGRESS_DATA.reduce((a, p) => a + p.questionsAnswered, 0);
  const totalSessions = PROGRESS_DATA.reduce((a, p) => a + p.sessionsCompleted, 0);
  const cacheHitRate = 78;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">التحليلات المتقدمة</h2>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="إجمالي الأسئلة" value={formatNumber(totalQuestions)} icon={<Zap size={20} />} change="+18% هذا الشهر" trend="up" />
        <StatCard label="إجمالي الجلسات" value={totalSessions} icon={<Clock size={20} />} change="+12 جلسة هذا الأسبوع" trend="up" />
        <StatCard label="معدل Cache Hit" value={`${cacheHitRate}%`} icon={<Activity size={20} />} change="توفير 67% من تكلفة API" trend="up" />
        <StatCard label="متوسط وقت الرد" value="1.2ث" icon={<Zap size={20} />} change="-0.3ث عن الشهر الماضي" trend="up" />
      </div>

      {/* Subject distribution */}
      <Card>
        <h3 className="mb-4 font-bold text-white">توزيع الاستخدام حسب المادة</h3>
        <div className="space-y-3">
          {ALL_SUBJECTS.map((subject) => {
            const meta = SUBJECT_META[subject];
            const progress = PROGRESS_DATA.find((p) => p.subject === subject);
            const count = progress?.questionsAnswered ?? Math.floor(Math.random() * 30) + 5;
            const maxCount = Math.max(...PROGRESS_DATA.map((p) => p.questionsAnswered), 142);
            return (
              <div key={subject} className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <meta.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white">{meta.labelAr}</span>
                    <span className="text-neutral-400">{count} سؤال</span>
                  </div>
                  <ProgressBar value={(count / maxCount) * 100} color={meta.accent} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Growth chart */}
      <Card>
        <h3 className="mb-4 font-bold text-white">نمو الطلاب والإيرادات</h3>
        <GrowthChart />
      </Card>

      {/* Performance metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-bold text-white">مؤشرات الأداء</h3>
          <div className="space-y-4">
            {[
              { label: 'نسبة إتمام الجلسات', value: 82, target: 80, unit: '%' },
              { label: 'نسبة فتح التقارير', value: 68, target: 60, unit: '%' },
              { label: 'نسبة التجديد', value: 91, target: 85, unit: '%' },
              { label: 'رضا الأهالي', value: 94, target: 90, unit: '%' },
              { label: 'Cache Hit Rate', value: 78, target: 75, unit: '%' },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-300">{m.label}</span>
                  <span className={m.value >= m.target ? 'text-green-400' : 'text-amber-400'}>{m.value}{m.unit} / الهدف {m.target}{m.unit}</span>
                </div>
                <ProgressBar value={m.value} color={m.value >= m.target ? '#16a34a' : '#b45309'} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-white">الاستخدام اليومي</h3>
          <UsageBars />
        </Card>
      </div>

      {/* Activity by type */}
      <Card>
        <h3 className="mb-4 font-bold text-white">النشاط حسب النوع</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: 'أسئلة نصية', value: 142, color: '#2563eb' },
            { label: 'رسائل صوتية', value: 48, color: '#16a34a' },
            { label: 'جلسات كاملة', value: 24, color: '#7c3aed' },
            { label: 'تقارير مولّدة', value: 12, color: '#b45309' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-neutral-400">{item.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <Badge variant="success" className="mt-2">+12%</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GrowthChart() {
  const months = REVENUE_DATA.map((r) => r.month);
  const students = [50, 120, 200, 350, 500];
  const maxStudents = 500;

  return (
    <div className="flex items-end justify-between gap-3 h-48 pt-4">
      {months.map((month, i) => (
        <div key={month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-col items-center justify-end" style={{ height: '160px' }}>
            <div
              className="w-full max-w-[60px] rounded-t-lg bg-white transition-all hover:bg-neutral-200"
              style={{ height: `${(students[i] / maxStudents) * 100}%` }}
              title={`${students[i]} طالب`}
            />
          </div>
          <span className="text-[10px] text-neutral-500">{month}</span>
          <span className="text-[10px] font-medium text-white">{students[i]}</span>
        </div>
      ))}
    </div>
  );
}

function UsageBars() {
  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const usage = [85, 92, 78, 88, 95, 72, 45];
  return (
    <div className="flex items-end justify-between gap-3 h-40 pt-4">
      {days.map((day, i) => (
        <div key={day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-col items-center justify-end" style={{ height: '130px' }}>
            <div
              className="w-full max-w-[40px] rounded-t-lg bg-neutral-700 hover:bg-white transition-all"
              style={{ height: `${usage[i]}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-500">{day}</span>
        </div>
      ))}
    </div>
  );
}

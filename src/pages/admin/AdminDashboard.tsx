import { Users, School, GraduationCap, Wallet, TrendingUp, Activity, DollarSign, UserCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { Card, StatCard, Badge, Avatar, ProgressBar } from '@/components/ui';
import { STUDENTS, SCHOOLS, TEACHERS, REVENUE_DATA, ACTIVITY_FEED, SESSIONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { AdminPageProps } from './types';

export function AdminDashboard({ onNavigate }: AdminPageProps) {
  const totalRevenue = REVENUE_DATA.reduce((a, r) => a + r.primer + r.liveOS, 0);
  const totalProfit = REVENUE_DATA.reduce((a, r) => a + r.profit, 0);
  const activeStudents = STUDENTS.filter((s) => s.subscriptionStatus === 'active').length;
  const trialStudents = STUDENTS.filter((s) => s.subscriptionStatus === 'trial').length;
  const liveSession = SESSIONS.find((s) => s.status === 'live');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">لوحة تحكم المدير</h2>
            <p className="text-sm text-neutral-400 mt-1">نظرة شاملة على The Primer — سبتمبر 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {liveSession && (
              <Badge variant="error" className="animate-pulse-glow">
                <span className="h-2 w-2 rounded-full bg-red-500" /> جلسة مباشرة الآن
              </Badge>
            )}
            <Badge variant="success">النظام يعمل</Badge>
          </div>
        </div>
      </Card>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="إجمالي الإيرادات" value={formatCurrency(totalRevenue)} icon={<DollarSign size={20} />} change={`+${formatCurrency(REVENUE_DATA[4].primer - REVENUE_DATA[3].primer)} هذا الشهر`} trend="up" />
        <StatCard label="صافي الربح" value={formatCurrency(totalProfit)} icon={<Wallet size={20} />} change="هامش 37.8%" trend="up" />
        <StatCard label="طلاب نشطون" value={activeStudents + trialStudents} icon={<Users size={20} />} change={`${activeStudents} مشترك — ${trialStudents} تجربة`} trend="up" />
        <StatCard label="مدارس" value={SCHOOLS.length} icon={<School size={20} />} change={`${SCHOOLS.filter((s) => s.contractStatus === 'active').length} فعالة`} trend="up" />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="مدرّسين" value={TEACHERS.length} icon={<GraduationCap size={20} />} />
        <StatCard label="جلسات اليوم" value={SESSIONS.filter((s) => s.status === 'live' || s.status === 'scheduled').length} icon={<Activity size={20} />} />
        <StatCard label="أسئلة اليوم" value="142" icon={<TrendingUp size={20} />} change="Cache hit: 78%" trend="up" />
        <StatCard label="تجديدات" value="50" icon={<UserCheck size={20} />} change="هذا الشهر" trend="up" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue chart */}
        <Card className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-white">الإيرادات الشهرية</h3>
            <Badge variant="success">+23% نمو</Badge>
          </div>
          <RevenueChart />
        </Card>

        {/* Live activity */}
        <Card>
          <h3 className="mb-4 font-bold text-white">النشاط المباشر</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {ACTIVITY_FEED.map((item) => {
              const meta = SUBJECT_META[item.subject];
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-lg bg-[#141414] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">
                      <span className="font-semibold">{item.studentName}</span> {item.action}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{item.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Schools overview */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">المدارس</h3>
          <button onClick={() => onNavigate('schools')} className="text-xs text-neutral-400 hover:text-white">إدارة المدارس</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {SCHOOLS.map((school) => (
            <div key={school.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white truncate">{school.name}</h4>
                <Badge variant={school.contractStatus === 'active' ? 'success' : school.contractStatus === 'trial' ? 'warning' : 'neutral'}>
                  {school.contractStatus === 'active' ? 'فعال' : school.contractStatus === 'trial' ? 'تجربة' : 'معلق'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mb-3">{school.location}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{school.studentsCount} طالب</span>
                <span className="text-neutral-400">{school.teachersCount} مدرّس</span>
                {school.monthlyReferralFee > 0 && (
                  <span className="text-green-400">{formatCurrency(school.monthlyReferralFee)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: 'المستخدمين', icon: Users, page: 'users' },
          { label: 'المدارس', icon: School, page: 'schools' },
          { label: 'التحليلات', icon: TrendingUp, page: 'analytics' },
          { label: 'المالية', icon: Wallet, page: 'finance' },
        ].map((link) => (
          <Card key={link.label} hover onClick={() => onNavigate(link.page)} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-white">
              <link.icon size={18} />
            </div>
            <span className="text-sm font-medium text-white">{link.label}</span>
            <ArrowLeft size={16} className="mr-auto text-neutral-500" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function RevenueChart() {
  const max = Math.max(...REVENUE_DATA.map((r) => r.primer + r.liveOS));
  return (
    <div className="flex items-end justify-between gap-3 h-48 pt-4">
      {REVENUE_DATA.map((row, i) => {
        const total = row.primer + row.liveOS;
        const heightPct = (total / max) * 100;
        const primerPct = (row.primer / total) * 100;
        const livePct = (row.liveOS / total) * 100;
        return (
          <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-col items-center justify-end" style={{ height: '160px' }}>
              <div
                className="w-full max-w-[60px] rounded-t-lg overflow-hidden flex flex-col animate-fade-in-up"
                style={{ height: `${heightPct}%` }}
              >
                <div className="bg-neutral-600" style={{ height: `${livePct}%` }} title={`Live OS: ${row.liveOS}`} />
                <div className="bg-white" style={{ height: `${primerPct}%` }} title={`Primer: ${row.primer}`} />
              </div>
            </div>
            <span className="text-[10px] text-neutral-500">{row.month}</span>
            <span className="text-[10px] font-medium text-white">{Math.round(total / 1000)}k</span>
          </div>
        );
      })}
    </div>
  );
}

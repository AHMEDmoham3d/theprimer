import { Wallet, TrendingUp, DollarSign, PiggyBank, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, StatCard, Badge, ProgressBar } from '@/components/ui';
import { REVENUE_DATA, STUDENTS, SCHOOLS } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import type { AdminPageProps } from './types';

export function AdminFinance({ onNavigate }: AdminPageProps) {
  const totalRevenue = REVENUE_DATA.reduce((a, r) => a + r.primer + r.liveOS, 0);
  const totalProfit = REVENUE_DATA.reduce((a, r) => a + r.profit, 0);
  const totalCosts = REVENUE_DATA.reduce((a, r) => a + r.costs, 0);
  const avgMargin = Math.round((totalProfit / totalRevenue) * 100);
  const activeSubscriptions = STUDENTS.filter((s) => s.subscriptionStatus === 'active').length;
  const monthlyRecurring = activeSubscriptions * 500;
  const totalReferral = SCHOOLS.reduce((a, s) => a + s.monthlyReferralFee, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">الإدارة المالية</h2>
        <button className="btn-secondary text-xs"><Download size={16} /> تصدير التقرير</button>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="إجمالي الإيرادات" value={formatCurrency(totalRevenue)} icon={<DollarSign size={20} />} change="+23% نمو شهري" trend="up" />
        <StatCard label="صافي الربح" value={formatCurrency(totalProfit)} icon={<PiggyBank size={20} />} change={`هامش ${avgMargin}%`} trend="up" />
        <StatCard label="إجمالي التكاليف" value={formatCurrency(totalCosts)} icon={<TrendingUp size={20} />} change="تنخفض بالـ scale" trend="down" />
        <StatCard label="إيراد متكرر شهري" value={formatCurrency(monthlyRecurring)} icon={<Wallet size={20} />} change={`${activeSubscriptions} مشترك`} trend="up" />
      </div>

      {/* Revenue table */}
      <Card>
        <h3 className="mb-4 font-bold text-white">الإيرادات الشهرية التفصيلية</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">
                <th className="pb-3 pr-4 font-medium">الشهر</th>
                <th className="pb-3 font-medium">The Primer</th>
                <th className="pb-3 font-medium">Live OS</th>
                <th className="pb-3 font-medium">التكاليف</th>
                <th className="pb-3 font-medium">صافي الربح</th>
                <th className="pb-3 font-medium">الهامش</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_DATA.map((row) => {
                const total = row.primer + row.liveOS;
                const margin = Math.round((row.profit / total) * 100);
                return (
                  <tr key={row.month} className="border-b border-[#1c1c1c] hover:bg-[#141414] transition">
                    <td className="py-3 pr-4 text-sm font-medium text-white">{row.month}</td>
                    <td className="text-sm text-green-400">{formatCurrency(row.primer)}</td>
                    <td className="text-sm text-neutral-300">{formatCurrency(row.liveOS)}</td>
                    <td className="text-sm text-red-400">{formatCurrency(row.costs)}</td>
                    <td className="text-sm font-bold text-white">{formatCurrency(row.profit)}</td>
                    <td><Badge variant={margin > 35 ? 'success' : 'warning'}>{margin}%</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cost breakdown & referral */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-bold text-white">توزيع التكاليف لكل طالب</h3>
          <div className="space-y-4">
            {[
              { label: 'LLM (Claude Haiku)', value: 45, amount: '~145 جنيه' },
              { label: 'Semantic Cache', value: 12, amount: '~39 جنيه' },
              { label: 'TTS (OpenAI)', value: 25, amount: '~80 جنيه' },
              { label: 'STT (Deepgram)', value: 10, amount: '~32 جنيه' },
              { label: 'Infrastructure', value: 8, amount: '~25 جنيه' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-300">{item.label}</span>
                  <span className="text-neutral-400">{item.amount}</span>
                </div>
                <ProgressBar value={item.value} color="#dc2626" />
              </div>
            ))}
            <div className="pt-3 border-t border-[#2a2a2a] flex justify-between text-sm">
              <span className="text-neutral-400">التكلفة الإجمالية للطالب</span>
              <span className="font-bold text-white">~321 جنيه/شهر</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">صافي الربح للطالب</span>
              <span className="font-bold text-green-400">~179 جنيه/شهر</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-white">عمولات المدارس</h3>
          <div className="space-y-3">
            {SCHOOLS.filter((s) => s.monthlyReferralFee > 0).map((school) => (
              <div key={school.id} className="flex items-center gap-3 rounded-xl bg-[#141414] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-white text-xs font-bold">
                  {school.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{school.name}</p>
                  <p className="text-xs text-neutral-500">{school.studentsCount} طالب × {school.referralPerStudent} جنيه</p>
                </div>
                <span className="text-sm font-bold text-green-400">{formatCurrency(school.monthlyReferralFee)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-[#2a2a2a] flex justify-between text-sm">
              <span className="text-neutral-400">إجمالي العمولات الشهرية</span>
              <span className="font-bold text-white">{formatCurrency(totalReferral)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Break-even analysis */}
      <Card className="border-white/10 bg-gradient-to-br from-[#181818] to-[#141414]">
        <h3 className="mb-4 font-bold text-white">تحليل نقطة التعادل</h3>
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
          {[
            { students: 10, revenue: '5,000', profit: '990', margin: '20%' },
            { students: 50, revenue: '25,000', profit: '8,450', margin: '34%' },
            { students: 100, revenue: '50,000', profit: '18,900', margin: '38%' },
            { students: 300, revenue: '150,000', profit: '70,700', margin: '47%' },
            { students: 500, revenue: '250,000', profit: '125,000', margin: '50%' },
          ].map((row) => (
            <div key={row.students} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 text-center">
              <p className="text-2xl font-bold text-white">{row.students}</p>
              <p className="text-[10px] text-neutral-500 mt-1">طالب</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-green-400">{row.revenue} جنيه</p>
                <p className="text-xs text-white">{row.profit} ربح</p>
                <Badge variant="success" className="text-[10px]">{row.margin}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

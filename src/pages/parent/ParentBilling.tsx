import { Wallet, CreditCard, CheckCircle2, Calendar, Sun, Download } from 'lucide-react';
import { Card, Badge, StatCard } from '@/components/ui';
import { CURRENT_STUDENT, PLAN_TIERS } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import type { ParentPageProps } from './types';

export function ParentBilling({ onNavigate }: ParentPageProps) {
  const child = CURRENT_STUDENT;
  const monthlyPlan = PLAN_TIERS.find((p) => p.id === 'monthly')!;

  const invoices = [
    { id: 'inv1', date: '1 أكتوبر 2026', amount: 500, status: 'paid', method: 'Paymob' },
    { id: 'inv2', date: '1 سبتمبر 2026', amount: 500, status: 'paid', method: 'Paymob' },
    { id: 'inv3', date: '1 أغسطس 2026', amount: 500, status: 'paid', method: 'Fawry' },
    { id: 'inv4', date: '15 يوليو 2026', amount: 500, status: 'paid', method: 'Paymob' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">إدارة الاشتراك</h2>

      {/* Current plan */}
      <Card className="border-white/20 bg-gradient-to-br from-[#1a1a1a] to-[#141414]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant="success">الخطة الحالية</Badge>
            <h3 className="text-2xl font-bold text-white mt-3">{monthlyPlan.name}</h3>
            <p className="text-sm text-neutral-400 mt-1">{formatCurrency(monthlyPlan.price)} / {monthlyPlan.period}</p>
          </div>
          <div className="text-left">
            <p className="text-xs text-neutral-500">التجديد القادم</p>
            <p className="text-lg font-bold text-white">12 أكتوبر</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-[#141414] p-3">
            <p className="text-xs text-neutral-500">الطالب</p>
            <p className="text-sm font-medium text-white mt-1">{child.name}</p>
          </div>
          <div className="rounded-xl bg-[#141414] p-3">
            <p className="text-xs text-neutral-500">المدرسة</p>
            <p className="text-sm font-medium text-white mt-1">{child.schoolName}</p>
          </div>
        </div>

        <ul className="space-y-2">
          {monthlyPlan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي المدفوع" value={formatCurrency(2000)} icon={<Wallet size={20} />} />
        <StatCard label="أشهر مشترك" value="4" icon={<Calendar size={20} />} />
        <StatCard label="التوفير من الكاش" value="0 جنيه" icon={<Sun size={20} />} change="كورس الصيف منفصل" trend="flat" />
      </div>

      {/* Payment method */}
      <Card>
        <h3 className="mb-4 font-bold text-white">طريقة الدفع</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/20 bg-[#141414] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-white" />
                <span className="text-sm font-medium text-white">Paymob</span>
              </div>
              <Badge variant="success">افتراضي</Badge>
            </div>
            <p className="text-xs text-neutral-500">**** **** **** 1234</p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-neutral-400" />
                <span className="text-sm font-medium text-white">Fawry</span>
              </div>
              <button className="text-xs text-neutral-400 hover:text-white">تفعيل</button>
            </div>
            <p className="text-xs text-neutral-500">ادفع من أي فرع فوري</p>
          </div>
        </div>
      </Card>

      {/* Summer course */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-[#141414]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">كورس الصيف — {child.name.split(' ')[0]}</h3>
            <p className="text-sm text-neutral-400 mt-1">8 أسابيع مخصصة — 300 جنيه</p>
          </div>
          <button className="btn-primary text-xs">سجّل الآن</button>
        </div>
      </Card>

      {/* Invoice history */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">سجل الفواتير</h3>
          <button className="text-xs text-neutral-400 hover:text-white">تصدير الكل</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">
                <th className="pb-3 pr-4 font-medium">التاريخ</th>
                <th className="pb-3 font-medium">المبلغ</th>
                <th className="pb-3 font-medium">طريقة الدفع</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[#1c1c1c] hover:bg-[#141414] transition">
                  <td className="py-3 pr-4 text-sm text-white">{inv.date}</td>
                  <td className="text-sm text-neutral-300">{formatCurrency(inv.amount)}</td>
                  <td className="text-xs text-neutral-400">{inv.method}</td>
                  <td><Badge variant="success">مدفوع</Badge></td>
                  <td>
                    <button className="text-neutral-400 hover:text-white transition">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

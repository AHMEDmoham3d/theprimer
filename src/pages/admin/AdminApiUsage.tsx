import { useState, useEffect } from 'react';
import { Zap, DollarSign, TrendingUp, Users, Brain, Mic, PenTool, BarChart3, Loader2, Cpu } from 'lucide-react';
import { Card, StatCard, Badge, Avatar } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import type { Subject } from '@/types';
import {
  fetchApiUsageSummary, fetchApiUsageLogs,
  type ApiUsageLogRow,
} from '@/lib/db';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { AdminPageProps } from './types';

const TYPE_META: Record<string, { label: string; icon: typeof Brain }> = {
  chat: { label: 'محادثة', icon: Brain },
  voice: { label: 'صوت', icon: Mic },
  whiteboard: { label: 'سبورة', icon: PenTool },
  exam_generation: { label: 'توليد امتحان', icon: BarChart3 },
  progress_analysis: { label: 'تحليل تقدم', icon: TrendingUp },
};

export function AdminApiUsage({}: AdminPageProps) {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchApiUsageSummary>> | null>(null);
  const [logs, setLogs] = useState<ApiUsageLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, l] = await Promise.all([
        fetchApiUsageSummary(),
        fetchApiUsageLogs(30),
      ]);
      setSummary(s);
      setLogs(l);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!summary) return null;

  const costPerRequest = summary.totalRequests > 0 ? summary.totalCost / summary.totalRequests : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Zap size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">استهلاك الذكاء الاصطناعي</h2>
            <p className="text-sm text-neutral-400 mt-1">تكلفة API الفعلية على الشركة — استهلاك لكل طالب ومادة</p>
          </div>
        </div>
      </Card>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label="إجمالي التكلفة"
          value={`$${summary.totalCost.toFixed(4)}`}
          icon={<DollarSign size={20} />}
          change="آخر 30 يوم"
          trend="up"
        />
        <StatCard
          label="إجمالي الطلبات"
          value={formatNumber(summary.totalRequests)}
          icon={<Zap size={20} />}
          change="API calls"
          trend="up"
        />
        <StatCard
          label="إجمالي الـ Tokens"
          value={formatNumber(summary.totalTokens)}
          icon={<Cpu size={20} />}
          change="تم استهلاكها"
          trend="up"
        />
        <StatCard
          label="تكلفة الطلب"
          value={`$${costPerRequest.toFixed(5)}`}
          icon={<TrendingUp size={20} />}
          change="متوسط"
          trend="flat"
        />
      </div>

      {/* Daily trend chart */}
      <Card>
        <h3 className="mb-4 font-bold text-white">الاستهلاك اليومي</h3>
        {summary.dailyTrend.length > 0 ? (
          <div className="flex items-end justify-between gap-2 h-40 pt-4">
            {summary.dailyTrend.map((day) => {
              const maxCost = Math.max(...summary.dailyTrend.map((d) => d.cost), 0.001);
              const heightPct = (day.cost / maxCost) * 100;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-col items-center justify-end" style={{ height: '130px' }}>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all hover:from-emerald-500 hover:to-emerald-300"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`$${day.cost.toFixed(4)} — ${formatNumber(day.tokens)} tokens`}
                    />
                  </div>
                  <span className="text-[9px] text-neutral-500">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-neutral-500">مفيش بيانات استهلاك</p>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top consumers */}
        <Card>
          <h3 className="mb-4 font-bold text-white">أكثر الطلاب استهلاكاً</h3>
          <div className="space-y-2">
            {summary.topConsumers.length > 0 ? summary.topConsumers.map((consumer, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{consumer.student_name}</p>
                  <p className="text-[10px] text-neutral-500">
                    {consumer.request_count} طلبات — {formatNumber(consumer.total_tokens)} tokens
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  ${consumer.total_cost.toFixed(4)}
                </span>
              </div>
            )) : (
              <p className="py-6 text-center text-sm text-neutral-500">مفيش بيانات</p>
            )}
          </div>
        </Card>

        {/* By subject */}
        <Card>
          <h3 className="mb-4 font-bold text-white">الاستهلاك حسب المادة</h3>
          <div className="space-y-2">
            {summary.bySubject.length > 0 ? summary.bySubject.map((item) => {
              const meta = SUBJECT_META[item.subject as Subject];
              const Icon = meta?.icon ?? BarChart3;
              const maxCost = Math.max(...summary.bySubject.map((s) => s.total_cost), 0.001);
              const pct = (item.total_cost / maxCost) * 100;
              return (
                <div key={item.subject} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: meta?.accent + '20', color: meta?.accent }}>
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-white">{meta?.labelAr ?? item.subject}</span>
                    <span className="mr-auto text-sm font-bold text-emerald-400">${item.total_cost.toFixed(4)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta?.accent ?? '#10b981' }} />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">{formatNumber(item.total_tokens)} tokens</p>
                </div>
              );
            }) : (
              <p className="py-6 text-center text-sm text-neutral-500">مفيش بيانات</p>
            )}
          </div>
        </Card>
      </div>

      {/* By interaction type */}
      <Card>
        <h3 className="mb-4 font-bold text-white">الاستهلاك حسب نوع التفاعل</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {summary.byType.map((item) => {
            const meta = TYPE_META[item.interaction_type] ?? { label: item.interaction_type, icon: Zap };
            const Icon = meta.icon;
            return (
              <div key={item.interaction_type} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-neutral-400" />
                  <span className="text-xs font-medium text-white">{meta.label}</span>
                </div>
                <p className="text-lg font-bold text-white">{item.count}</p>
                <p className="text-[10px] text-neutral-500">طلب</p>
                <p className="text-xs text-emerald-400 mt-1">${item.total_cost.toFixed(4)}</p>
              </div>
            );
          })}
          {summary.byType.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-neutral-500">مفيش بيانات</p>
          )}
        </div>
      </Card>

      {/* Recent logs */}
      <Card>
        <h3 className="mb-4 font-bold text-white">آخر الطلبات</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => {
            const meta = SUBJECT_META[log.subject as Subject];
            const typeMeta = TYPE_META[log.interaction_type] ?? { label: log.interaction_type, icon: Zap };
            const TypeIcon = typeMeta.icon;
            return (
              <div key={log.id} className="flex items-center gap-3 rounded-lg bg-[#141414] p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                  <TypeIcon size={14} className="text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    <span className="font-semibold">{log.student_name}</span>
                    {log.content_preview && <span className="text-neutral-500"> — {log.content_preview}</span>}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {typeMeta.label}
                    {meta && ` — ${meta.labelAr}`}
                    {' — '}<span className="text-neutral-600">{log.model}</span>
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-xs font-bold text-emerald-400">${Number(log.cost_usd).toFixed(4)}</p>
                  <p className="text-[10px] text-neutral-500">{formatNumber(log.tokens_used)} tok</p>
                </div>
                <span className="text-[10px] text-neutral-600 shrink-0 hidden sm:block">
                  {new Date(log.created_at).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-500">مفيش سجلات</p>
          )}
        </div>
      </Card>
    </div>
  );
}

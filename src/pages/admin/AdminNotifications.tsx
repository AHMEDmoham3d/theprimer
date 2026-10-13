import { Bell, Plus, Send, CheckCircle2, AlertCircle, Calendar, TrendingUp, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import { Card, Badge, StatCard } from '@/components/ui';
import { NOTIFICATIONS } from '@/data/mockData';
import type { AdminPageProps } from './types';

const ALL_NOTIFS = [
  ...NOTIFICATIONS,
  { id: 'n5', type: 'system', title: 'تحديث النظام', message: 'تم تحديث الـ Semantic Cache — توفير إضافي 12%', timestamp: 'منذ يومين', read: true, forRole: 'admin' as const },
  { id: 'n6', type: 'session', title: 'جلسة مباشرة', message: 'يوسف عماد في جلسة الآن — الحركة الدائرية', timestamp: 'منذ 15 دقيقة', read: false, forRole: 'admin' as const },
  { id: 'n7', type: 'progress', title: 'اكتشاف مهارة', message: 'تم اكتشاف مهارة جديدة لـ مريم حسام — طب وعلوم حياة', timestamp: 'منذ 5 ساعات', read: true, forRole: 'admin' as const },
  { id: 'n8', type: 'alert', title: 'مدرسة جديدة', message: 'مدرسة المنصورة للغات تنتظر التفعيل', timestamp: 'منذ 6 ساعات', read: false, forRole: 'admin' as const },
];

const ICON_MAP: Record<string, typeof Calendar> = {
  session: Calendar,
  progress: TrendingUp,
  alert: AlertCircle,
  billing: DollarSign,
  system: SettingsIcon,
};

export function AdminNotifications({ onNavigate }: AdminPageProps) {
  const unread = ALL_NOTIFS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">إدارة الإشعارات</h2>
        <button className="btn-primary text-xs"><Plus size={16} /> إرسال إشعار</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي الإشعارات" value={ALL_NOTIFS.length} icon={<Bell size={20} />} />
        <StatCard label="غير مقروءة" value={unread} icon={<AlertCircle size={20} />} />
        <StatCard label="مرسلة هذا الأسبوع" value="23" icon={<Send size={20} />} />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">كل الإشعارات</h3>
          <button className="text-xs text-neutral-400 hover:text-white">تعليم الكل كمقروء</button>
        </div>
        <div className="space-y-3">
          {ALL_NOTIFS.map((n) => {
            const Icon = ICON_MAP[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                  n.read ? 'border-[#2a2a2a] bg-[#141414]' : 'border-white/20 bg-[#181818]'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  n.type === 'alert' ? 'bg-red-500/10 text-red-400' :
                  n.type === 'billing' ? 'bg-green-500/10 text-green-400' :
                  n.type === 'session' ? 'bg-blue-500/10 text-blue-400' :
                  n.type === 'progress' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-neutral-800 text-neutral-400'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-neutral-600 mt-1">{n.timestamp}</p>
                </div>
                {n.read ? (
                  <CheckCircle2 size={16} className="text-neutral-600" />
                ) : (
                  <Badge variant="default" className="text-[10px]">جديد</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Notification settings */}
      <Card>
        <h3 className="mb-4 font-bold text-white">إعدادات الإشعارات</h3>
        <div className="space-y-3">
          {[
            { label: 'إشعار عند جلسة مباشرة', enabled: true },
            { label: 'إشعار عند طالب متعثر', enabled: true },
            { label: 'إشعار عند تجديد/إلغاء اشتراك', enabled: true },
            { label: 'إشعار عند مدرسة جديدة', enabled: true },
            { label: 'تقرير يومي بالبريد', enabled: false },
            { label: 'إشعار عند اكتشاف مهارة', enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between rounded-xl bg-[#141414] p-4">
              <span className="text-sm text-white">{setting.label}</span>
              <ToggleSwitch enabled={setting.enabled} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ToggleSwitch({ enabled }: { enabled: boolean }) {
  return (
    <div className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-white' : 'bg-neutral-700'}`}>
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-all ${enabled ? 'left-0.5' : 'right-0.5'}`}
      />
    </div>
  );
}

import { useState } from 'react';
import { Settings, Globe, Shield, Bell, CreditCard, Database, Key, Save } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { AdminPageProps } from './types';

type SettingsTab = 'general' | 'security' | 'notifications' | 'billing' | 'api' | 'integrations';

export function AdminSettings({ onNavigate }: AdminPageProps) {
  const [tab, setTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'billing', label: 'الدفع', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'التكاملات', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">إعدادات النظام</h2>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Tab sidebar */}
        <div className="flex gap-2 overflow-x-auto md:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                tab === t.id ? 'bg-white text-black' : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {tab === 'general' && (
            <Card>
              <h3 className="mb-4 font-bold text-white">الإعدادات العامة</h3>
              <div className="space-y-4">
                <Field label="اسم الشركة" value="The Primer" />
                <Field label="البريد الرسمي" value="info@theprimer.edu" />
                <Field label="رقم الهاتف" value="0100-123-4567" />
                <Field label="العنوان" value="القاهرة، مصر" />
                <div>
                  <label className="text-xs text-neutral-400 mb-2 block">اللغة الافتراضية</label>
                  <select className="input-base">
                    <option>العربية</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-2 block">المنطقة الزمنية</label>
                  <select className="input-base">
                    <option>(GMT+2) القاهرة</option>
                    <option>(GMT+3) الرياض</option>
                    <option>(GMT+4) دبي</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary mt-6 text-xs"><Save size={14} /> حفظ التغييرات</button>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <h3 className="mb-4 font-bold text-white">إعدادات الأمان</h3>
              <div className="space-y-3">
                {[
                  { label: 'تفعيل المصادقة الثنائية (2FA)', enabled: true },
                  { label: 'تشفير قاعدة البيانات', enabled: true },
                  { label: 'سياسة كلمات المرور القوية', enabled: true },
                  { label: 'تسجيل خروج تلقائي بعد ساعة', enabled: false },
                  { label: 'حظر IP بعد 5 محاولات فاشلة', enabled: true },
                  { label: 'نسخ احتياطي يومي', enabled: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-xl bg-[#141414] p-4">
                    <span className="text-sm text-white">{s.label}</span>
                    <ToggleSwitch enabled={s.enabled} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <h3 className="mb-4 font-bold text-white">إعدادات الإشعارات</h3>
              <div className="space-y-3">
                {[
                  { label: 'إشعارات البريد الإلكتروني', enabled: true },
                  { label: 'إشعارات واتساب', enabled: true },
                  { label: 'إشعارات داخل التطبيق', enabled: true },
                  { label: 'تقرير يومي', enabled: false },
                  { label: 'تقرير أسبوعي', enabled: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-xl bg-[#141414] p-4">
                    <span className="text-sm text-white">{s.label}</span>
                    <ToggleSwitch enabled={s.enabled} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'billing' && (
            <Card>
              <h3 className="mb-4 font-bold text-white">إعدادات الدفع</h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-white" />
                      <span className="text-sm font-medium text-white">Paymob</span>
                    </div>
                    <Badge variant="success">متصل</Badge>
                  </div>
                  <p className="text-xs text-neutral-500">بوابة الدفع الرئيسية للسوق المصري</p>
                </div>
                <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-white" />
                      <span className="text-sm font-medium text-white">Fawry</span>
                    </div>
                    <Badge variant="success">متصل</Badge>
                  </div>
                  <p className="text-xs text-neutral-500">بوابة دفع بديلة — شبكة فوري</p>
                </div>
                <Field label="سعر الاشتراك الشهري" value="500 جنيه" />
                <Field label="سعر كورس الصيف" value="300 جنيه" />
                <Field label="عمولة المدرسة لكل طالب" value="80 جنيه" />
              </div>
            </Card>
          )}

          {tab === 'api' && (
            <Card>
              <h3 className="mb-4 font-bold text-white">مفاتيح API</h3>
              <div className="space-y-3">
                {[
                  { name: 'Anthropic (Claude Haiku)', status: 'active', key: 'sk-ant-***...***' },
                  { name: 'OpenAI (TTS-1)', status: 'active', key: 'sk-***...***' },
                  { name: 'Deepgram (STT)', status: 'active', key: 'dg-***...***' },
                  { name: 'WhatsApp Business', status: 'active', key: 'wb-***...***' },
                ].map((api) => (
                  <div key={api.name} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Key size={16} className="text-neutral-400" />
                        <span className="text-sm font-medium text-white">{api.name}</span>
                      </div>
                      <Badge variant="success">{api.status === 'active' ? 'نشط' : 'متوقف'}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-[#0f0f0f] px-3 py-2 text-xs text-neutral-400 font-mono">{api.key}</code>
                      <button className="btn-secondary text-xs">تغيير</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'integrations' && (
            <Card>
              <h3 className="mb-4 font-bold text-white">التكاملات</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: 'Supabase', desc: 'قاعدة البيانات + pgvector', status: 'connected' },
                  { name: 'tldraw', desc: 'السبورة التفاعلية', status: 'connected' },
                  { name: 'KaTeX', desc: 'معادلات الرياضيات', status: 'connected' },
                  { name: 'WhatsApp Business', desc: 'التواصل مع الأهالي', status: 'connected' },
                  { name: 'Daily.co', desc: 'جلسات الصوت والفيديو', status: 'connected' },
                  { name: 'Leaflet.js', desc: 'خرائط تفاعلية', status: 'connected' },
                ].map((int) => (
                  <div key={int.name} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-neutral-400" />
                        <span className="text-sm font-medium text-white">{int.name}</span>
                      </div>
                      <Badge variant="success">متصل</Badge>
                    </div>
                    <p className="text-xs text-neutral-500">{int.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-neutral-400 mb-2 block">{label}</label>
      <input className="input-base" defaultValue={value} />
    </div>
  );
}

function ToggleSwitch({ enabled }: { enabled: boolean }) {
  return (
    <div className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-white' : 'bg-neutral-700'}`}>
      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-all ${enabled ? 'left-0.5' : 'right-0.5'}`} />
    </div>
  );
}

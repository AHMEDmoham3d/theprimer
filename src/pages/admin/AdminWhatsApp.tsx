import { useState, useEffect } from 'react';
import {
  MessageCircle, Send, Plus, Edit, Power, Check, Clock, AlertCircle,
  Loader2, Phone, Mail, Building2, X, Users,
} from 'lucide-react';
import { Card, Badge, StatCard, Avatar, IconButton } from '@/components/ui';
import {
  fetchWhatsAppTemplates, fetchWhatsAppMessages, fetchStudents, updateWhatsAppTemplate, sendWhatsAppMessage,
  type WhatsAppTemplateRow, type WhatsAppMessageRow, type StudentRow,
} from '@/lib/db';
import type { AdminPageProps } from './types';

const TRIGGER_LABELS: Record<string, string> = {
  'post-study': 'بعد المذاكرة',
  'pre-session-reminder': 'تذكير قبل الجلسة',
  'post-session-report': 'تقرير بعد الجلسة',
  'exam-result': 'نتيجة امتحان',
  'weekly-progress': 'تقرير أسبوعي',
  'welcome': 'ترحيب',
  'subscription-renewal': 'تجديد اشتراك',
};

export function AdminWhatsApp(_: AdminPageProps) {
  const [tab, setTab] = useState<'templates' | 'log' | 'contacts'>('templates');
  const [templates, setTemplates] = useState<WhatsAppTemplateRow[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessageRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTpl, setEditingTpl] = useState<WhatsAppTemplateRow | null>(null);

  const load = () => {
    Promise.all([fetchWhatsAppTemplates(), fetchWhatsAppMessages(), fetchStudents()]).then(([t, m, s]) => {
      setTemplates(t);
      setMessages(m);
      setStudents(s);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const sentCount = messages.filter((m) => m.status === 'sent').length;
  const pendingCount = messages.filter((m) => m.status === 'pending').length;
  const companyNumber = templates[0]?.company_sending_number ?? '+20 100 123 4567';

  const handleToggle = async (tpl: WhatsAppTemplateRow) => {
    const ok = await updateWhatsAppTemplate(tpl.id, { enabled: !tpl.enabled });
    if (ok) load();
  };

  const handleSaveTemplate = async (id: string, template: string, companyNum: string) => {
    const ok = await updateWhatsAppTemplate(id, { template, company_sending_number: companyNum });
    if (ok) { setEditingTpl(null); load(); }
  };

  const handleSendTest = async (student: StudentRow, recipient: 'student' | 'parent') => {
    const phone = recipient === 'student' ? student.student_phone : student.parent_phone;
    const email = recipient === 'student' ? student.student_email : student.parent_email;
    const name = recipient === 'student' ? student.name : student.parent_name;
    if (!phone) return;
    await sendWhatsAppMessage({
      student_id: student.id,
      student_name: student.name,
      recipient,
      recipient_phone: phone,
      recipient_name: name,
      recipient_email: email,
      content: `رسالة تجريبية من The Primer إلى ${name}`,
      trigger_type: 'welcome',
      company_sending_number: companyNumber,
    });
    load();
    setTab('log');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">أتمتة واتساب</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2">
            <Building2 size={14} className="text-green-400" />
            <span className="text-xs text-green-300">رقم الشركة: {companyNumber}</span>
          </div>
          <Badge variant="success"><Power size={12} /> يعمل تلقائياً</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="رسائل مرسلة" value={sentCount} icon={<Send size={20} />} change="تلقائياً" trend="up" />
        <StatCard label="منتظرة" value={pendingCount} icon={<Clock size={20} />} />
        <StatCard label="قوالب نشطة" value={templates.filter((t) => t.enabled).length} icon={<MessageCircle size={20} />} />
        <StatCard label="طلاب بأرقام مسجلة" value={students.filter((s) => s.parent_phone || s.student_phone).length} icon={<Users size={20} />} />
      </div>

      <div className="flex items-center gap-2">
        {(['templates', 'log', 'contacts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === t ? 'bg-white text-black' : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#2a2a2a]'}`}
          >
            {t === 'templates' ? 'قوالب الرسائل' : t === 'log' ? 'سجل الرسائل' : 'جهات الاتصال'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-neutral-500" /></div>
      ) : (
        <>
          {tab === 'templates' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-sm text-green-300">
                  النظام بيبعت الرسائل أوتوماتيك من رقم الشركة. كل قالب بيعرف رقم الطالب وولي الأمر والإيميل المسجل. تقدر تعدل القالب وتتحكم في تفعيله.
                </p>
              </div>
              {templates.map((tpl) => (
                <Card key={tpl.id}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tpl.recipient === 'student' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                      <MessageCircle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="info" className="text-[10px]">{TRIGGER_LABELS[tpl.trigger_type] ?? tpl.trigger_type}</Badge>
                        <Badge variant={tpl.recipient === 'student' ? 'default' : 'success'} className="text-[10px]">
                          {tpl.recipient === 'student' ? 'للطالب' : 'لولي الأمر'}
                        </Badge>
                        {tpl.enabled ? (
                          <Badge variant="success" className="text-[10px]">مفعّل</Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">متوقف</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-200 mt-2 leading-relaxed bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                        {tpl.template}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] text-neutral-500">المتغيرات:</span>
                        {tpl.variables.map((v) => (
                          <code key={v} className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">{`{${v}}`}</code>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500">
                        <Building2 size={10} /> يُرسل من: {tpl.company_sending_number}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <IconButton onClick={() => setEditingTpl(tpl)}><Edit size={14} /></IconButton>
                      <IconButton onClick={() => handleToggle(tpl)}><Power size={14} /></IconButton>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 'log' && (
            <Card className="overflow-x-auto">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-neutral-500 py-8">مفيش رسائل مرسلة بعد</p>
              ) : (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">
                      <th className="pb-3 pr-4 font-medium">الطالب</th>
                      <th className="pb-3 font-medium">المستلم</th>
                      <th className="pb-3 font-medium">الهاتف</th>
                      <th className="pb-3 font-medium">الإيميل</th>
                      <th className="pb-3 font-medium">الرسالة</th>
                      <th className="pb-3 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id} className="border-b border-[#1c1c1c] hover:bg-[#141414] transition">
                        <td className="py-3 pr-4">
                          <span className="text-sm text-white">{msg.student_name}</span>
                        </td>
                        <td className="text-xs">
                          <Badge variant={msg.recipient === 'student' ? 'default' : 'success'} className="text-[10px]">
                            {msg.recipient === 'student' ? 'طالب' : 'ولي أمر'}
                          </Badge>
                          <p className="text-neutral-400 mt-1">{msg.recipient_name}</p>
                        </td>
                        <td className="text-xs text-neutral-400">
                          <span className="flex items-center gap-1"><Phone size={10} /> {msg.recipient_phone}</span>
                        </td>
                        <td className="text-xs text-neutral-500">
                          {msg.recipient_email ? <span className="flex items-center gap-1"><Mail size={10} /> {msg.recipient_email}</span> : <span className="text-neutral-600">غير مسجل</span>}
                        </td>
                        <td className="text-xs text-neutral-400 max-w-xs truncate">{msg.content}</td>
                        <td>
                          {msg.status === 'sent' ? (
                            <Badge variant="success"><Check size={10} /> مرسلة</Badge>
                          ) : msg.status === 'pending' ? (
                            <Badge variant="warning"><Clock size={10} /> منتظرة</Badge>
                          ) : (
                            <Badge variant="error"><AlertCircle size={10} /> فشلت</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'contacts' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-sm text-blue-300">
                  كل طالب له رقم هاتف وإيميل مسجل، وكذلك ولي أمره. تقدر تبعت رسالة تجريبية لأي واحد منهم.
                </p>
              </div>
              {students.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar initials={s.avatar} size="md" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white">{s.name}</h3>
                      <p className="text-xs text-neutral-500">{s.school_name || 'طالب مستقل'} — {s.curriculum_name || 'بدون منهج'}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Student contact */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <MessageCircle size={16} />
                        </div>
                        <span className="text-xs font-medium text-white">بيانات الطالب</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Phone size={12} className="text-neutral-500" />
                          {s.student_phone || <span className="text-red-400">غير مسجل</span>}
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Mail size={12} className="text-neutral-500" />
                          {s.student_email || <span className="text-red-400">غير مسجل</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendTest(s, 'student')}
                        disabled={!s.student_phone}
                        className="btn-secondary w-full mt-3 text-[10px] disabled:opacity-30"
                      >
                        <Send size={12} /> إرسال تجريبي
                      </button>
                    </div>

                    {/* Parent contact */}
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                          <Users size={16} />
                        </div>
                        <span className="text-xs font-medium text-white">بيانات ولي الأمر</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-neutral-400">{s.parent_name || 'غير مسجل'}</p>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Phone size={12} className="text-neutral-500" />
                          {s.parent_phone || <span className="text-red-400">غير مسجل</span>}
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Mail size={12} className="text-neutral-500" />
                          {s.parent_email || <span className="text-red-400">غير مسجل</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendTest(s, 'parent')}
                        disabled={!s.parent_phone}
                        className="btn-secondary w-full mt-3 text-[10px] disabled:opacity-30"
                      >
                        <Send size={12} /> إرسال تجريبي
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {editingTpl && (
        <EditTemplateModal
          template={editingTpl}
          onClose={() => setEditingTpl(null)}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
}

function EditTemplateModal({ template, onClose, onSave }: {
  template: WhatsAppTemplateRow;
  onClose: () => void;
  onSave: (id: string, template: string, companyNum: string) => void;
}) {
  const [text, setText] = useState(template.template);
  const [companyNum, setCompanyNum] = useState(template.company_sending_number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Edit size={18} /> تعديل القالب</h3>
          <IconButton onClick={onClose}><X size={18} /></IconButton>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">نص الرسالة</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="input-base resize-none"
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-neutral-500">المتغيرات المتاحة:</span>
              {template.variables.map((v) => (
                <code key={v} className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">{`{${v}}`}</code>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">رقم الشركة المُرسل منه</label>
            <input value={companyNum} onChange={(e) => setCompanyNum(e.target.value)} className="input-base" />
          </div>
        </div>

        <button onClick={() => onSave(template.id, text, companyNum)} className="btn-primary w-full mt-5">
          <Check size={16} /> حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

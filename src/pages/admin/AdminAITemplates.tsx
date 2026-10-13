import { useState } from 'react';
import { Bot, Edit, Save, Search, X, Sparkles, Check } from 'lucide-react';
import { Card, Badge, IconButton } from '@/components/ui';
import { AI_TEMPLATES } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { AdminPageProps } from './types';
import type { AITemplate, Subject } from '@/types';

export function AdminAITemplates({ onNavigate }: AdminPageProps) {
  const [templates, setTemplates] = useState<AITemplate[]>(AI_TEMPLATES);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filtered = templates.filter((t) => {
    const matchSearch = t.trigger.includes(search) || t.response.includes(search) || t.category.includes(search);
    const matchCat = filterCat === 'all' || t.category === filterCat;
    return matchSearch && matchCat;
  });

  const startEdit = (tpl: AITemplate) => {
    setEditing(tpl.id);
    setEditText(tpl.response);
  };

  const saveEdit = (id: string) => {
    setTemplates((ts) => ts.map((t) =>
      t.id === id
        ? { ...t, response: editText, edited: true, lastEditedAt: new Date().toLocaleDateString('ar-EG'), editedBy: 'المدير' }
        : t
    ));
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ردود الذكاء الاصطناعي</h2>
            <p className="text-sm text-neutral-400">تحكم كامل في ردود المدرّس الذكي</p>
          </div>
        </div>
        <Badge variant="info">{templates.filter((t) => t.edited).length} معدّل</Badge>
      </div>

      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-green-400 mt-0.5 shrink-0" />
          <p className="text-sm text-green-300">
            النظام بيستخدم القوالب دي عشان يرد على الطلاب. تقدر تعدل أي رد وتخصصه — التعديل هيطبق فوراً على كل المحادثات الجديدة.
          </p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3 min-w-[200px]">
          <Search size={18} className="text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في القوالب..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition whitespace-nowrap ${
                filterCat === cat ? 'bg-white text-black' : 'bg-[#141414] text-neutral-400 border border-[#2a2a2a]'
              }`}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-3">
        {filtered.map((tpl) => {
          const meta = tpl.subject ? SUBJECT_META[tpl.subject as Subject] : null;
          const isEditing = editing === tpl.id;
          return (
            <Card key={tpl.id}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta ? '' : 'bg-neutral-800 text-white'}`}
                  style={meta ? { background: meta.accentSoft, color: meta.accent } : {}}>
                  <Bot size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="neutral" className="text-[10px]">{tpl.category}</Badge>
                    {meta && <Badge variant="info" className="text-[10px]">{meta.labelAr}</Badge>}
                    {tpl.edited && <Badge variant="warning" className="text-[10px]">معدّل</Badge>}
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">المُحفّز: {tpl.trigger}</p>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#444] resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(tpl.id)} className="btn-primary text-xs">
                          <Save size={14} /> حفظ
                        </button>
                        <button onClick={() => setEditing(null)} className="btn-secondary text-xs">
                          <X size={14} /> إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-neutral-200 leading-relaxed bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
                        {tpl.response}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {tpl.edited && tpl.lastEditedAt && (
                          <span className="text-[10px] text-neutral-500">آخر تعديل: {tpl.lastEditedAt} بواسطة {tpl.editedBy}</span>
                        )}
                        <button onClick={() => startEdit(tpl)} className="mr-auto flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition">
                          <Edit size={12} /> تعديل
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

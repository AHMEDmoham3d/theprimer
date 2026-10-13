import { useState } from 'react';
import { MessageSquare, Search, ChevronLeft, Eye, Building2 } from 'lucide-react';
import { Card, Badge, Avatar, EmptyState, StatCard } from '@/components/ui';
import { STUDENT_CHAT_RECORDS, STUDENTS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import type { AdminPageProps } from './types';

export function AdminStudentChats({ onNavigate }: AdminPageProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = STUDENT_CHAT_RECORDS.filter((r) =>
    r.studentName.includes(search) || r.schoolName.includes(search)
  );

  if (selectedId) {
    const record = STUDENT_CHAT_RECORDS.find((r) => r.id === selectedId);
    if (!record) return null;
    const student = STUDENTS.find((s) => s.id === record.studentId);
    const meta = SUBJECT_META[record.subject];

    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar initials={student?.avatar ?? 'ST'} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-white">{record.studentName}</h2>
              <p className="text-sm text-neutral-400 mt-1 flex items-center gap-2">
                <Building2 size={14} /> {record.schoolName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <meta.icon size={12} />
                </div>
                <span className="text-xs text-neutral-400">{meta.labelAr}</span>
                <Badge variant="info" className="text-[10px]">{record.totalMessages} رسالة</Badge>
              </div>
            </div>
            <button onClick={() => setSelectedId(null)} className="btn-secondary text-xs mr-auto">
              رجوع للقائمة
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-white">سجل المحادثة</h3>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
            {record.messages.map((msg) => {
              const isAI = msg.role === 'ai';
              return (
                <div key={msg.id} className={`flex gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}>
                  {isAI && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 text-xs font-bold text-white">
                      م
                    </div>
                  )}
                  <div className={`max-w-[75%] space-y-2`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isAI ? 'bg-[#1c1c1c] text-neutral-100' : 'bg-white text-black'}`}>
                      {msg.text}
                    </div>
                    {msg.hasWhiteboard && msg.whiteboardSteps && (
                      <Whiteboard steps={msg.whiteboardSteps} className="max-w-md" />
                    )}
                    <span className="block text-[10px] text-neutral-600">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
          <MessageSquare size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">محادثات الطلاب</h2>
          <p className="text-sm text-neutral-400">شوف محادثة أي طالب من أي مدرسة</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي المحادثات" value={STUDENT_CHAT_RECORDS.length} icon={<MessageSquare size={20} />} />
        <StatCard label="إجمالي الرسائل" value={STUDENT_CHAT_RECORDS.reduce((a, r) => a + r.totalMessages, 0)} icon={<MessageSquare size={20} />} />
        <StatCard label="محادثات نشطة" value={STUDENT_CHAT_RECORDS.filter((r) => r.lastMessageAt.includes('دقيقة') || r.lastMessageAt.includes('ساعة')).length} icon={<MessageSquare size={20} />} />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <Search size={18} className="text-neutral-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الطالب أو المدرسة..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((record) => {
          const student = STUDENTS.find((s) => s.id === record.studentId);
          const meta = SUBJECT_META[record.subject];
          const isActive = record.lastMessageAt.includes('دقيقة') || record.lastMessageAt.includes('ساعة');
          return (
            <Card key={record.id} hover onClick={() => setSelectedId(record.id)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Avatar initials={student?.avatar ?? 'ST'} size="md" />
                  {isActive && <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#181818] bg-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{record.studentName}</h3>
                  <p className="text-xs text-neutral-500 truncate">{record.schoolName}</p>
                </div>
                <Badge variant={isActive ? 'success' : 'neutral'} className="text-[10px]">{record.lastMessageAt}</Badge>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={11} />
                  </div>
                  <span className="text-xs text-neutral-400">{meta.labelAr}</span>
                </div>
                <span className="text-xs text-neutral-500">{record.totalMessages} رسالة</span>
                <span className="flex items-center gap-1 text-xs text-white">
                  <Eye size={12} /> عرض
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <EmptyState icon={<Search size={28} />} title="مفيش نتائج" />
      )}
    </div>
  );
}

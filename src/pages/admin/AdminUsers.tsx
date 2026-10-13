import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Users, GraduationCap, Brain, UserCircle } from 'lucide-react';
import { Card, Badge, Avatar, IconButton, EmptyState } from '@/components/ui';
import { STUDENTS, TEACHERS, PARENTS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { AdminPageProps } from './types';

type Tab = 'students' | 'teachers' | 'parents';

export function AdminUsers({ onNavigate }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('students');
  const [search, setSearch] = useState('');

  const tabs: { id: Tab; label: string; icon: typeof Users; count: number }[] = [
    { id: 'students', label: 'الطلاب', icon: Users, count: STUDENTS.length },
    { id: 'teachers', label: 'المدرّسين', icon: GraduationCap, count: TEACHERS.length },
    { id: 'parents', label: 'أولياء الأمور', icon: Brain, count: PARENTS.length },
  ];

  const filteredStudents = STUDENTS.filter((s) => s.name.includes(search));
  const filteredTeachers = TEACHERS.filter((t) => t.name.includes(search));
  const filteredParents = PARENTS.filter((p) => p.name.includes(search));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition whitespace-nowrap ${
              tab === t.id ? 'bg-white text-black' : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#2a2a2a]'
            }`}
          >
            <t.icon size={16} /> {t.label}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${tab === t.id ? 'bg-black/10' : 'bg-neutral-800'}`}>{t.count}</span>
          </button>
        ))}
        <button className="btn-primary text-xs mr-auto whitespace-nowrap">
          <Plus size={16} /> إضافة مستخدم
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
          <Search size={18} className="text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
          />
        </div>
        <button className="btn-secondary"><Filter size={16} /> تصفية</button>
      </div>

      {/* Students table */}
      {tab === 'students' && (
        <Card className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">
                <th className="pb-3 pr-4 font-medium">الطالب</th>
                <th className="pb-3 font-medium">الصف</th>
                <th className="pb-3 font-medium">المدرسة</th>
                <th className="pb-3 font-medium">المادة النشطة</th>
                <th className="pb-3 font-medium">الاشتراك</th>
                <th className="pb-3 font-medium">آخر نشاط</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const meta = SUBJECT_META[s.activeSubject];
                return (
                  <tr key={s.id} className="border-b border-[#1c1c1c] hover:bg-[#141414] transition">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={s.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-white">{s.name}</p>
                          <p className="text-[10px] text-neutral-500">{s.parentName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-neutral-400">{s.grade}</td>
                    <td className="text-xs text-neutral-400">{s.schoolName}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                          <meta.icon size={11} />
                        </div>
                        <span className="text-xs text-neutral-300">{meta.labelAr}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={s.subscriptionStatus === 'active' ? 'success' : 'warning'}>
                        {s.subscriptionStatus === 'active' ? 'مشترك' : 'تجربة'}
                      </Badge>
                    </td>
                    <td className="text-xs text-neutral-400">{s.lastActive}</td>
                    <td><IconButton><MoreVertical size={16} /></IconButton></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && <EmptyState icon={<UserCircle size={28} />} title="مفيش مستخدمين" />}
        </Card>
      )}

      {/* Teachers */}
      {tab === 'teachers' && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredTeachers.map((t) => {
            const meta = SUBJECT_META[t.subject];
            return (
              <Card key={t.id} hover>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar initials={t.avatar} size="md" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                    <p className="text-xs text-neutral-500">{t.schoolName}</p>
                  </div>
                  <IconButton><MoreVertical size={16} /></IconButton>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                      <meta.icon size={11} />
                    </div>
                    <span className="text-xs text-neutral-300">{meta.labelAr}</span>
                  </div>
                  <Badge variant="info">{t.studentsCount} طالب</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Parents */}
      {tab === 'parents' && (
        <Card className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">
                <th className="pb-3 pr-4 font-medium">ولي الأمر</th>
                <th className="pb-3 font-medium">الهاتف</th>
                <th className="pb-3 font-medium">عدد الأبناء</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((p) => (
                <tr key={p.id} className="border-b border-[#1c1c1c] hover:bg-[#141414] transition">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.name.split(' ').map((n) => n[0]).join('')} size="sm" />
                      <span className="text-sm font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-xs text-neutral-400">{p.phone}</td>
                  <td><Badge variant="info">{p.childrenIds.length} طفل</Badge></td>
                  <td><IconButton><MoreVertical size={16} /></IconButton></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredParents.length === 0 && <EmptyState icon={<UserCircle size={28} />} title="مفيش أولياء أمور" />}
        </Card>
      )}
    </div>
  );
}

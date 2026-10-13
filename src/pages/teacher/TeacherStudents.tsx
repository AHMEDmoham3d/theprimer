import { useState } from 'react';
import { Search, Filter, Flame, TrendingUp } from 'lucide-react';
import { Card, Badge, ProgressBar, Avatar, EmptyState } from '@/components/ui';
import { STUDENTS, TEACHERS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';

export function TeacherStudents() {
  const [search, setSearch] = useState('');
  const teacher = TEACHERS[0];
  const myStudents = STUDENTS.filter((s) => s.schoolId === teacher.schoolId);
  const filtered = myStudents.filter((s) => s.name.includes(search) || s.grade.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
          <Search size={18} className="text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن طالب..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
          />
        </div>
        <button className="btn-secondary">
          <Filter size={16} /> تصفية
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((s) => {
          const meta = SUBJECT_META[s.activeSubject];
          return (
            <Card key={s.id} hover>
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={s.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{s.name}</h3>
                  <p className="text-xs text-neutral-500">{s.grade}</p>
                </div>
                <Badge variant={s.subscriptionStatus === 'active' ? 'success' : 'warning'}>
                  {s.subscriptionStatus === 'active' ? 'مشترك' : 'تجربة'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
                    <span>الهدف الأسبوعي</span>
                    <span>{s.weeklyProgress}/{s.weeklyGoal}</span>
                  </div>
                  <ProgressBar value={(s.weeklyProgress / s.weeklyGoal) * 100} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Flame size={12} className="text-amber-400" /> {s.streakDays} يوم
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <div className="h-6 w-6 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                      <meta.icon size={12} />
                    </div>
                    {meta.labelAr}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <TrendingUp size={12} /> {s.lastActive}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <EmptyState icon={<Search size={28} />} title="مفيش نتائج" description="جرب كلمة بحث تانية" />
      )}
    </div>
  );
}

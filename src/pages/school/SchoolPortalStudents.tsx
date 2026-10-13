import { useState } from 'react';
import { Search, Flame, TrendingUp, Activity } from 'lucide-react';
import { Card, Badge, Avatar, ProgressBar, EmptyState } from '@/components/ui';
import { STUDENTS, STUDY_LOGS, SESSIONS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import type { SchoolPortalPageProps } from './types';

export function SchoolPortalStudents({ schoolId }: SchoolPortalPageProps) {
  const [search, setSearch] = useState('');
  const schoolStudents = STUDENTS.filter((s) => s.schoolId === schoolId);
  const filtered = schoolStudents.filter((s) => s.name.includes(search) || s.grade.includes(search));

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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((s) => {
          const meta = SUBJECT_META[s.activeSubject];
          const studentLog = STUDY_LOGS.find((l) => l.studentId === s.id);
          const studentSessions = SESSIONS.filter((se) => se.studentId === s.id);
          const isStudying = studentLog?.studiedAt.includes('دقيقة') || studentLog?.studiedAt.includes('ساعة');
          return (
            <Card key={s.id} hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Avatar initials={s.avatar} size="md" />
                  {isStudying && (
                    <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#181818] bg-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{s.name}</h3>
                  <p className="text-xs text-neutral-500">{s.grade}</p>
                </div>
                {isStudying ? (
                  <Badge variant="success">يدرس الآن</Badge>
                ) : (
                  <Badge variant="neutral">{s.lastActive}</Badge>
                )}
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
                    <div className="h-5 w-5 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                      <meta.icon size={11} />
                    </div>
                    {meta.labelAr}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Activity size={12} /> {studentSessions.length} جلسة
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

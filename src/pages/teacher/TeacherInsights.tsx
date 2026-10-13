import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Card, Badge, ProgressBar, Avatar } from '@/components/ui';
import { STUDENTS, PROGRESS_DATA, SKILL_INSIGHTS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';

export function TeacherInsights() {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <Lightbulb size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">الرؤى التعليمية الذكية</h2>
            <p className="text-sm text-neutral-400 mt-0.5">تحليل أداء الطلاب واقتراحات لتوجيه وقتك في الحصة</p>
          </div>
        </div>
      </Card>

      {/* Class overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><div className="text-center"><p className="text-3xl font-bold text-green-400">68%</p><p className="text-xs text-neutral-400 mt-1">فهموا المفهوم</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-amber-400">22%</p><p className="text-xs text-neutral-400 mt-1">محتاجين تركيز</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-red-400">10%</p><p className="text-xs text-neutral-400 mt-1">متعثرين</p></div></Card>
      </div>

      {/* Skill insights */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-white" />
          <h3 className="font-bold text-white">اكتشاف المهارات — رؤى من البيانات</h3>
        </div>
        <div className="space-y-3">
          {SKILL_INSIGHTS.map((insight) => {
            const meta = SUBJECT_META[insight.subject];
            return (
              <div key={insight.studentId} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initials={insight.studentName.split(' ').map((n) => n[0]).join('')} size="sm" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{insight.studentName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-4 w-4 rounded flex items-center justify-center" style={{ background: meta.accentSoft, color: meta.accent }}>
                        <meta.icon size={10} />
                      </div>
                      <span className="text-xs text-neutral-500">{meta.labelAr}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-neutral-500">الثقة</p>
                    <p className="text-lg font-bold text-white">{insight.confidence}%</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-200 mb-3">{insight.insight}</p>
                <div>
                  <p className="text-xs text-neutral-500 mb-2">الأدلة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.evidence.map((e) => (
                      <Badge key={e} variant="neutral" className="text-[10px]">{e}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Subject breakdown */}
      <Card>
        <h3 className="mb-4 font-bold text-white">تحليل المواد</h3>
        <div className="space-y-3">
          {PROGRESS_DATA.map((p) => {
            const meta = SUBJECT_META[p.subject];
            return (
              <div key={p.subject} className="flex items-center gap-4 rounded-xl bg-[#141414] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <meta.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{meta.labelAr}</p>
                  <p className="text-xs text-neutral-500">{p.questionsAnswered} سؤال — {p.sessionsCompleted} جلسة</p>
                </div>
                <div className="w-32">
                  <ProgressBar value={p.mastery} color={meta.accent} />
                </div>
                <span className="text-sm font-bold text-white">{p.mastery}%</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

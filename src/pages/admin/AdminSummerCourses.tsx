import { useState, useEffect } from 'react';
import { Sun, Eye, EyeOff, CheckCircle2, Sparkles, Brain, TrendingUp, Clock, Target, ChevronDown, ChevronLeft, GraduationCap } from 'lucide-react';
import { Card, Badge, Avatar } from '@/components/ui';
import { STUDENTS } from '@/data/mockData';
import { SUBJECT_META } from '@/data/subjects';
import {
  fetchAllRecommendations, updateRecommendationStatus,
  type SummerCourseRecommendation,
} from '@/lib/db';
import { cn } from '@/lib/utils';
import type { AdminPageProps } from './types';

export function AdminSummerCourses({}: AdminPageProps) {
  const [recommendations, setRecommendations] = useState<SummerCourseRecommendation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllRecommendations().then((data) => {
      setRecommendations(data);
      setLoading(false);
    });
  }, []);

  const handleConfirm = async (id: string) => {
    const ok = await updateRecommendationStatus(id, 'confirmed');
    if (ok) {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'confirmed', confirmed_at: new Date().toISOString() } : r))
      );
    }
  };

  const handleHide = async (id: string) => {
    const ok = await updateRecommendationStatus(id, 'hidden');
    if (ok) {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'hidden' } : r))
      );
    }
  };

  const pending = recommendations.filter((r) => r.status === 'pending');
  const confirmed = recommendations.filter((r) => r.status === 'confirmed');
  const hidden = recommendations.filter((r) => r.status === 'hidden');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
            <Sun size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">كورسات الصيف</h2>
            <p className="text-sm text-neutral-400 mt-1">النظام بيحلل كل طالب ويقترح كورسات مخصصة — مع شرح السبب والأدلة</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"><Clock size={18} className="text-amber-400" /></div>
          <div><p className="text-2xl font-bold text-white">{pending.length}</p><p className="text-xs text-neutral-500">في انتظار المراجعة</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10"><CheckCircle2 size={18} className="text-emerald-400" /></div>
          <div><p className="text-2xl font-bold text-white">{confirmed.length}</p><p className="text-xs text-neutral-500">مؤكدة ومرئية للطالب</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800"><EyeOff size={18} className="text-neutral-400" /></div>
          <div><p className="text-2xl font-bold text-white">{hidden.length}</p><p className="text-xs text-neutral-500">مخفية عن الطالب</p></div>
        </Card>
      </div>

      {loading && <p className="text-center text-neutral-500 py-8">جاري تحليل بيانات الطلاب...</p>}

      {!loading && recommendations.length === 0 && (
        <Card className="text-center py-12">
          <Brain size={32} className="text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">لا توجد توصيات حالياً — النظام بيحلل بيانات الطلاب ويولّد كورسات تلقائياً</p>
        </Card>
      )}

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            isExpanded={expanded === rec.id}
            onToggle={() => setExpanded(expanded === rec.id ? null : rec.id)}
            onConfirm={() => handleConfirm(rec.id)}
            onHide={() => handleHide(rec.id)}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({
  rec, isExpanded, onToggle, onConfirm, onHide,
}: {
  rec: SummerCourseRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onHide: () => void;
}) {
  const student = STUDENTS.find((s) => s.name === rec.student_name);
  const statusBadge = {
    pending: <Badge variant="warning">في انتظار المراجعة</Badge>,
    confirmed: <Badge variant="success">مؤكد ومرئي للطالب</Badge>,
    hidden: <Badge variant="neutral">مخفي عن الطالب</Badge>,
  }[rec.status];

  return (
    <Card className="overflow-hidden">
      {/* Student header */}
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-right transition hover:bg-[#1a1a1a]">
        <Avatar initials={student?.avatar ?? rec.student_name.slice(0, 2).toUpperCase()} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{rec.student_name}</p>
          <p className="text-xs text-neutral-500">{student?.grade ?? 'طالب'}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          <span className="text-[10px] text-neutral-500">{rec.courses.length} كورس مقترح</span>
          <ChevronDown size={18} className={cn('text-neutral-500 transition-transform', isExpanded && 'rotate-180')} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-[#2a2a2a] p-4 space-y-4 animate-fade-in">
          {/* AI reasoning */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">ليه النظام اختار الكورسات دي تحديداً؟</span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">{rec.ai_reasoning}</p>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-white">الأدلة والتحليل</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {rec.evidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-[#141414] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                    {ev.factor.includes('قوة') ? <TrendingUp size={14} className="text-emerald-400" /> :
                     ev.factor.includes('تركيز') ? <Target size={14} className="text-amber-400" /> :
                     ev.factor.includes('تعلم') ? <Brain size={14} className="text-blue-400" /> :
                     ev.factor.includes('تفاعل') ? <Sparkles size={14} className="text-purple-400" /> :
                     <Clock size={14} className="text-neutral-400" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500">{ev.factor}</p>
                    <p className="text-xs text-neutral-200">{ev.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-white">الكورسات المقترحة</span>
            </div>
            <div className="space-y-2">
              {rec.courses.map((course, i) => (
                <div key={i} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{course.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          {course.match_score}% تطابق
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{course.description}</p>
                    </div>
                    <Badge variant="neutral">{course.duration}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#2a2a2a]">
                    <Sparkles size={12} className="text-emerald-400 shrink-0" />
                    <p className="text-xs text-neutral-500">{course.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {rec.status !== 'confirmed' && (
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <Eye size={16} />
                تأكيد وعرض للطالب
              </button>
            )}
            {rec.status !== 'hidden' && (
              <button
                onClick={onHide}
                className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400 transition hover:bg-neutral-700 hover:text-white"
              >
                <EyeOff size={16} />
                إخفاء عن الطالب
              </button>
            )}
            {rec.status === 'confirmed' && (
              <span className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 size={16} />
                الكورسات مرئية الآن في صفحة الطالب
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

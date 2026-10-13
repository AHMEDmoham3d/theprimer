import { FileText, Download, Award, TrendingUp, Clock, CheckCircle2, Star, Sun } from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { PROGRESS_REPORTS, CURRENT_STUDENT } from '@/data/mockData';
import type { ParentPageProps } from './types';

export function ParentReports({ onNavigate }: ParentPageProps) {
  const report = PROGRESS_REPORTS.find((r) => r.studentId === CURRENT_STUDENT.id);
  const childName = CURRENT_STUDENT.name.split(' ')[0];

  if (!report) {
    return (
      <Card>
        <div className="py-12 text-center">
          <FileText size={40} className="mx-auto mb-4 text-neutral-600" />
          <h3 className="text-lg font-bold text-white">التقرير هيكون جاهز في آخر الترم</h3>
          <p className="text-sm text-neutral-400 mt-2">النظام بيجمع بيانات {childName} كل يوم عشان يولّد تقرير دقيق</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">تقارير {childName}</h2>
        <button className="btn-secondary text-xs"><Download size={16} /> تحميل PDF</button>
      </div>

      {/* Main report */}
      <Card className="border-white/10 bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">تقرير نهاية الترم</h3>
            <p className="text-sm text-neutral-400">{report.term} — {childName}</p>
          </div>
          <Badge variant="success" className="mr-auto">جاهز</Badge>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-[#141414] p-4 text-center">
            <Clock size={20} className="mx-auto mb-2 text-neutral-400" />
            <p className="text-2xl font-bold text-white">{report.totalSessions}</p>
            <p className="text-[10px] text-neutral-500 mt-1">جلسات</p>
          </div>
          <div className="rounded-xl bg-[#141414] p-4 text-center">
            <TrendingUp size={20} className="mx-auto mb-2 text-neutral-400" />
            <p className="text-2xl font-bold text-white">{report.activeLearningHours}س</p>
            <p className="text-[10px] text-neutral-500 mt-1">ساعات تعلم فعلي</p>
          </div>
          <div className="rounded-xl bg-[#141414] p-4 text-center">
            <CheckCircle2 size={20} className="mx-auto mb-2 text-neutral-400" />
            <p className="text-2xl font-bold text-white">{report.attendanceRate}%</p>
            <p className="text-[10px] text-neutral-500 mt-1">نسبة الحضور</p>
          </div>
        </div>

        {/* Fastest topics */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-white mb-3">أسرع المواضيع إتقاناً</p>
          <div className="flex flex-wrap gap-2">
            {report.fastestTopics.map((topic, i) => (
              <div key={topic} className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2">
                <Star size={14} className="text-green-400" />
                <span className="text-sm text-green-300">{topic}</span>
                <span className="text-xs text-neutral-500">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Natural intuition */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-white mb-3">مناطق الحدس الطبيعي</p>
          <div className="flex flex-wrap gap-2">
            {report.naturalIntuitionAreas.map((area) => (
              <Badge key={area} variant="info">{area}</Badge>
            ))}
          </div>
        </div>

        {/* Suggested skill */}
        <div className="rounded-xl border border-white/20 bg-[#141414] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Award size={22} className="text-white" />
            <h4 className="font-bold text-white">المهارة المقترحة</h4>
          </div>
          <p className="text-lg text-white mb-2">{report.suggestedSkill}</p>
          <p className="text-sm text-neutral-400">
            بناءً على 3 شهور من أداء {childName} الفعلي، النظام لاحظ إنه عنده حدس طبيعي في المجالات دي.
            كورس الصيف هيبني عليها.
          </p>
        </div>
      </Card>

      {/* Summer course */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-[#141414]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Sun size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{report.summerCourseTitle}</h3>
            <p className="text-sm text-neutral-400 mt-1">
              8 أسابيع مخصصة لـ {childName} بناءً على بيانات الترم. 300 جنيه للبرنامج كاملاً.
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-400">سعة الكورس</span>
                <span className="text-amber-400">15/20 مسجل</span>
              </div>
              <ProgressBar value={75} color="#b45309" />
            </div>
            <button onClick={() => onNavigate('billing')} className="btn-primary mt-4 text-xs">
              سجّل في كورس الصيف
            </button>
          </div>
        </div>
      </Card>

      {/* Personal message */}
      <Card>
        <h3 className="mb-3 font-bold text-white">رسالة من مدرّس {childName}</h3>
        <div className="rounded-xl bg-[#141414] p-5">
          <p className="text-sm text-neutral-200 leading-relaxed">
            "يا {childName}، كنا مع بعض 3 شهور — وعندي حاجة مهمة أقولهالك. لاحظت إنك لما بتيجي لمسألة هندسية، بتحلها بطريقة مختلفة عن باقي الطلاب. ده مش صدفة. خليت لك برنامج صيف عشان تبني عليها. جاهز؟"
          </p>
        </div>
      </Card>
    </div>
  );
}

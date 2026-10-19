import { useState, useEffect } from 'react';
import { CheckCircle2, BookOpen, Loader2, ShieldCheck } from 'lucide-react';
import { fetchCurricula, updateStudentCurriculum, type CurriculumRow } from '@/lib/db';
import { cn } from '@/lib/utils';

interface CurriculumSelectorProps {
  studentId: string;
  currentCurriculumId?: string | null;
  onCurriculumUpdated?: (curriculumName: string) => void;
}

export function CurriculumSelector({ studentId, currentCurriculumId, onCurriculumUpdated }: CurriculumSelectorProps) {
  const [curricula, setCurricula] = useState<CurriculumRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentCurriculumId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCurricula();
      setCurricula(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    const chosen = curricula.find((c) => c.id === selectedId);
    if (!chosen) {
      setSaving(false);
      return;
    }

    const curriculumName = chosen.name_ar || chosen.name;
    const success = await updateStudentCurriculum(studentId, chosen.id, curriculumName);
    
    setSaving(false);
    if (success) {
      setSuccessMessage(true);
      if (onCurriculumUpdated) {
        onCurriculumUpdated(curriculumName);
      }
      setTimeout(() => setSuccessMessage(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
        <Loader2 className="animate-spin text-neutral-400" size={24} />
        <span className="mr-2 text-xs text-neutral-400">جاري تحميل المناهج الدراسية...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 w-full shadow-2xl my-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">اختر نظامك الدراسي والمنهج</h3>
          <p className="text-xs text-neutral-400">علشان نخصص ليك المدرس الذكي والدروس حسب نظامك بدقة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {curricula.map((curr) => {
          const isSelected = selectedId === curr.id;
          return (
            <div
              key={curr.id}
              onClick={() => setSelectedId(curr.id)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all',
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg'
                  : 'border-[#2a2a2a] bg-[#0f0f0f] hover:border-neutral-700'
              )}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="curriculum"
                  checked={isSelected}
                  onChange={() => setSelectedId(curr.id)}
                  className="accent-emerald-500 h-4 w-4 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold text-white truncate">{curr.name_ar || curr.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 uppercase shrink-0">
                    {curr.school_type}
                  </span>
                </div>
                {curr.description && (
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">{curr.description}</p>
                )}
              </div>
              {isSelected && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
            </div>
          );
        })}

        {curricula.length === 0 && (
          <p className="col-span-2 text-xs text-amber-400 text-center py-4">
            لا توجد مناهج مضافة في قاعدة البيانات حالياً. تأكد من إضافة بيانات في جدول (curricula).
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
        {successMessage ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-pulse">
            <ShieldCheck size={14} /> تم حفظ وتحديث المنهج بنجاح!
          </span>
        ) : (
          <span className="text-xs text-neutral-500">سيتم تطبيق التغييرات فوراً على المدرس الذكي</span>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !selectedId}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition disabled:opacity-50 shadow-md"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          <span>حفظ المنهج</span>
        </button>
      </div>
    </div>
  );
}

// دعم التصدير الافتراضي أيضاً لمنع أي خطأ مطبعي في الاستيراد مستقبلاً
export default CurriculumSelector;
import { useState, useEffect } from 'react';
import {
  ArrowLeft, GraduationCap, Shield, Globe,
  ChevronLeft, Check, Sparkles, Loader2, User,
  Users, ArrowRight, Zap, MessageCircle,
} from 'lucide-react';
import type { Role } from '@/types';
import { useLang } from '@/lib/i18n';
import { fetchCurricula, createStudent, sendWhatsAppMessagePaced, type CurriculumRow } from '@/lib/db';
import { Logo } from '@/components/Logo';

interface SmartPortalProps {
  onChoose: (role: Role, schoolId?: string) => void;
  onBack: () => void;
}

type Step = 'welcome' | 'student-onboard' | 'parent-onboard';

export function SmartPortal({ onChoose, onBack }: SmartPortalProps) {
  const { t, lang, setLang } = useLang();
  const [step, setStep] = useState<Step>('welcome');
  const [curricula, setCurricula] = useState<CurriculumRow[]>([]);

  useEffect(() => {
    fetchCurricula().then(setCurricula);
  }, []);

  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('grade1');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [selectedCurriculumName, setSelectedCurriculumName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const grades = [t.grade1, t.grade2, t.grade3];
  const gradeKeys = ['grade1', 'grade2', 'grade3'];

  const handleStudentSubmit = async () => {
    setError('');
    if (!studentName.trim() || !parentPhone.trim()) {
      setError(t.nameRequired);
      return;
    }
    setSubmitting(true);
    const gradeLabel = grades[gradeKeys.indexOf(studentGrade)] ?? t.grade1;
    const student = await createStudent({
      name: studentName,
      grade: gradeLabel,
      school_id: null,
      school_name: '',
      curriculum_id: selectedCurriculumId,
      curriculum_name: selectedCurriculumName,
      parent_name: parentName,
      parent_phone: parentPhone,
      parent_email: parentEmail,
      student_phone: studentPhone,
      student_email: studentEmail,
    });
    if (!student) {
      setSubmitting(false);
      setError(t.registrationError);
      return;
    }

    const companyNumber = '+20 100 123 4567';
    if (parentPhone) {
      await sendWhatsAppMessagePaced({
        student_id: student.id,
        student_name: studentName,
        recipient: 'parent',
        recipient_phone: parentPhone,
        recipient_name: parentName || t.parent,
        recipient_email: parentEmail,
        content: lang === 'ar'
          ? `أهلاً بك في The Primer! ابنك ${studentName} تم تسجيله بنجاح. مدرّسه الشخصي جاهز 24/7. المنهج: ${selectedCurriculumName || 'سيتم تحديده'}.`
          : `Welcome to The Primer! Your child ${studentName} has been registered. Their personal tutor is ready 24/7. Curriculum: ${selectedCurriculumName || 'TBD'}.`,
        trigger_type: 'welcome',
        company_sending_number: companyNumber,
      });
    }
    if (studentPhone) {
      await sendWhatsAppMessagePaced({
        student_id: student.id,
        student_name: studentName,
        recipient: 'student',
        recipient_phone: studentPhone,
        recipient_name: studentName,
        recipient_email: studentEmail,
        content: lang === 'ar'
          ? `أهلاً ${studentName}! مدرّسك الشخصي في The Primer جاهز. اسأل أي سؤال في أي وقت — أنا هنا 24/7.`
          : `Hi ${studentName}! Your personal tutor at The Primer is ready. Ask any question anytime — I'm here 24/7.`,
        trigger_type: 'welcome',
        company_sending_number: companyNumber,
      });
    }

    setSubmitting(false);
    onChoose('student');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <button
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white hover:text-white"
      >
        <Globe size={16} /> {lang === 'ar' ? 'English' : 'العربية'}
      </button>

      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.portalTitle}</h1>
          <p className="text-sm text-neutral-400 mt-2">{t.portalSubtitle}</p>
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                <Sparkles size={18} />
              </div>
              <div className="rounded-2xl rounded-tr-sm border border-[#2a2a2a] bg-[#141414] p-4">
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {lang === 'ar'
                    ? 'أهلاً بيك! أنا The Primer — مدرّسك الشخصي الذكي. عشان أقدر أساعدك صح، محتاج أعرف إنت مين. اختار اللي يناسبك تحت.'
                    : 'Welcome! I\'m The Primer — your personal AI tutor. To help you the right way, I need to know who you are. Choose what fits you below.'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => { setStep('student-onboard'); }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-[#2a2a2a] bg-gradient-to-l from-[#141414] to-[#0f0f0f] p-5 text-right transition hover:border-white hover:from-[#1a1a1a]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-white transition group-hover:bg-white group-hover:text-black">
                  <GraduationCap size={26} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white">{t.newStudent}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{t.newStudentDesc}</p>
                </div>
                {lang === 'ar' ? <ArrowLeft size={20} className="text-neutral-600 group-hover:text-white transition" /> : <ArrowRight size={20} className="text-neutral-600 group-hover:text-white transition" />}
              </button>

              <button
                onClick={() => setStep('parent-onboard')}
                className="group flex w-full items-center gap-4 rounded-2xl border border-[#2a2a2a] bg-gradient-to-l from-[#141414] to-[#0f0f0f] p-5 text-right transition hover:border-white hover:from-[#1a1a1a]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-white transition group-hover:bg-white group-hover:text-black">
                  <Users size={26} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white">{t.parent}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{t.parentDesc}</p>
                </div>
                {lang === 'ar' ? <ArrowLeft size={20} className="text-neutral-600 group-hover:text-white transition" /> : <ArrowRight size={20} className="text-neutral-600 group-hover:text-white transition" />}
              </button>
            </div>

            <button onClick={onBack} className="mx-auto flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition pt-2">
              <Globe size={16} /> {t.backToHome}
            </button>
          </div>
        )}

        {/* Step: Student Onboarding */}
        {step === 'student-onboard' && (
          <div className="animate-fade-in space-y-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
              <div className="flex gap-3 mb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                  <GraduationCap size={18} />
                </div>
                <div className="rounded-2xl rounded-tr-sm border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                  <p className="text-sm text-neutral-200">
                    {lang === 'ar'
                      ? 'تمام! عشان أقدر أذاكر معاك صح، محتاج أعرف شوية حاجات عنك. مفيش حاجة هتاخد وقت.'
                      : 'Great! To study with you properly, I need to know a few things about you. This won\'t take long.'}
                  </p>
                </div>
              </div>

              {/* Curriculum selection */}
              <div className="mb-4">
                <p className="text-xs text-neutral-400 mb-2">{t.selectCurriculum}</p>
                <div className="flex flex-wrap gap-2">
                  {curricula.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCurriculumId(c.id); setSelectedCurriculumName(c.name); }}
                      className={`rounded-lg border px-3 py-2 text-xs transition ${
                        selectedCurriculumId === c.id ? 'border-white bg-[#1a1a1a] text-white' : 'border-[#2a2a2a] bg-[#0f0f0f] text-neutral-400 hover:border-[#444]'
                      }`}
                    >
                      {lang === 'ar' ? (c.name_ar || c.name) : c.name}
                    </button>
                  ))}
                  {curricula.length === 0 && (
                    <p className="text-xs text-neutral-500">{t.loading}</p>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <FormField label={t.studentName} value={studentName} onChange={setStudentName} placeholder={lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'} />
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block">{t.grade}</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#555]"
                  >
                    {grades.map((g, i) => <option key={gradeKeys[i]} value={gradeKeys[i]}>{g}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t.studentPhone} value={studentPhone} onChange={setStudentPhone} placeholder="010xxxxxxxx" />
                  <FormField label={t.studentEmail} value={studentEmail} onChange={setStudentEmail} placeholder="student@email.com" />
                </div>
                <div className="pt-2 border-t border-[#2a2a2a]">
                  <p className="text-xs text-neutral-500 mb-3">{t.parentInfo}</p>
                  <FormField label={t.parentName} value={parentName} onChange={setParentName} placeholder={lang === 'ar' ? 'محمد عبد الرحمن' : 'Mohamed Abdelrahman'} />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <FormField label={t.parentPhone} value={parentPhone} onChange={setParentPhone} placeholder="010xxxxxxxx" required />
                    <FormField label={t.parentEmail} value={parentEmail} onChange={setParentEmail} placeholder="parent@email.com" />
                  </div>
                </div>
              </div>

              {(parentPhone || studentPhone) && (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-green-300">
                      {lang === 'ar' ? 'هنرسل رسالة واتساب ترحيب أوتوماتيك:' : 'Auto WhatsApp welcome will be sent to:'}
                    </span>
                  </div>
                  {parentPhone && <p className="text-[10px] text-neutral-400">{t.parent}: {parentPhone} {parentEmail && `· ${parentEmail}`}</p>}
                  {studentPhone && <p className="text-[10px] text-neutral-400">{t.newStudent}: {studentPhone} {studentEmail && `· ${studentEmail}`}</p>}
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleStudentSubmit}
                disabled={submitting}
                className="btn-primary w-full mt-5 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {submitting ? t.registering : t.startStudying}
              </button>
            </div>
            <BackButton onClick={() => setStep('welcome')} label={t.back} />
          </div>
        )}

        {/* Step: Parent Onboard */}
        {step === 'parent-onboard' && (
          <div className="animate-fade-in space-y-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6">
              <div className="flex gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                  <Users size={18} />
                </div>
                <div className="rounded-2xl rounded-tr-sm border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                  <p className="text-sm text-neutral-200">
                    {lang === 'ar'
                      ? 'أهلاً بيك! تقدر تتابع تقدّم ابنك وتشوف تقاريره مباشرة. ادخل دلوقتي.'
                      : 'Welcome! You can track your child\'s progress and view their reports directly. Enter now.'}
                  </p>
                </div>
              </div>
              <button onClick={() => onChoose('parent')} className="btn-primary w-full text-xs">
                {t.enterDirectly}
                {lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>
            <BackButton onClick={() => setStep('welcome')} label={t.back} />
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, required }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-neutral-400 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#555]"
      />
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="mx-auto flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition">
      <ChevronLeft size={16} /> {label}
    </button>
  );
}
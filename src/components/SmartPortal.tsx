
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Globe,
  ChevronLeft,
  Sparkles,
  Loader2,
  Users,
  ArrowRight,
  Zap,
  MessageCircle,
} from 'lucide-react';
import type { Role } from '@/types';
import { useLang } from '@/lib/i18n';
import {
  fetchCurricula,
  fetchCurriculumGrades,
  createStudent,
  sendWhatsAppMessagePaced,
  type CurriculumRow,
  type CurriculumGradeRow,
} from '@/lib/db';
import { Logo } from '@/components/Logo';

interface SmartPortalProps {
  onChoose: (role: Role, entityId?: string) => void;
  onBack: () => void;
}

type Step = 'welcome' | 'student-onboard' | 'parent-onboard';

export function SmartPortal({ onChoose, onBack }: SmartPortalProps) {
  const { t, lang, setLang } = useLang();

  const [step, setStep] = useState<Step>('welcome');
  const [curricula, setCurricula] = useState<CurriculumRow[]>([]);
  const [curriculumGrades, setCurriculumGrades] = useState<CurriculumGradeRow[]>([]);
  const [loadingCurricula, setLoadingCurricula] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [studentStage, setStudentStage] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [selectedCurriculumName, setSelectedCurriculumName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCurricula() {
      setLoadingCurricula(true);

      try {
        const rows = await fetchCurricula();

        if (!cancelled) {
          setCurricula(rows);
        }
      } catch (err) {
        console.error('Failed to load curricula:', err);

        if (!cancelled) {
          setError(
            lang === 'ar'
              ? 'حصل خطأ أثناء تحميل المناهج الدراسية.'
              : 'Failed to load curricula.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCurricula(false);
        }
      }
    }

    void loadCurricula();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const stageOptions = Array.from(
    new Map(
      curriculumGrades.map((grade) => [
        grade.stage,
        {
          value: grade.stage,
          ar: getStageLabel(grade.stage, 'ar'),
          en: getStageLabel(grade.stage, 'en'),
        },
      ])
    ).values()
  );

  const gradeOptions = curriculumGrades.filter(
    (grade) => grade.stage === studentStage
  );

  useEffect(() => {
    const curriculumId = selectedCurriculumId;

    if (curriculumId === null || curriculumId === '') {
      setCurriculumGrades([]);
      setStudentStage('');
      setStudentGrade('');
      setLoadingGrades(false);
      return;
    }

    let cancelled = false;

    async function loadGrades(curriculumId: string) {
      setLoadingGrades(true);
      setCurriculumGrades([]);
      setStudentStage('');
      setStudentGrade('');
      setError('');

      try {
        const grades = await fetchCurriculumGrades(curriculumId);

        if (cancelled) {
          return;
        }

        setCurriculumGrades(grades);

        if (grades.length > 0) {
          setStudentStage(grades[0].stage);
          setStudentGrade(grades[0].grade_code);
        } else {
          setError(
            lang === 'ar'
              ? 'المنهج ده مفيش له صفوف دراسية مسجلة حاليًا.'
              : 'No grades are configured for this curriculum.'
          );
        }
      } catch (err) {
        console.error('Failed to load curriculum grades:', err);

        if (!cancelled) {
          setCurriculumGrades([]);
          setStudentStage('');
          setStudentGrade('');
          setError(
            lang === 'ar'
              ? 'حصل خطأ أثناء تحميل الصفوف الدراسية.'
              : 'Failed to load curriculum grades.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingGrades(false);
        }
      }
    }

    void loadGrades(curriculumId);

    return () => {
      cancelled = true;
    };
  }, [selectedCurriculumId, lang]);

  useEffect(() => {
    const validGrades = curriculumGrades.filter(
      (grade) => grade.stage === studentStage
    );

    if (!validGrades.some((grade) => grade.grade_code === studentGrade)) {
      setStudentGrade(validGrades[0]?.grade_code ?? '');
    }
  }, [studentStage, curriculumGrades, studentGrade]);

  const handleStudentSubmit = async () => {
    setError('');

    const curriculumId = selectedCurriculumId;

    if (!curriculumId) {
      setError(
        lang === 'ar'
          ? 'من فضلك اختار المنهج الدراسي الأول.'
          : 'Please select a curriculum first.'
      );
      return;
    }

    if (!studentName.trim() || !parentPhone.trim()) {
      setError(t.nameRequired);
      return;
    }

    if (loadingGrades) {
      setError(
        lang === 'ar'
          ? 'استنى لحد ما الصفوف الدراسية تتحمّل.'
          : 'Please wait for the available grades to load.'
      );
      return;
    }

    const selectedGrade = curriculumGrades.find(
      (grade) =>
        grade.stage === studentStage &&
        grade.grade_code === studentGrade
    );

    if (!selectedGrade) {
      setError(
        lang === 'ar'
          ? 'مفيش صف دراسي صالح للاختيار في المنهج ده. راجع الصفوف المسجلة في قاعدة البيانات.'
          : 'No valid grade is available for this curriculum. Check the grades in the database.'
      );
      return;
    }

    setSubmitting(true);

    const gradeLabel =
      lang === 'ar'
        ? selectedGrade.grade_name_ar || selectedGrade.grade_name
        : selectedGrade.grade_name || selectedGrade.grade_name_ar;

    try {
      const createdStudent = await createStudent({
        name: studentName.trim(),
        grade: gradeLabel,
        stage: selectedGrade.stage,
        grade_code: selectedGrade.grade_code,
        school_id: null,
        school_name: '',
        curriculum_id: curriculumId,
        curriculum_name: selectedCurriculumName,
        parent_name: parentName.trim(),
        parent_phone: parentPhone.trim(),
        parent_email: parentEmail.trim(),
        student_phone: studentPhone.trim(),
        student_email: studentEmail.trim(),
      });

      if (!createdStudent?.id) {
        setError(t.registrationError);
        return;
      }

      const realStudentId = createdStudent.id;

      localStorage.setItem('current_student_id', realStudentId);

      try {
        const companyNumber = '+20 100 123 4567';

        if (parentPhone.trim()) {
          await sendWhatsAppMessagePaced({
            student_id: realStudentId,
            student_name: studentName.trim(),
            recipient: 'parent',
            recipient_phone: parentPhone.trim(),
            recipient_name: parentName.trim() || t.parent,
            recipient_email: parentEmail.trim(),
            content:
              lang === 'ar'
                ? `أهلاً بك في The Primer! ابنك ${studentName.trim()} تم تسجيله بنجاح. مدرّسه الشخصي جاهز 24/7. المنهج: ${selectedCurriculumName || 'سيتم تحديده'}، الصف: ${gradeLabel}.`
                : `Welcome to The Primer! Your child ${studentName.trim()} has been registered. Their personal tutor is ready 24/7. Curriculum: ${selectedCurriculumName || 'TBD'}, grade: ${gradeLabel}.`,
            trigger_type: 'welcome',
            company_sending_number: companyNumber,
          });
        }

        if (studentPhone.trim()) {
          await sendWhatsAppMessagePaced({
            student_id: realStudentId,
            student_name: studentName.trim(),
            recipient: 'student',
            recipient_phone: studentPhone.trim(),
            recipient_name: studentName.trim(),
            recipient_email: studentEmail.trim(),
            content:
              lang === 'ar'
                ? `أهلاً ${studentName.trim()}! مدرّسك الشخصي في The Primer جاهز. اسأل أي سؤال في أي وقت — أنا هنا 24/7.`
                : `Hi ${studentName.trim()}! Your personal tutor at The Primer is ready. Ask any question anytime — I'm here 24/7.`,
            trigger_type: 'welcome',
            company_sending_number: companyNumber,
          });
        }
      } catch (whatsappErr) {
        console.error(
          'WhatsApp notification skipped/failed safely:',
          whatsappErr
        );
      }

      onChoose('student', realStudentId);
    } catch (registrationErr) {
      console.error('Student registration failed:', registrationErr);
      setError(t.registrationError);
    } finally {
      setSubmitting(false);
    }
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
                    : "Welcome! I'm The Primer — your personal AI tutor. To help you the right way, I need to know who you are. Choose what fits you below."}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setStep('student-onboard')}
                className="group flex w-full items-center gap-4 rounded-2xl border border-[#2a2a2a] bg-gradient-to-l from-[#141414] to-[#0f0f0f] p-5 text-right transition hover:border-white hover:from-[#1a1a1a]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-white transition group-hover:bg-white group-hover:text-black">
                  <GraduationCap size={26} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white">{t.newStudent}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{t.newStudentDesc}</p>
                </div>
                {lang === 'ar' ? (
                  <ArrowLeft size={20} className="text-neutral-600 group-hover:text-white transition" />
                ) : (
                  <ArrowRight size={20} className="text-neutral-600 group-hover:text-white transition" />
                )}
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
                {lang === 'ar' ? (
                  <ArrowLeft size={20} className="text-neutral-600 group-hover:text-white transition" />
                ) : (
                  <ArrowRight size={20} className="text-neutral-600 group-hover:text-white transition" />
                )}
              </button>
            </div>

            <button
              onClick={onBack}
              className="mx-auto flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition pt-2"
            >
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
                      : "Great! To study with you properly, I need to know a few things about you. This won't take long."}
                  </p>
                </div>
              </div>

              {/* Curriculum selection */}
              <div className="mb-4">
                <p className="text-xs text-neutral-400 mb-2">{t.selectCurriculum}</p>
                <div className="flex flex-wrap gap-2">
                  {curricula.map((curriculum) => (
                    <button
                      key={curriculum.id}
                      type="button"
                      onClick={() => {
                        setSelectedCurriculumId(curriculum.id);
                        setSelectedCurriculumName(curriculum.name_ar || curriculum.name);
                        setError('');
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs transition ${
                        selectedCurriculumId === curriculum.id
                          ? 'border-white bg-[#1a1a1a] text-white'
                          : 'border-[#2a2a2a] bg-[#0f0f0f] text-neutral-400 hover:border-[#444]'
                      }`}
                    >
                      {lang === 'ar'
                        ? curriculum.name_ar || curriculum.name
                        : curriculum.name}
                    </button>
                  ))}

                  {loadingCurricula && (
                    <p className="text-xs text-neutral-500">{t.loading}</p>
                  )}

                  {!loadingCurricula && curricula.length === 0 && (
                    <p className="text-xs text-neutral-500">
                      {lang === 'ar'
                        ? 'مفيش مناهج متاحة حاليًا.'
                        : 'No curricula are currently available.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <FormField
                  label={t.studentName}
                  value={studentName}
                  onChange={setStudentName}
                  placeholder={lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">
                      {lang === 'ar' ? 'المرحلة الدراسية' : 'School stage'}
                    </label>
                    <select
                      value={studentStage}
                      onChange={(event) => {
                        setStudentStage(event.target.value);
                        setError('');
                      }}
                      disabled={
                        !selectedCurriculumId ||
                        loadingGrades ||
                        stageOptions.length === 0
                      }
                      className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#555] disabled:opacity-50"
                    >
                      {stageOptions.length === 0 && (
                        <option value="">
                          {loadingGrades
                            ? lang === 'ar'
                              ? 'جاري تحميل المراحل...'
                              : 'Loading stages...'
                            : lang === 'ar'
                              ? 'اختار المنهج الأول'
                              : 'Select curriculum first'}
                        </option>
                      )}

                      {stageOptions.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {lang === 'ar' ? stage.ar : stage.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">
                      {t.grade}
                    </label>
                    <select
                      value={studentGrade}
                      onChange={(event) => {
                        setStudentGrade(event.target.value);
                        setError('');
                      }}
                      disabled={
                        !studentStage ||
                        loadingGrades ||
                        gradeOptions.length === 0
                      }
                      className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#555] disabled:opacity-50"
                    >
                      {loadingGrades && (
                        <option value="">
                          {lang === 'ar'
                            ? 'جاري تحميل الصفوف...'
                            : 'Loading grades...'}
                        </option>
                      )}

                      {!loadingGrades && gradeOptions.length === 0 && (
                        <option value="">
                          {lang === 'ar'
                            ? 'لا توجد صفوف متاحة'
                            : 'No grades available'}
                        </option>
                      )}

                      {gradeOptions.map((grade) => (
                        <option key={grade.id} value={grade.grade_code}>
                          {lang === 'ar'
                            ? grade.grade_name_ar || grade.grade_name
                            : grade.grade_name || grade.grade_name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label={t.studentPhone}
                    value={studentPhone}
                    onChange={setStudentPhone}
                    placeholder="010xxxxxxxx"
                  />
                  <FormField
                    label={t.studentEmail}
                    value={studentEmail}
                    onChange={setStudentEmail}
                    placeholder="student@email.com"
                  />
                </div>

                <div className="pt-2 border-t border-[#2a2a2a]">
                  <p className="text-xs text-neutral-500 mb-3">{t.parentInfo}</p>
                  <FormField
                    label={t.parentName}
                    value={parentName}
                    onChange={setParentName}
                    placeholder={lang === 'ar' ? 'محمد عبد الرحمن' : 'Mohamed Abdelrahman'}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <FormField
                      label={t.parentPhone}
                      value={parentPhone}
                      onChange={setParentPhone}
                      placeholder="010xxxxxxxx"
                      required
                    />
                    <FormField
                      label={t.parentEmail}
                      value={parentEmail}
                      onChange={setParentEmail}
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>
              </div>

              {(parentPhone || studentPhone) && (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-green-300">
                      {lang === 'ar'
                        ? 'هنرسل رسالة واتساب ترحيب أوتوماتيك:'
                        : 'Auto WhatsApp welcome will be sent to:'}
                    </span>
                  </div>

                  {parentPhone && (
                    <p className="text-[10px] text-neutral-400">
                      {t.parent}: {parentPhone} {parentEmail && `· ${parentEmail}`}
                    </p>
                  )}

                  {studentPhone && (
                    <p className="text-[10px] text-neutral-400">
                      {t.newStudent}: {studentPhone} {studentEmail && `· ${studentEmail}`}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleStudentSubmit}
                disabled={
                  submitting ||
                  loadingGrades ||
                  loadingCurricula
                }
                className="btn-primary w-full mt-5 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
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
                      : "Welcome! You can track your child's progress and view their reports directly. Enter now."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onChoose('parent')}
                className="btn-primary w-full text-xs"
              >
                {t.enterDirectly}
                {lang === 'ar' ? (
                  <ArrowLeft size={14} />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            </div>

            <BackButton onClick={() => setStep('welcome')} label={t.back} />
          </div>
        )}
      </div>
    </div>
  );
}

function getStageLabel(
  stage: string,
  language: 'ar' | 'en'
): string {
  const normalized = stage.trim().toLowerCase();

  const labels: Record<string, { ar: string; en: string }> = {
    primary: { ar: 'ابتدائي', en: 'Primary' },
    preparatory: { ar: 'إعدادي', en: 'Preparatory' },
    secondary: { ar: 'ثانوي', en: 'Secondary' },
    kindergarten: { ar: 'رياض أطفال', en: 'Kindergarten' },
    kg: { ar: 'رياض أطفال', en: 'Kindergarten' },
    early_years: { ar: 'السنوات المبكرة', en: 'Early Years' },
    lower_secondary: { ar: 'إعدادي', en: 'Lower Secondary' },
    middle: { ar: 'متوسط', en: 'Middle School' },
    middle_school: { ar: 'متوسط', en: 'Middle School' },
    upper_secondary: { ar: 'ثانوي', en: 'Upper Secondary' },
    pyp: { ar: 'المرحلة الابتدائية (PYP)', en: 'Primary Years (PYP)' },
    myp: { ar: 'المرحلة المتوسطة (MYP)', en: 'Middle Years (MYP)' },
    dp: { ar: 'الدبلومة (DP)', en: 'Diploma Programme (DP)' },
  };

  if (labels[normalized]) {
    return labels[normalized][language];
  }

  const readable = normalized
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return readable;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#555]"
      />
    </div>
  );
}

function BackButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="mx-auto flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
    >
      <ChevronLeft size={16} /> {label}
    </button>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send, Brain, X, PanelRightClose, PanelRightOpen,
  BookMarked, ChevronUp, ChevronDown, PenTool, Sparkles,
} from 'lucide-react';
import type { ChatMessage, Subject } from '@/types';
import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import { SUBJECT_META } from '@/data/subjects';
import { SMART_QUESTIONS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  fetchStudentProgress,
  fetchStudentSchedule,
  fetchLessonMasteryBySubject,
  fetchCurriculumSubjects,
  fetchStudentById,
  type StudentProgressRow,
  type ScheduleSlotRow,
  type LessonMasteryRow,
} from '@/lib/db';
import { askAITutor } from '@/lib/ai';
import { playTutorAudio, stopTutorAudio } from '@/lib/tts';

interface TeacherChatProps {
  messages: ChatMessage[];
  studentName: string;
}

interface SubjectDisplayName {
  label: string;
  labelAr: string;
}

const DYNAMIC_SUBJECT_WHITEBOARDS: Partial<
  Record<Subject, { title: string; steps: string[] }>
> = {
  math: {
    title: 'توضيح القاعدة الرياضية والخطوات',
    steps: [
      '1. كتابة المعطيات وتحديد المطلوب في المعادلة',
      '2. تطبيق القانون أو التفاضل المناسب خطوة بخطوة',
      '3. الوصول للحل النهائي والتحقق من صحته',
    ],
  },
  physics: {
    title: 'تحليل القوانين والقوى الفيزيائية',
    steps: [
      '1. تحديد القانون الأساسي (مثل قانون نيوتن أو الشغل)',
      '2. تعويض الأرقام والوحدات القياسية',
      '3. استنتاج النتيجة الفيزيائية',
    ],
  },
  chemistry: {
    title: 'توضيح التفاعل والروابط الكيميائية',
    steps: [
      '1. كتابة رموز العناصر المشاركة في التفاعل',
      '2. توزيع الإلكترونات وتحديد نوع الرابطة',
      '3. وزن المعادلة الكيميائية النهائية',
    ],
  },
  biology: {
    title: 'مخطط العمليات الحيوية في الخلية',
    steps: [
      '1. تحديد العضو أو الخلية المستهدفة',
      '2. توضيح مراحل الانقسام أو التفاعل الحيوي',
      '3. تلخيص الوظيفة النهائية',
    ],
  },
  history: {
    title: 'تسلسل الأحداث والتواريخ المهمة',
    steps: [
      '1. تحديد الحدث الرئيسي والأطراف المشاركة',
      '2. توضيح الأسباب والنتائج المترتبة عليه',
      '3. ربط الحدث بالسياق التاريخي العام',
    ],
  },
  english: {
    title: 'قاعدة الجرامر وبناء الجملة',
    steps: [
      '1. كتابة التكوين الأساسي للقاعدة (Structure)',
      '2. إعطاء أمثلة توضيحية للإثبات والنفي',
      '3. تطبيق تدريب سريع للتأكيد',
    ],
  },
  geography: {
    title: 'تحليل الظواهر الجغرافية والموارد',
    steps: [
      '1. تحديد الموقع أو الظاهرة على الخريطة',
      '2. دراسة العوامل المؤثرة (المناخ، التضاريس)',
      '3. استنتاج التوزيع الاقتصادي أو السكاني',
    ],
  },
};

function detectSubject(text: string, availableSubjects: Subject[]): Subject | null {
  if (!text || availableSubjects.length === 0) return null;

  const lower = text.toLowerCase();

  const keywords: Partial<Record<Subject, string[]>> = {
    math: [
      'معادلة', 'رياضيات', 'حساب', 'جبر', 'تفاضل', 'تكامل',
      'كسر', 'هندسة', 'مثلث', 'math', 'equation',
    ],
    physics: [
      'فيزياء', 'نيوتن', 'حركة', 'قوة', 'سرعة', 'شغل',
      'طاقة', 'physics', 'force',
    ],
    chemistry: [
      'كيمياء', 'رابطة', 'ذرة', 'تفاعل', 'أيون',
      'chemistry', 'atom',
    ],
    biology: [
      'أحياء', 'خلية', 'انقسام', 'وراثة', 'dna',
      'biology', 'cell',
    ],
    history: [
      'تاريخ', 'ثورة', 'سعد زغلول', 'history', 'revolution',
    ],
    english: [
      'english', 'grammar', 'tense', 'writing', 'إنجليزي', 'قواعد',
    ],
    geography: [
      'جغرافيا', 'خريطة', 'مصر', 'geography', 'map',
    ],
  };

  for (const subject of availableSubjects) {
    if (keywords[subject]?.some((kw) => lower.includes(kw))) {
      return subject;
    }
  }

  return null;
}

export function TeacherChat({
  messages: initialMessages,
  studentName,
}: TeacherChatProps) {
  // Use the real student ID; never substitute another student's ID.
  const activeStudentId =
    typeof window !== 'undefined'
      ? localStorage.getItem('current_student_id') || ''
      : '';

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages || []
  );
  const [input, setInput] = useState('');
  const [voiceOn] = useState(true);
  const [muted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState<Subject | ''>('');
  const [subjectBarOpen, setSubjectBarOpen] = useState(true);

  const [dbProgress, setDbProgress] = useState<StudentProgressRow[]>([]);
  const [dbSchedule, setDbSchedule] = useState<ScheduleSlotRow[]>([]);
  const [dbLessons, setDbLessons] = useState<LessonMasteryRow[]>([]);

  const [studentCurriculum, setStudentCurriculum] = useState(
    'جاري تحميل المنهج...'
  );
  const [studentStage, setStudentStage] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  // Dynamic names returned from curriculum_grade_subjects.
  const [subjectDisplayNames, setSubjectDisplayNames] = useState<
    Record<string, SubjectDisplayName>
  >({});

  const [studentLoadError, setStudentLoadError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, typing, drawing]);

  // Load the selected student's actual curriculum, stage, grade, and subjects.
  useEffect(() => {
    let cancelled = false;

    async function loadStudentData() {
      setDbProgress([]);
      setDbSchedule([]);
      setDbLessons([]);
      setAvailableSubjects([]);
      setSubjectDisplayNames({});
      setStudentStage('');
      setStudentGrade('');
      setStudentLoadError('');

      if (!activeStudentId) {
        setStudentCurriculum('لم يتم تحديد الطالب');
        setStudentLoadError(
          'معرّف الطالب غير موجود. سجّل دخول الطالب أو أكمل تسجيله أولًا.'
        );
        return;
      }

      try {
        const student = await fetchStudentById(activeStudentId);

        if (cancelled) return;

        if (!student) {
          setStudentCurriculum('تعذّر تحميل المنهج');
          setStudentLoadError(
            'لم نتمكن من تحميل بيانات الطالب. تأكد من تسجيل الدخول وصلاحيات قاعدة البيانات.'
          );
          return;
        }

        setStudentCurriculum(
          student.curriculum_name || 'لم يتم تحديد المنهج'
        );
        setStudentStage(student.stage || '');
        setStudentGrade(student.grade_code || student.grade || '');

        const [progress, schedule] = await Promise.all([
          fetchStudentProgress(activeStudentId),
          fetchStudentSchedule(activeStudentId),
        ]);

        if (cancelled) return;

        setDbProgress(progress);
        setDbSchedule(schedule);

        if (!student.curriculum_id) {
          setStudentLoadError(
            'لم يتم ربط الطالب بمنهج دراسي حتى الآن.'
          );
          return;
        }

        if (!student.stage || !student.grade_code) {
          setStudentLoadError(
            'المرحلة أو الصف الدراسي غير محدد في بيانات الطالب.'
          );
          return;
        }

        const curriculumSubjects = await fetchCurriculumSubjects(
          student.curriculum_id,
          student.stage,
          student.grade_code
        );

        if (cancelled) return;

        // Accept every valid subject_key returned by the database.
        // Do not restrict students to the old static ALL_SUBJECTS list.
        const validRows = curriculumSubjects.filter(
          (row) =>
            typeof row.subject_key === 'string' &&
            row.subject_key.trim().length > 0
        );

        const validSubjects = Array.from(
          new Set(
            validRows.map((row) => row.subject_key as Subject)
          )
        );

        // Keep the Arabic and English names supplied by the database.
        const namesMap: Record<string, SubjectDisplayName> = {};

        validRows.forEach((row) => {
          const key = row.subject_key;

          if (!namesMap[key]) {
            namesMap[key] = {
              label: row.subject_name || key,
              labelAr: row.subject_name_ar || row.subject_name || key,
            };
          }
        });

        setSubjectDisplayNames(namesMap);
        setAvailableSubjects(validSubjects);

        if (validSubjects.length > 0) {
          setActiveSubject((current) =>
            current && validSubjects.includes(current) ? current : validSubjects[0]
          );
        } else {
          setActiveSubject('');
          setStudentLoadError(
            'لم يتم العثور على مواد نشطة مسجلة لهذا المنهج والمرحلة والصف. اطلب من مسؤول النظام إضافة المواد من صفحة الأدمن.'
          );
        }
      } catch (error) {
        console.error('Failed to load student data:', error);

        if (!cancelled) {
          setStudentCurriculum('تعذّر تحميل المنهج');
          setStudentLoadError(
            'حدث خطأ أثناء تحميل بيانات الطالب والمنهج.'
          );
        }
      }
    }

    void loadStudentData();

    return () => {
      cancelled = true;
    };
  }, [activeStudentId]);

  // Load lesson mastery only when a real student and a valid subject exist.
  useEffect(() => {
    let cancelled = false;

    if (!activeStudentId || !activeSubject || !availableSubjects.includes(activeSubject)) {
      setDbLessons([]);
      return;
    }

    fetchLessonMasteryBySubject(activeStudentId, activeSubject)
      .then((res) => {
        if (!cancelled) {
          setDbLessons(res || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDbLessons([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeStudentId, activeSubject, availableSubjects]);

  useEffect(() => {
    return () => {
      requestIdRef.current++;
      stopTutorAudio();
    };
  }, []);

  const currentActiveLesson = useMemo(() => {
    return dbLessons.find((lesson) => lesson.unlocked && !lesson.exam_passed)
      || dbLessons[0];
  }, [dbLessons]);

  // Use database names for dynamic subjects and existing metadata for known ones.
  const activeBaseMeta = activeSubject
    ? SUBJECT_META[activeSubject]
    : { label: 'No subject selected', labelAr: 'لم يتم تحديد مادة', icon: BookMarked, accent: '#9ca3af', accentSoft: '#262626' };
  const activeSubjectNames = activeSubject
    ? subjectDisplayNames[activeSubject]
    : undefined;

  const activeMeta = {
    ...activeBaseMeta,
    label: activeSubjectNames?.label || activeBaseMeta.label,
    labelAr: activeSubjectNames?.labelAr || activeBaseMeta.labelAr,
  };

  const ActiveIcon = activeMeta.icon;

  const send = async (text?: string) => {
    const content = (text ?? input).trim();

    if (!content) return;

    if (!activeStudentId) {
      setStudentLoadError(
        'لا يمكن إرسال السؤال قبل تحديد الطالب. سجّل دخول الطالب أولًا.'
      );
      return;
    }

    if (availableSubjects.length === 0) {
      setStudentLoadError(
        'لا توجد مواد متاحة لهذا الطالب حتى الآن. راجع المنهج والمرحلة والصف المسجلين.'
      );
      return;
    }

    // Keep the detected subject inside the student's available curriculum.
    const detectedSubject = detectSubject(content, availableSubjects);
    const selectedSubject = detectedSubject
      || (activeSubject && availableSubjects.includes(activeSubject)
        ? activeSubject
        : availableSubjects[0]);

    const currentRequestId = ++requestIdRef.current;
    stopTutorAudio();

    setActiveSubject(selectedSubject);

    const studentMsg: ChatMessage = {
      id: `s-${Date.now()}`,
      role: 'student',
      text: content,
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const currentWb =
      DYNAMIC_SUBJECT_WHITEBOARDS[selectedSubject]
      || {
        title: `شرح مادة ${subjectDisplayNames[selectedSubject]?.labelAr || selectedSubject}`,
        steps: [
          '1. تحديد الفكرة أو السؤال المطلوب فهمه',
          '2. شرح المفهوم خطوة بخطوة مع أمثلة مناسبة',
          '3. مراجعة الفهم والتأكد من استيعاب النقاط الأساسية',
        ],
      };

    const messageId = `a-${Date.now()}-${currentRequestId}`;
    const useVoice = voiceOn && !muted;

    const aiMsg: ChatMessage = {
      id: messageId,
      role: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      reaction: 'encourage',
      hasWhiteboard: true,
      whiteboardSteps:
        currentWb.steps as unknown as NonNullable<
          ChatMessage['whiteboardSteps']
        >,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      studentMsg,
      aiMsg,
    ]);
    setInput('');
    setTyping(true);
    setDrawing(false);

    let responseText = '';
    let receivedFirstChunk = false;

    const gradeContext = [
      studentStage,
      studentGrade,
    ].filter(Boolean).join(' - ') || 'غير محدد';

    const curriculumContext = studentCurriculum;

    try {
      responseText = await askAITutor(
        content,
        {
          name: studentName,
          grade: gradeContext,
          weakTopics: dbProgress.map((progress) => progress.subject),
        },
        (chunk) => {
          if (currentRequestId !== requestIdRef.current) return;

          if (!receivedFirstChunk) {
            receivedFirstChunk = true;
            setTyping(false);
          }

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === messageId
                ? { ...message, text: message.text + chunk }
                : message
            )
          );
        }
      );

      if (currentRequestId !== requestIdRef.current) return;

      // Keep the final answer exactly as returned by the AI helper.
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, text: responseText }
            : message
        )
      );
    } catch (error) {
      console.warn('AI call error:', error);

      responseText =
        `يا ${studentName}، أنا معاك في ${activeMeta.labelAr}! ` +
        'حصلت مشكلة أثناء تجهيز الإجابة. جرّب تبعت سؤالك تاني بعد قليل.';

      if (currentRequestId === requestIdRef.current) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId
              ? { ...message, text: responseText }
              : message
          )
        );
      }
    }

    if (currentRequestId !== requestIdRef.current) return;

    setTyping(false);
    setDrawing(true);

    if (useVoice && responseText.trim()) {
      try {
        await playTutorAudio(responseText);
      } catch (error) {
        console.warn('Tutor audio playback failed:', error);
      }
    }

    if (currentRequestId === requestIdRef.current) {
      setDrawing(false);
    }

    // Keep curriculumContext available for curriculum-aware prompts later.
    void curriculumContext;
  };

  const suggestedQuestions = useMemo(() => {
    return SMART_QUESTIONS
      .filter((question) => question.subject === activeSubject)
      .slice(0, 3);
  }, [activeSubject]);

  const voiceActive = voiceOn && !muted;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:flex-row gap-3">
      <div className="flex flex-1 flex-col rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden min-h-0">
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] px-4 py-3 bg-gradient-to-l from-[#1a1a1a] to-[#141414]">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 border border-neutral-500 text-white font-bold text-base">
              P
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#141414] bg-green-500" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">
                {activeSubject ? `مدرّسك في ${activeMeta.labelAr}` : 'مدرّسك الشخصي'}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <BookMarked size={10} /> {studentCurriculum}
              </span>
            </div>

            <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {typing
                ? 'بجهز الإجابة...'
                : voiceActive
                  ? 'معاك دلوقتي'
                  : 'جاهز أي وقت'}
            </span>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-neutral-800 text-neutral-300 hover:text-white transition"
              aria-label={panelOpen ? 'إغلاق تفاصيل المنهج' : 'عرض تفاصيل المنهج'}
            >
              {panelOpen ? (
                <PanelRightClose size={14} />
              ) : (
                <PanelRightOpen size={14} />
              )}
            </button>
          </div>
        </div>

        {studentLoadError && (
          <div
            role="status"
            className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs leading-relaxed text-amber-300"
          >
            {studentLoadError}
          </div>
        )}

        <div className="border-b border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2">
          {availableSubjects.length === 0 ? (
            <p className="px-2 py-1 text-xs text-amber-300">لا توجد مواد مضافة لهذا الصف حتى الآن.</p>
          ) : subjectBarOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin flex-1">
                {availableSubjects.map((subj) => {
                  const baseMeta = SUBJECT_META[subj];
                  const names = subjectDisplayNames[subj];

                  const meta = {
                    ...baseMeta,
                    label: names?.label || baseMeta.label,
                    labelAr: names?.labelAr || baseMeta.labelAr,
                  };

                  const Icon = meta.icon;
                  const isActive = activeSubject === subj;

                  return (
                    <button
                      key={subj}
                      onClick={() => setActiveSubject(subj)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition shrink-0',
                        isActive
                          ? 'border-transparent text-white'
                          : 'border-[#2a2a2a] text-neutral-500 hover:text-neutral-300'
                      )}
                      style={
                        isActive
                          ? {
                              background: meta.accent + '20',
                              border: `1px solid ${meta.accent}40`,
                            }
                          : undefined
                      }
                    >
                      <Icon size={14} style={{ color: meta.accent }} />
                      {meta.labelAr}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setSubjectBarOpen(false)}
                className="text-neutral-500 hover:text-white"
                aria-label="إخفاء المواد"
              >
                <ChevronUp size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSubjectBarOpen(true)}
              className="flex items-center gap-2 text-xs text-neutral-500"
            >
              <ActiveIcon size={14} style={{ color: activeMeta.accent }} />
              <span className="font-medium">{activeMeta.labelAr}</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4 min-h-0"
        >
          {availableSubjects.length === 0 && messages.length === 0 && (
            <div className="mx-auto max-w-md rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-sm leading-7 text-neutral-300">
              لا توجد مواد دراسية متاحة لحسابك حاليًا. بمجرد أن يضيف مسؤول النظام مادة من صفحة الأدمن، ستظهر هنا تلقائيًا.
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {typing && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white font-bold">
                P
              </div>

              <div className="flex gap-1 rounded-2xl bg-[#1c1c1c] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-neutral-500"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-neutral-500"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          {drawing && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white font-bold">
                P
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-[#1c1c1c] px-4 py-3">
                <PenTool size={14} className="text-emerald-400 animate-pulse" />
                <span>جاري إعداد السبورة التفاعلية...</span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 4 && (
          <div className="border-t border-[#2a2a2a] px-4 py-3">
            <p className="text-[10px] text-neutral-500 mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> أسئلة مقترحة
            </p>

            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question.question}
                  onClick={() => void send(question.question)}
                  className="rounded-lg border border-[#2a2a2a] bg-[#1c1c1c] px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  {question.question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#2a2a2a] p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder={availableSubjects.length > 0 ? 'اسأل مدرّسك...' : 'لا توجد مواد متاحة حاليًا'}
              disabled={availableSubjects.length === 0}
              className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none"
            />

            <button
              onClick={() => void send()}
              disabled={!input.trim() || availableSubjects.length === 0}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white transition hover:bg-neutral-700 disabled:opacity-30"
              aria-label="إرسال السؤال"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {panelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border border-[#2a2a2a] bg-[#141414] p-4 md:static md:w-72 md:rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">تفاصيل المنهج</h3>
            </div>

            <button
              onClick={() => setPanelOpen(false)}
              className="text-neutral-400 hover:text-white"
              aria-label="إغلاق تفاصيل المنهج"
            >
              <X size={16} />
            </button>
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3 space-y-2">
            <p className="text-xs font-bold text-emerald-400">
              {studentCurriculum}
            </p>

            {studentStage && (
              <p className="text-xs text-neutral-300">
                المرحلة: {studentStage}
              </p>
            )}

            {studentGrade && (
              <p className="text-xs text-neutral-300">
                الصف: {studentGrade}
              </p>
            )}

            {currentActiveLesson && (
              <p className="text-xs text-neutral-400">
                الدرس الحالي: {currentActiveLesson.lesson_title}
              </p>
            )}

            <p className="text-xs text-neutral-500">
              عدد المواد المتاحة: {availableSubjects.length}
            </p>

            <p className="text-xs text-neutral-500">
              عدد مواعيد المذاكرة: {dbSchedule.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAI = message?.role === 'ai';

  return (
    <div className={cn('flex gap-2', isAI ? 'justify-start' : 'justify-end')}>
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 border border-neutral-600 text-xs font-bold text-white">
          P
        </div>
      )}

      <div className={cn('max-w-[80%] space-y-3', !isAI && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isAI
              ? 'bg-[#1c1c1c] text-neutral-100'
              : 'bg-white text-black mr-auto'
          )}
        >
          {message?.text || ''}
        </div>

        {message?.hasWhiteboard && message?.whiteboardSteps && (
          <Whiteboard
            steps={message.whiteboardSteps}
            className="max-w-md"
          />
        )}

        <span className="block text-[10px] text-neutral-600">
          {message?.timestamp || ''}
        </span>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Brain,
  X,
  PanelRightClose,
  PanelRightOpen,
  BookMarked,
  ChevronUp,
  ChevronDown,
  PenTool,
} from 'lucide-react';
import type { ChatMessage, Subject } from '@/types';
import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import { SUBJECT_META } from '@/data/subjects';
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

function detectSubject(
  text: string,
  availableSubjects: Subject[]
): Subject | null {
  if (!text || availableSubjects.length === 0) return null;

  const lower = text.toLowerCase();

  const keywords: Partial<Record<Subject, string[]>> = {
    math: [
      'معادلة',
      'رياضيات',
      'حساب',
      'جبر',
      'تفاضل',
      'تكامل',
      'كسر',
      'هندسة',
      'مثلث',
      'math',
      'equation',
    ],
    physics: [
      'فيزياء',
      'نيوتن',
      'حركة',
      'قوة',
      'سرعة',
      'شغل',
      'طاقة',
      'physics',
      'force',
    ],
    chemistry: [
      'كيمياء',
      'رابطة',
      'ذرة',
      'تفاعل',
      'أيون',
      'chemistry',
      'atom',
    ],
    biology: [
      'أحياء',
      'خلية',
      'انقسام',
      'وراثة',
      'dna',
      'biology',
      'cell',
    ],
    history: [
      'تاريخ',
      'ثورة',
      'سعد زغلول',
      'history',
      'revolution',
    ],
    english: [
      'english',
      'grammar',
      'tense',
      'writing',
      'إنجليزي',
      'قواعد',
    ],
    geography: [
      'جغرافيا',
      'خريطة',
      'مصر',
      'geography',
      'map',
    ],
  };

  for (const subject of availableSubjects) {
    if (keywords[subject]?.some((keyword) => lower.includes(keyword))) {
      return subject;
    }
  }

  return null;
}

// Supports both predefined and custom subjects added by the admin.
function getSubjectMeta(subject: Subject) {
  const meta = SUBJECT_META[subject];

  if (meta) {
    return meta;
  }

  return {
    label: subject,
    labelAr: subject,
    icon: BookMarked,
    accent: '#9ca3af',
    accentSoft: '#262626',
  };
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

  // Scroll to the latest message.
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
      setActiveSubject('');
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

        const [progress, schedule, curriculumSubjects] =
          await Promise.all([
            fetchStudentProgress(activeStudentId),
            fetchStudentSchedule(activeStudentId),
            fetchCurriculumSubjects(
              student.curriculum_id,
              student.stage,
              student.grade_code
            ),
          ]);

        if (cancelled) return;

        // Accept every valid active subject returned by the database.
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

        // Keep only progress and schedule records belonging to
        // subjects that are currently active in this student's curriculum.
        setDbProgress(
          progress.filter((item) =>
            validSubjects.includes(item.subject as Subject)
          )
        );

        setDbSchedule(
          schedule.filter((item) =>
            validSubjects.includes(item.subject as Subject)
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
          setActiveSubject(validSubjects[0]);
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

    if (
      !activeStudentId ||
      !activeSubject ||
      !availableSubjects.includes(activeSubject)
    ) {
      setDbLessons([]);
      return;
    }

    fetchLessonMasteryBySubject(activeStudentId, activeSubject)
      .then((res) => {
        if (!cancelled) {
          setDbLessons(res || []);
        }
      })
      .catch((error) => {
        console.error('Failed to load lesson mastery:', error);

        if (!cancelled) {
          setDbLessons([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeStudentId, activeSubject, availableSubjects]);

  // Stop audio and invalidate pending requests when the component unmounts.
  useEffect(() => {
    return () => {
      requestIdRef.current++;
      stopTutorAudio();
    };
  }, []);

  const currentActiveLesson = useMemo(() => {
    return (
      dbLessons.find(
        (lesson) => lesson.unlocked && !lesson.exam_passed
      ) || dbLessons[0]
    );
  }, [dbLessons]);

  // Use database names for dynamic subjects and existing metadata for known ones.
  const activeBaseMeta = activeSubject
    ? getSubjectMeta(activeSubject)
    : {
        label: 'No subject selected',
        labelAr: 'لم يتم تحديد مادة',
        icon: BookMarked,
        accent: '#9ca3af',
        accentSoft: '#262626',
      };

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

    const selectedSubject =
      detectedSubject ||
      (activeSubject && availableSubjects.includes(activeSubject)
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
      DYNAMIC_SUBJECT_WHITEBOARDS[selectedSubject] || {
        title: `شرح مادة ${
          subjectDisplayNames[selectedSubject]?.labelAr ||
          selectedSubject
        }`,
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

    // Send the actual curriculum, stage, and grade as context.
    const gradeContext = [
      studentCurriculum,
      studentStage,
      studentGrade,
    ]
      .filter(Boolean)
      .join(' - ') || 'غير محدد';

    try {
      responseText = await askAITutor(
        content,
        {
          name: studentName,
          grade: gradeContext,
          weakTopics: dbProgress.map(
            (progress) => progress.subject
          ),
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
                ? {
                    ...message,
                    text: message.text + chunk,
                  }
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
            ? {
                ...message,
                text: responseText,
              }
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
              ? {
                  ...message,
                  text: responseText,
                }
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
  };

  const voiceActive = voiceOn && !muted;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3 md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]">
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] bg-gradient-to-l from-[#1a1a1a] to-[#141414] px-4 py-3">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-500 bg-gradient-to-br from-neutral-600 to-neutral-900 text-base font-bold text-white">
              P
            </div>

            <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#141414] bg-green-500" />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-white">
                {activeSubject
                  ? `مدرّسك في ${activeMeta.labelAr}`
                  : 'مدرّسك الشخصي'}
              </span>

              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <BookMarked size={10} />
                {studentCurriculum}
              </span>
            </div>

            <span className="mt-0.5 flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />

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
              className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:text-white"
              aria-label={
                panelOpen
                  ? 'إغلاق تفاصيل المنهج'
                  : 'عرض تفاصيل المنهج'
              }
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
            <p className="px-2 py-1 text-xs text-amber-300">
              لا توجد مواد مضافة لهذا الصف حتى الآن.
            </p>
          ) : subjectBarOpen ? (
            <div className="flex items-center gap-2">
              <div className="scrollbar-thin flex flex-1 items-center gap-2 overflow-x-auto">
                {availableSubjects.map((subj) => {
                  const baseMeta = getSubjectMeta(subj);
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
                        'flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
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
                      <Icon
                        size={14}
                        style={{ color: meta.accent }}
                      />

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
              <ActiveIcon
                size={14}
                style={{ color: activeMeta.accent }}
              />

              <span className="font-medium">
                {activeMeta.labelAr}
              </span>

              <ChevronDown size={14} />
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
        >
          {availableSubjects.length === 0 && messages.length === 0 && (
            <div className="mx-auto max-w-md rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-sm leading-7 text-neutral-300">
              لا توجد مواد دراسية متاحة لحسابك حاليًا. بمجرد أن يضيف
              مسؤول النظام مادة من صفحة الأدمن، ستظهر هنا تلقائيًا.
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}

          {typing && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 font-bold text-white">
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
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 font-bold text-white">
                P
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-[#1c1c1c] px-4 py-3">
                <PenTool className="animate-pulse text-emerald-400" size={14} />

                <span>جاري إعداد السبورة التفاعلية...</span>
              </div>
            </div>
          )}
        </div>

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
              placeholder={
                availableSubjects.length > 0
                  ? 'اسأل مدرّسك...'
                  : 'لا توجد مواد متاحة حاليًا'
              }
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
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-emerald-400" />

              <h3 className="text-sm font-bold text-white">
                تفاصيل المنهج
              </h3>
            </div>

            <button
              onClick={() => setPanelOpen(false)}
              className="text-neutral-400 hover:text-white"
              aria-label="إغلاق تفاصيل المنهج"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
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
    <div
      className={cn(
        'flex gap-2',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-600 bg-gradient-to-br from-neutral-600 to-neutral-900 text-xs font-bold text-white">
          P
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] min-w-0 space-y-3',
          !isAI && 'items-end'
        )}
      >
        <div
          dir="auto"
          className={cn(
            'min-w-0 break-words rounded-2xl px-4 py-3 text-sm leading-8',
            isAI
              ? 'bg-[#1c1c1c] text-right text-neutral-100'
              : 'mr-auto bg-white text-right text-black'
          )}
        >
          {isAI ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-3 mt-4 text-xl font-bold text-white first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-3 mt-4 text-lg font-bold text-white first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-4 text-base font-bold text-emerald-400 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 whitespace-pre-wrap leading-8 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-disc space-y-2 pr-6 last:mb-0">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal space-y-2 pr-6 last:mb-0">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="pr-1 leading-8">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-emerald-400">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-neutral-300">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-3 border-r-4 border-emerald-500 pr-3 text-neutral-300">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-black/40 px-1.5 py-1 text-emerald-300">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre
                    dir="ltr"
                    className="my-3 max-w-full overflow-x-auto rounded-xl bg-black p-4 text-left text-sm leading-7 text-emerald-300"
                  >
                    {children}
                  </pre>
                ),
                hr: () => <hr className="my-4 border-neutral-700" />,
                table: ({ children }) => (
                  <div className="my-3 max-w-full overflow-x-auto">
                    <table className="w-full border-collapse text-right text-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-neutral-800">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-neutral-700 px-3 py-2 font-bold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-neutral-700 px-3 py-2">
                    {children}
                  </td>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message?.text || ''}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap leading-8">
              {message?.text || ''}
            </p>
          )}
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

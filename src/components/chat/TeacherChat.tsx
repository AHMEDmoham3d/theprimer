
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
  Mic,
  MicOff,
  Volume2,
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
import { askAITutor, type TutorLessonContext } from '@/lib/ai';
import { fetchStudentSubjectLessons } from '@/lib/studentCurriculum';
import { playTutorAudio, stopTutorAudio } from '@/lib/tts';
import { StudentVoiceListener } from '@/lib/studentVoice';
import {
  getOrCreateTutorConversation,
  fetchTutorMessages,
  saveTutorMessage,
  updateTutorConversationProgress,
  type TutorConversationRow,
} from '@/lib/tutorConversations';
interface TeacherChatProps {
  messages: ChatMessage[];
  studentName: string;
}
interface SubjectDisplayName {
  label: string;
  labelAr: string;
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
  const [isListening, setIsListening] = useState(false);
  const [speechDraft, setSpeechDraft] = useState('');
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [voiceOn] = useState(true);
  const [micMuted, setMicMuted] = useState(true);
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
  const [curriculumLessons, setCurriculumLessons] = useState<TutorLessonContext[]>([]);
  const [curriculumLessonsLoading, setCurriculumLessonsLoading] = useState(false);
  // Dynamic names returned from curriculum_grade_subjects.
  const [subjectDisplayNames, setSubjectDisplayNames] = useState<
    Record<string, SubjectDisplayName>
  >({});
  const [studentLoadError, setStudentLoadError] = useState('');
  const [conversation, setConversation] =
    useState<TutorConversationRow | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const autoStartedConversationsRef = useRef<Set<string>>(new Set());
  const studentVoiceRef = useRef<StudentVoiceListener | null>(null);
  const micEnabledRef = useRef(false);
  const micManuallyMutedRef = useRef(false);
  const tutorSpeakingRef = useRef(false);
  const tutorSpeechTextRef = useRef('');
  const voiceInterruptingTutorRef = useRef(false);
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
      setCurriculumLessons([]);
      setCurriculumLessonsLoading(false);
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
  // Load a separate saved conversation whenever the selected subject changes.
  useEffect(() => {
    let cancelled = false;
    const currentRequestId = ++requestIdRef.current;
    stopTutorAudio();
    micEnabledRef.current = false;
    setMicMuted(true);
    tutorSpeakingRef.current = false;
    setMessages([]);
    setConversation(null);
    setConversationLoading(false);
    setTyping(false);
    setDrawing(false);
    if (
      !activeStudentId ||
      !activeSubject ||
      !availableSubjects.includes(activeSubject)
    ) {
      return () => {
        cancelled = true;
      };
    }
    async function loadConversation() {
      setConversationLoading(true);
      setStudentLoadError('');
      try {
        const result = await getOrCreateTutorConversation(
          activeStudentId,
          activeSubject
        );
        if (cancelled || currentRequestId !== requestIdRef.current) return;
        const savedMessages = await fetchTutorMessages(
          result.conversation.id
        );
        if (cancelled || currentRequestId !== requestIdRef.current) return;
        setConversation(result.conversation);
        setMessages(
          savedMessages.map((message) => ({
            id: message.id,
            role: message.role === 'assistant' ? 'ai' : 'student',
            text: message.content,
            timestamp: new Date(message.created_at).toLocaleTimeString(
              'ar-EG',
              { hour: '2-digit', minute: '2-digit' }
            ),
          }))
        );
      } catch (error) {
        console.error('Failed to load tutor conversation:', error);
        if (!cancelled && currentRequestId === requestIdRef.current) {
          setStudentLoadError(
            'تعذّر تحميل محادثة المادة. راجع اتصال قاعدة البيانات وصلاحيات جداول المحادثات.'
          );
        }
      } finally {
        if (!cancelled && currentRequestId === requestIdRef.current) {
          setConversationLoading(false);
        }
      }
    }
    void loadConversation();
    return () => {
      cancelled = true;
    };
  }, [activeStudentId, activeSubject, availableSubjects]);
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
  // Load only the lessons actually published for the selected subject.
  useEffect(() => {
    let cancelled = false;
    setCurriculumLessons([]);
    if (
      !activeStudentId ||
      !activeSubject ||
      !availableSubjects.includes(activeSubject)
    ) {
      setCurriculumLessonsLoading(false);
      return () => {
        cancelled = true;
      };
    }
    async function loadPublishedLessons() {
      setCurriculumLessonsLoading(true);
      try {
        const result = await fetchStudentSubjectLessons(
          activeStudentId,
          activeSubject
        );
        if (cancelled) return;
        // The loader returns lesson records containing their parent unit.
        // Accept a single record or an array to keep this integration tolerant
        // of the helper's return shape without inventing lesson data.
        const rows = Array.isArray(result)
          ? result
          : result
            ? [result]
            : [];
        const mappedLessons: TutorLessonContext[] = rows
          .filter((item) => item?.lesson && item?.unit)
          .map((item) => ({
            lessonId: item.lesson.id,
            lessonTitle:
              item.lesson.name_ar || item.lesson.name || 'درس بدون اسم',
            unitTitle:
              item.unit.name_ar || item.unit.name || 'وحدة بدون اسم',
            content: item.lesson.content || '',
            order: item.lesson.sort_order || 0,
          }));
        setCurriculumLessons(mappedLessons);
      } catch (error) {
        console.error('Failed to load published curriculum lessons:', error);
        if (!cancelled) {
          setCurriculumLessons([]);
          setStudentLoadError(
            'تعذّر تحميل دروس المادة المنشورة. لن يبدأ المدرس شرح درس غير متاح من المنهج.'
          );
        }
      } finally {
        if (!cancelled) {
          setCurriculumLessonsLoading(false);
        }
      }
    }
    void loadPublishedLessons();
    return () => {
      cancelled = true;
    };
  }, [activeStudentId, activeSubject, availableSubjects]);
  // Stop audio and invalidate pending requests when the component unmounts.
  useEffect(() => {
    return () => {
      requestIdRef.current++;
      micEnabledRef.current = false;
      studentVoiceRef.current?.stop();
      studentVoiceRef.current = null;
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
  const getGradeContext = () => {
    return [
      studentCurriculum,
      studentStage,
      studentGrade,
    ]
      .filter(Boolean)
      .join(' - ') || 'غير محدد';
  };
  const getSubjectContext = () => ({
    name: studentName,
    grade: getGradeContext(),
    stage: studentStage,
    curriculum: studentCurriculum,
    subject: activeSubject || undefined,
    subjectName: activeMeta.labelAr,
    weakTopics: dbProgress
      .filter((progress) => progress.subject === activeSubject)
      .flatMap((progress) => progress.weaknesses || []),
  });
  const getConversationHistory = () =>
    messages
      .filter((message) => message.text?.trim())
      .map((message) => ({
        role: message.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: message.text,
      }))
      .slice(-30);
  const createAssistantMessage = (id: string): ChatMessage => ({
    id,
    role: 'ai',
    text: '',
    timestamp: new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    reaction: 'encourage',
    hasWhiteboard: false,
    whiteboardSteps: [],
  });
  const runTutorResponse = async (
    prompt: string,
    options: {
      isFirstMessage: boolean;
      history: { role: 'user' | 'assistant'; content: string }[];
      conversationRow: TutorConversationRow;
      messageId: string;
    }
  ) => {
    const currentRequestId = requestIdRef.current;
    const useVoice = voiceOn;
    let responseText = '';
    let receivedFirstChunk = false;
    setMessages((currentMessages) => [
      ...currentMessages,
      createAssistantMessage(options.messageId),
    ]);
    setTyping(true);
    setDrawing(false);
    try {
      responseText = await askAITutor(
        prompt,
        getSubjectContext(),
        (chunk) => {
          if (currentRequestId !== requestIdRef.current) return;
          if (!receivedFirstChunk) {
            receivedFirstChunk = true;
            setTyping(false);
          }
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === options.messageId
                ? { ...message, text: message.text + chunk }
                : message
            )
          );
        },
        {
          conversationHistory: options.history,
          isFirstMessage: options.isFirstMessage,
          lastLessonTitle:
            options.conversationRow.last_lesson_title ||
            currentActiveLesson?.lesson_title ||
            null,
          lastTopic: options.conversationRow.last_topic || null,
          curriculumLessons,
          onBoardSteps: (steps) => {
            if (currentRequestId !== requestIdRef.current) return;
            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === options.messageId
                  ? {
                      ...message,
                      hasWhiteboard: steps.length > 0,
                      whiteboardSteps: steps,
                    }
                  : message
              )
            );
          },
        }
      );
      if (currentRequestId !== requestIdRef.current) return;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === options.messageId
            ? { ...message, text: responseText }
            : message
        )
      );
      await saveTutorMessage({
        conversationId: options.conversationRow.id,
        role: 'assistant',
        content: responseText,
      });
      if (currentActiveLesson) {
        await updateTutorConversationProgress(
          options.conversationRow.id,
          {
            last_lesson_id: currentActiveLesson.lesson_id,
            last_lesson_title: currentActiveLesson.lesson_title,
          }
        );
        setConversation((current) =>
          current?.id === options.conversationRow.id
            ? {
                ...current,
                last_lesson_id: currentActiveLesson.lesson_id,
                last_lesson_title: currentActiveLesson.lesson_title,
              }
            : current
        );
      }
    } catch (error) {
      console.error('Tutor response error:', error);
      if (currentRequestId === requestIdRef.current) {
        const fallback =
          `يا ${studentName}، حصلت مشكلة أثناء تجهيز الإجابة. ` +
          'جرّب تاني بعد قليل.';
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === options.messageId
              ? { ...message, text: fallback }
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
        // Open the microphone while the tutor speaks so the student can interrupt.
        tutorSpeechTextRef.current = responseText;
        tutorSpeakingRef.current = true;
        setIsTutorSpeaking(true);
        if (!micManuallyMutedRef.current) {
          micEnabledRef.current = true;
          setMicMuted(false);
          await startVoiceInput(true);
        }
        await playTutorAudio(responseText);
      } catch (error) {
        console.warn('Tutor audio playback failed:', error);
      } finally {
        tutorSpeakingRef.current = false;
        setIsTutorSpeaking(false);
        if (micEnabledRef.current && !studentVoiceRef.current) {
          await startVoiceInput(true);
        }
      }
    } else if (micEnabledRef.current && !studentVoiceRef.current) {
      await startVoiceInput(true);
    }
    if (currentRequestId === requestIdRef.current) {
      setDrawing(false);
    }
  };
  // The tutor opens the conversation proactively once per subject visit.
  useEffect(() => {
    if (
      conversationLoading ||
      curriculumLessonsLoading ||
      !conversation ||
      !activeSubject ||
      !availableSubjects.includes(activeSubject) ||
      autoStartedConversationsRef.current.has(conversation.id)
    ) {
      return;
    }
    autoStartedConversationsRef.current.add(conversation.id);
    const isFirstMessage = messages.length === 0;
    const prompt = isFirstMessage
      ? 'ابدأ أول حصة مع الطالب الآن. رحّب به باسمه، وابدأ تدريسه في المادة المحددة من منهجه الحالي بطريقة تفاعلية، ولا تنتظر أن يرسل سؤالًا.'
      : 'ابدأ الجلسة مع الطالب الآن، واستأنف الشرح من آخر درس وآخر نقطة محفوظة في هذه المحادثة. راجع سياق الرسائل السابقة ولا تكرر المقدمة.';
    const currentRequestId = ++requestIdRef.current;
    stopTutorAudio();
    void runTutorResponse(prompt, {
      isFirstMessage,
      history: getConversationHistory(),
      conversationRow: conversation,
      messageId: `auto-${conversation.id}-${currentRequestId}`,
    });
  }, [
    conversation,
    conversationLoading,
    curriculumLessonsLoading,
    activeSubject,
    availableSubjects,
    messages.length,
    currentActiveLesson,
  ]);
  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || typing) return;
    if (!activeStudentId) {
      setStudentLoadError(
        'لا يمكن إرسال السؤال قبل تحديد الطالب. سجّل دخول الطالب أولًا.'
      );
      return;
    }
    if (!activeSubject || !availableSubjects.includes(activeSubject)) {
      setStudentLoadError('اختار مادة متاحة الأول علشان أقدر أساعدك فيها.');
      return;
    }
    if (conversationLoading || curriculumLessonsLoading || !conversation) {
      setStudentLoadError('محادثة المادة لسه بتتحمّل. استنى لحظة وجرب تاني.');
      return;
    }
    const currentRequestId = ++requestIdRef.current;
    stopTutorAudio();
    const studentMsg: ChatMessage = {
      id: `s-${Date.now()}`,
      role: 'student',
      text: content,
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages((currentMessages) => [...currentMessages, studentMsg]);
    setInput('');
    setSpeechDraft('');
    setTyping(true);
    setDrawing(false);
    setStudentLoadError('');
    try {
      await saveTutorMessage({
        conversationId: conversation.id,
        role: 'student',
        content,
      });
      if (currentRequestId !== requestIdRef.current) return;
      // The current prompt is sent separately to the API, so history
      // contains only messages that came before this prompt.
      const history = getConversationHistory();
      const messageId = `a-${Date.now()}-${currentRequestId}`;
      await runTutorResponse(content, {
        isFirstMessage: false,
        history,
        conversationRow: conversation,
        messageId,
      });
      if (currentActiveLesson) {
        await updateTutorConversationProgress(conversation.id, {
          last_lesson_id: currentActiveLesson.lesson_id,
          last_lesson_title: currentActiveLesson.lesson_title,
          last_topic: content.slice(0, 200),
        });
        setConversation((current) =>
          current?.id === conversation.id
            ? {
                ...current,
                last_lesson_id: currentActiveLesson.lesson_id,
                last_lesson_title: currentActiveLesson.lesson_title,
                last_topic: content.slice(0, 200),
              }
            : current
        );
      }
    } catch (error) {
      console.error('Failed to send or save student message:', error);
      if (currentRequestId === requestIdRef.current) {
        setTyping(false);
        setStudentLoadError(
          'حصلت مشكلة في حفظ رسالتك. حاول تبعتها مرة تانية.'
        );
      }
    }
  };
  const cancelVoiceInput = () => {
    micEnabledRef.current = false;
    micManuallyMutedRef.current = true;
    setMicMuted(true);
    studentVoiceRef.current?.stop();
    studentVoiceRef.current = null;
    voiceInterruptingTutorRef.current = false;
    setSpeechDraft('');
    setIsListening(false);
  };

  const startVoiceInput = async (allowDuringTutor = false): Promise<void> => {
    if (
      (!allowDuringTutor && typing) ||
      conversationLoading ||
      !conversation ||
      !micEnabledRef.current ||
      studentVoiceRef.current
    ) {
      return;
    }

    if (!window.isSecureContext) {
      setStudentLoadError(
        'الميكروفون يحتاج إلى اتصال آمن HTTPS. افتح الموقع من رابطه الآمن ثم جرّب مرة أخرى.'
      );
      micEnabledRef.current = false;
      setMicMuted(true);
      return;
    }

    setStudentLoadError('');
    setSpeechDraft('');

    const listener = new StudentVoiceListener({
      onSpeechStart: () => {
        voiceInterruptingTutorRef.current = tutorSpeakingRef.current;

        if (tutorSpeakingRef.current) {
          stopTutorAudio();
          tutorSpeakingRef.current = false;
          setIsTutorSpeaking(false);
        }

        setIsListening(true);
      },
      onTranscript: (transcript) => {
        const normalizedTranscript = transcript
          .toLocaleLowerCase('ar-EG')
          .replace(/[ًٌٍَُِّْـ]/g, '')
          .replace(/[.,،؛:!?؟"'()\[\]{}]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const normalizedTutorText = tutorSpeechTextRef.current
          .toLocaleLowerCase('ar-EG')
          .replace(/[ًٌٍَُِّْـ]/g, '')
          .replace(/[.,،؛:!?؟"'()\[\]{}]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const looksLikeTutorEcho =
          voiceInterruptingTutorRef.current &&
          normalizedTranscript.length >= 5 &&
          normalizedTutorText.length > 0 &&
          (normalizedTutorText.includes(normalizedTranscript) ||
            normalizedTranscript.includes(
              normalizedTutorText.slice(
                0,
                Math.min(normalizedTranscript.length, 18)
              )
            ));

        voiceInterruptingTutorRef.current = false;

        if (looksLikeTutorEcho) {
          setSpeechDraft('');
          return;
        }

        setSpeechDraft(transcript);
        void send(transcript);
      },
      onError: (message) => {
        setStudentLoadError(message);
      },
    });

    studentVoiceRef.current = listener;

    try {
      await listener.start();

      if (studentVoiceRef.current === listener && micEnabledRef.current) {
        setIsListening(true);
      }
    } catch (error) {
      if (studentVoiceRef.current === listener) {
        studentVoiceRef.current = null;
      }

      setIsListening(false);
      micEnabledRef.current = false;
      setMicMuted(true);

      setStudentLoadError(
        error instanceof Error
          ? error.message
          : 'تعذّر تشغيل الميكروفون. حاول مرة أخرى.'
      );
    }
  };

  const toggleVoiceInput = () => {
    if (micEnabledRef.current) {
      micEnabledRef.current = false;
      micManuallyMutedRef.current = true;
      setMicMuted(true);
      studentVoiceRef.current?.stop();
      studentVoiceRef.current = null;
      voiceInterruptingTutorRef.current = false;
      setIsListening(false);
      setSpeechDraft('');
      return;
    }

    micManuallyMutedRef.current = false;
    micEnabledRef.current = true;
    setMicMuted(false);
    void startVoiceInput(true);
  };

  const voiceActive = voiceOn && !micMuted;
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
              {isListening
                ? 'بسمعك دلوقتي...'
                : typing
                  ? 'بجهز الإجابة...'
                  : isTutorSpeaking
                    ? 'المدرس بيتكلم...'
                    : voiceActive
                      ? 'الصوت متاح — اتكلم معايا'
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
                      onClick={() => {
                        cancelVoiceInput();
                        setActiveSubject(subj);
                      }}
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
          {conversationLoading && (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-3 text-center text-xs text-neutral-400">
              جاري تحميل محادثة {activeMeta.labelAr}...
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
        <div className="border-t border-[#2a2a2a] bg-[#111111] p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-gradient-to-l from-emerald-500/[0.08] to-transparent px-2.5 py-1.5">
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={
                availableSubjects.length === 0 ||
                conversationLoading ||
                curriculumLessonsLoading
              }
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40',
                isListening
                  ? 'animate-pulse border-red-400 bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'border-emerald-400/40 bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.15)] hover:bg-emerald-400'
              )}
              aria-label={micMuted ? 'تشغيل الميكروفون' : 'كتم الميكروفون'}
              title={micMuted ? 'تشغيل الميكروفون' : 'كتم الميكروفون'}
            >
              {micMuted ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
            <div className="min-w-0 flex-1 space-y-0.5 text-right">
              <p className="text-xs font-semibold leading-5 text-white">
                {micMuted
                  ? 'الميكروفون مكتوم'
                  : isListening
                    ? isTutorSpeaking
                      ? 'المدرس بيشرح وتقدر تقاطعه في أي وقت'
                      : 'أنا بسمعك... اتكلم براحتك'
                    : 'الميكروفون هيفتح تلقائيًا'}
              </p>
              <p className="text-[10px] leading-4 text-neutral-500">
                {micMuted
                  ? 'اضغط على الميكروفون لتشغيله، وهيفضل متاحًا أثناء الشرح'
                  : 'اتكلم في أي وقت؛ هوقف صوت المدرس وأسمع سؤالك تلقائيًا'}
              </p>
            </div>
          </div>
          {speechDraft && (
            <div
              dir="auto"
              className="mb-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-right text-xs leading-6 text-neutral-300"
            >
              {speechDraft}
            </div>
          )}
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
                  ? 'أو اكتب رسالتك هنا...'
                  : 'لا توجد مواد متاحة حاليًا'
              }
              disabled={
                availableSubjects.length === 0 ||
                conversationLoading ||
                curriculumLessonsLoading ||
                typing
              }
              className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none"
            />
            <button
              onClick={() => void send()}
              disabled={!input.trim() || availableSubjects.length === 0 || conversationLoading || curriculumLessonsLoading || typing}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white transition hover:bg-neutral-700 disabled:opacity-30"
              aria-label="إرسال الرسالة المكتوبة"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-neutral-600">
            <Volume2 size={12} />
            <span>المدرس يرد بالصوت والنص، وتقدر تستخدم الكتابة في أي وقت</span>
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
              عدد الدروس المنشورة للمادة: {curriculumLessons.length}
            </p>
            {curriculumLessonsLoading && (
              <p className="text-xs text-emerald-400">جاري تحميل دروس المنهج...</p>
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
          isAI
            ? 'w-full max-w-5xl min-w-0 space-y-3'
            : 'max-w-[80%] min-w-0 space-y-3',
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
            autoPlay
            className="w-full max-w-none"
          />
        )}
        <span className="block text-[10px] text-neutral-600">
          {message?.timestamp || ''}
        </span>
      </div>
    </div>
  );
}

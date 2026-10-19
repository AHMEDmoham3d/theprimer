import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send, Mic, MicOff, Calendar, Sparkles, Paperclip, Play,
  BookOpen, Target, Flame, Clock, Lightbulb,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Brain, History,
  X, PanelRightClose, PanelRightOpen, CheckCircle2, Circle,
  Headphones, BookOpen as BookIcon, PenTool,
  Lock as LockIcon, Volume2, Zap, Loader2, BookMarked, GraduationCap,
} from 'lucide-react';
import type { ChatMessage, Subject } from '@/types';
import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import { SUBJECT_META, ALL_SUBJECTS } from '@/data/subjects';
import {
  SMART_QUESTIONS, CURRICULUM_LESSONS,
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  fetchStudentProgress, fetchStudentSchedule, fetchLessonMasteryBySubject,
  type StudentProgressRow, type ScheduleSlotRow, type LessonMasteryRow,
} from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TeacherChatProps {
  messages: ChatMessage[];
  studentName: string;
}

// سبورة تفاعلية مخصصة لكل مادة عشان تظهر الحاجة الصح مش مثلث وخلاص
const DYNAMIC_SUBJECT_WHITEBOARDS: Record<Subject, { title: string; steps: string[] }> = {
  math: {
    title: 'توضيح القاعدة الرياضية والخطوات',
    steps: ['1. كتابة المعطيات وتحديد المطلوب في المعادلة', '2. تطبيق القانون أو التفاضل المناسب خطوة بخطوة', '3. الوصول للحل النهائي والتحقق من صحته']
  },
  physics: {
    title: 'تحليل القوانين والقوى الفيزيائية',
    steps: ['1. تحديد القانون الأساسي (مثل قانون نيوتن أو الشغل والطاقة)', '2. تعويض الأرقام والوحدات القياسية', '3. استنتاج النتيجة الفيزيائية']
  },
  chemistry: {
    title: 'توضيح التفاعل والروابط الكيميائية',
    steps: ['1. كتابة رموز العناصر المشاركة في التفاعل', '2. توزيع الإلكترونات وتحديد نوع الرابطة', '3. وزن المعادلة الكيميائية النهائية']
  },
  biology: {
    title: 'مخطط العمليات الحيوية في الخلية',
    steps: ['1. تحديد العضو أو الخلية المستهدفة', '2. توضيح مراحل الانقسام أو التفاعل الحيوي', '3. تلخيص الوظيفة النهائية']
  },
  history: {
    title: 'تسلسل الأحداث والتواريخ المهمة',
    steps: ['1. تحديد الحدث الرئيسي والأطراف المشاركة', '2. توضيح الأسباب والنتائج المترتبة عليه', '3. ربط الحدث بالسياق التاريخي العام']
  },
  english: {
    title: 'قاعدة الجرامر وبناء الجملة',
    steps: ['1. كتابة التكوين الأساسي للقاعدة (Structure)', '2. إعطاء أمثلة توضيحية للإثبات والنفي', '3. تطبيق تدريب سريع للتأكيد']
  },
  geography: {
    title: 'تحليل الظواهر الجغرافية والموارد',
    steps: ['1. تحديد الموقع أو الظاهرة على الخريطة', '2. دراسة العوامل المؤثرة (م المناخ، التضاريس)', '3. استنتاج التوزيع الاقتصادي أو السكاني']
  },
};

function detectSubject(text: string): Subject {
  const lower = text.toLowerCase();
  const keywords: Record<Subject, string[]> = {
    math: ['معادلة', 'رياضيات', 'حساب', 'جبر', 'تفاضل', 'تكامل', 'كسر', 'سؤال رياض', 'هندسة', 'مثلث', 'زاوية', 'sin', 'cos', 'math', 'equation', 'calculus'],
    physics: ['فيزياء', 'نيوتن', 'حركة', 'قوة', 'دائرية', 'سرعة', 'شغل', 'طاقة', 'كهرباء', 'physics', 'force', 'motion', 'energy'],
    chemistry: ['كيمياء', 'رابطة', 'ذرة', 'جدول دوري', 'تفاعل', 'أيون', 'تساهمي', 'chemistry', 'bond', 'atom', 'reaction'],
    biology: ['أحياء', 'خلية', 'انقسام', 'كروموسوم', 'وراثة', 'جين', 'dna', 'biology', 'cell', 'mitosis', 'meiosis'],
    history: ['تاريخ', 'ثورة', '1919', '1952', 'سعد زغلول', 'تصريح', 'history', 'revolution'],
    english: ['english', 'grammar', 'tense', 'reading', 'writing', 'essay', 'إنجليزي', 'قواعد'],
    geography: ['جغرافيا', 'خريطة', 'مصر', 'موارد', 'geography', 'map', 'resources'],
  };
  for (const subject of ALL_SUBJECTS) {
    if (keywords[subject].some((kw) => lower.includes(kw))) return subject;
  }
  return 'math';
}

const TYPE_LABELS: Record<string, string> = {
  review: 'مراجعة',
  new: 'درس جديد',
  practice: 'تدريب',
  'exam-prep': 'استعداد امتحان',
};

const TYPE_COLORS: Record<string, string> = {
  review: 'text-blue-400 bg-blue-500/10',
  new: 'text-emerald-400 bg-emerald-500/10',
  practice: 'text-amber-400 bg-amber-500/10',
  'exam-prep': 'text-red-400 bg-red-500/10',
};

const PROACTIVE_PROMPTS: Record<Subject, string[]> = {
  math: ['عايز نراجع الجبر سوا؟', 'درس التفاضل لسه مخلصناش — يلا نكمّله؟', 'لحظة، حابة أسألك حاجة في حساب التكامل'],
  physics: ['نيوتن لازم نثبّته كويس — نذاكره دلوقتي؟', 'الشغل والطاقة درس حلو جداً — جاهز؟', 'مستواك في الحركة حلو، ننتقل للكهرباء؟'],
  chemistry: ['الجدول الدوري مهم جداً — نراجع بسرعة؟', 'الروابط الكيميائية فهمتها؟ نتأكد سوا', 'يلا نبدأ التفاعلات الكيميائية — درس شيق'],
  biology: ['الخلية أساس كل حاجة — نراجعها؟', 'الانقسام المنصف محتاج تركيز — جاهز؟', 'الوراثة درس جميل جداً — نبدأه؟'],
  history: ['ثورة 1919 حدث مهم — نذاكره؟', 'تصريح 28 فبراير — عايز أشرحهولك؟', 'سعد زغلول شخصية محورية — نراجع دوره؟'],
  english: ['قواعد الـ tenses محتاجة مراجعة — يلا؟', 'عايز نتدرب على writing مع بعض؟', 'reading comprehension — نتمرن سوا؟'],
  geography: ['موارد مصر الطبيعية — نذاكرها؟', 'خريطة مصر محتاجة تثبيت — جاهز؟', 'النشاط الاقتصادي — درس حلو نبدأه؟'],
};

export function TeacherChat({ messages: initialMessages, studentName }: TeacherChatProps) {
  const activeStudentId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') || 'dfb49b28-c914-4711-91b6-12016f1e34a5' : 'dfb49b28-c914-4711-91b6-12016f1e34a5';

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState<Subject>('math');
  const [subjectBarOpen, setSubjectBarOpen] = useState(true);
  const [dbProgress, setDbProgress] = useState<StudentProgressRow[]>([]);
  const [dbSchedule, setDbSchedule] = useState<ScheduleSlotRow[]>([]);
  const [dbLessons, setDbLessons] = useState<LessonMasteryRow[]>([]);
  const [studentCurriculum, setStudentCurriculum] = useState<string>('المنهج العام (المصري)');
  const [showProactive, setShowProactive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, drawing]);

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          fetchStudentProgress(activeStudentId),
          fetchStudentSchedule(activeStudentId),
        ]);
        setDbProgress(p || []);
        setDbSchedule(s || []);

      } catch (err) {
        console.error('Error loading student context:', err);
      }
    })();
  }, [activeStudentId]);

  useEffect(() => {
    fetchLessonMasteryBySubject(activeStudentId, activeSubject)
      .then((res) => setDbLessons(res || []))
      .catch((err) => console.error('Error loading lessons:', err));
  }, [activeStudentId, activeSubject]);

  useEffect(() => {
    if (!showProactive || messages.length > 2) return;
    const timer = setTimeout(() => {
      setShowProactive(false);
      const prompts = PROACTIVE_PROMPTS[activeSubject];
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      const proactiveMsg: ChatMessage = {
        id: `p-${Date.now()}`,
        role: 'ai',
        text: prompt,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        reaction: 'encourage',
      };
      setMessages((m) => [...m, proactiveMsg]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showProactive, activeSubject, messages.length]);

  const currentActiveLesson = useMemo(() => {
    return dbLessons.find((l) => l.unlocked && !l.exam_passed) || dbLessons[0];
  }, [dbLessons]);

  const send = async (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;
    setShowProactive(false);

    const detectedSubject = detectSubject(content);
    setActiveSubject(detectedSubject);

    const studentMsg: ChatMessage = {
      id: `s-${Date.now()}`,
      role: 'student',
      text: content,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((m) => [...m, studentMsg]);
    setInput('');
    setTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      let responseText = '';

      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        // استخدام الموديل المستقر المعتمد لتفادي الشاشة السوداء
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const activeSubjectMeta = SUBJECT_META[detectedSubject];
        const lessonTitle = currentActiveLesson?.lesson_title || 'مراجعة عامة للمنهج';

        const systemInstruction = `أنت المدرس الخصوصي الذكي والتفاعلي لمنصة "ذا بريمير" (The Primer).
تتحدث الآن مع الطالب/الطالبة: ${studentName}.
المادة الحالية: ${activeSubjectMeta?.labelAr || detectedSubject}.
النظام الدراسي / المنهج: ${studentCurriculum}.
الدرس الحالي الذي يدرسه الطالب الآن: "${lessonTitle}".

🎯 **التعليمات والقواعد الصارمة**:
1. **اللهجة**: اتكلم حصرياً بـ **العامية المصرية السهلة والودودة جداً** (كأنك مدرس شاطر وقريب من الطالب وبيكلمه بحب وببساطة)، وبلاش الفصحى المعقدة.
2. **الارتباط بالدرس الحالي**: وجّه الشرح والنقاش والأسئلة لخدمة ومواءمة الدرس الحالي ("${lessonTitle}") ومعايير منهج (${studentCurriculum}).
3. **الأسلوب التربوي (الأسلوب السقراطي وتشجيع التفكير)**: 
   - **أوعى تدي الإجابة الجاهزة أبداً من أول مرة!** 
   - دورك إنك تسأل الطالب أسئلة توجيهية وذكية تخليه هو اللي يفكر ويستنتج الحل بنفسه خطوة بخطوة.
4. **الحدود والأخلاقيات الصارمة**: 
   - ممنوع تماماً الكلام في الدين، السياسة، الجنس، العنف، إيذاء الآخرين، أو أي موضوع خارج الأخلاق العامة والتعليم. لو الطالب اتكلم في حاجة برا الحدود دي، وجهه بلطف وبحزم للمذاكرة والأخلاق الحميدة.
5. **الشخصية**: خليك ودود، ذكي، وتابع اسم الطالب (${studentName}) دايماً في الكلام لشحن حماسه.`;

        const result = await model.generateContent(`${systemInstruction}\n\nسؤال الطالب: ${content}`);
        responseText = result.response.text();
      } else {
        console.warn('VITE_GEMINI_API_KEY is missing or empty!');
        responseText = `يا ${studentName}، مفتاح الـ API مش متسجل في ملف البيئة (env). تأكد من إضافته وإعادة تشغيل السيرفر.`;
      }

      setTyping(false);
      setDrawing(true);
      
      const currentWb = DYNAMIC_SUBJECT_WHITEBOARDS[detectedSubject] || DYNAMIC_SUBJECT_WHITEBOARDS.math;

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        reaction: 'encourage',
        hasWhiteboard: true,
        whiteboardSteps: currentWb.steps as unknown as NonNullable<ChatMessage['whiteboardSteps']>,
      };

      setMessages((m) => [...m, aiMsg]);
      setTimeout(() => setDrawing(false), 2000);
    } catch (error) {
      console.error('Gemini API Error details:', error);
      setTyping(false);
      setDrawing(false);
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: `يا ${studentName}، أنا معاك في درس (${currentActiveLesson?.lesson_title || 'المادة'}) بمنهج ${studentCurriculum}! فكر معايا، إيه أول خطوة نبدأ بيها؟`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        reaction: 'encourage',
      };
      setMessages((m) => [...m, fallbackMsg]);
    }
  };

  const suggestedQuestions = useMemo(() => {
    return SMART_QUESTIONS.filter((q) => q.subject === activeSubject).slice(0, 3);
  }, [activeSubject]);

  const todaySlots = dbSchedule.slice(0, 4);
  const doneCount = dbSchedule.filter((s) => s.status === 'done').length;
  const totalCount = dbSchedule.length;
  const weekProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const currentLessons = CURRICULUM_LESSONS.find((l) => l.subject === activeSubject)?.lessons ?? [];
  const subjectProgress = dbProgress.find((p) => p.subject === activeSubject);

  const activeMeta = SUBJECT_META[activeSubject];
  const ActiveIcon = activeMeta.icon;

  const voiceActive = voiceOn && !muted;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:flex-row gap-3">
      {/* Main learning panel */}
      <div className="flex flex-1 flex-col rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#2a2a2a] px-4 py-3 bg-gradient-to-l from-[#1a1a1a] to-[#141414]">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 border border-neutral-500 text-white font-bold text-base">
              P
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#141414] bg-green-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">مدرّسك في {activeMeta.labelAr}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <BookMarked size={10} /> {studentCurriculum}
              </span>
              {currentActiveLesson && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20 truncate max-w-[200px]">
                  <GraduationCap size={10} /> {currentActiveLesson.lesson_title}
                </span>
              )}
            </div>
            <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {voiceActive ? 'معاك دلوقتي' : 'جاهز أي وقت'}
            </span>
          </div>
          <div className="mr-auto flex items-center gap-2">
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                voiceOn ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-500'
              )}
              title={voiceOn ? 'الصوت شغال' : 'الصوت متوقف'}
            >
              {voiceOn ? <Volume2 size={14} /> : <MicOff size={14} />}
              <span>{voiceOn ? 'صوت' : 'صامت'}</span>
            </button>
            {voiceOn && (
              <button
                onClick={() => setMuted(!muted)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  muted ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-700 text-white'
                )}
              >
                {muted ? <MicOff size={14} /> : <Headphones size={14} />}
              </button>
            )}
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                panelOpen ? 'bg-neutral-800 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              )}
            >
              {panelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            </button>
          </div>
        </div>

        {/* Subject selector */}
        <div className="border-b border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2">
          {subjectBarOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin flex-1">
                {ALL_SUBJECTS.map((subj) => {
                  const meta = SUBJECT_META[subj];
                  const Icon = meta.icon;
                  const isActive = activeSubject === subj;
                  const prog = dbProgress.find((p) => p.subject === subj);
                  return (
                    <button
                      key={subj}
                      onClick={() => setActiveSubject(subj)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition shrink-0',
                        isActive
                          ? 'border-transparent text-white'
                          : 'border-[#2a2a2a] text-neutral-500 hover:border-[#444] hover:text-neutral-300'
                      )}
                      style={isActive ? { background: meta.accent + '20', border: `1px solid ${meta.accent}40` } : undefined}
                    >
                      <Icon size={14} style={{ color: meta.accent }} />
                      {meta.labelAr}
                      {prog && (
                        <span className="text-[9px] px-1 rounded-full" style={{ background: meta.accent + '20', color: meta.accent }}>
                          {prog.mastery}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setSubjectBarOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
                title="إخفاء المواد"
              >
                <ChevronUp size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSubjectBarOpen(true)}
              className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition"
            >
              <ActiveIcon size={14} style={{ color: activeMeta.accent }} />
              <span className="font-medium">{activeMeta.labelAr}</span>
              <ChevronDown size={14} className="text-neutral-600" />
              <span className="text-neutral-600">— اضغط لعرض كل المواد</span>
            </button>
          )}
        </div>

        {/* Session content */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 min-h-0">
          {messages.length <= 2 && (
            <div className="rounded-xl border border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#141414] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: activeMeta.accent + '20', color: activeMeta.accent }}>
                  <BookIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{activeMeta.labelAr} — درس: {currentActiveLesson?.lesson_title || 'عام'}</p>
                  <p className="text-[10px] text-neutral-500">النظام والدعم الذكي متصلان خصيصاً لمنهجك ({studentCurriculum})</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1"><PenTool size={11} /> سبورة مخصصة</span>
                <span className="flex items-center gap-1"><Clock size={11} /> فوري</span>
                <span className="flex items-center gap-1"><Brain size={11} /> أسلوب سقراطي تفاعلي</span>
                {voiceActive && <span className="flex items-center gap-1 text-green-400"><Volume2 size={11} /> صوت شغال</span>}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} studentName={studentName} voiceActive={voiceActive} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-white">P</div>
              <div className="flex gap-1 rounded-2xl bg-[#1c1c1c] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-neutral-600">بجهّز الشرح لدرس ({currentActiveLesson?.lesson_title})...</span>
            </div>
          )}
          {drawing && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-white">P</div>
              <div className="flex items-center gap-2 rounded-2xl bg-[#1c1c1c] px-4 py-3">
                <PenTool size={14} className="text-emerald-400 animate-pulse" />
                <span>جاري إعداد السبورة التفاعلية للدرس...</span>
                {voiceActive && (
                  <div className="flex items-end gap-0.5 mr-2">
                    {[4, 8, 5, 10, 6, 9, 4, 7].map((h, i) => (
                      <span key={i} className="w-0.5 rounded-full bg-emerald-400 animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {messages.length <= 4 && (
          <div className="border-t border-[#2a2a2a] px-4 py-3">
            <p className="text-[10px] text-neutral-500 mb-2 flex items-center gap-1">
              <Lightbulb size={12} className="text-amber-400" />
              أسئلة مقترحة في {activeMeta.labelAr}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q.question}
                  onClick={() => send(q.question)}
                  className="rounded-lg border border-[#2a2a2a] bg-[#1c1c1c] px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white hover:text-white"
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#2a2a2a] p-3">
          {isRecording ? (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
              <div className="flex items-end gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="voice-bar w-1 rounded-full bg-red-500" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
              <span className="text-sm text-red-400">تكلم بصوتك يا {studentName} — أنا سامعك في {activeMeta.labelAr}</span>
              <button onClick={() => { setIsRecording(false); send('سؤال صوتي'); }} className="mr-auto rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200">
                إرسال
              </button>
              <button onClick={() => setIsRecording(false)} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30">
                إلغاء
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition">
                <Paperclip size={18} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={`اسأل في درس (${currentActiveLesson?.lesson_title || activeMeta.labelAr})...`}
                className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-3 sm:px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#444] min-w-0"
              />
              <button
                onClick={() => setIsRecording(true)}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
                  voiceActive ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-500'
                )}
                title="اسأل بصوتك"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white transition hover:bg-neutral-700 disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between px-2">
            <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition">
              <Calendar size={13} /> جلسة تفاعلية
            </button>
            <span className="text-xs text-neutral-600 flex items-center gap-1">
              <History size={11} /> متابع مستواك في {activeMeta.labelAr} يا {studentName}
            </span>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {panelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setPanelOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border border-[#2a2a2a] bg-[#141414] p-4 animate-slide-in-up md:static md:inset-auto md:z-auto md:max-h-none md:w-72 md:rounded-2xl md:border md:bg-[#141414] md:animate-slide-in-right md:shrink-0">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-700 md:hidden" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">تفاصيل المنهج والدرس</h3>
              </div>
              <button onClick={() => setPanelOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition" title="إخفاء">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3 space-y-2">
              <div>
                <p className="text-[10px] text-neutral-500">المنظومة:</p>
                <p className="text-xs font-bold text-emerald-400">{studentCurriculum}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-500">الدرس الحالي:</p>
                <p className="text-xs font-bold text-blue-400">{currentActiveLesson?.lesson_title || 'لا يوجد درس نشط'}</p>
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: activeMeta.accentSoft + '20', color: activeMeta.accent }}>
                  <ActiveIcon size={16} />
                </div>
                <span className="text-sm font-bold text-white">{activeMeta.labelAr}</span>
              </div>
              {subjectProgress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span>مستوى الفهم في {activeMeta.labelAr}</span>
                    <span style={{ color: activeMeta.accent }}>{subjectProgress.mastery}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${subjectProgress.mastery}%`, background: activeMeta.accent }} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {dbLessons.length > 0 ? dbLessons.slice(0, 5).map((lesson) => {
                  const isDone = lesson.mastery >= 100 && lesson.exam_passed;
                  const isLocked = !lesson.unlocked;
                  return (
                    <div key={lesson.id} className="flex items-center gap-2 text-sm">
                      {isLocked ? <LockIcon size={14} className="text-neutral-600 shrink-0" /> : isDone ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <Circle size={14} className="text-amber-400 shrink-0" />}
                      <span className={cn('flex-1 min-w-0 truncate', isLocked ? 'text-neutral-600' : isDone ? 'text-neutral-400 line-through' : 'text-neutral-300')}>{lesson.lesson_title}</span>
                      {!isLocked && !isDone && lesson.mastery > 0 && <span className="text-xs text-neutral-500 shrink-0">{lesson.mastery}%</span>}
                    </div>
                  );
                }) : currentLessons.slice(0, 4).map((lesson, i) => (
                  <div key={lesson.id} className="flex items-center gap-2 text-sm">
                    {i < 2 ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <Circle size={14} className="text-neutral-600 shrink-0" />}
                    <span className={cn('flex-1 min-w-0 truncate', i < 2 ? 'text-neutral-400 line-through' : 'text-neutral-300')}>{lesson.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-neutral-500" />
                <span className="text-xs text-neutral-500">جدول اليوم — تلقائي</span>
              </div>
              <div className="space-y-2.5">
                {todaySlots.map((slot, i) => {
                  const meta = SUBJECT_META[slot.subject as keyof typeof SUBJECT_META] ?? SUBJECT_META.math;
                  const Icon = meta.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600 w-12 shrink-0">{slot.scheduled_time}</span>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: meta.accentSoft + '20', color: meta.accent }}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm truncate', slot.status === 'done' ? 'text-neutral-500 line-through' : 'text-neutral-300')}>{slot.topic}</p>
                        <span className={cn('text-[10px] px-1.5 rounded inline-block', TYPE_COLORS[slot.slot_type])}>{TYPE_LABELS[slot.slot_type]}</span>
                      </div>
                      {slot.status === 'done' && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}
                {todaySlots.length === 0 && <p className="text-xs text-neutral-600 text-center py-2">جاري تحميل الجدول...</p>}
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">تقدّم الأسبوع</span>
                <span className="text-sm font-bold text-emerald-400">{weekProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${weekProgress}%` }} />
              </div>
              <p className="text-xs text-neutral-600 mt-2">{doneCount} من {totalCount} جلسة</p>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                <Flame size={16} className="text-orange-400 mb-1" />
                <p className="text-base font-bold text-white">12 يوم</p>
                <p className="text-[10px] text-neutral-500">متتالية</p>
              </div>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                <Clock size={16} className="text-blue-400 mb-1" />
                <p className="text-base font-bold text-white">45 د</p>
                <p className="text-[10px] text-neutral-500">اليوم</p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">اقتراح</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {subjectProgress?.weaknesses?.[0]
                  ? `يا ${studentName}، يلا نركّز شوية على ${subjectProgress.weaknesses[0]} في ${activeMeta.labelAr}`
                  : `جاهز نبدأ درس جديد في ${activeMeta.labelAr} يا ${studentName}؟`}
              </p>
              <button className="mt-2 w-full rounded-lg bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20">
                يلا نبدأ
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({ message, studentName, voiceActive }: { message: ChatMessage; studentName: string; voiceActive: boolean }) {
  const isAI = message.role === 'ai';

  return (
    <div className={cn('flex gap-2', isAI ? 'justify-start' : 'justify-end')}>
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 border border-neutral-600 text-xs font-bold text-white">
          P
        </div>
      )}
      <div className={cn('max-w-[80%] space-y-3', !isAI && 'items-end')}>
        <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed', isAI ? 'bg-[#1c1c1c] text-neutral-100' : 'bg-white text-black mr-auto')}>
          {message.text}
        </div>

        {voiceActive && isAI && (
          <button className="flex items-center gap-2 rounded-lg bg-[#1c1c1c] px-3 py-2 text-xs text-neutral-300 hover:text-white transition">
            <Play size={14} />
            استمع
            <div className="flex items-end gap-0.5">
              {[3, 6, 4, 8, 5, 7, 3].map((h, i) => (
                <span key={i} className="w-0.5 rounded-full bg-neutral-500" style={{ height: `${h}px` }} />
              ))}
            </div>
          </button>
        )}

        {message.hasWhiteboard && message.whiteboardSteps && (
          <Whiteboard steps={message.whiteboardSteps} className="max-w-md" />
        )}

        {isAI && message.reaction === 'celebrate' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <Sparkles size={14} />
            <span>أحسنت يا {studentName}!</span>
          </div>
        )}

        <span className="block text-[10px] text-neutral-600">{message.timestamp}</span>
      </div>
    </div>
  );
}
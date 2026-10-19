import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send, Mic, Calendar, Sparkles, Paperclip,
  ChevronUp, ChevronDown, Brain,
  X, PanelRightClose, PanelRightOpen,
  Volume2, BookMarked, GraduationCap, PenTool,
} from 'lucide-react';
import type { ChatMessage, Subject } from '@/types';
import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import { SUBJECT_META, ALL_SUBJECTS } from '@/data/subjects';
import { SMART_QUESTIONS, CURRICULUM_LESSONS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  fetchStudentProgress, fetchStudentSchedule, fetchLessonMasteryBySubject,
  type StudentProgressRow, type ScheduleSlotRow, type LessonMasteryRow,
} from '@/lib/db';
import { supabase } from '@/lib/supabase';

interface TeacherChatProps {
  messages: ChatMessage[];
  studentName: string;
}

const DYNAMIC_SUBJECT_WHITEBOARDS: Record<Subject, { title: string; steps: string[] }> = {
  math: {
    title: 'توضيح القاعدة الرياضية والخطوات',
    steps: ['1. كتابة المعطيات وتحديد المطلوب', '2. تطبيق القانون المناسب خطوة بخطوة', '3. الوصول للحل النهائي والتحقق منه']
  },
  physics: {
    title: 'تحليل القوانين والقوى الفيزيائية',
    steps: ['1. تحديد القانون الأساسي', '2. تعويض الأرقام والوحدات', '3. استنتاج النتيجة الفيزيائية']
  },
  chemistry: {
    title: 'توضيح التفاعل والروابط الكيميائية',
    steps: ['1. كتابة رموز العناصر', '2. توزيع الإلكترونات وتحديد الرابطة', '3. وزن المعادلة النهائية']
  },
  biology: {
    title: 'مخطط العمليات الحيوية في الخلية',
    steps: ['1. تحديد العضو المستهدف', '2. توضيح مراحل الانقسام أو التفاعل', '3. تلخيص الوظيفة النهائية']
  },
  history: {
    title: 'تسلسل الأحداث والتواريخ المهمة',
    steps: ['1. تحديد الحدث والأطراف', '2. الأسباب والنتائج', '3. ربط الحدث بالسياق التاريخي']
  },
  english: {
    title: 'قاعدة الجرامر وبناء الجملة',
    steps: ['1. التكوين الأساسي للقاعدة (Structure)', '2. أمثلة توضيحية للإثبات والنفي', '3. تطبيق تدريب سريع']
  },
  geography: {
    title: 'تحليل الظواهر الجغرافية والموارد',
    steps: ['1. تحديد الموقع أو الظاهرة', '2. دراسة العوامل المؤثرة', '3. استنتاج التوزيع']
  },
};

function detectSubject(text: string): Subject {
  if (!text) return 'math';
  const lower = text.toLowerCase();
  const keywords: Record<Subject, string[]> = {
    math: ['معادلة', 'رياضيات', 'حساب', 'جبر', 'تفاضل', 'تكامل', 'كسر', 'هندسة', 'مثلث', 'math', 'equation'],
    physics: ['فيزياء', 'نيوتن', 'حركة', 'قوة', 'سرعة', 'شغل', 'طاقة', 'physics', 'force'],
    chemistry: ['كيمياء', 'رابطة', 'ذرة', 'تفاعل', 'أيون', 'chemistry', 'atom'],
    biology: ['أحياء', 'خلية', 'انقسام', 'وراثة', 'dna', 'biology', 'cell'],
    history: ['تاريخ', 'ثورة', 'سعد زغلول', 'history', 'revolution'],
    english: ['english', 'grammar', 'tense', 'writing', 'إنجليزي', 'قواعد'],
    geography: ['جغرافيا', 'خريطة', 'مصر', 'geography', 'map'],
  };
  for (const subject of ALL_SUBJECTS) {
    if (keywords[subject]?.some((kw) => lower.includes(kw))) return subject;
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
  math: ['عايز نراجع الجبر سوا؟', 'درس التفاضل لسه مخلصناش — يلا نكمّله؟'],
  physics: ['نيوتن لازم نثبّته كويس — نذاكره دلوقتي؟', 'الشغل والطاقة درس حلو جداً — جاهز؟'],
  chemistry: ['الجدول الدوري مهم جداً — نراجع بسرعة؟', 'الروابط الكيميائية فهمتها؟ نتأكد سوا'],
  biology: ['الخلية أساس كل حاجة — نراجعها؟', 'الانقسام المنصف محتاج تركيز — جاهز؟'],
  history: ['ثورة 1919 حدث مهم — نذاكره؟', 'تصريح 28 فبراير — عايز أشرحهولك؟'],
  english: ['قواعد الـ tenses محتاجة مراجعة — يلا؟', 'عايز نتدرب على writing مع بعض؟'],
  geography: ['موارد مصر الطبيعية — نذاكرها؟', 'خريطة مصر محتاجة تثبيت — جاهز؟'],
};

export function TeacherChat({ messages: initialMessages, studentName }: TeacherChatProps) {
  const activeStudentId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') || 'dfb49b28-c914-4711-91b6-12016f1e34a5' : 'dfb49b28-c914-4711-91b6-12016f1e34a5';

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState('');
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
          fetchStudentProgress(activeStudentId).catch(() => []),
          fetchStudentSchedule(activeStudentId).catch(() => []),
        ]);
        setDbProgress(p || []);
        setDbSchedule(s || []);

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('curriculum_name')
          .eq('id', activeStudentId)
          .maybeSingle();
        
        if (!studentError && studentData?.curriculum_name) {
          setStudentCurriculum(studentData.curriculum_name);
        }
      } catch (err) {
        console.warn('Database fallback active', err);
      }
    })();
  }, [activeStudentId]);

  useEffect(() => {
    fetchLessonMasteryBySubject(activeStudentId, activeSubject)
      .then((res) => setDbLessons(res || []))
      .catch(() => setDbLessons([]));
  }, [activeStudentId, activeSubject]);

  const currentActiveLesson = useMemo(() => {
    return dbLessons.find((l) => l.unlocked && !l.exam_passed) || dbLessons[0];
  }, [dbLessons]);

  const activeMeta = SUBJECT_META[activeSubject] || SUBJECT_META.math;
  const ActiveIcon = activeMeta.icon;

  // استدعاء جيميناي عبر Fetch الآمن (بدون مكتبة خارجية وبدون أي احتمالية לשاشة سوداء)
  const send = async (text?: string) => {
    const content = text || input;
    if (!content || !content.trim()) return;
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

    let responseText = '';
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (apiKey) {
        const activeSubMeta = SUBJECT_META[detectedSubject] || SUBJECT_META.math;
        const lessonTitle = currentActiveLesson?.lesson_title || 'مراجعة عامة للمنهج';

        const systemPrompt = `أنت المدرس الخصوصي الذكي لمنصة "ذا بريمير" (The Primer). تحدث مع الطالب ${studentName} في مادة ${activeSubMeta.labelAr} بمنهج ${studentCurriculum} للدرس "${lessonTitle}". اتكلم بالعامية المصرية الودودة وبأسلوب سقراطي (اسأل أسئلة توجيهية ولا تعط الإجابة مباشرة).`;

        // استخدام الـ REST API المباشر لتجنب أخطاء حزم المكتبات و delayMs تماماً
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nسؤال الطالب: ${content}` }] }
            ]
          })
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      }
    } catch (e) {
      console.warn('API error handled safely:', e);
    }

    setTyping(false);
    setDrawing(true);

    if (!responseText.trim()) {
      responseText = `يا ${studentName}، أنا معاك في ${activeMeta.labelAr} بمنهج ${studentCurriculum}! فكر معايا: إيه أول خطوة تحب نكتبها على السبورة عشان نحل بيها؟`;
    }

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
    setTimeout(() => setDrawing(false), 1500);
  };

  const suggestedQuestions = useMemo(() => {
    return SMART_QUESTIONS.filter((q) => q.subject === activeSubject).slice(0, 3);
  }, [activeSubject]);

  const todaySlots = dbSchedule.slice(0, 4);
  const doneCount = dbSchedule.filter((s) => s.status === 'done').length;
  const totalCount = dbSchedule.length;
  const weekProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
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
              <span className="text-sm font-bold text-white truncate">مدرّسك في {activeMeta.labelAr}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <BookMarked size={10} /> {studentCurriculum}
              </span>
            </div>
            <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {voiceActive ? 'معاك دلوقتي' : 'جاهز أي وقت'}
            </span>
          </div>
          <div className="mr-auto flex items-center gap-2">
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

        <div className="border-b border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2">
          {subjectBarOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin flex-1">
                {ALL_SUBJECTS.map((subj) => {
                  const meta = SUBJECT_META[subj] || SUBJECT_META.math;
                  const Icon = meta.icon;
                  const isActive = activeSubject === subj;
                  return (
                    <button
                      key={subj}
                      onClick={() => setActiveSubject(subj)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition shrink-0',
                        isActive ? 'border-transparent text-white' : 'border-[#2a2a2a] text-neutral-500 hover:text-neutral-300'
                      )}
                      style={isActive ? { background: meta.accent + '20', border: `1px solid ${meta.accent}40` } : undefined}
                    >
                      <Icon size={14} style={{ color: meta.accent }} />
                      {meta.labelAr}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setSubjectBarOpen(false)} className="text-neutral-500 hover:text-white">
                <ChevronUp size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setSubjectBarOpen(true)} className="flex items-center gap-2 text-xs text-neutral-500">
              <ActiveIcon size={14} style={{ color: activeMeta.accent }} />
              <span className="font-medium">{activeMeta.labelAr}</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 min-h-0">
          {messages && messages.map((msg) => (
            <MessageBubble key={msg.id || Math.random()} message={msg} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white font-bold">P</div>
              <div className="flex gap-1 rounded-2xl bg-[#1c1c1c] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          {drawing && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white font-bold">P</div>
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
              {suggestedQuestions.map((q) => (
                <button
                  key={q.question}
                  onClick={() => send(q.question)}
                  className="rounded-lg border border-[#2a2a2a] bg-[#1c1c1c] px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#2a2a2a] p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="اسأل مدرّسك..."
              className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white transition hover:bg-neutral-700 disabled:opacity-30"
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
            <button onClick={() => setPanelOpen(false)} className="text-neutral-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
            <p className="text-xs font-bold text-emerald-400">{studentCurriculum}</p>
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
        <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed', isAI ? 'bg-[#1c1c1c] text-neutral-100' : 'bg-white text-black mr-auto')}>
          {message?.text || ''}
        </div>
        {message?.hasWhiteboard && message?.whiteboardSteps && (
          <Whiteboard steps={message.whiteboardSteps} className="max-w-md" />
        )}
        <span className="block text-[10px] text-neutral-600">{message?.timestamp || ''}</span>
      </div>
    </div>
  );
}
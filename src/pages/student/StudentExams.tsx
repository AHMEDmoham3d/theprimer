import { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, CheckCircle2, XCircle, Play, Award, ChevronLeft, Send, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Card, Badge, ProgressBar, EmptyState } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import type { Subject } from '@/types';
import { fetchLessonMastery, fetchStudentById, updateLessonMastery, unlockNextLesson, type LessonMasteryRow, type StudentRow } from '@/lib/db';
import { cn } from '@/lib/utils';

const EXAM_PASS_THRESHOLD = 70;

interface DynamicExam {
  id: string;
  subject: Subject;
  topic: string;
  type: 'pre-session' | 'post-session';
  status: 'pending' | 'completed' | 'in-progress';
  score: number | null;
  totalPoints: number;
  questions: Array<{
    id: string;
    type: 'mcq' | 'truefalse' | 'chat';
    question: string;
    options?: string[];
    correctAnswer: string;
    points: number;
    explanation: string;
  }>;
}

export function StudentExams({ studentId }: { studentId?: string }) {
  const storedStudentId = typeof window !== 'undefined' ? localStorage.getItem('current_student_id') : null;
  const activeStudentId = studentId || storedStudentId || 'dfb49b28-c914-4711-91b6-12016f1e34a5';

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [lessonMastery, setLessonMastery] = useState<LessonMasteryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<DynamicExam | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, masteryRows] = await Promise.all([
        fetchStudentById(activeStudentId),
        fetchLessonMastery(activeStudentId),
      ]);
      setStudent(s);
      setLessonMastery(masteryRows);
      setLoading(false);
    })();
  }, [activeStudentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  // بناء الامتحانات ديناميكياً بناءً على الدروس الحقيقية الخاصة بالطالب في قاعدة البيانات
  const dynamicExams: DynamicExam[] = lessonMastery.map((lesson) => {
    const isCompleted = lesson.mastery >= 100 && lesson.exam_passed;
    const status = isCompleted ? 'completed' : lesson.unlocked ? 'pending' : 'pending';
    const score = lesson.exam_score;

    return {
      id: lesson.id,
      subject: lesson.subject as Subject,
      topic: lesson.lesson_title,
      type: 'post-session',
      status,
      score,
      totalPoints: 100,
      questions: [
        {
          id: `${lesson.id}-q1`,
          type: 'mcq',
          question: `ما هي النتيجة الأساسية أو التطبيق العملي المرتبط بـ (${lesson.lesson_title})؟`,
          options: ['التحليل المباشر للقيم المعطاة', 'التكامل أو الاشتقاق المباشر', 'لا يوجد تطبيق مباشر', 'كل ما سبق صحيح'],
          correctAnswer: 'كل ما سبق صحيح',
          points: 40,
          explanation: `يعتمد درس ${lesson.lesson_title} على الفهم الشامل والتطبيق المباشر للقواعد الأساسية.`,
        },
        {
          id: `${lesson.id}-q2`,
          type: 'truefalse',
          question: `هل يُعد فهم القواعد الأساسية لـ (${lesson.lesson_title}) شرطاً أساسياً لفتح الدروس التالية؟`,
          options: ['صح', 'غلط'],
          correctAnswer: 'صح',
          points: 30,
          explanation: 'نعم، يجب اجتياز الامتحانات بنسبة 70% أو أكثر لضمان تفتح الدروس التالية تلقائياً.',
        },
        {
          id: `${lesson.id}-q3`,
          type: 'chat',
          question: `اشرح باختصار كيف يمكنك تطبيق ما تعلمته في درس (${lesson.lesson_title}) لحل المسائل العملية؟`,
          correctAnswer: 'تطبيق خطوة بخطوة',
          points: 30,
          explanation: 'التحليل السليم والكتابة الواضحة تدل على استيعابك الحقيقي للمفهوم.',
        },
      ],
    };
  });

  if (activeExam) {
    return (
      <ExamRunner
        exam={activeExam}
        studentId={activeStudentId}
        onExit={() => {
          setActiveExam(null);
          // إعادة جلب بيانات الدروس لتحديث الحالات بعد الامتحانات
          fetchLessonMastery(activeStudentId).then(setLessonMastery);
        }}
      />
    );
  }

  const pending = dynamicExams.filter((e) => e.status === 'pending');
  const completed = dynamicExams.filter((e) => e.status === 'completed');
  const inProgress = dynamicExams.filter((e) => e.status === 'in-progress');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><div className="text-center"><p className="text-3xl font-bold text-white">{pending.length}</p><p className="text-xs text-neutral-400 mt-1">امتحانات منتظرة</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-amber-400">{inProgress.length}</p><p className="text-xs text-neutral-400 mt-1">قيد التقدم</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-green-400">{completed.length}</p><p className="text-xs text-neutral-400 mt-1">مكتملة</p></div></Card>
      </div>

      {/* Passing criteria notice */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">عايز تفتح الدرس اللي بعده؟</p>
            <p className="text-xs text-neutral-400 mt-1">لازم تجيب {EXAM_PASS_THRESHOLD}% أو أكتر في امتحان الدرس علشان الدرس اللي بعده يفتح. لو جبت أقل، راجع الدرس تاني وامتحن تاني.</p>
          </div>
        </div>
      </Card>

      {/* Pending exams */}
      <Card>
        <h3 className="mb-4 font-bold text-white">امتحانات تنتظرك ({student?.name ?? 'الطالب'})</h3>
        <div className="space-y-3">
          {pending.map((exam) => {
            const meta = SUBJECT_META[exam.subject] || SUBJECT_META.math;
            const lessonMatch = lessonMastery.find((m) => m.subject === exam.subject && m.lesson_title === exam.topic);
            const isLocked = lessonMatch && !lessonMatch.unlocked;
            return (
              <div key={exam.id} className={cn('flex items-center gap-4 rounded-xl border p-4', isLocked ? 'border-[#222] bg-[#0a0a0a] opacity-70' : 'border-[#2a2a2a] bg-[#141414]')}>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', isLocked && 'opacity-50')} style={{ background: meta.accentSoft, color: meta.accent }}>
                  {isLocked ? <Lock size={22} /> : <ClipboardCheck size={22} />}
                </div>
                <div className="flex-1">
                  <h4 className={cn('text-sm font-semibold', isLocked ? 'text-neutral-500' : 'text-white')}>{exam.topic}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    امتحان تقييم مستوى — {meta.labelAr}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="neutral" className="text-[10px]">{exam.questions.length} أسئلة</Badge>
                    <Badge variant="neutral" className="text-[10px]">{exam.totalPoints} نقطة</Badge>
                    {isLocked && <Badge variant="neutral" className="text-[10px]"><Lock size={10} /> مقفل</Badge>}
                  </div>
                  {isLocked && <p className="text-[10px] text-neutral-600 mt-1">يفتح لما تكمّل الدرس اللي قبله بنجاح</p>}
                </div>
                {isLocked ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Lock size={14} /> مقفل
                  </div>
                ) : (
                  <button onClick={() => setActiveExam(exam)} className="btn-primary text-xs">
                    <Play size={14} /> ابدأ
                  </button>
                )}
              </div>
            );
          })}
          {pending.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">مفيش امتحانات منتظرة حالياً</p>
          )}
        </div>
      </Card>

      {/* Completed exams */}
      <Card>
        <h3 className="mb-4 font-bold text-white">امتحانات مكتملة</h3>
        <div className="space-y-3">
          {completed.map((exam) => {
            const meta = SUBJECT_META[exam.subject] || SUBJECT_META.math;
            const score = exam.score ?? 0;
            const passed = score >= EXAM_PASS_THRESHOLD;
            return (
              <div key={exam.id} className="flex items-center gap-4 rounded-xl bg-[#141414] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: meta.accentSoft, color: meta.accent }}>
                  <Award size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{exam.topic}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{meta.labelAr}</p>
                </div>
                <div className="text-left">
                  <p className={`text-2xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>{score}</p>
                  <p className="text-[10px] text-neutral-500">من {exam.totalPoints}</p>
                </div>
                {passed ? (
                  <Badge variant="success"><CheckCircle2 size={12} /> نجح</Badge>
                ) : (
                  <Badge variant="error"><XCircle size={12} /> رسب</Badge>
                )}
                <button onClick={() => setActiveExam(exam)} className="btn-secondary text-xs whitespace-nowrap">
                  <Play size={14} /> إعادة
                </button>
              </div>
            );
          })}
          {completed.length === 0 && (
            <EmptyState icon={<ClipboardCheck size={28} />} title="مفيش امتحانات مكتملة بعد" />
          )}
        </div>
      </Card>
    </div>
  );
}

function ExamRunner({ exam, studentId, onExit }: { exam: DynamicExam; studentId: string; onExit: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatAnswer, setChatAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const question = exam.questions[currentQ];
  const meta = SUBJECT_META[exam.subject] || SUBJECT_META.math;
  const isLast = currentQ === exam.questions.length - 1;

  const selectAnswer = (qid: string, answer: string) => {
    setAnswers((a) => ({ ...a, [qid]: answer }));
  };

  const next = async () => {
    if (isLast) {
      setSubmitting(true);
      const score = exam.questions.reduce((acc, q) => {
        const ans = answers[q.id];
        if (!ans) return acc;
        if (q.type === 'chat') {
          return acc + (ans.length > 15 ? q.points : Math.floor(q.points * 0.4));
        }
        return ans === q.correctAnswer ? acc + q.points : acc;
      }, 0);

      const passed = score >= EXAM_PASS_THRESHOLD;

      // تحديث قاعدة البيانات بنتيجة الامتحان وفتح الدرس التالي إذا نجح
      await updateLessonMastery(exam.id, {
        mastery: passed ? 100 : 50,
        exam_score: score,
        exam_passed: passed,
      });

      if (passed) {
        // العثور على ترتيب الدرس الحالي لفتح الدرس الذي يليه في قاعدة البيانات
        const masteryRows = await fetchLessonMastery(studentId);
        const currentLesson = masteryRows.find((m) => m.id === exam.id);
        if (currentLesson) {
          await unlockNextLesson(studentId, currentLesson.subject, currentLesson.lesson_order);
        }
      }

      setSubmitting(false);
      setSubmitted(true);
    } else {
      setCurrentQ((q) => q + 1);
      setChatAnswer('');
    }
  };

  const prev = () => {
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1);
      setChatAnswer('');
    }
  };

  if (submitted) {
    const score = exam.questions.reduce((acc, q) => {
      const ans = answers[q.id];
      if (!ans) return acc;
      if (q.type === 'chat') {
        return acc + (ans.length > 15 ? q.points : Math.floor(q.points * 0.4));
      }
      return ans === q.correctAnswer ? acc + q.points : acc;
    }, 0);
    const passed = score >= EXAM_PASS_THRESHOLD;

    return (
      <div className="space-y-6">
        <Card className="border-white/10 bg-gradient-to-br from-[#181818] to-[#141414] text-center py-12">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
          </div>
          <h2 className="text-2xl font-bold text-white">{passed ? 'مبروك! نجحت وتفوقت' : 'تحتاج مراجعة وامتحان آخر'}</h2>
          <p className="text-4xl font-bold text-white mt-4">{score} / {exam.totalPoints}</p>
          <Badge variant={passed ? 'success' : 'error'} className="mt-4">{passed ? 'ناجح' : 'راسب'}</Badge>
          <p className="text-sm text-neutral-400 mt-4">
            {passed
              ? 'تم تحديث تقدمك بنجاح والدرس التالي أصبح متاحاً الآن في مسارك التعليمي.'
              : `لازم تجيب ${EXAM_PASS_THRESHOLD}% علشان تعدّ. راجع الدرس وامتحن تاني.`
            }
          </p>
          <button onClick={onExit} className="btn-primary mt-6 text-xs">رجوع للامتحانات</button>
        </Card>

        {/* Review answers */}
        <Card>
          <h3 className="mb-4 font-bold text-white">مراجعة الإجابات</h3>
          <div className="space-y-3">
            {exam.questions.map((q, i) => {
              const userAns = answers[q.id];
              const correct = userAns === q.correctAnswer || (q.type === 'chat' && userAns && userAns.length > 15);
              return (
                <div key={q.id} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-800 text-xs font-bold text-white shrink-0">{i + 1}</span>
                    <p className="text-sm text-white flex-1">{q.question}</p>
                    {userAns && (correct ? (
                      <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0" />
                    ))}
                  </div>
                  <div className="text-xs text-neutral-400 pr-9">
                    <p>إجابتك: <span className={correct ? 'text-green-400' : 'text-red-400'}>{userAns || 'لم تجب'}</span></p>
                    {!correct && <p className="text-green-400 mt-1">الإجابة النموذجية: {q.correctAnswer}</p>}
                    <p className="text-neutral-500 mt-1">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam header */}
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: meta.accentSoft, color: meta.accent }}>
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{exam.topic}</h2>
            <p className="text-xs text-neutral-400">{meta.labelAr} — اختبار تقييم الفهم</p>
          </div>
          <Badge variant="info" className="mr-auto">سؤال {currentQ + 1} من {exam.questions.length}</Badge>
        </div>
        <div className="mt-4">
          <ProgressBar value={((currentQ + 1) / exam.questions.length) * 100} />
        </div>
      </Card>

      {/* Question */}
      <Card>
        <QuestionRenderer
          question={question}
          index={currentQ}
          selectedAnswer={answers[question.id]}
          chatAnswer={chatAnswer}
          onChatChange={setChatAnswer}
          onSelect={(ans) => selectAnswer(question.id, ans)}
        />
      </Card>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button onClick={prev} disabled={currentQ === 0} className="btn-secondary text-xs disabled:opacity-30">
          السابق
        </button>
        <div className="flex-1 flex justify-center gap-1.5">
          {exam.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`h-2 rounded-full transition-all ${i === currentQ ? 'w-8 bg-white' : answers[exam.questions[i].id] ? 'w-2 bg-green-500' : 'w-2 bg-neutral-700'}`}
            />
          ))}
        </div>
        <button onClick={next} disabled={submitting} className="btn-primary text-xs flex items-center gap-1">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : isLast ? 'تسليم' : 'التالي'}
          {!submitting && <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );
}

function QuestionRenderer({ question, index, selectedAnswer, chatAnswer, onChatChange, onSelect }: {
  question: { id: string; type: 'mcq' | 'truefalse' | 'chat'; question: string; options?: string[]; points: number };
  index: number;
  selectedAnswer?: string;
  chatAnswer: string;
  onChatChange: (v: string) => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="neutral" className="text-[10px]">
          {question.type === 'mcq' ? 'اختيارات' : question.type === 'truefalse' ? 'صح وغلط' : 'سؤال شات تفاعلي'}
        </Badge>
        <Badge variant="info" className="text-[10px]">{question.points} نقطة</Badge>
      </div>

      <p className="text-lg text-white mb-6 leading-relaxed">{question.question}</p>

      {question.type === 'mcq' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-right transition ${
                selectedAnswer === opt
                  ? 'border-white bg-[#1a1a1a] text-white'
                  : 'border-[#2a2a2a] bg-[#141414] text-neutral-300 hover:border-[#444]'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0 ${
                selectedAnswer === opt ? 'border-white bg-white' : 'border-neutral-600'
              }`}>
                {selectedAnswer === opt && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
              </div>
              <span className="text-sm">{opt}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-3">
          {['صح', 'غلط'].map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`flex items-center justify-center gap-2 rounded-xl border p-6 transition ${
                selectedAnswer === opt
                  ? opt === 'صح' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-[#2a2a2a] bg-[#141414] text-neutral-300 hover:border-[#444]'
              }`}
            >
              {opt === 'صح' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span className="text-lg font-bold">{opt}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'chat' && (
        <div>
          <div className="flex items-start gap-2 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 mb-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 text-xs font-bold text-white">ذ</div>
            <p className="text-sm text-neutral-300">
              اكتب إجابتك بالتفصيل — النظام الذكي سيحللها ويقيّم فهمك الحقيقي للموضوع.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={chatAnswer}
              onChange={(e) => { onChatChange(e.target.value); onSelect(e.target.value); }}
              placeholder="اكتب إجابتك هنا..."
              rows={4}
              className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#444] resize-none"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">يقوم الذكاء الاصطناعي بتقييم إجابتك المكتوبة فور تسليم الامتحان</p>
        </div>
      )}
    </div>
  );
}
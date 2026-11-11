import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  ChevronLeft,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import {
  Card,
  Badge,
  ProgressBar,
  EmptyState,
} from '@/components/ui';

import { SUBJECT_META } from '@/data/subjects';

import {
  updateLessonMastery,
  unlockNextLesson,
  fetchLessonMastery,
  type LessonMasteryRow,
  type StudentRow,
} from '@/lib/db';

import { fetchStudentExamData } from '@/lib/studentCurriculum';
import { cn } from '@/lib/utils';

const EXAM_PASS_THRESHOLD = 70;

interface ExamQuestion {
  id: string;
  type: 'mcq' | 'truefalse' | 'chat';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
}

interface DynamicExam {
  id: string;
  subject: string;
  subjectLabel: string;
  topic: string;
  status: 'pending' | 'completed' | 'in-progress';
  score: number | null;
  totalPoints: number;
  isLocked: boolean;
  questions: ExamQuestion[];
}

function createExamQuestions(
  lessonTitle: string,
  lessonId: string
): ExamQuestion[] {
  return [
    {
      id: `${lessonId}-q1`,
      type: 'mcq',
      question: `ما الفكرة الأساسية التي يتناولها درس (${lessonTitle})؟`,
      options: [
        'فهم المفاهيم الأساسية للدرس',
        'حفظ المعلومات دون فهم',
        'تجاهل القواعد والتطبيقات',
        'لا شيء مما سبق',
      ],
      correctAnswer: 'فهم المفاهيم الأساسية للدرس',
      points: 40,
      explanation: `يركز درس ${lessonTitle} على فهم المفاهيم الأساسية وتطبيقها.`,
    },
    {
      id: `${lessonId}-q2`,
      type: 'truefalse',
      question: `هل يساعد فهم درس (${lessonTitle}) على استيعاب الموضوعات المرتبطة به؟`,
      options: ['صح', 'غلط'],
      correctAnswer: 'صح',
      points: 30,
      explanation:
        'فهم المفاهيم الأساسية يساعد على استيعاب الموضوعات المرتبطة بها.',
    },
    {
      id: `${lessonId}-q3`,
      type: 'chat',
      question: `اشرح باختصار أهم ما فهمته من درس (${lessonTitle}).`,
      correctAnswer: 'إجابة توضح فهم الدرس',
      points: 30,
      explanation:
        'الإجابة التي توضح الفكرة الأساسية للدرس تُعد مؤشرًا على الفهم.',
    },
  ];
}

/**
 * Returns the visual metadata for a known subject.
 * Custom subjects receive neutral styling instead of falling back to Math.
 */
function getSubjectMeta(subject: string) {
  const meta = SUBJECT_META[subject as keyof typeof SUBJECT_META];

  if (meta) {
    return meta;
  }

  return {
    accent: '#a3a3a3',
    accentSoft: 'rgba(163, 163, 163, 0.12)',
  };
}

function buildDynamicExams(
  lessons: Array<{
    lesson: {
      id: string;
      name: string;
      name_ar: string | null;
    };
    subject: {
      subject_key: string;
      subject_name: string;
      subject_name_ar: string | null;
    };
    mastery: LessonMasteryRow | null;
  }>,
  allowedSubjectKeys: Set<string>
): DynamicExam[] {
  return lessons
    .filter(
      (item) =>
        item.mastery !== null &&
        allowedSubjectKeys.has(item.subject.subject_key)
    )
    .map((item) => {
      const mastery = item.mastery!;

      const isCompleted =
        mastery.mastery >= 100 && mastery.exam_passed === true;

      const lessonTitle =
        item.lesson.name_ar ||
        item.lesson.name ||
        mastery.lesson_title ||
        'درس بدون اسم';

      const subjectLabel =
        item.subject.subject_name_ar ||
        item.subject.subject_name ||
        item.subject.subject_key;

      return {
        id: mastery.id,
        subject: item.subject.subject_key,
        subjectLabel,
        topic: lessonTitle,
        status: isCompleted ? 'completed' : 'pending',
        score: mastery.exam_score,
        totalPoints: 100,
        isLocked: !mastery.unlocked,
        questions: createExamQuestions(lessonTitle, item.lesson.id),
      };
    });
}

export function StudentExams({
  studentId,
}: {
  studentId?: string;
}) {
  const storedStudentId =
    typeof window !== 'undefined'
      ? localStorage.getItem('current_student_id')
      : null;

  const activeStudentId = studentId || storedStudentId || '';

  const [student, setStudent] = useState<StudentRow | null>(null);
  const [dynamicExams, setDynamicExams] = useState<DynamicExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeExam, setActiveExam] = useState<DynamicExam | null>(null);

  const loadExamData = async () => {
    if (!activeStudentId) {
      setStudent(null);
      setDynamicExams([]);
      setErrorMessage('لم يتم العثور على حساب الطالب. سجل الدخول مرة أخرى.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const data = await fetchStudentExamData(activeStudentId);

      if (!data) {
        setStudent(null);
        setDynamicExams([]);
        setErrorMessage('تعذر تحميل بيانات الطالب أو لم يتم العثور عليه.');
        return;
      }

      setStudent(data.student);

      const allowedSubjectKeys = new Set(
        data.subjects.map((subject) => subject.subject_key)
      );

      const exams = buildDynamicExams(
        data.lessons,
        allowedSubjectKeys
      );

      setDynamicExams(exams);

      if (!data.student.curriculum_id) {
        setErrorMessage('لم يتم ربط حسابك بمنهج دراسي حتى الآن.');
      } else if (data.subjects.length === 0) {
        setErrorMessage('لا توجد مواد دراسية مفعّلة في منهجك حتى الآن.');
      } else if (exams.length === 0) {
        setErrorMessage(
          'لا توجد دروس منشورة لها امتحانات في الترم الحالي حتى الآن.'
        );
      }
    } catch (error) {
      console.error('Failed to load student exams:', error);
      setErrorMessage('حدث خطأ أثناء تحميل الامتحانات. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamData();
  }, [activeStudentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={24}
          className="animate-spin text-neutral-500"
        />
      </div>
    );
  }

  if (activeExam) {
    return (
      <ExamRunner
        exam={activeExam}
        studentId={activeStudentId}
        onExit={async () => {
          setActiveExam(null);
          await loadExamData();
        }}
      />
    );
  }

  const pending = dynamicExams.filter(
    (exam) => exam.status === 'pending'
  );

  const completed = dynamicExams.filter(
    (exam) => exam.status === 'completed'
  );

  const inProgress = dynamicExams.filter(
    (exam) => exam.status === 'in-progress'
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {pending.length}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              امتحانات منتظرة
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">
              {inProgress.length}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              قيد التقدم
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {completed.length}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              مكتملة
            </p>
          </div>
        </Card>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-400"
          />

          <div>
            <p className="text-sm font-medium text-amber-300">
              عايز تفتح الدرس اللي بعده؟
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              لازم تجيب {EXAM_PASS_THRESHOLD}% أو أكتر في امتحان الدرس
              علشان الدرس اللي بعده يفتح. لو جبت أقل، راجع الدرس
              تاني وامتحن مرة أخرى.
            </p>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <Card>
          <div className="py-4 text-center">
            <AlertCircle
              size={28}
              className="mx-auto mb-3 text-amber-400"
            />

            <p className="text-sm text-neutral-300">
              {errorMessage}
            </p>

            <button
              onClick={loadExamData}
              className="btn-primary mt-4 text-xs"
            >
              إعادة المحاولة
            </button>
          </div>
        </Card>
      )}

      {!errorMessage && (
        <>
          <Card>
            <h3 className="mb-4 font-bold text-white">
              امتحانات تنتظرك ({student?.name ?? 'الطالب'})
            </h3>

            <div className="space-y-3">
              {pending.map((exam) => {
                const meta = getSubjectMeta(exam.subject);
                const isLocked = exam.isLocked;

                return (
                  <div
                    key={exam.id}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4',
                      isLocked
                        ? 'border-[#222] bg-[#0a0a0a] opacity-70'
                        : 'border-[#2a2a2a] bg-[#141414]'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        isLocked && 'opacity-50'
                      )}
                      style={{
                        background: meta.accentSoft,
                        color: meta.accent,
                      }}
                    >
                      {isLocked ? (
                        <Lock size={22} />
                      ) : (
                        <ClipboardCheck size={22} />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4
                        className={cn(
                          'text-sm font-semibold',
                          isLocked ? 'text-neutral-500' : 'text-white'
                        )}
                      >
                        {exam.topic}
                      </h4>

                      <p className="mt-0.5 text-xs text-neutral-400">
                        {exam.subjectLabel} — امتحان تقييم مستوى
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge variant="neutral" className="text-[10px]">
                          {exam.questions.length} أسئلة
                        </Badge>

                        <Badge variant="neutral" className="text-[10px]">
                          {exam.totalPoints} نقطة
                        </Badge>

                        {isLocked && (
                          <Badge variant="neutral" className="text-[10px]">
                            <Lock size={10} /> مقفل
                          </Badge>
                        )}
                      </div>

                      {isLocked && (
                        <p className="mt-1 text-[10px] text-neutral-600">
                          يفتح لما تجتاز امتحان الدرس اللي قبله
                        </p>
                      )}
                    </div>

                    {isLocked ? (
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Lock size={14} />
                        مقفل
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveExam(exam)}
                        className="btn-primary text-xs"
                      >
                        <Play size={14} /> ابدأ
                      </button>
                    )}
                  </div>
                );
              })}

              {pending.length === 0 && (
                <p className="py-8 text-center text-sm text-neutral-500">
                  مفيش امتحانات منتظرة حالياً
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-bold text-white">
              امتحانات مكتملة
            </h3>

            <div className="space-y-3">
              {completed.map((exam) => {
                const meta = getSubjectMeta(exam.subject);
                const score = exam.score ?? 0;

                return (
                  <div
                    key={exam.id}
                    className="flex items-center gap-4 rounded-xl bg-[#141414] p-4"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        background: meta.accentSoft,
                        color: meta.accent,
                      }}
                    >
                      <Award size={22} />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">
                        {exam.topic}
                      </h4>

                      <p className="mt-0.5 text-xs text-neutral-500">
                        {exam.subjectLabel}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-400">
                        {score}
                      </p>

                      <p className="text-[10px] text-neutral-500">
                        من {exam.totalPoints}
                      </p>
                    </div>

                    <Badge variant="success">
                      <CheckCircle2 size={12} /> نجح
                    </Badge>

                    <button
                      onClick={() => setActiveExam(exam)}
                      className="btn-secondary whitespace-nowrap text-xs"
                    >
                      <Play size={14} /> إعادة
                    </button>
                  </div>
                );
              })}

              {completed.length === 0 && (
                <EmptyState
                  icon={<ClipboardCheck size={28} />}
                  title="مفيش امتحانات مكتملة بعد"
                />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ExamRunner({
  exam,
  studentId,
  onExit,
}: {
  exam: DynamicExam;
  studentId: string;
  onExit: () => void | Promise<void>;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatAnswer, setChatAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const question = exam.questions[currentQ];
  const meta = getSubjectMeta(exam.subject);
  const isLast = currentQ === exam.questions.length - 1;

  const selectAnswer = (qid: string, answer: string) => {
    setAnswers((previous) => ({
      ...previous,
      [qid]: answer,
    }));
  };

  const calculateScore = () => {
    return exam.questions.reduce((total, currentQuestion) => {
      const answer = answers[currentQuestion.id];

      if (!answer) {
        return total;
      }

      if (currentQuestion.type === 'chat') {
        return (
          total +
          (answer.trim().length > 15
            ? currentQuestion.points
            : Math.floor(currentQuestion.points * 0.4))
        );
      }

      return answer === currentQuestion.correctAnswer
        ? total + currentQuestion.points
        : total;
    }, 0);
  };

  const next = async () => {
    if (!isLast) {
      setCurrentQ((current) => current + 1);
      setChatAnswer('');
      return;
    }

    try {
      setSubmitting(true);
      setSaveError('');

      const score = calculateScore();
      const passed = score >= EXAM_PASS_THRESHOLD;

      await updateLessonMastery(exam.id, {
        mastery: passed ? 100 : 50,
        exam_score: score,
        exam_passed: passed,
      });

      if (passed) {
        const masteryRows = await fetchLessonMastery(studentId);

        const currentLesson = masteryRows.find(
          (lesson) => lesson.id === exam.id
        );

        if (currentLesson) {
          await unlockNextLesson(
            studentId,
            currentLesson.subject,
            currentLesson.lesson_order
          );
        }
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to save exam result:', error);
      setSaveError(
        'حصل خطأ أثناء حفظ النتيجة. حاول تسليم الامتحان مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const prev = () => {
    if (currentQ > 0) {
      setCurrentQ((current) => current - 1);
      setChatAnswer('');
    }
  };

  if (submitted) {
    const score = calculateScore();
    const passed = score >= EXAM_PASS_THRESHOLD;

    return (
      <div className="space-y-6">
        <Card className="border-white/10 bg-gradient-to-br from-[#181818] to-[#141414] py-12 text-center">
          <div
            className={cn(
              'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl',
              passed
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {passed ? (
              <CheckCircle2 size={40} />
            ) : (
              <XCircle size={40} />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white">
            {passed
              ? 'مبروك! نجحت وتفوقت'
              : 'تحتاج مراجعة وامتحان آخر'}
          </h2>

          <p className="mt-4 text-4xl font-bold text-white">
            {score} / {exam.totalPoints}
          </p>

          <Badge
            variant={passed ? 'success' : 'error'}
            className="mt-4"
          >
            {passed ? 'ناجح' : 'راسب'}
          </Badge>

          <p className="mt-4 text-sm text-neutral-400">
            {passed
              ? 'تم تحديث تقدمك بنجاح، والدرس التالي أصبح متاحاً إذا كان موجوداً في مسارك التعليمي.'
              : `لازم تجيب ${EXAM_PASS_THRESHOLD}% علشان تعدّي. راجع الدرس وامتحن تاني.`}
          </p>

          <button
            onClick={onExit}
            className="btn-primary mt-6 text-xs"
          >
            رجوع للامتحانات
          </button>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-white">
            مراجعة الإجابات
          </h3>

          <div className="space-y-3">
            {exam.questions.map((currentQuestion, index) => {
              const userAnswer = answers[currentQuestion.id];

              const correct =
                userAnswer === currentQuestion.correctAnswer ||
                (currentQuestion.type === 'chat' &&
                  Boolean(userAnswer) &&
                  userAnswer.trim().length > 15);

              return (
                <div
                  key={currentQuestion.id}
                  className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xs font-bold text-white">
                      {index + 1}
                    </span>

                    <p className="flex-1 text-sm text-white">
                      {currentQuestion.question}
                    </p>

                    {userAnswer &&
                      (correct ? (
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-green-400"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="shrink-0 text-red-400"
                        />
                      ))}
                  </div>

                  <div className="pr-9 text-xs text-neutral-400">
                    <p>
                      إجابتك:{' '}
                      <span
                        className={
                          correct ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {userAnswer || 'لم تجب'}
                      </span>
                    </p>

                    {!correct && (
                      <p className="mt-1 text-green-400">
                        الإجابة النموذجية:{' '}
                        {currentQuestion.correctAnswer}
                      </p>
                    )}

                    <p className="mt-1 text-neutral-500">
                      {currentQuestion.explanation}
                    </p>
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
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: meta.accentSoft,
              color: meta.accent,
            }}
          >
            <ClipboardCheck size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              {exam.topic}
            </h2>

            <p className="text-xs text-neutral-400">
              {exam.subjectLabel} — اختبار تقييم الفهم
            </p>
          </div>

          <Badge variant="info" className="mr-auto">
            سؤال {currentQ + 1} من {exam.questions.length}
          </Badge>
        </div>

        <div className="mt-4">
          <ProgressBar
            value={
              ((currentQ + 1) / exam.questions.length) * 100
            }
          />
        </div>
      </Card>

      {saveError && (
        <Card>
          <p className="text-sm text-red-400">{saveError}</p>
        </Card>
      )}

      <Card>
        <QuestionRenderer
          question={question}
          index={currentQ}
          selectedAnswer={answers[question.id]}
          chatAnswer={chatAnswer}
          onChatChange={setChatAnswer}
          onSelect={(answer) => selectAnswer(question.id, answer)}
        />
      </Card>

      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          disabled={currentQ === 0 || submitting}
          className="btn-secondary text-xs disabled:opacity-30"
        >
          السابق
        </button>

        <div className="flex flex-1 justify-center gap-1.5">
          {exam.questions.map((currentQuestion, index) => (
            <button
              key={currentQuestion.id}
              onClick={() => {
                setCurrentQ(index);
                setChatAnswer('');
              }}
              disabled={submitting}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentQ
                  ? 'w-8 bg-white'
                  : answers[currentQuestion.id]
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-neutral-700'
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={submitting}
          className="btn-primary flex items-center gap-1 text-xs"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isLast ? (
            'تسليم'
          ) : (
            'التالي'
          )}

          {!submitting && <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  index,
  selectedAnswer,
  chatAnswer,
  onChatChange,
  onSelect,
}: {
  question: ExamQuestion;
  index: number;
  selectedAnswer?: string;
  chatAnswer: string;
  onChatChange: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="neutral" className="text-[10px]">
          {question.type === 'mcq'
            ? 'اختيارات'
            : question.type === 'truefalse'
              ? 'صح وغلط'
              : 'سؤال كتابي'}
        </Badge>

        <Badge variant="info" className="text-[10px]">
          {question.points} نقطة
        </Badge>
      </div>

      <p className="mb-6 text-lg leading-relaxed text-white">
        {question.question}
      </p>

      {question.type === 'mcq' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-4 text-right transition',
                selectedAnswer === option
                  ? 'border-white bg-[#1a1a1a] text-white'
                  : 'border-[#2a2a2a] bg-[#141414] text-neutral-300 hover:border-[#444]'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                  selectedAnswer === option
                    ? 'border-white bg-white'
                    : 'border-neutral-600'
                )}
              >
                {selectedAnswer === option && (
                  <div className="h-2.5 w-2.5 rounded-full bg-black" />
                )}
              </div>

              <span className="text-sm">{option}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'truefalse' && (
        <div className="grid grid-cols-2 gap-3">
          {['صح', 'غلط'].map((option) => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border p-6 transition',
                selectedAnswer === option
                  ? option === 'صح'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-[#2a2a2a] bg-[#141414] text-neutral-300 hover:border-[#444]'
              )}
            >
              {option === 'صح' ? (
                <CheckCircle2 size={24} />
              ) : (
                <XCircle size={24} />
              )}

              <span className="text-lg font-bold">{option}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'chat' && (
        <div>
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-900 text-xs font-bold text-white">
              ذ
            </div>

            <p className="text-sm text-neutral-300">
              اكتب إجابتك بالتفصيل. سيتم تقييم الإجابة وفقًا لطولها
              حاليًا، وليس بتحليل ذكاء اصطناعي لمحتواها.
            </p>
          </div>

          <textarea
            value={chatAnswer}
            onChange={(event) => {
              onChatChange(event.target.value);
              onSelect(event.target.value);
            }}
            placeholder="اكتب إجابتك هنا..."
            rows={4}
            className="w-full resize-none rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-[#444] focus:outline-none"
          />

          <p className="mt-2 text-xs text-neutral-500">
            سيتم احتساب درجة السؤال الكتابي بناءً على طول الإجابة في
            النسخة الحالية.
          </p>
        </div>
      )}
    </div>
  );
}

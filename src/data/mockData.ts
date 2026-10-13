import type {
  Student,
  Teacher,
  School,
  Parent,
  Session,
  ChatMessage,
  SubjectProgress,
  ProgressReport,
  SystemNotification,
  FAQ,
  PlanTier,
  ActivityItem,
  RevenueRow,
  SkillInsight,
  StepAnimation,
  Exam,
  WhatsAppTemplate,
  WhatsAppMessage,
  BlockedUser,
  AITemplate,
  SchoolPortal,
  StudentChatRecord,
} from '@/types';
import { SUBJECT_META } from './subjects';
import type { Subject } from '@/types';

export const SCHOOLS: School[] = [
  { id: 's1', name: 'مدرسة المستقبل الدولية', location: 'القاهرة — مدينة نصر', studentsCount: 42, teachersCount: 6, contractStatus: 'active', monthlyReferralFee: 3360, referralPerStudent: 80, joinDate: '2026-05-12' },
  { id: 's2', name: 'مدارس النيل الخاصة', location: 'القاهرة — المعادي', studentsCount: 28, teachersCount: 4, contractStatus: 'active', monthlyReferralFee: 2240, referralPerStudent: 80, joinDate: '2026-06-01' },
  { id: 's3', name: 'مدرسة الأهرام الدولية', location: 'الجيزة — 6 أكتوبر', studentsCount: 15, teachersCount: 3, contractStatus: 'trial', monthlyReferralFee: 0, referralPerStudent: 80, joinDate: '2026-09-15' },
  { id: 's4', name: 'مدارس الإسكندرية الحديثة', location: 'الإسكندرية — سموحة', studentsCount: 8, teachersCount: 2, contractStatus: 'pending', monthlyReferralFee: 0, referralPerStudent: 80, joinDate: '2026-09-28' },
  { id: 's5', name: 'مدرسة المنصورة للغات', location: 'الدقهلية — المنصورة', studentsCount: 0, teachersCount: 0, contractStatus: 'pending', monthlyReferralFee: 0, referralPerStudent: 80, joinDate: '2026-10-01' },
];

export const TEACHERS: Teacher[] = [
  { id: 't1', name: 'أ. محمود سعيد', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', subject: 'math', avatar: 'MS', studentsCount: 18 },
  { id: 't2', name: 'أ. سارة عبد الله', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', subject: 'chemistry', avatar: 'SA', studentsCount: 12 },
  { id: 't3', name: 'أ. خالد فؤاد', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', subject: 'physics', avatar: 'KF', studentsCount: 8 },
  { id: 't4', name: 'أ. منى رشاد', schoolId: 's2', schoolName: 'مدارس النيل الخاصة', subject: 'biology', avatar: 'MR', studentsCount: 15 },
  { id: 't5', name: 'أ. أحمد زكي', schoolId: 's2', schoolName: 'مدارس النيل الخاصة', subject: 'english', avatar: 'AZ', studentsCount: 13 },
];

export const PARENTS: Parent[] = [
  { id: 'p1', name: 'محمد عبد الرحمن', phone: '01012345678', childrenIds: ['st1'] },
  { id: 'p2', name: 'فاطمة الزهراء', phone: '01098765432', childrenIds: ['st2'] },
  { id: 'p3', name: 'خالد إبراهيم', phone: '01155667788', childrenIds: ['st3'] },
  { id: 'p4', name: 'نورا حسن', phone: '01233445566', childrenIds: ['st4'] },
  { id: 'p5', name: 'عمرو شعبان', phone: '01099887766', childrenIds: ['st5'] },
];

export const STUDENTS: Student[] = [
  { id: 'st1', name: 'أحمد محمد', grade: 'الصف الأول الثانوي', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', avatar: 'AM', activeSubject: 'math', lastActive: 'منذ 5 دقائق', streakDays: 12, weeklyGoal: 10, weeklyProgress: 7, subscriptionStatus: 'active', subscriptionStart: '2026-07-01', monthlyFee: 500, parentName: 'محمد عبد الرحمن', parentPhone: '01012345678' },
  { id: 'st2', name: 'فاطمة خالد', grade: 'الصف الثاني الثانوي', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', avatar: 'FK', activeSubject: 'chemistry', lastActive: 'منذ 20 دقيقة', streakDays: 8, weeklyGoal: 10, weeklyProgress: 5, subscriptionStatus: 'active', subscriptionStart: '2026-07-15', monthlyFee: 500, parentName: 'فاطمة الزهراء', parentPhone: '01098765432' },
  { id: 'st3', name: 'يوسف عماد', grade: 'الصف الثالث الثانوي', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', avatar: 'YE', activeSubject: 'physics', lastActive: 'منذ ساعة', streakDays: 3, weeklyGoal: 10, weeklyProgress: 3, subscriptionStatus: 'trial', subscriptionStart: '2026-09-20', monthlyFee: 500, parentName: 'خالد إبراهيم', parentPhone: '01155667788' },
  { id: 'st4', name: 'مريم حسام', grade: 'الصف الأول الثانوي', schoolId: 's2', schoolName: 'مدارس النيل الخاصة', avatar: 'MH', activeSubject: 'biology', lastActive: 'منذ 3 ساعات', streakDays: 15, weeklyGoal: 10, weeklyProgress: 9, subscriptionStatus: 'active', subscriptionStart: '2026-08-01', monthlyFee: 500, parentName: 'نورا حسن', parentPhone: '01233445566' },
  { id: 'st5', name: 'عمر أيمن', grade: 'الصف الثاني الثانوي', schoolId: 's2', schoolName: 'مدارس النيل الخاصة', avatar: 'OA', activeSubject: 'english', lastActive: 'منذ يوم', streakDays: 0, weeklyGoal: 10, weeklyProgress: 2, subscriptionStatus: 'trial', subscriptionStart: '2026-09-25', monthlyFee: 500, parentName: 'عمرو شعبان', parentPhone: '01099887766' },
  { id: 'st6', name: 'سلمى طارق', grade: 'الصف الثالث الثانوي', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', avatar: 'ST', activeSubject: 'history', lastActive: 'منذ 30 دقيقة', streakDays: 7, weeklyGoal: 10, weeklyProgress: 6, subscriptionStatus: 'active', subscriptionStart: '2026-06-20', monthlyFee: 500, parentName: 'طارق منصور', parentPhone: '01066554433' },
  { id: 'st7', name: 'آدم نبيل', grade: 'الصف الأول الثانوي', schoolId: 's2', schoolName: 'مدارس النيل الخاصة', avatar: 'AN', activeSubject: 'geography', lastActive: 'منذ ساعتين', streakDays: 4, weeklyGoal: 10, weeklyProgress: 4, subscriptionStatus: 'active', subscriptionStart: '2026-08-10', monthlyFee: 500, parentName: 'نبيل فتحي', parentPhone: '01077889900' },
  { id: 'st8', name: 'هدى يسري', grade: 'الصف الثاني الثانوي', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', avatar: 'HY', activeSubject: 'math', lastActive: 'منذ 10 دقائق', streakDays: 20, weeklyGoal: 10, weeklyProgress: 8, subscriptionStatus: 'active', subscriptionStart: '2026-05-15', monthlyFee: 500, parentName: 'يسري عبد الله', parentPhone: '01022334455' },
];

export const CURRENT_STUDENT = STUDENTS[0];

export const SESSIONS: Session[] = [
  { id: 'se1', studentId: 'st1', studentName: 'أحمد محمد', subject: 'math', topic: 'المعادلات التفاضلية', status: 'scheduled', date: '2026-10-06T16:00:00', duration: 25, teacherId: 't1' },
  { id: 'se2', studentId: 'st1', studentName: 'أحمد محمد', subject: 'math', topic: 'حساب التفاضل والتكامل', status: 'completed', date: '2026-10-04T16:00:00', duration: 28, teacherId: 't1' },
  { id: 'se3', studentId: 'st1', studentName: 'أحمد محمد', subject: 'physics', topic: 'قوانين نيوتن', status: 'completed', date: '2026-10-02T17:00:00', duration: 30, teacherId: 't3' },
  { id: 'se4', studentId: 'st2', studentName: 'فاطمة خالد', subject: 'chemistry', topic: 'الروابط الكيميائية', status: 'scheduled', date: '2026-10-06T15:00:00', duration: 25, teacherId: 't2' },
  { id: 'se5', studentId: 'st3', studentName: 'يوسف عماد', subject: 'physics', topic: 'الحركة الدائرية', status: 'live', date: '2026-10-05T14:00:00', duration: 25, teacherId: 't3' },
  { id: 'se6', studentId: 'st4', studentName: 'مريم حسام', subject: 'biology', topic: 'الانقسام الخلوي', status: 'completed', date: '2026-10-03T16:00:00', duration: 32, teacherId: 't4' },
  { id: 'se7', studentId: 'st6', studentName: 'سلمى طارق', subject: 'history', topic: 'الثورة المصرية 1919', status: 'completed', date: '2026-10-01T18:00:00', duration: 26 },
  { id: 'se8', studentId: 'st8', studentName: 'هدى يسري', subject: 'math', topic: 'الكسور المتشابكة', status: 'scheduled', date: '2026-10-07T16:00:00', duration: 25, teacherId: 't1' },
];

const whiteboardSinCos: StepAnimation[] = [
  {
    id: 'step1',
    label: 'المجاور',
    narration: 'اولاً، عندنا القاعدة — الجزء اللي جنب الزاوية. اسمه المجاور.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#2563eb', x1: 80, y1: 260, x2: 320, y2: 260, delayMs: 0 }, { kind: 'text', color: '#2563eb', x1: 180, y1: 290, text: 'المجاور', fontSize: 16 }],
  },
  {
    id: 'step2',
    label: 'المقابل',
    narration: 'ثانياً، الارتفاع اللي مقابل الزاوية. اسمه المقابل.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#dc2626', x1: 320, y1: 260, x2: 320, y2: 80, delayMs: 500 }, { kind: 'text', color: '#dc2626', x1: 330, y1: 170, text: 'المقابل', fontSize: 16 }],
  },
  {
    id: 'step3',
    label: 'الوتر',
    narration: 'ثالثاً، الضلع المائل اللي مقابل الزاوية القائمة. ده الوتر.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#16a34a', x1: 80, y1: 260, x2: 320, y2: 80, delayMs: 500 }, { kind: 'text', color: '#16a34a', x1: 170, y1: 160, text: 'الوتر', fontSize: 16 }],
  },
  {
    id: 'step4',
    label: 'الزاوية A',
    narration: 'الزاوية اللي بنشتغل عليها هي الزاوية A عند القاعدة.',
    durationMs: 2500,
    shapes: [{ kind: 'arc', color: '#7c3aed', x1: 120, y1: 260, radius: 30, delayMs: 300 }, { kind: 'text', color: '#7c3aed', x1: 105, y1: 240, text: 'A', fontSize: 18 }],
  },
  {
    id: 'step5',
    label: 'sin A',
    narration: 'sin A = المقابل ÷ الوتر. لاحظ الجزء المظلل بالأحمر.',
    durationMs: 3500,
    shapes: [{ kind: 'highlight', color: '#dc2626', x1: 320, y1: 80, x2: 320, y2: 260, delayMs: 800 }, { kind: 'text', color: '#1f2937', x1: 420, y1: 100, text: 'sin A = المقابل / الوتر', fontSize: 18 }],
  },
  {
    id: 'step6',
    label: 'cos A',
    narration: 'cos A = المجاور ÷ الوتر. لاحظ الجزء المظلل بالأزرق.',
    durationMs: 3500,
    shapes: [{ kind: 'highlight', color: '#2563eb', x1: 80, y1: 255, x2: 320, y2: 265, delayMs: 800 }, { kind: 'text', color: '#1f2937', x1: 420, y1: 140, text: 'cos A = المجاور / الوتر', fontSize: 18 }],
  },
];

const whiteboardChemistry: StepAnimation[] = [
  {
    id: 'c1',
    label: 'ذرة الهيدروجين',
    narration: 'جزيء الماء H2O بيتكون من ذرة أكسجين وذرتي هيدروجين.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#dc2626', x1: 250, y1: 180, radius: 30, delayMs: 0 }, { kind: 'text', color: '#1f2937', x1: 240, y1: 175, text: 'O', fontSize: 20 }],
  },
  {
    id: 'c2',
    label: 'ذرات الهيدروجين',
    narration: 'دلوقتي نظيف ذرتي الهيدروجين، واحدة على كل جانب.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#2563eb', x1: 180, y1: 120, radius: 18, delayMs: 500 }, { kind: 'circle', color: '#2563eb', x1: 320, y1: 120, radius: 18 }, { kind: 'text', color: '#1f2937', x1: 174, y1: 116, text: 'H', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 314, y1: 116, text: 'H', fontSize: 14 }],
  },
  {
    id: 'c3',
    label: 'الروابط',
    narration: 'كل هيدروجين بيتشارك مع الأكسجين برابطة تساهمية.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#16a34a', x1: 195, y1: 130, x2: 225, y2: 165, delayMs: 500 }, { kind: 'line', color: '#16a34a', x1: 305, y1: 130, x2: 275, y2: 165 }],
  },
  {
    id: 'c4',
    label: 'المعادلة',
    narration: 'المعادلة الكيميائية: 2H + O = H2O.',
    durationMs: 3000,
    shapes: [{ kind: 'text', color: '#1f2937', x1: 170, y1: 280, text: '2H + O → H₂O', fontSize: 22, delayMs: 300 }],
  },
];

const whiteboardBiology: StepAnimation[] = [
  {
    id: 'b1',
    label: 'الخلية الأم',
    narration: 'الانقسام المتساوي بيبدأ بخلية أم واحدة بت contain النواة.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#16a34a', x1: 250, y1: 180, radius: 60, delayMs: 0 }, { kind: 'circle', color: '#0891b2', x1: 250, y1: 180, radius: 25 }],
  },
  {
    id: 'b2',
    label: 'تكرار الكروموسومات',
    narration: 'الكروموسومات بتتكرر جوه النواة.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#dc2626', x1: 240, y1: 170, x2: 240, y2: 190, delayMs: 500 }, { kind: 'line', color: '#dc2626', x1: 260, y1: 170, x2: 260, y2: 190 }],
  },
  {
    id: 'b3',
    label: 'الانقسام',
    narration: 'الخلية بتقسم لخليتين بنتين متطابقتين.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#16a34a', x1: 200, y1: 180, radius: 40, delayMs: 500 }, { kind: 'circle', color: '#16a34a', x1: 300, y1: 180, radius: 40 }, { kind: 'circle', color: '#0891b2', x1: 200, y1: 180, radius: 18 }, { kind: 'circle', color: '#0891b2', x1: 300, y1: 180, radius: 18 }],
  },
];

const whiteboardHistory: StepAnimation[] = [
  {
    id: 'h1',
    label: 'بداية الثورة',
    narration: 'الثورة المصرية سنة 1919 بدأت بعد اعتقال سعد زغلول.',
    durationMs: 3000,
    shapes: [{ kind: 'timeline-marker', color: '#b45309', x1: 80, y1: 200, delayMs: 0 }, { kind: 'text', color: '#1f2937', x1: 60, y1: 230, text: 'مارس 1919', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 60, y1: 250, text: 'بداية الثورة', fontSize: 12 }],
  },
  {
    id: 'h2',
    label: 'المظاهرات',
    narration: 'المظاهرات انتشرت في كل مصر — رجال وستات مع بعض.',
    durationMs: 3000,
    shapes: [{ kind: 'timeline-marker', color: '#b45309', x1: 200, y1: 200, delayMs: 500 }, { kind: 'text', color: '#1f2937', x1: 180, y1: 230, text: 'أبريل 1919', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 180, y1: 250, text: 'المظاهرات الكبرى', fontSize: 12 }],
  },
  {
    id: 'h3',
    label: 'النتيجة',
    narration: 'نتج عنها تصريح 1922 واستقلال صوري لمصر.',
    durationMs: 3000,
    shapes: [{ kind: 'timeline-marker', color: '#b45309', x1: 360, y1: 200, delayMs: 500 }, { kind: 'text', color: '#1f2937', x1: 340, y1: 230, text: '1922', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 340, y1: 250, text: 'تصريح 28 فبراير', fontSize: 12 }, { kind: 'line', color: '#b45309', x1: 80, y1: 200, x2: 360, y2: 200 }],
  },
];

const whiteboardSinCosEn: StepAnimation[] = [
  {
    id: 'step1',
    label: 'Adjacent',
    narration: 'First, the side next to the angle. It\'s called the adjacent.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#2563eb', x1: 80, y1: 260, x2: 320, y2: 260, delayMs: 0 }, { kind: 'text', color: '#2563eb', x1: 180, y1: 290, text: 'Adjacent', fontSize: 16 }],
  },
  {
    id: 'step2',
    label: 'Opposite',
    narration: 'Second, the height across from the angle. That\'s the opposite.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#dc2626', x1: 320, y1: 260, x2: 320, y2: 80, delayMs: 500 }, { kind: 'text', color: '#dc2626', x1: 330, y1: 170, text: 'Opposite', fontSize: 16 }],
  },
  {
    id: 'step3',
    label: 'Hypotenuse',
    narration: 'Third, the slanted side across from the right angle. That\'s the hypotenuse.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#16a34a', x1: 80, y1: 260, x2: 320, y2: 80, delayMs: 500 }, { kind: 'text', color: '#16a34a', x1: 170, y1: 160, text: 'Hypotenuse', fontSize: 16 }],
  },
  {
    id: 'step4',
    label: 'Angle A',
    narration: 'The angle we\'re working with is angle A at the base.',
    durationMs: 2500,
    shapes: [{ kind: 'arc', color: '#7c3aed', x1: 120, y1: 260, radius: 30, delayMs: 300 }, { kind: 'text', color: '#7c3aed', x1: 105, y1: 240, text: 'A', fontSize: 18 }],
  },
  {
    id: 'step5',
    label: 'sin A',
    narration: 'sin A = Opposite ÷ Hypotenuse. Notice the red-highlighted part.',
    durationMs: 3500,
    shapes: [{ kind: 'highlight', color: '#dc2626', x1: 320, y1: 80, x2: 320, y2: 260, delayMs: 800 }, { kind: 'text', color: '#1f2937', x1: 420, y1: 100, text: 'sin A = Opp / Hyp', fontSize: 18 }],
  },
  {
    id: 'step6',
    label: 'cos A',
    narration: 'cos A = Adjacent ÷ Hypotenuse. Notice the blue-highlighted part.',
    durationMs: 3500,
    shapes: [{ kind: 'highlight', color: '#2563eb', x1: 80, y1: 255, x2: 320, y2: 265, delayMs: 800 }, { kind: 'text', color: '#1f2937', x1: 420, y1: 140, text: 'cos A = Adj / Hyp', fontSize: 18 }],
  },
];

const whiteboardChemistryEn: StepAnimation[] = [
  {
    id: 'c1',
    label: 'Oxygen Atom',
    narration: 'A water molecule H2O is made of one oxygen atom and two hydrogen atoms.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#dc2626', x1: 250, y1: 180, radius: 30, delayMs: 0 }, { kind: 'text', color: '#1f2937', x1: 240, y1: 175, text: 'O', fontSize: 20 }],
  },
  {
    id: 'c2',
    label: 'Hydrogen Atoms',
    narration: 'Now we add two hydrogen atoms, one on each side.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#2563eb', x1: 180, y1: 120, radius: 18, delayMs: 500 }, { kind: 'circle', color: '#2563eb', x1: 320, y1: 120, radius: 18 }, { kind: 'text', color: '#1f2937', x1: 174, y1: 116, text: 'H', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 314, y1: 116, text: 'H', fontSize: 14 }],
  },
  {
    id: 'c3',
    label: 'Bonds',
    narration: 'Each hydrogen shares a covalent bond with the oxygen.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#16a34a', x1: 195, y1: 130, x2: 225, y2: 165, delayMs: 500 }, { kind: 'line', color: '#16a34a', x1: 305, y1: 130, x2: 275, y2: 165 }],
  },
  {
    id: 'c4',
    label: 'Equation',
    narration: 'The chemical equation: 2H + O → H2O.',
    durationMs: 3000,
    shapes: [{ kind: 'text', color: '#1f2937', x1: 170, y1: 280, text: '2H + O → H₂O', fontSize: 22, delayMs: 300 }],
  },
];

const whiteboardBiologyEn: StepAnimation[] = [
  {
    id: 'b1',
    label: 'Parent Cell',
    narration: 'Mitosis begins with a single parent cell containing the nucleus.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#16a34a', x1: 250, y1: 180, radius: 60, delayMs: 0 }, { kind: 'circle', color: '#0891b2', x1: 250, y1: 180, radius: 25 }],
  },
  {
    id: 'b2',
    label: 'Chromosome Duplication',
    narration: 'Chromosomes duplicate inside the nucleus.',
    durationMs: 3000,
    shapes: [{ kind: 'line', color: '#dc2626', x1: 240, y1: 170, x2: 240, y2: 190, delayMs: 500 }, { kind: 'line', color: '#dc2626', x1: 260, y1: 170, x2: 260, y2: 190 }],
  },
  {
    id: 'b3',
    label: 'Division',
    narration: 'The cell divides into two identical daughter cells.',
    durationMs: 3000,
    shapes: [{ kind: 'circle', color: '#16a34a', x1: 200, y1: 180, radius: 40, delayMs: 500 }, { kind: 'circle', color: '#16a34a', x1: 300, y1: 180, radius: 40 }, { kind: 'circle', color: '#0891b2', x1: 200, y1: 180, radius: 18 }, { kind: 'circle', color: '#0891b2', x1: 300, y1: 180, radius: 18 }],
  },
];

const whiteboardHistoryEn: StepAnimation[] = [
  {
    id: 'h1',
    label: 'Revolution Begins',
    narration: 'The 1919 Egyptian Revolution began after the arrest of Saad Zaghloul.',
    durationMs: 3000,
    shapes: [{ kind: 'timeline-marker', color: '#b45309', x1: 80, y1: 200, delayMs: 0 }, { kind: 'text', color: '#1f2937', x1: 60, y1: 230, text: 'March 1919', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 60, y1: 250, text: 'Revolution Begins', fontSize: 12 }],
  },
  {
    id: 'h2',
    label: 'Mass Protests',
    narration: 'Protests spread across Egypt — men and women together.',
    durationMs: 3000,
    shapes: [{ kind: 'timeline-marker', color: '#b45309', x1: 200, y1: 200, delayMs: 500 }, { kind: 'text', color: '#1f2937', x1: 180, y1: 230, text: 'April 1919', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 180, y1: 250, text: 'Mass Protests', fontSize: 12 }],
  },
  {
    id: 'h3',
    label: 'The Result',
    narration: 'It led to the 1922 Declaration and nominal independence for Egypt.',
    durationMs: 3000,
    shapes: [{ kind: 'timeline-marker', color: '#b45309', x1: 360, y1: 200, delayMs: 500 }, { kind: 'text', color: '#1f2937', x1: 340, y1: 230, text: '1922', fontSize: 14 }, { kind: 'text', color: '#1f2937', x1: 340, y1: 250, text: 'Feb 28 Declaration', fontSize: 12 }, { kind: 'line', color: '#b45309', x1: 80, y1: 200, x2: 360, y2: 200 }],
  },
];

export const SAMPLE_WHITEBOARDS_EN: Record<string, StepAnimation[]> = {
  sincos: whiteboardSinCosEn,
  water: whiteboardChemistryEn,
  mitosis: whiteboardBiologyEn,
  revolution1919: whiteboardHistoryEn,
};

export const SAMPLE_WHITEBOARDS: Record<string, StepAnimation[]> = {
  sincos: whiteboardSinCos,
  water: whiteboardChemistry,
  mitosis: whiteboardBiology,
  revolution1919: whiteboardHistory,
};

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', role: 'ai', text: 'يا أحمد، كيفك؟ الأسبوع اللي فات حسّيت إنك وصلت لحاجة مهمة في حساب التفاضل — عايزين نكمّل من هناك؟', timestamp: '14:00', reaction: 'neutral' },
  { id: 'm2', role: 'student', text: 'أهلاً! أيوة كنت بتسأل عن المعادلات التفاضلية بس لسه مش فاهمها كويس', timestamp: '14:02' },
  { id: 'm3', role: 'ai', text: 'تمام يا أحمد — تعال نبدأ من الأساس. هرسملك على السبورة خطوة بخطوة عشان تبقى واضحة.', timestamp: '14:03', reaction: 'encourage', hasWhiteboard: true, whiteboardSteps: whiteboardSinCos },
  { id: 'm4', role: 'student', text: 'أها فهمت! يعني sin بيستخدم المقابل وcos بيستخدم المجاور؟', timestamp: '14:08' },
  { id: 'm5', role: 'ai', text: 'برافو يا أحمد! بالظبط كده. sin A = المقابل ÷ الوتر، وcos A = المجاور ÷ الوتر. أنت بتتطور بسرعة في الموضوع ده.', timestamp: '14:09', reaction: 'celebrate' },
  { id: 'm6', role: 'ai', text: 'لاحظت إنك بتسأل كتير في المعادلات التفاضلية الأيام دي — عايز سيشن 25 دقيقة نخلّص الموضوع ده؟', timestamp: '14:10', reaction: 'neutral' },
];

export const PROGRESS_DATA: SubjectProgress[] = [
  { subject: 'math', mastery: 78, questionsAnswered: 142, sessionsCompleted: 12, strengths: ['الجبر', 'حساب التفاضل'], weaknesses: ['المعادلات التفاضلية'], recentTopics: ['sin وcos', 'التفاضل', 'الكسور المتشابكة'] },
  { subject: 'physics', mastery: 65, questionsAnswered: 88, sessionsCompleted: 8, strengths: ['قوانين نيوتن'], weaknesses: ['الحركة الدائرية'], recentTopics: ['قوانين نيوتن', 'القوى'] },
  { subject: 'chemistry', mastery: 52, questionsAnswered: 45, sessionsCompleted: 4, strengths: ['الجدول الدوري'], weaknesses: ['الروابط الكيميائية'], recentTopics: ['الروابط', 'المعادلات'] },
  { subject: 'biology', mastery: 70, questionsAnswered: 60, sessionsCompleted: 6, strengths: ['الخلية'], weaknesses: ['الانقسام المنصف'], recentTopics: ['الانقسام المتساوي', 'الخلية'] },
];

export const PROGRESS_REPORTS: ProgressReport[] = [
  { id: 'r1', studentId: 'st1', studentName: 'أحمد محمد', term: 'الترم الأول 2026', totalSessions: 24, activeLearningHours: 18.5, attendanceRate: 92, fastestTopics: ['الجبر الخطي', 'حساب التفاضل', 'قوانين نيوتن'], naturalIntuitionAreas: ['التفكير المكاني', 'التحليل المنطقي'], suggestedSkill: 'هندسة وعلوم حاسب', summerCourseTitle: 'برنامج الصيف: مقدمة في البرمجة والهندسة', generatedAt: '2026-09-30' },
  { id: 'r2', studentId: 'st4', studentName: 'مريم حسام', term: 'الترم الأول 2026', totalSessions: 28, activeLearningHours: 22, attendanceRate: 96, fastestTopics: ['الخلية', 'الجينات', 'الانقسام الخلوي'], naturalIntuitionAreas: ['الحفظ المرئي', 'الربط البيولوجي'], suggestedSkill: 'طب وعلوم حياة', summerCourseTitle: 'برنامج الصيف: مقدمة في علوم الحياة', generatedAt: '2026-09-30' },
];

export const NOTIFICATIONS: SystemNotification[] = [
  { id: 'n1', type: 'session', title: 'جلسة جديدة مجدولة', message: 'أحمد محمد — معادلة تفاضلية، غداً 4:00 م', timestamp: 'منذ 5 دقائق', read: false, forRole: 'student' },
  { id: 'n2', type: 'progress', title: 'تقدم ملحوظ', message: 'أحمد أتقن sin وcos بنسبة 85%', timestamp: 'منذ ساعة', read: false, forRole: 'parent' },
  { id: 'n3', type: 'alert', title: 'طالب متعثر', message: 'يوسف عماد لم يكمل 3 جلسات متتالية', timestamp: 'منذ 3 ساعات', read: false, forRole: 'teacher' },
  { id: 'n4', type: 'billing', title: 'تجديد اشتراك', message: '50 طالب جددوا اشتراكهم هذا الشهر', timestamp: 'منذ يوم', read: true, forRole: 'admin' },
];

export const FAQS_EN: FAQ[] = [
  { id: 'f1', question: 'What\'s the difference between The Primer and ChatGPT?', answer: 'ChatGPT waits for the student to come to it. The Primer proactively reaches out — it messages the student, remembers their name and history across sessions, and generates reports for parents. It\'s also built specifically for the Egyptian curriculum.' },
  { id: 'f2', question: 'Will the system replace the teacher?', answer: 'No — quite the opposite. The teacher gets a weekly dashboard showing who understands and who is struggling, so they enter class better prepared. The AI is a tool for the teacher, not a replacement.' },
  { id: 'f3', question: 'How will my child use the system?', answer: 'The student writes or sends a voice message anytime — the system responds instantly with text or an interactive drawing. The system also suggests full sessions when it senses the student needs one.' },
  { id: 'f4', question: 'How much does the subscription cost?', answer: '500 EGP per month, paid directly via Paymob or Fawry. The first two weeks are completely free — if you don\'t like it, you stop with no commitment.' },
  { id: 'f5', question: 'Is my child\'s data safe?', answer: 'All data is stored on encrypted Supabase servers, and no one can view it except the parent and the responsible teacher. The system complies with privacy standards.' },
];

export const PLAN_TIERS_EN: PlanTier[] = [
  { id: 'trial', name: 'Free Trial', price: 0, currency: 'EGP', period: 'two weeks', features: ['Full access to all features', '24/7 text messaging', 'Interactive sessions', 'Initial parent report'], highlight: false },
  { id: 'monthly', name: 'Monthly Subscription', price: 500, currency: 'EGP', period: 'per month', features: ['24/7 text and voice messaging', 'Unlimited interactive sessions', 'Interactive whiteboard for all subjects', 'Weekly parent reports', 'End-of-term report + skill discovery', 'Customized summer course'], highlight: true },
  { id: 'summer', name: 'Summer Course', price: 300, currency: 'EGP', period: 'full program', features: ['8 weeks personalized per student', 'Built on term data', 'Practical skill building', 'Final report with suggested career path'], highlight: false },
];

export const FAQS: FAQ[] = [
  { id: 'f1', question: 'إيه الفرق بين The Primer و ChatGPT؟', answer: 'ChatGPT بيقعد ينتظر الطالب يجيله. The Primer بيبادر هو — بيرسل للطالب، بيتذكر اسمه وتاريخه من جلسة لجلسة، وبيولّد تقارير لولي الأمر. كمان بنخصص للمنهج المصري تحديداً.' },
  { id: 'f2', question: 'هل النظام ه يستبدل المدرّس؟', answer: 'لأ — بالعكس. المدرّس بياخد داشبورد أسبوعي بيقوله مين فاهم ومين متعثر، فيدخل الحصة مستعد أكتر. الـ AI أداة للمدرّس، مش بديل.' },
  { id: 'f3', question: 'ابني هيستخدم النظام إزاي؟', answer: 'الطالب بيكتب أو يبعت صوت في أي وقت — النظام بيرد فوراً بنص أو رسم تفاعلي. كمان النظام نفسه بيقترح جلسات كاملة لما يحس إن الطالب محتاجها.' },
  { id: 'f4', question: 'الاشتراك بكم؟', answer: '500 جنيه شهرياً، بتدفعهم مباشرة لينا عبر Paymob أو Fawry. أول أسبوعين مجانية تماماً — لو ما عجبكمش، توقفوا من غير أي التزام.' },
  { id: 'f5', question: 'هل بيانات ابني آمنة؟', answer: 'كل البيانات متخزنة على Supabase المشفّرة، ومفيش حد يقدر يشوفها غير ولي الأمر والمدرّس المسؤول. النظام متوافق مع معايير الخصوصية.' },
];

export const PLAN_TIERS: PlanTier[] = [
  { id: 'trial', name: 'تجربة مجانية', price: 0, currency: 'جنيه', period: 'أسبوعين', features: ['وصول كامل لكل الميزات', 'رسائل نصية 24/7', 'جلسات تفاعلية', 'تقرير أولي لولي الأمر'], highlight: false },
  { id: 'monthly', name: 'الاشتراك الشهري', price: 500, currency: 'جنيه', period: 'شهرياً', features: ['رسائل نصية وصوتية 24/7', 'جلسات تفاعلية غير محدودة', 'سبورة تفاعلية لكل المواد', 'تقارير أسبوعية لولي الأمر', 'تقرير نهاية الترم + اكتشاف المهارة', 'كورس صيفي مخصص'], highlight: true },
  { id: 'summer', name: 'كورس الصيف', price: 300, currency: 'جنيه', period: 'برنامج كامل', features: ['8 أسابيع مخصصة لكل طالب', 'مبنية على بيانات الترم', 'بناء مهارة عملية', 'تقرير نهائي بمسار مهني مقترح'], highlight: false },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: 'a1', studentName: 'أحمد محمد', action: 'سأل عن المعادلات التفاضلية', subject: 'math', timestamp: 'منذ 5 دقائق', type: 'question' },
  { id: 'a2', studentName: 'يوسف عماد', action: 'بدأ جلسة: الحركة الدائرية', subject: 'physics', timestamp: 'منذ 15 دقيقة', type: 'session' },
  { id: 'a3', studentName: 'فاطمة خالد', action: 'أرسلت رسالة صوتية', subject: 'chemistry', timestamp: 'منذ 20 دقيقة', type: 'voice' },
  { id: 'a4', studentName: 'مريم حسام', action: 'أكملت جلسة: الانقسام الخلوي', subject: 'biology', timestamp: 'منذ ساعة', type: 'session' },
  { id: 'a5', studentName: 'سلمى طارق', action: 'تم توليد تقرير الترم', subject: 'history', timestamp: 'منذ ساعتين', type: 'report' },
  { id: 'a6', studentName: 'هدى يسري', action: 'سألت عن الكسور المتشابكة', subject: 'math', timestamp: 'منذ 3 ساعات', type: 'question' },
  { id: 'a7', studentName: 'آدم نبيل', action: 'أكمل جلسة: خرائط مصر', subject: 'geography', timestamp: 'منذ 4 ساعات', type: 'session' },
];

export const REVENUE_DATA: RevenueRow[] = [
  { month: 'مايو', primer: 5000, liveOS: 6000, costs: 4010, profit: 6990 },
  { month: 'يونيو', primer: 15000, liveOS: 8000, costs: 7100, profit: 15900 },
  { month: 'يوليو', primer: 25000, liveOS: 12000, costs: 11200, profit: 25800 },
  { month: 'أغسطس', primer: 35000, liveOS: 15000, costs: 15000, profit: 35000 },
  { month: 'سبتمبر', primer: 50000, liveOS: 18000, costs: 18900, profit: 49100 },
];

export const SKILL_INSIGHTS: SkillInsight[] = [
  { studentId: 'st1', studentName: 'أحمد محمد', subject: 'math', insight: 'تفكير مكاني قوي — يحل المسائل الهندسية بطريقة مختلفة عن المتوسط', confidence: 87, evidence: ['حل 15 مسألة هندسية بسرعة فوق المتوسط', 'استخدم طرق غير تقليدية في 8 مسائل', 'أظهر حدس طبيعي في التفاضل'] },
  { studentId: 'st4', studentName: 'مريم حسام', subject: 'biology', insight: 'قدرة استثنائية على الربط البيولوجي والحفظ المرئي', confidence: 91, evidence: ['أتقنت الانقسام الخلوي في 3 جلسات فقط', 'ربطت بين الجينات والوراثة بشكل تلقائي', 'حفظت 40 مصطلح في أسبوع'] },
  { studentId: 'st8', studentName: 'هدى يسري', subject: 'math', insight: 'تحليل منطقي متقدم — تفوق في الجبر والمعادلات', confidence: 84, evidence: ['أتقنت الكسور المتشابكة بسرعة', 'حلت معادلات معقدة بدقة 95%', 'أظهرت صبر في المسائل الطويلة'] },
];

export const getSubjectColor = (subject: Subject): string => SUBJECT_META[subject]?.accent ?? '#1f2937';

export const EXAMS: Exam[] = [
  {
    id: 'ex1', type: 'pre-session', sessionId: 'se1', studentId: 'st1', studentName: 'أحمد محمد',
    subject: 'math', topic: 'مراجعة المعادلات التفاضلية', status: 'completed', score: 80, totalPoints: 100,
    createdAt: '2026-10-05T10:00:00', completedAt: '2026-10-05T10:25:00',
    questions: [
      { id: 'q1', type: 'mcq', question: 'ما هو حل المعادلة التفاضلية dy/dx = 2x؟', options: ['y = x² + C', 'y = 2x²', 'y = x + C', 'y = 2x'], correctAnswer: 'y = x² + C', explanation: 'بالتكامل، y = ∫2x dx = x² + C', points: 20 },
      { id: 'q2', type: 'truefalse', question: 'المعادلة التفاضلية من الدرجة الأولى تحتوي مشتقة أولى فقط.', correctAnswer: 'صح', explanation: 'صحيح — الدرجة تُحدد بترتيب أعلى مشتقة في المعادلة', points: 10 },
      { id: 'q3', type: 'mcq', question: 'أي مما يلي معادلة تفاضلية خطية؟', options: ['y\' + xy = 0', 'y\'\' + sin(y) = 0', 'y × y\' = 1', '(y\')² = x'], correctAnswer: 'y\' + xy = 0', explanation: 'الخطية تعني أن y ومشتقاتها تظهر بدرجة أولى فقط', points: 20 },
      { id: 'q4', type: 'chat', question: 'اشرح بكلماتك الخاصة ما الفرق بين المعادلة التفاضلية العادية والجزئية؟', correctAnswer: 'العادية تحتوي متغير واحد، الجزئية تحتوي أكثر من متغير', explanation: 'ODE لمتغير مستقل واحد، PDE لعدة متغيرات مستقلة', points: 25 },
      { id: 'q5', type: 'truefalse', question: 'ثابت التكامل C يمكن أن يكون أي قيمة حقيقية.', correctAnswer: 'صح', explanation: 'صحيح — C يمثل عائلة الحلول', points: 10 },
      { id: 'q6', type: 'mcq', question: 'ما هو شرط القيمة الابتدائية في y\' = 2x, y(0) = 5؟', options: ['y = x² + 5', 'y = 2x + 5', 'y = x²', 'y = 5x'], correctAnswer: 'y = x² + 5', explanation: 'بتطبيق y(0)=5 على y=x²+C نحصل C=5', points: 15 },
    ],
  },
  {
    id: 'ex2', type: 'post-session', sessionId: 'se2', studentId: 'st1', studentName: 'أحمد محمد',
    subject: 'math', topic: 'امتحان بعد جلسة حساب التفاضل', status: 'pending', totalPoints: 100,
    createdAt: '2026-10-04T17:00:00',
    questions: [
      { id: 'q1', type: 'mcq', question: 'ما هو اشتقاق الدالة f(x) = x³؟', options: ['3x²', 'x²', '3x', 'x⁴/4'], correctAnswer: '3x²', explanation: 'بقاعدة القوة: d/dx(xⁿ) = n·xⁿ⁻¹', points: 25 },
      { id: 'q2', type: 'truefalse', question: 'اشتقاق الثابت يساوي صفر.', correctAnswer: 'صح', explanation: 'صحيح — d/dx(c) = 0', points: 10 },
      { id: 'q3', type: 'chat', question: 'احسب مشتقة f(x) = 2x² + 3x - 5 واشرح خطواتك.', correctAnswer: 'f\'(x) = 4x + 3', explanation: 'نطبق قوة القوة على كل حد: 2·2x + 3 = 4x + 3', points: 35 },
      { id: 'q4', type: 'mcq', question: 'ما هي قاعدة السلسلة؟', options: ['(f∘g)\' = f\'(g)·g\'', '(f∘g)\' = f\'·g\'', '(f∘g)\' = f + g\'', '(f∘g)\' = f\'/g\''], correctAnswer: '(f∘g)\' = f\'(g)·g\'', explanation: 'قاعدة السلسلة لاشتقاق الدوال المركبة', points: 30 },
    ],
  },
  {
    id: 'ex3', type: 'pre-session', sessionId: 'se4', studentId: 'st2', studentName: 'فاطمة خالد',
    subject: 'chemistry', topic: 'مراجعة الروابط الكيميائية', status: 'in-progress', totalPoints: 100,
    createdAt: '2026-10-05T14:00:00',
    questions: [
      { id: 'q1', type: 'mcq', question: 'كم إلكترون يشارك الهيدروجين في الرابطة التساهمية؟', options: ['1', '2', '0', '3'], correctAnswer: '1', explanation: 'الهيدروجين له إلكترون واحد يشارك به', points: 25 },
      { id: 'q2', type: 'truefalse', question: 'الرابطة الأيونية تنشأ بين فلز ولا فلز.', correctAnswer: 'صح', explanation: 'صحيح — انتقال إلكترونات من الفلز إلى اللافلز', points: 15 },
      { id: 'q3', type: 'chat', question: 'اشرح الفرق بين الرابطة التساهمية والرابطة الأيونية بمثال.', correctAnswer: 'التساهمية: مشاركة إلكترونات (H2O). الأيونية: انتقال إلكترونات (NaCl)', explanation: 'التساهمية مشاركة، الأيونية انتقال', points: 35 },
      { id: 'q4', type: 'mcq', question: 'أي جزيء يحتوي على رابطة تساهمية مزدوجة؟', options: ['O₂', 'H₂', 'NaCl', 'CH₄'], correctAnswer: 'O₂', explanation: 'O₂ يشارك زوجين من الإلكترونات', points: 25 },
    ],
  },
];

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'wt1', trigger: 'post-study', recipient: 'student',
    template: 'يا {studentName}، أحسنت! خلّصت جلسة {topic} بنجاح. {score} من 100. عايز نكمّل بكرة؟',
    enabled: true, variables: ['studentName', 'topic', 'score'],
  },
  {
    id: 'wt2', trigger: 'post-study', recipient: 'parent',
    template: 'عزيزي {parentName}، ابنك {studentName} أنهى للتو مراجعة {topic}. النتيجة: {score}/100. تقرير مفصل: {reportLink}',
    enabled: true, variables: ['parentName', 'studentName', 'topic', 'score', 'reportLink'],
  },
  {
    id: 'wt3', trigger: 'pre-session-reminder', recipient: 'student',
    template: 'يا {studentName}، عندك جلسة {subject} بكرة الساعة {time} عن {topic}. لا تنسى تراجع الدرس اللي فات! الامتحان المراجع جاهز.',
    enabled: true, variables: ['studentName', 'subject', 'time', 'topic'],
  },
  {
    id: 'wt4', trigger: 'pre-session-reminder', recipient: 'parent',
    template: 'عزيزي {parentName}، {studentName} عنده جلسة {subject} بكرة الساعة {time}. تأكد إنه ذاكر الامتحان المراجع.',
    enabled: true, variables: ['parentName', 'studentName', 'subject', 'time'],
  },
  {
    id: 'wt5', trigger: 'post-session-report', recipient: 'parent',
    template: 'عزيزي {parentName}، {studentName} أنهى جلسة {topic}. مدة الجلسة: {duration} دقيقة. نقاط القوة: {strengths}. نقاط للتحسين: {weaknesses}.',
    enabled: true, variables: ['parentName', 'studentName', 'topic', 'duration', 'strengths', 'weaknesses'],
  },
  {
    id: 'wt6', trigger: 'exam-result', recipient: 'student',
    template: 'يا {studentName}، نتيجة امتحان {topic}: {score}/{total}. {feedback}.Keep going!',
    enabled: true, variables: ['studentName', 'topic', 'score', 'total', 'feedback'],
  },
  {
    id: 'wt7', trigger: 'exam-result', recipient: 'parent',
    template: 'عزيزي {parentName}، {studentName} حصل على {score}/{total} في امتحان {topic}. {feedback}',
    enabled: true, variables: ['parentName', 'studentName', 'score', 'total', 'topic', 'feedback'],
  },
  {
    id: 'wt8', trigger: 'weekly-progress', recipient: 'parent',
    template: 'تقرير أسبوعي: {studentName} أكمل {sessionsCount} جلسات هذا الأسبوع. معدل التقدم: {progress}%. المواد: {subjects}.',
    enabled: true, variables: ['studentName', 'sessionsCount', 'progress', 'subjects'],
  },
  {
    id: 'wt9', trigger: 'welcome', recipient: 'student',
    template: 'أهلاً بيك يا {studentName} في The Primer! أنا مدرّسك الشخصي — هكون معاك 24/7. اكتبلي في أي وقت أي سؤال.',
    enabled: true, variables: ['studentName'],
  },
  {
    id: 'wt10', trigger: 'welcome', recipient: 'parent',
    template: 'أهلاً بيك يا {parentName}! ابنك {studentName} انضم لـ The Primer. هتوصلك تقارير دورية عن تقدمه. أول أسبوعين مجانية.',
    enabled: true, variables: ['parentName', 'studentName'],
  },
  {
    id: 'wt11', trigger: 'subscription-renewal', recipient: 'parent',
    template: 'عزيزي {parentName}، اشتراك {studentName} هيتجدد بعد {days} يوم. المبلغ: {amount} جنيه. للإلغاء ابعث "إيقاف".',
    enabled: true, variables: ['parentName', 'studentName', 'days', 'amount'],
  },
];

export const WHATSAPP_LOG: WhatsAppMessage[] = [
  { id: 'wl1', studentId: 'st1', studentName: 'أحمد محمد', recipient: 'student', recipientPhone: '01012345678', recipientName: 'أحمد محمد', content: 'يا أحمد، أحسنت! خلّصت مراجعة المعادلات التفاضلية. 80 من 100. عايز نكمّل بكرة؟', trigger: 'post-study', status: 'sent', timestamp: 'منذ 10 دقائق' },
  { id: 'wl2', studentId: 'st1', studentName: 'أحمد محمد', recipient: 'parent', recipientPhone: '01012345678', recipientName: 'محمد عبد الرحمن', content: 'عزيزي محمد، ابنك أحمد أنهى للتو مراجعة المعادلات التفاضلية. النتيجة: 80/100. تقرير مفصل في التطبيق.', trigger: 'post-study', status: 'sent', timestamp: 'منذ 10 دقائق' },
  { id: 'wl3', studentId: 'st3', studentName: 'يوسف عماد', recipient: 'student', recipientPhone: '01155667788', recipientName: 'يوسف عماد', content: 'يا يوسف، عندك جلسة فيزياء بكرة الساعة 2:00 عن الحركة الدائرية. الامتحان المراجع جاهز!', trigger: 'pre-session-reminder', status: 'sent', timestamp: 'منذ 30 دقيقة' },
  { id: 'wl4', studentId: 'st2', studentName: 'فاطمة خالد', recipient: 'parent', recipientPhone: '01098765432', recipientName: 'فاطمة الزهراء', content: 'عزيزي فاطمة، فاطمة أنهت جلسة الروابط الكيميائية. مدة الجلسة: 25 دقيقة. نقاط القوة: الجدول الدوري. للتحسين: الروابط الأيونية.', trigger: 'post-session-report', status: 'sent', timestamp: 'منذ ساعة' },
  { id: 'wl5', studentId: 'st4', studentName: 'مريم حسام', recipient: 'student', recipientPhone: '01233445566', recipientName: 'مريم حسام', content: 'يا مريم، نتيجة امتحان الانقسام الخلوي: 95/100. ممتاز جداً! استمري!', trigger: 'exam-result', status: 'sent', timestamp: 'منذ ساعتين' },
  { id: 'wl6', studentId: 'st8', studentName: 'هدى يسري', recipient: 'parent', recipientPhone: '01022334455', recipientName: 'يسري عبد الله', content: 'تقرير أسبوعي: هدى أكملت 8 جلسات هذا الأسبوع. معدل التقدم: 88%. المواد: رياضيات، فيزياء.', trigger: 'weekly-progress', status: 'sent', timestamp: 'منذ 3 ساعات' },
  { id: 'wl7', studentId: 'st5', studentName: 'عمر أيمن', recipient: 'parent', recipientPhone: '01099887766', recipientName: 'عمرو شعبان', content: 'عزيزي عمرو، اشتراك عمر هيتجدد بعد 5 أيام. المبلغ: 500 جنيه. للإلغاء ابعث "إيقاف".', trigger: 'subscription-renewal', status: 'pending', timestamp: 'منذ 5 ساعات' },
];

export const BLOCKED_USERS: BlockedUser[] = [
  { id: 'bu1', email: 'spam@test.com', name: 'حساب وهمي', role: 'student', reason: 'محتوى غير لائق', blockedAt: '2026-09-20', blockedBy: 'المدير' },
  { id: 'bu2', email: 'cheater@school.edu', name: 'محمود علي', role: 'student', reason: 'محاولة غش متكررة', blockedAt: '2026-09-15', blockedBy: 'المدير' },
];

export const AI_TEMPLATES: AITemplate[] = [
  { id: 'at1', category: 'تحية', trigger: 'بداية المحادثة', response: 'يا {studentName}، كيفك؟ الأسبوع اللي فات حسّيت إنك وصلت لحاجة مهمة — عايزين نكمّل من هناك؟', edited: false },
  { id: 'at2', category: 'تحية', trigger: 'طالب عاد بعد غياب', response: 'وحشتنا يا {studentName}! فينك الأيام دي؟ تعال نشوف كنت واقف فين ونكمّل.', edited: false },
  { id: 'at3', category: 'رياضيات', trigger: 'سؤال عن المثلثات', response: 'سؤال جميل يا {studentName}! تعال نرسم على السبورة خطوة بخطوة.', subject: 'math', edited: false },
  { id: 'at4', category: 'رياضيات', trigger: 'سؤال عن الجبر', response: 'الجبر سهل لما تعرف القواعد. خليني أوريك على السبورة.', subject: 'math', edited: true, lastEditedAt: '2026-09-28', editedBy: 'المدير' },
  { id: 'at5', category: 'كيمياء', trigger: 'سؤال عن الروابط', response: 'الروابط الكيميائية زي اللوجو — كل ذرة بتدور على استقرار. تعال أرسملك.', subject: 'chemistry', edited: false },
  { id: 'at6', category: 'فيزياء', trigger: 'سؤال عن القوى', response: 'قوانين نيوتن الثلاثة بتدير العالم كله! خليني أشرحها ببساطة.', subject: 'physics', edited: false },
  { id: 'at7', category: 'أحياء', trigger: 'سؤال عن الخلية', response: 'الخلية زي المدينة — فيها أجزاء بتعمل وظايف مختلفة. تعال نرسمها.', subject: 'biology', edited: false },
  { id: 'at8', category: 'تشجيع', trigger: 'إجابة صحيحة', response: 'برافو يا {studentName}! أنت بتتطور بسرعة في الموضوع ده. استمر!', edited: false },
  { id: 'at9', category: 'تشجيع', trigger: 'إجابة خاطئة', response: 'مش مشكلة يا {studentName} — الغلط جزء من التعلم. تعال نشوف فين الغلط ونصلحه سوا.', edited: false },
  { id: 'at10', category: 'اقتراح جلسة', trigger: '3+ أسئلة في نفس الموضوع', response: 'يا {studentName}، لاحظت إنك بتسأل كتير في {topic} — عايز سيشن 25 دقيقة نخلّص الموضوع ده؟', edited: false },
  { id: 'at11', category: 'إنجليزي', trigger: 'سؤال عن القواعد', response: 'Let\'s break it down step by step. Grammar is easier than you think!', subject: 'english', edited: false },
  { id: 'at12', category: 'تاريخ', trigger: 'سؤال عن حدث تاريخي', response: 'التاريخ قصة يا {studentName}! تعال أرسملك الخط الزمني ونشوف القصة كاملة.', subject: 'history', edited: false },
];

export const SCHOOL_PORTALS: SchoolPortal[] = [
  { id: 'sp1', schoolId: 's1', schoolName: 'مدرسة المستقبل الدولية', slug: 'future-academy', theme: '#2563eb', students: ['st1','st2','st3','st6','st8'], teachers: ['t1','t2','t3'], activeStudents: 42, studyingNow: 8 },
  { id: 'sp2', schoolId: 's2', schoolName: 'مدارس النيل الخاصة', slug: 'nile-schools', theme: '#16a34a', students: ['st4','st5','st7'], teachers: ['t4','t5'], activeStudents: 28, studyingNow: 5 },
  { id: 'sp3', schoolId: 's3', schoolName: 'مدرسة الأهرام الدولية', slug: 'pyramids-intl', theme: '#b45309', students: [], teachers: [], activeStudents: 15, studyingNow: 3 },
];

export const STUDENT_CHAT_RECORDS: StudentChatRecord[] = [
  {
    id: 'scr1', studentId: 'st1', studentName: 'أحمد محمد', schoolName: 'مدرسة المستقبل الدولية',
    subject: 'math', lastMessageAt: 'منذ 5 دقائق', totalMessages: 47,
    messages: CHAT_MESSAGES,
  },
  {
    id: 'scr2', studentId: 'st2', studentName: 'فاطمة خالد', schoolName: 'مدرسة المستقبل الدولية',
    subject: 'chemistry', lastMessageAt: 'منذ 20 دقيقة', totalMessages: 32,
    messages: [
      { id: 'fm1', role: 'ai', text: 'يا فاطمة، كيفك؟ لاحظت إنك بتسأل كتير في الروابط الكيميائية — عايزة نبدأ بدرس جديد؟', timestamp: '15:30', reaction: 'neutral' },
      { id: 'fm2', role: 'student', text: 'أهلاً! أيوة عايزة أفهم الرابطة الأيونية', timestamp: '15:32' },
      { id: 'fm3', role: 'ai', text: 'تمام يا فاطمة! الرابطة الأيونية زي ما NaCl بيعمل — صوديوم بيدى إلكترون للكلور. تعالي أرسمها.', timestamp: '15:33', reaction: 'encourage', hasWhiteboard: true, whiteboardSteps: SAMPLE_WHITEBOARDS.water },
      { id: 'fm4', role: 'student', text: 'أها! يعني واحد بيدى والثاني بياخد؟', timestamp: '15:38' },
      { id: 'fm5', role: 'ai', text: 'برافو يا فاطمة! بالظبط كده. واحد بيفقد إلكترون (فلز) والتاني بيكسبه (لافلز). وبيتكوّن أيون موجب وأيون سالب بيتجذبوا.', timestamp: '15:39', reaction: 'celebrate' },
    ],
  },
  {
    id: 'scr3', studentId: 'st4', studentName: 'مريم حسام', schoolName: 'مدارس النيل الخاصة',
    subject: 'biology', lastMessageAt: 'منذ ساعة', totalMessages: 56,
    messages: [
      { id: 'mrm1', role: 'ai', text: 'يا مريم، كيفك؟ الجلسة اللي فاتت كنتي ممتازة في الانقسام الخلوي!', timestamp: '14:00', reaction: 'neutral' },
      { id: 'mrm2', role: 'student', text: 'شكراً! عايزة أسأل عن الانقسام المنصف', timestamp: '14:05' },
      { id: 'mrm3', role: 'ai', text: 'سؤال ممتاز يا مريم! الانقسام المنصف بيختزل الكروموسومات للنص. تعالي أرسملك الخطوات.', timestamp: '14:06', reaction: 'encourage', hasWhiteboard: true, whiteboardSteps: SAMPLE_WHITEBOARDS.mitosis },
      { id: 'mrm4', role: 'student', text: 'يعني بيفرق عن المتساوي إنه بيدي خلايا مختلفة وراثياً؟', timestamp: '14:15' },
      { id: 'mrm5', role: 'ai', text: 'برافو يا مريم! بالظبط — الانقسام المنصف بيدي 4 خلايا مختلفة وراثياً، والمتساوي بيدي خليتين متطابقتين. أنتِ بتفتكري بذكاء!', timestamp: '14:16', reaction: 'celebrate' },
    ],
  },
  {
    id: 'scr4', studentId: 'st8', studentName: 'هدى يسري', schoolName: 'مدرسة المستقبل الدولية',
    subject: 'math', lastMessageAt: 'منذ 10 دقائق', totalMessages: 71,
    messages: [
      { id: 'hd1', role: 'ai', text: 'يا هدى، كيفك؟ 20 يوم متتالي مذاكرة — أنتِ قدوة!', timestamp: '13:00', reaction: 'celebrate' },
      { id: 'hd2', role: 'student', text: 'أهلاً! عايزة أسأل عن الكسور المتشابكة', timestamp: '13:02' },
      { id: 'hd3', role: 'ai', text: 'الكسور المتشابكة يا هدى — تعالي نبسّطها. الكسر المتشابك عبارة عن كسر في بسطه أو مقامه كسر آخر.', timestamp: '13:03', reaction: 'encourage' },
      { id: 'hd4', role: 'student', text: 'أها فهمت! يعني أضرب في مقام الكسر الداخلي؟', timestamp: '13:10' },
      { id: 'hd5', role: 'ai', text: 'بالظبط يا هدى! بتضربي البسط والمقام في مقام الكسر الداخلي عشان تتخلصي من التشابك. أنتِ بتتقدمين بسرعة!', timestamp: '13:11', reaction: 'celebrate' },
    ],
  },
];

export const STUDY_LOGS: { studentId: string; studentName: string; studiedAt: string; subject: Subject; topic: string; duration: number }[] = [
  { studentId: 'st1', studentName: 'أحمد محمد', studiedAt: 'منذ 5 دقائق', subject: 'math', topic: 'المعادلات التفاضلية', duration: 25 },
  { studentId: 'st2', studentName: 'فاطمة خالد', studiedAt: 'منذ 20 دقيقة', subject: 'chemistry', topic: 'الروابط الكيميائية', duration: 22 },
  { studentId: 'st3', studentName: 'يوسف عماد', studiedAt: 'منذ 15 دقيقة', subject: 'physics', topic: 'الحركة الدائرية', duration: 18 },
  { studentId: 'st4', studentName: 'مريم حسام', studiedAt: 'منذ ساعة', subject: 'biology', topic: 'الانقسام الخلوي', duration: 30 },
  { studentId: 'st8', studentName: 'هدى يسري', studiedAt: 'منذ 10 دقائق', subject: 'math', topic: 'الكسور المتشابكة', duration: 28 },
  { studentId: 'st6', studentName: 'سلمى طارق', studiedAt: 'منذ 30 دقيقة', subject: 'history', topic: 'الثورة المصرية 1919', duration: 26 },
];

// Auto-generated weekly study schedule — the system builds this based on curriculum,
// not the student choosing times. Optimized for retention and avoiding lazy schedules.
export interface ScheduleSlot {
  day: string;
  dayEn: string;
  time: string;
  subject: Subject;
  topic: string;
  duration: number;
  type: 'review' | 'new' | 'practice' | 'exam-prep';
  status: 'upcoming' | 'done' | 'missed';
}

export const STUDY_SCHEDULE: ScheduleSlot[] = [
  { day: 'السبت', dayEn: 'Saturday', time: '16:00', subject: 'math', topic: 'المعادلات التفاضلية', duration: 30, type: 'new', status: 'done' },
  { day: 'السبت', dayEn: 'Saturday', time: '18:00', subject: 'physics', topic: 'قوانين نيوتن — مراجعة', duration: 20, type: 'review', status: 'done' },
  { day: 'الأحد', dayEn: 'Sunday', time: '16:00', subject: 'chemistry', topic: 'الروابط الكيميائية', duration: 25, type: 'new', status: 'done' },
  { day: 'الأحد', dayEn: 'Sunday', time: '18:30', subject: 'english', topic: 'Grammar — Tenses', duration: 20, type: 'practice', status: 'upcoming' },
  { day: 'الإثنين', dayEn: 'Monday', time: '17:00', subject: 'math', topic: 'حساب التفاضل — تطبيقات', duration: 30, type: 'new', status: 'upcoming' },
  { day: 'الثلاثاء', dayEn: 'Tuesday', time: '16:00', subject: 'biology', topic: 'الانقسام الخلوي', duration: 25, type: 'new', status: 'upcoming' },
  { day: 'الثلاثاء', dayEn: 'Tuesday', time: '18:00', subject: 'history', topic: 'ثورة 1919 — الأسباب', duration: 20, type: 'review', status: 'upcoming' },
  { day: 'الأربعاء', dayEn: 'Wednesday', time: '17:00', subject: 'math', topic: 'مراجعة شاملة + امتحان', duration: 35, type: 'exam-prep', status: 'upcoming' },
  { day: 'الخميس', dayEn: 'Thursday', time: '16:00', subject: 'physics', topic: 'الحركة الدائرية', duration: 25, type: 'new', status: 'upcoming' },
  { day: 'الخميس', dayEn: 'Thursday', time: '18:00', subject: 'geography', topic: 'خرائط مصر', duration: 20, type: 'review', status: 'upcoming' },
];

// Curriculum lesson plans — the system knows what lessons each curriculum has
export interface LessonPlan {
  subject: Subject;
  lessons: { id: string; title: string; titleEn: string; order: number; difficulty: 'basic' | 'intermediate' | 'advanced' }[];
}

export const CURRICULUM_LESSONS: LessonPlan[] = [
  {
    subject: 'math',
    lessons: [
      { id: 'm1', title: 'الجبر الخطي', titleEn: 'Linear Algebra', order: 1, difficulty: 'basic' },
      { id: 'm2', title: 'حساب التفاضل', titleEn: 'Calculus', order: 2, difficulty: 'intermediate' },
      { id: 'm3', title: 'الكسيور المتشابكة', titleEn: 'Complex Fractions', order: 3, difficulty: 'intermediate' },
      { id: 'm4', title: 'المعادلات التفاضلية', titleEn: 'Differential Equations', order: 4, difficulty: 'advanced' },
      { id: 'm5', title: 'حساب التكامل', titleEn: 'Integration', order: 5, difficulty: 'advanced' },
    ],
  },
  {
    subject: 'physics',
    lessons: [
      { id: 'p1', title: 'قوانين نيوتن', titleEn: "Newton's Laws", order: 1, difficulty: 'basic' },
      { id: 'p2', title: 'الحركة الدائرية', titleEn: 'Circular Motion', order: 2, difficulty: 'intermediate' },
      { id: 'p3', title: 'الشغل والطاقة', titleEn: 'Work and Energy', order: 3, difficulty: 'intermediate' },
      { id: 'p4', title: 'الكهرباء الساكنة', titleEn: 'Electrostatics', order: 4, difficulty: 'advanced' },
    ],
  },
  {
    subject: 'chemistry',
    lessons: [
      { id: 'c1', title: 'الجدول الدوري', titleEn: 'Periodic Table', order: 1, difficulty: 'basic' },
      { id: 'c2', title: 'الروابط الكيميائية', titleEn: 'Chemical Bonds', order: 2, difficulty: 'intermediate' },
      { id: 'c3', title: 'التفاعلات الكيميائية', titleEn: 'Chemical Reactions', order: 3, difficulty: 'intermediate' },
      { id: 'c4', title: 'الكيمياء العضوية', titleEn: 'Organic Chemistry', order: 4, difficulty: 'advanced' },
    ],
  },
  {
    subject: 'biology',
    lessons: [
      { id: 'b1', title: 'الخلية', titleEn: 'The Cell', order: 1, difficulty: 'basic' },
      { id: 'b2', title: 'الانقسام المتساوي', titleEn: 'Mitosis', order: 2, difficulty: 'intermediate' },
      { id: 'b3', title: 'الانقسام المنصف', titleEn: 'Meiosis', order: 3, difficulty: 'intermediate' },
      { id: 'b4', title: 'الوراثة والجينات', titleEn: 'Genetics', order: 4, difficulty: 'advanced' },
    ],
  },
  {
    subject: 'history',
    lessons: [
      { id: 'h1', title: 'ثورة 1919', titleEn: '1919 Revolution', order: 1, difficulty: 'basic' },
      { id: 'h2', title: 'تصريح 1922', titleEn: '1922 Declaration', order: 2, difficulty: 'intermediate' },
      { id: 'h3', title: 'ثورة 1952', titleEn: '1952 Revolution', order: 3, difficulty: 'intermediate' },
    ],
  },
  {
    subject: 'english',
    lessons: [
      { id: 'e1', title: 'Grammar — Tenses', titleEn: 'Grammar — Tenses', order: 1, difficulty: 'basic' },
      { id: 'e2', title: 'Reading Comprehension', titleEn: 'Reading Comprehension', order: 2, difficulty: 'intermediate' },
      { id: 'e3', title: 'Writing — Essays', titleEn: 'Writing — Essays', order: 3, difficulty: 'advanced' },
    ],
  },
  {
    subject: 'geography',
    lessons: [
      { id: 'g1', title: 'خرائط مصر', titleEn: 'Maps of Egypt', order: 1, difficulty: 'basic' },
      { id: 'g2', title: 'الموارد الطبيعية', titleEn: 'Natural Resources', order: 2, difficulty: 'intermediate' },
    ],
  },
];

// Map subjects to whiteboard samples for curriculum-aware AI responses
export const SUBJECT_WHITEBOARDS: Record<Subject, StepAnimation[]> = {
  math: whiteboardSinCos,
  chemistry: whiteboardChemistry,
  biology: whiteboardBiology,
  history: whiteboardHistory,
  physics: whiteboardSinCos, // reuse as placeholder
  english: whiteboardSinCos,
  geography: whiteboardHistory,
};

// Smart suggested questions — generated based on curriculum and current progress
export const SMART_QUESTIONS: { subject: Subject; question: string; topic: string }[] = [
  { subject: 'math', question: 'اشرحلي المعادلات التفاضلية', topic: 'المعادلات التفاضلية' },
  { subject: 'math', question: 'ازاي أحل الكسور المتشابكة؟', topic: 'الكسور المتشابكة' },
  { subject: 'physics', question: 'ما هي قوانين نيوتن الثلاثة؟', topic: 'قوانين نيوتن' },
  { subject: 'physics', question: 'اشرح الحركة الدائرية', topic: 'الحركة الدائرية' },
  { subject: 'chemistry', question: 'ما الفرق بين الرابطة التساهمية والأيونية؟', topic: 'الروابط الكيميائية' },
  { subject: 'chemistry', question: 'ازاي أقرأ الجدول الدوري؟', topic: 'الجدول الدوري' },
  { subject: 'biology', question: 'اشرح الانقسام المتساوي', topic: 'الانقسام المتساوي' },
  { subject: 'biology', question: 'ما الفرق بين الانقسام المنصف والمتساوي؟', topic: 'الانقسام المنصف' },
  { subject: 'history', question: 'ما أسباب ثورة 1919؟', topic: 'ثورة 1919' },
  { subject: 'english', question: 'Explain the present perfect tense', topic: 'Tenses' },
  { subject: 'geography', question: 'ازاي أقرأ خريطة مصر؟', topic: 'خرائط مصر' },
];

export type Role = 'student' | 'teacher' | 'parent' | 'admin' | 'school';

export type Subject =
  | 'math'
  | 'chemistry'
  | 'physics'
  | 'biology'
  | 'english'
  | 'history'
  | 'geography';

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type ContentType = 'text' | 'voice' | 'session';

export type ExamType = 'pre-session' | 'post-session';

export type ExamQuestionType = 'mcq' | 'truefalse' | 'chat';

export type WhatsAppTrigger =
  | 'post-study'
  | 'pre-session-reminder'
  | 'post-session-report'
  | 'exam-result'
  | 'weekly-progress'
  | 'welcome'
  | 'subscription-renewal';

export type BlockStatus = 'active' | 'blocked';

export type StepAnimation = {
  id: string;
  label: string;
  shapes: ShapeInstruction[];
  narration: string;
  durationMs: number;
};

export type ShapeInstruction = {
  kind: 'line' | 'rect' | 'circle' | 'arc' | 'text' | 'triangle' | 'arrow' | 'highlight' | 'molecule' | 'wave' | 'cell' | 'map-pin' | 'timeline-marker';
  color: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  points?: { x: number; y: number }[];
  delayMs?: number;
};

export interface Student {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  avatar: string;
  activeSubject: Subject;
  lastActive: string;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
  subscriptionStatus: 'active' | 'trial' | 'expired';
  subscriptionStart: string;
  monthlyFee: number;
  parentName: string;
  parentPhone: string;
}

export interface Teacher {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  subject: Subject;
  avatar: string;
  studentsCount: number;
}

export interface School {
  id: string;
  name: string;
  location: string;
  studentsCount: number;
  teachersCount: number;
  contractStatus: 'active' | 'pending' | 'trial' | 'expired';
  monthlyReferralFee: number;
  referralPerStudent: number;
  joinDate: string;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  childrenIds: string[];
}

export interface Session {
  id: string;
  studentId: string;
  studentName: string;
  subject: Subject;
  topic: string;
  status: SessionStatus;
  date: string;
  duration: number;
  teacherId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'student';
  text: string;
  timestamp: string;
  hasVoice?: boolean;
  hasWhiteboard?: boolean;
  whiteboardSteps?: StepAnimation[];
  reaction?: 'celebrate' | 'encourage' | 'concern' | 'neutral';
}

export interface SubjectProgress {
  subject: Subject;
  mastery: number;
  questionsAnswered: number;
  sessionsCompleted: number;
  strengths: string[];
  weaknesses: string[];
  recentTopics: string[];
}

export interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  term: string;
  totalSessions: number;
  activeLearningHours: number;
  attendanceRate: number;
  fastestTopics: string[];
  naturalIntuitionAreas: string[];
  suggestedSkill: string;
  summerCourseTitle: string;
  generatedAt: string;
}

export interface SystemNotification {
  id: string;
  type: 'session' | 'progress' | 'alert' | 'billing' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  forRole: Role;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  highlight: boolean;
}

export interface ActivityItem {
  id: string;
  studentName: string;
  action: string;
  subject: Subject;
  timestamp: string;
  type: 'question' | 'session' | 'voice' | 'report';
}

export interface DashboardCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  icon: string;
}

export interface RevenueRow {
  month: string;
  primer: number;
  liveOS: number;
  costs: number;
  profit: number;
}

export interface SkillInsight {
  studentId: string;
  studentName: string;
  subject: Subject;
  insight: string;
  confidence: number;
  evidence: string[];
}

export interface ExamQuestion {
  id: string;
  type: ExamQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface Exam {
  id: string;
  type: ExamType;
  sessionId?: string;
  studentId: string;
  studentName: string;
  subject: Subject;
  topic: string;
  questions: ExamQuestion[];
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  totalPoints: number;
  createdAt: string;
  completedAt?: string;
}

export interface WhatsAppTemplate {
  id: string;
  trigger: WhatsAppTrigger;
  recipient: 'student' | 'parent';
  template: string;
  enabled: boolean;
  variables: string[];
}

export interface WhatsAppMessage {
  id: string;
  studentId: string;
  studentName: string;
  recipient: 'student' | 'parent';
  recipientPhone: string;
  recipientName: string;
  content: string;
  trigger: WhatsAppTrigger;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
}

export interface BlockedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  reason: string;
  blockedAt: string;
  blockedBy: string;
}

export interface AITemplate {
  id: string;
  category: string;
  trigger: string;
  response: string;
  subject?: Subject;
  edited: boolean;
  lastEditedAt?: string;
  editedBy?: string;
}

export interface SchoolPortal {
  id: string;
  schoolId: string;
  schoolName: string;
  slug: string;
  theme: string;
  students: string[];
  teachers: string[];
  activeStudents: number;
  studyingNow: number;
}

export interface StudentChatRecord {
  id: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  subject: Subject;
  messages: ChatMessage[];
  lastMessageAt: string;
  totalMessages: number;
}

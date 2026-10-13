import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'ar' | 'en';

export interface Translations {
  // Common
  appName: string;
  appTagline: string;
  startNow: string;
  tryFree: string;
  adminPanel: string;
  imParent: string;
  imTeacher: string;
  imStudent: string;
  backToHome: string;
  back: string;
  save: string;
  cancel: string;
  add: string;
  edit: string;
  delete: string;
  search: string;
  loading: string;
  submit: string;

  // Portal
  portalTitle: string;
  portalSubtitle: string;
  portalIdentify: string;
  newStudent: string;
  newStudentDesc: string;
  parent: string;
  parentDesc: string;
  schoolPortal: string;
  schoolPortalDesc: string;
  admin: string;
  adminDesc: string;
  studentRegister: string;
  schoolOrAlone: string;
  inSchool: string;
  alone: string;
  selectCurriculum: string;
  studentName: string;
  grade: string;
  studentPhone: string;
  studentEmail: string;
  parentInfo: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  startStudying: string;
  registering: string;
  parentLogin: string;
  childInSchool: string;
  childStudyingAlone: string;
  enterDirectly: string;
  selectSchool: string;
  searchSchool: string;
  students: string;
  adminLogin: string;
  enterDashboard: string;
  noSchoolsFound: string;
  nameRequired: string;
  parentPhoneRequired: string;
  registrationError: string;
  changeSchool: string;
  noCurriculum: string;

  // Landing
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  tryTwoWeeks: string;
  activeStudents: string;
  schools: string;
  whyNotChatGPT: string;
  whyNotChatGPTDesc: string;
  featureProactive: string;
  featureProactiveDesc: string;
  featureWhiteboard: string;
  featureWhiteboardDesc: string;
  featureRemembers: string;
  featureRemembersDesc: string;
  featureReports: string;
  featureReportsDesc: string;
  featureCurriculum: string;
  featureCurriculumDesc: string;
  featureFast: string;
  featureFastDesc: string;
  howItWorks: string;
  howItWorksDesc: string;
  stepChat: string;
  stepChatDesc: string;
  stepVoice: string;
  stepVoiceDesc: string;
  stepSession: string;
  stepSessionDesc: string;
  pricing: string;
  pricingDesc: string;
  faq: string;
  finalCta: string;
  finalCtaDesc: string;

  // Admin
  manageSchools: string;
  addSchool: string;
  addTeacher: string;
  manageTeachers: string;
  manageContent: string;
  manageWhatsApp: string;
  manageBlocked: string;
  schoolName: string;
  schoolNameEn: string;
  schoolLocation: string;
  schoolType: string;
  contractStatus: string;
  studentLink: string;
  teacherLink: string;
  companyNumber: string;
  templates: string;
  messageLog: string;
  contacts: string;
  sendTest: string;
  notRegistered: string;
  curriculum: string;
  subjects: string;
  units: string;
  lessons: string;
  international: string;
  national: string;
  private: string;
  trial: string;
  active: string;
  pending: string;
  expired: string;
  sent: string;
  enabled: string;
  disabled: string;
  recipient: string;
  forStudent: string;
  forParent: string;
  variables: string;
  editTemplate: string;
  companySendingNumber: string;
  saveChanges: string;
  blockEmail: string;
  unblock: string;
  blocked: string;
  reason: string;

  // Nav
  dashboard: string;
  chat: string;
  sessions: string;
  exams: string;
  progress: string;
  reports: string;
  billing: string;
  users: string;
  teachers: string;
  content: string;
  whatsapp: string;
  analytics: string;
  finance: string;
  notifications: string;
  settings: string;
  insights: string;
  activity: string;

  // Student dashboard
  welcomeBack: string;
  continueStudying: string;
  weeklyGoal: string;
  streak: string;
  days: string;
  askTeacher: string;
  upcomingSession: string;

  // Grades
  grade1: string;
  grade2: string;
  grade3: string;
}

const ar: Translations = {
  appName: 'The Primer',
  appTagline: 'نظام التعليم الذكي',
  startNow: 'ابدأ الآن',
  tryFree: 'جرّب مجاناً',
  adminPanel: 'لوحة تحكم المدير',
  imParent: 'أنا ولي أمر',
  imTeacher: 'أنا مدرّس',
  imStudent: 'طالب جديد',
  backToHome: 'العودة للرئيسية',
  back: 'رجوع',
  save: 'حفظ',
  cancel: 'إلغاء',
  add: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
  search: 'بحث',
  loading: 'جاري التحميل...',
  submit: 'إرسال',

  portalTitle: 'بوابة الدخول الذكية',
  portalSubtitle: 'The Primer — نظام التعليم الذكي',
  portalIdentify: 'إنت إيه؟ اختار عشان نوصلك لمكانك الصح',
  newStudent: 'طالب جديد',
  newStudentDesc: 'سجّل بياناتك وابدأ مذاكرة فوراً',
  parent: 'ولي أمر',
  parentDesc: 'تابع تقدّم ابنك وشوف تقاريره',
  schoolPortal: 'بوابة مدرسة',
  schoolPortalDesc: 'ادخل عبر مدرستك أو ابحث عنها',
  admin: 'مدير النظام',
  adminDesc: 'تحكم كامل في المنصة',
  studentRegister: 'تسجيل طالب جديد',
  schoolOrAlone: 'إنت في مدرسة متعاقدة معانا ولا بتذاكر لوحدك؟',
  inSchool: 'في مدرسة',
  alone: 'لوحدي',
  selectCurriculum: 'اختر المنهج الدراسي',
  studentName: 'اسم الطالب',
  grade: 'الصف',
  studentPhone: 'رقم هاتفك',
  studentEmail: 'إيميلك',
  parentInfo: 'بيانات ولي الأمر',
  parentName: 'اسم ولي الأمر',
  parentPhone: 'رقم ولي الأمر',
  parentEmail: 'إيميل ولي الأمر',
  startStudying: 'ابدأ المذاكرة',
  registering: 'جاري التسجيل...',
  parentLogin: 'دخول ولي الأمر',
  childInSchool: 'ابنك في مدرسة متعاقدة معانا؟',
  childStudyingAlone: 'ابنك بيدرس على السيستم بس مش عبر مدرسة؟',
  enterDirectly: 'ادخل مباشر',
  selectSchool: 'اختار المدرسة',
  searchSchool: 'ابحث عن مدرسة...',
  students: 'طالب',
  adminLogin: 'دخول المدير',
  enterDashboard: 'دخول لوحة التحكم',
  noSchoolsFound: 'مفيش مدارس بالاسم ده',
  nameRequired: 'من فضلك اكتب اسمك ورقم ولي الأمر على الأقل',
  parentPhoneRequired: 'من فضلك اكتب اسمك ورقم ولي الأمر على الأقل',
  registrationError: 'حصل خطأ أثناء إنشاء الحساب. حاول تاني.',
  changeSchool: 'تغيير',
  noCurriculum: 'اختر مدرسة الأول أو لوحدك',

  heroBadge: 'أول مدرّس AI شخصي في مصر — متاح 24/7',
  heroTitle1: 'المدرّس الوحيد',
  heroTitle2: 'اللي بيصحى معاك',
  heroSubtitle: 'نظام تعليمي ذكي بيتكيف مع شخصية كل طالب، بيبادر هو بالتواصل، وبيبني ملف تراكمي يزداد قيمة كل يوم. مش مجرد chatbot — ده مدرّس حقيقي بيعرف اسمك وتاريخك.',
  tryTwoWeeks: 'جرّب مجاناً أسبوعين',
  activeStudents: 'طالب نشط',
  schools: 'مدارس',
  whyNotChatGPT: 'ليه مش مجرد ChatGPT؟',
  whyNotChatGPTDesc: 'الفرق الجوهري: The Primer بيبادر هو، بيتذكر تاريخك، وبيشرح على سبورة تفاعلية خطوة بخطوة',
  featureProactive: 'بيبادر هو',
  featureProactiveDesc: 'مش بننتظر الطالب يجيله. النظام بيرسل رسائل، بيقترح جلسات، ولاحظ التراجع والتقدم.',
  featureWhiteboard: 'سبورة تفاعلية',
  featureWhiteboardDesc: 'بيرسم معاك خطوة بخطوة بأنيميشن، مش بيولّد صورة نهائية. الطالب بيشوف كل خطوة وهي تظهر.',
  featureRemembers: 'بيتذكرك',
  featureRemembersDesc: 'بيعرف اسمك، مدرستك، نقاط قوتك وضعفك. بيكمّل من حيث وقفتوا، مش بيبدا من الصفر.',
  featureReports: 'تقارير لولي الأمر',
  featureReportsDesc: 'بعد كل جلسة، ولي الأمر بيوصلو تقرير. في آخر الترم، تقرير اكتشاف المهارة.',
  featureCurriculum: 'مخصص للمنهج المصري',
  featureCurriculumDesc: 'مش منصة عالمية عامة. مبني خصيصاً للمنهج المصري وبكالوريا 2026.',
  featureFast: 'سريع ورخيص',
  featureFastDesc: 'أقل من قرش للسؤال. النظام بيستخدم semantic cache عشان يبقى سريع ومربح.',
  howItWorks: 'إزاي بيشتغل؟',
  howItWorksDesc: 'ثلاث طبقات تعليمية — النظام هو اللي بيبادر',
  stepChat: 'نص 24/7',
  stepChatDesc: 'الطالب يكتب في أي وقت، النظام بيرد فوراً بنص + رسم تفاعلي. ده القلب الرئيسي — بيغطي 80% من الاحتياج.',
  stepVoice: 'صوت اختياري',
  stepVoiceDesc: 'الطالب بيختار امتى يحب الصوت. في غرفته وحده = صوت، ليل وأهله نايمين = نص. احترام لسياقه.',
  stepSession: 'جلسة كاملة',
  stepSessionDesc: 'النظام بيقترح جلسة لما يحس إن الطالب محتاجها: 3 أسئلة في نفس الموضوع، نفس الخطأ مرتين، إشارة عدم فهم.',
  pricing: 'الأسعار',
  pricingDesc: 'الأهالي بيدفعوا مباشرة — أول أسبوعين مجانية',
  faq: 'الأسئلة الشائعة',
  finalCta: 'ابنك يستاهل مدرّس',
  finalCtaDesc: 'بيعرفه ويبادر بيه',

  manageSchools: 'إدارة المدارس',
  addSchool: 'إضافة مدرسة',
  addTeacher: 'إضافة مدرّس',
  manageTeachers: 'إدارة المدرّسين',
  manageContent: 'إدارة المناهج والمحتوى',
  manageWhatsApp: 'أتمتة واتساب',
  manageBlocked: 'إدارة الحظر',
  schoolName: 'اسم المدرسة (عربي)',
  schoolNameEn: 'اسم المدرسة (إنجليزي)',
  schoolLocation: 'الموقع',
  schoolType: 'نوع المدرسة',
  contractStatus: 'حالة العقد',
  studentLink: 'رابط الطلاب وأولياء الأمور',
  teacherLink: 'رابط المدرّسين',
  companyNumber: 'رقم الشركة',
  templates: 'قوالب الرسائل',
  messageLog: 'سجل الرسائل',
  contacts: 'جهات الاتصال',
  sendTest: 'إرسال تجريبي',
  notRegistered: 'غير مسجل',
  curriculum: 'المنهج',
  subjects: 'مواد',
  units: 'وحدات',
  lessons: 'دروس',
  international: 'إنترناشونال',
  national: 'ناشونال',
  private: 'خاصة',
  trial: 'تجربة',
  active: 'فعال',
  pending: 'معلق',
  expired: 'منتهي',
  sent: 'مرسلة',
  enabled: 'مفعّل',
  disabled: 'متوقف',
  recipient: 'المستلم',
  forStudent: 'للطالب',
  forParent: 'لولي الأمر',
  variables: 'المتغيرات',
  editTemplate: 'تعديل القالب',
  companySendingNumber: 'رقم الشركة المُرسل منه',
  saveChanges: 'حفظ التغييرات',
  blockEmail: 'حظر إيميل',
  unblock: 'فك الحظر',
  blocked: 'محظور',
  reason: 'السبب',

  dashboard: 'الرئيسية',
  chat: 'المذاكرة',
  sessions: 'الجلسات',
  exams: 'الامتحانات',
  progress: 'تقدّمي',
  reports: 'التقارير',
  billing: 'الفواتير',
  users: 'المستخدمين',
  teachers: 'المدرّسين',
  content: 'المحتوى',
  whatsapp: 'واتساب',
  analytics: 'التحليلات',
  finance: 'المالية',
  notifications: 'الإشعارات',
  settings: 'الإعدادات',
  insights: 'تحليلات',
  activity: 'النشاط',

  welcomeBack: 'أهلاً بعودتك',
  continueStudying: 'استكمل مذاكرة',
  weeklyGoal: 'هدف الأسبوع',
  streak: 'أيام متتالية',
  days: 'يوم',
  askTeacher: 'اسأل مدرّسك',
  upcomingSession: 'جلسة قادمة',

  grade1: 'الصف الأول الثانوي',
  grade2: 'الصف الثاني الثانوي',
  grade3: 'الصف الثالث الثانوي',
};

const en: Translations = {
  appName: 'The Primer',
  appTagline: 'Smart Education System',
  startNow: 'Start Now',
  tryFree: 'Try Free',
  adminPanel: 'Admin Dashboard',
  imParent: 'I am a Parent',
  imTeacher: 'I am a Teacher',
  imStudent: 'New Student',
  backToHome: 'Back to Home',
  back: 'Back',
  save: 'Save',
  cancel: 'Cancel',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  search: 'Search',
  loading: 'Loading...',
  submit: 'Submit',

  portalTitle: 'Smart Login Portal',
  portalSubtitle: 'The Primer — Smart Education System',
  portalIdentify: 'Who are you? Choose to get to the right place',
  newStudent: 'New Student',
  newStudentDesc: 'Register your info and start studying instantly',
  parent: 'Parent',
  parentDesc: 'Track your child\'s progress and view reports',
  schoolPortal: 'School Portal',
  schoolPortalDesc: 'Enter through your school or search for it',
  admin: 'Admin',
  adminDesc: 'Full platform control',
  studentRegister: 'New Student Registration',
  schoolOrAlone: 'Are you at a partnered school or studying on your own?',
  inSchool: 'At School',
  alone: 'On My Own',
  selectCurriculum: 'Select your curriculum',
  studentName: 'Student Name',
  grade: 'Grade',
  studentPhone: 'Your Phone',
  studentEmail: 'Your Email',
  parentInfo: 'Parent Information',
  parentName: 'Parent Name',
  parentPhone: 'Parent Phone',
  parentEmail: 'Parent Email',
  startStudying: 'Start Studying',
  registering: 'Registering...',
  parentLogin: 'Parent Login',
  childInSchool: 'Is your child at a partnered school?',
  childStudyingAlone: 'Is your child studying on the system independently?',
  enterDirectly: 'Enter Directly',
  selectSchool: 'Select School',
  searchSchool: 'Search for a school...',
  students: 'students',
  adminLogin: 'Admin Login',
  enterDashboard: 'Enter Dashboard',
  noSchoolsFound: 'No schools found with that name',
  nameRequired: 'Please enter your name and parent phone at minimum',
  parentPhoneRequired: 'Please enter your name and parent phone at minimum',
  registrationError: 'An error occurred during registration. Please try again.',
  changeSchool: 'Change',
  noCurriculum: 'Select a school first or choose individual',

  heroBadge: 'Egypt\'s first personal AI tutor — available 24/7',
  heroTitle1: 'The only tutor',
  heroTitle2: 'who wakes up with you',
  heroSubtitle: 'A smart learning system that adapts to each student\'s personality, proactively reaches out, and builds a cumulative profile that grows more valuable every day. Not just a chatbot — a real tutor who knows your name and your history.',
  tryTwoWeeks: 'Try free for two weeks',
  activeStudents: 'Active Students',
  schools: 'Schools',
  whyNotChatGPT: 'Why not just ChatGPT?',
  whyNotChatGPTDesc: 'The core difference: The Primer proactively reaches out, remembers your history, and explains on an interactive whiteboard step by step',
  featureProactive: 'Proactive',
  featureProactiveDesc: 'We don\'t wait for the student to come. The system sends messages, suggests sessions, and notices progress and setbacks.',
  featureWhiteboard: 'Interactive Whiteboard',
  featureWhiteboardDesc: 'Draws with you step by step with animation, not just a final image. The student sees each step appear.',
  featureRemembers: 'Remembers You',
  featureRemembersDesc: 'Knows your name, your school, your strengths and weaknesses. Continues from where you left off, never starts from scratch.',
  featureReports: 'Parent Reports',
  featureReportsDesc: 'After every session, the parent gets a report. At end of term, a skill discovery report.',
  featureCurriculum: 'Curriculum-Specific',
  featureCurriculumDesc: 'Not a generic global platform. Built specifically for the Egyptian curriculum and 2026 baccalaureate.',
  featureFast: 'Fast & Affordable',
  featureFastDesc: 'Less than a penny per question. The system uses semantic caching to stay fast and profitable.',
  howItWorks: 'How it works',
  howItWorksDesc: 'Three educational layers — the system takes the initiative',
  stepChat: 'Text 24/7',
  stepChatDesc: 'The student writes anytime, the system responds instantly with text + interactive drawing. This is the core — covers 80% of needs.',
  stepVoice: 'Optional Voice',
  stepVoiceDesc: 'The student chooses when they want voice. Alone in their room = voice, late at night = text. Respects their context.',
  stepSession: 'Full Session',
  stepSessionDesc: 'The system suggests a session when it senses the student needs one: 3 questions on the same topic, the same mistake twice, a sign of not understanding.',
  pricing: 'Pricing',
  pricingDesc: 'Parents pay directly — first two weeks free',
  faq: 'FAQ',
  finalCta: 'Your child deserves a tutor',
  finalCtaDesc: 'who knows them and reaches out',

  manageSchools: 'Manage Schools',
  addSchool: 'Add School',
  addTeacher: 'Add Teacher',
  manageTeachers: 'Manage Teachers',
  manageContent: 'Curriculum & Content',
  manageWhatsApp: 'WhatsApp Automation',
  manageBlocked: 'Blocked Users',
  schoolName: 'School Name (Arabic)',
  schoolNameEn: 'School Name (English)',
  schoolLocation: 'Location',
  schoolType: 'School Type',
  contractStatus: 'Contract Status',
  studentLink: 'Students & Parents Link',
  teacherLink: 'Teachers Link',
  companyNumber: 'Company Number',
  templates: 'Templates',
  messageLog: 'Message Log',
  contacts: 'Contacts',
  sendTest: 'Send Test',
  notRegistered: 'Not registered',
  curriculum: 'Curriculum',
  subjects: 'Subjects',
  units: 'Units',
  lessons: 'Lessons',
  international: 'International',
  national: 'National',
  private: 'Private',
  trial: 'Trial',
  active: 'Active',
  pending: 'Pending',
  expired: 'Expired',
  sent: 'Sent',
  enabled: 'Enabled',
  disabled: 'Disabled',
  recipient: 'Recipient',
  forStudent: 'For Student',
  forParent: 'For Parent',
  variables: 'Variables',
  editTemplate: 'Edit Template',
  companySendingNumber: 'Company Sending Number',
  saveChanges: 'Save Changes',
  blockEmail: 'Block Email',
  unblock: 'Unblock',
  blocked: 'Blocked',
  reason: 'Reason',

  dashboard: 'Dashboard',
  chat: 'Chat',
  sessions: 'Sessions',
  exams: 'Exams',
  progress: 'Progress',
  reports: 'Reports',
  billing: 'Billing',
  users: 'Users',
  teachers: 'Teachers',
  content: 'Content',
  whatsapp: 'WhatsApp',
  analytics: 'Analytics',
  finance: 'Finance',
  notifications: 'Notifications',
  settings: 'Settings',
  insights: 'Insights',
  activity: 'Activity',

  welcomeBack: 'Welcome back',
  continueStudying: 'Continue studying',
  weeklyGoal: 'Weekly Goal',
  streak: 'Day streak',
  days: 'days',
  askTeacher: 'Ask your tutor',
  upcomingSession: 'Upcoming session',

  grade1: 'First Year Secondary',
  grade2: 'Second Year Secondary',
  grade3: 'Third Year Secondary',
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = lang === 'ar' ? ar : en;

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

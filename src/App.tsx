import { useState, useEffect } from 'react';
import type { Role } from '@/types';

import { AppShell } from '@/components/layout/AppShell';
import { SmartPortal } from '@/components/SmartPortal';

import { LandingPage } from '@/pages/LandingPage';

import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { StudentChat } from '@/pages/student/StudentChat';
import { StudentSessions } from '@/pages/student/StudentSessions';
import { StudentProgress } from '@/pages/student/StudentProgress';
import { StudentExams } from '@/pages/student/StudentExams';

import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard';
import { TeacherStudents } from '@/pages/teacher/TeacherStudents';
import { TeacherInsights } from '@/pages/teacher/TeacherInsights';
import { TeacherReports } from '@/pages/teacher/TeacherReports';

import { ParentDashboard } from '@/pages/parent/ParentDashboard';
import { ParentReports } from '@/pages/parent/ParentReports';
import { ParentBilling } from '@/pages/parent/ParentBilling';

import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminSchools } from '@/pages/admin/AdminSchools';
import { AdminTeachers } from '@/pages/admin/AdminTeachers';
import { AdminContent } from '@/pages/admin/AdminContent';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminFinance } from '@/pages/admin/AdminFinance';
import { AdminNotifications } from '@/pages/admin/AdminNotifications';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminWhatsApp } from '@/pages/admin/AdminWhatsApp';
import { AdminAITemplates } from '@/pages/admin/AdminAITemplates';
import { AdminStudentChats } from '@/pages/admin/AdminStudentChats';
import { AdminBlocked } from '@/pages/admin/AdminBlocked';
import { AdminSummerCourses } from '@/pages/admin/AdminSummerCourses';
import { AdminSubscriptions } from '@/pages/admin/AdminSubscriptions';
import { AdminApiUsage } from '@/pages/admin/AdminApiUsage';
import { AdminExams } from '@/pages/admin/AdminExams';

import { SchoolPortalDashboard } from '@/pages/school/SchoolPortalDashboard';
import { SchoolPortalStudents } from '@/pages/school/SchoolPortalStudents';
import { SchoolPortalTeachers } from '@/pages/school/SchoolPortalTeachers';
import { SchoolPortalActivity } from '@/pages/school/SchoolPortalActivity';

import { supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/adminCurriculumApi';

type AppState =
  | 'landing'
  | 'portal'
  | 'app'
  | 'admin-login'
  | 'admin-checking';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');

  const [role, setRole] = useState<Role>('student');

  const [activePage, setActivePage] = useState('dashboard');

  const [schoolId, setSchoolId] = useState<string | undefined>(undefined);

  const [studentId, setStudentId] = useState<string | undefined>(undefined);

  // التحقق من رابط الأدمن عند فتح الموقع
  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess() {
      const currentPath = window.location.pathname;

      // إزالة أي استخدام قديم للرابط السري
      if (window.location.hash === '#admin-secret') {
        window.history.replaceState(null, '', currentPath);
      }

      // لا نبدأ فحص الأدمن إلا عند فتح /admin
      if (currentPath !== '/admin' && currentPath !== '/admin/') {
        return;
      }

      setAppState('admin-checking');

      try {
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const accessToken =
          sessionData.session?.access_token;

        if (!accessToken) {
          if (!cancelled) {
            setAppState('admin-login');
          }

          return;
        }

        // التحقق من أن الحساب أدمن فعليًا من خلال API
        await verifyAdminSession(accessToken);

        if (cancelled) {
          return;
        }

        setRole('admin');
        setActivePage('dashboard');
        setAppState('app');
      } catch (error) {
        await supabase.auth.signOut();

        if (!cancelled) {
          setAppState('admin-login');
        }
      }
    }

    void checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  const enterApp = (
    selectedRole: Role,
    selectedId?: string
  ) => {
    setRole(selectedRole);

    if (selectedRole === 'school') {
      setSchoolId(selectedId);
      setStudentId(undefined);
    } else if (selectedRole === 'student') {
      setStudentId(selectedId);
      setSchoolId(undefined);
    } else {
      setSchoolId(undefined);
      setStudentId(undefined);
    }

    setActivePage(
      selectedRole === 'school'
        ? 'portal-dashboard'
        : 'dashboard'
    );

    setAppState('app');
  };

  const switchRole = () => {
    setAppState('portal');
  };

  const goLanding = () => {
    setAppState('landing');
  };

  // شاشة فحص صلاحية الأدمن
  if (appState === 'admin-checking') {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#090909] text-white"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-neutral-700 border-t-cyan-400" />

          <p className="text-sm text-neutral-300">
            جارٍ التحقق من صلاحية الدخول...
          </p>
        </div>
      </main>
    );
  }

  // شاشة تسجيل دخول الأدمن
  if (appState === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={() => {
          setRole('admin');
          setSchoolId(undefined);
          setStudentId(undefined);
          setActivePage('dashboard');
          setAppState('app');
        }}
        onBack={() => {
          window.history.replaceState(null, '', '/');
          setAppState('landing');
        }}
      />
    );
  }

  if (appState === 'landing') {
    return <LandingPage onEnter={enterApp} />;
  }

  if (appState === 'portal') {
    return (
      <SmartPortal
        onChoose={enterApp}
        onBack={goLanding}
      />
    );
  }

  return (
    <AppShell
      role={role}
      activePage={activePage}
      onNavigate={setActivePage}
      onSwitchRole={switchRole}
      notificationsCount={3}
    >
      {renderPage(
        role,
        activePage,
        setActivePage,
        schoolId,
        studentId
      )}
    </AppShell>
  );
}

function renderPage(
  role: Role,
  page: string,
  onNavigate: (p: string) => void,
  schoolId?: string,
  studentId?: string
) {
  if (role === 'student') {
    switch (page) {
      case 'dashboard':
        return <StudentDashboard onNavigate={onNavigate} />;

      case 'chat':
        return <StudentChat />;

      case 'sessions':
        return <StudentSessions />;

      case 'exams':
        return <StudentExams />;

      case 'progress':
        return <StudentProgress />;

      default:
        return <StudentDashboard onNavigate={onNavigate} />;
    }
  }

  if (role === 'teacher') {
    switch (page) {
      case 'dashboard':
        return <TeacherDashboard onNavigate={onNavigate} />;

      case 'students':
        return <TeacherStudents />;

      case 'insights':
        return <TeacherInsights />;

      case 'reports':
        return <TeacherReports />;

      default:
        return <TeacherDashboard onNavigate={onNavigate} />;
    }
  }

  if (role === 'parent') {
    switch (page) {
      case 'dashboard':
        return <ParentDashboard onNavigate={onNavigate} />;

      case 'reports':
        return <ParentReports onNavigate={onNavigate} />;

      case 'billing':
        return <ParentBilling onNavigate={onNavigate} />;

      default:
        return <ParentDashboard onNavigate={onNavigate} />;
    }
  }

  if (role === 'school') {
    switch (page) {
      case 'portal-dashboard':
        return (
          <SchoolPortalDashboard
            schoolId={schoolId ?? 's1'}
            onNavigate={onNavigate}
          />
        );

      case 'portal-students':
        return (
          <SchoolPortalStudents
            schoolId={schoolId ?? 's1'}
            onNavigate={onNavigate}
          />
        );

      case 'portal-teachers':
        return (
          <SchoolPortalTeachers
            schoolId={schoolId ?? 's1'}
            onNavigate={onNavigate}
          />
        );

      case 'portal-activity':
        return (
          <SchoolPortalActivity
            schoolId={schoolId ?? 's1'}
            onNavigate={onNavigate}
          />
        );

      default:
        return (
          <SchoolPortalDashboard
            schoolId={schoolId ?? 's1'}
            onNavigate={onNavigate}
          />
        );
    }
  }

  if (role === 'admin') {
    switch (page) {
      case 'dashboard':
        return <AdminDashboard onNavigate={onNavigate} />;

      case 'users':
        return <AdminUsers onNavigate={onNavigate} />;

      case 'schools':
        return <AdminSchools onNavigate={onNavigate} />;

      case 'teachers':
        return <AdminTeachers onNavigate={onNavigate} />;

      case 'content':
        return <AdminContent onNavigate={onNavigate} />;

      case 'exams':
        return <AdminExams onNavigate={onNavigate} />;

      case 'whatsapp':
        return <AdminWhatsApp onNavigate={onNavigate} />;

      case 'ai-templates':
        return <AdminAITemplates onNavigate={onNavigate} />;

      case 'student-chats':
        return <AdminStudentChats onNavigate={onNavigate} />;

      case 'summer-courses':
        return <AdminSummerCourses onNavigate={onNavigate} />;

      case 'subscriptions':
        return <AdminSubscriptions onNavigate={onNavigate} />;

      case 'api-usage':
        return <AdminApiUsage onNavigate={onNavigate} />;

      case 'blocked':
        return <AdminBlocked onNavigate={onNavigate} />;

      case 'analytics':
        return <AdminAnalytics onNavigate={onNavigate} />;

      case 'finance':
        return <AdminFinance onNavigate={onNavigate} />;

      case 'notifications':
        return <AdminNotifications onNavigate={onNavigate} />;

      case 'settings':
        return <AdminSettings onNavigate={onNavigate} />;

      default:
        return <AdminDashboard onNavigate={onNavigate} />;
    }
  }

  return null;
}

export default App;

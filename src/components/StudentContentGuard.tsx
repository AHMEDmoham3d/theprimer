
import { useEffect, useState, type ReactNode } from 'react';
import {
  LockKeyhole,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { Card } from '@/components/ui';
import { fetchStudentById } from '@/lib/db';

interface StudentContentGuardProps {
  studentId?: string;
  children: ReactNode;
}

type AccessState =
  | 'loading'
  | 'allowed'
  | 'blocked'
  | 'not_found'
  | 'error';

export function StudentContentGuard({
  studentId,
  children,
}: StudentContentGuardProps) {
  const [accessState, setAccessState] =
    useState<AccessState>('loading');

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkStudentAccess() {
      setAccessState('loading');

      const storedId =
        localStorage.getItem('current_student_id');

      const activeStudentId =
        studentId || storedId || '';

      if (!activeStudentId.trim()) {
        if (!cancelled) {
          setAccessState('not_found');
        }

        return;
      }

      try {
        const student = await fetchStudentById(
          activeStudentId
        );

        if (cancelled) return;

        if (!student) {
          setAccessState('not_found');
          return;
        }

        // The database migration adds this column
        // with TRUE as the default for existing students.
        const hasContentAccess = (
          student as typeof student & {
            content_access_enabled?: boolean;
          }
        ).content_access_enabled === true;

        setAccessState(
          hasContentAccess ? 'allowed' : 'blocked'
        );

      } catch (error) {
        console.error(
          'Student content access check failed:',
          error
        );

        if (!cancelled) {
          setAccessState('error');
        }
      }
    }

    void checkStudentAccess();

    return () => {
      cancelled = true;
    };
  }, [studentId, retryKey]);

  if (accessState === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto mb-4 animate-spin text-emerald-400"
          />

          <p className="text-sm text-neutral-400">
            جاري التحقق من صلاحية الوصول...
          </p>
        </div>
      </div>
    );
  }

  if (accessState === 'blocked') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-500/20 bg-[#141414] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <LockKeyhole
              size={30}
              className="text-red-400"
            />
          </div>

          <h2 className="mb-3 text-xl font-bold text-white">
            المحتوى غير متاح حاليًا
          </h2>

          <p className="text-sm leading-7 text-neutral-400">
            تم إيقاف صلاحية الوصول إلى المحتوى التعليمي
            لهذا الحساب بواسطة إدارة The Primer.
            برجاء التواصل مع الإدارة لمعرفة التفاصيل.
          </p>

          <div className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
            <p className="text-xs text-neutral-500">
              صلاحية المحتوى
            </p>

            <p className="mt-1 text-sm font-semibold text-red-400">
              متوقفة
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (accessState === 'not_found') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle
            size={32}
            className="mx-auto mb-4 text-amber-400"
          />

          <h2 className="mb-2 text-lg font-bold text-white">
            لم يتم العثور على حساب الطالب
          </h2>

          <p className="text-sm leading-7 text-neutral-400">
            لم نتمكن من تحديد حساب الطالب.
            برجاء العودة إلى تسجيل الدخول والمحاولة مرة أخرى.
          </p>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('current_student_id');
              window.location.href = '/';
            }}
            className="btn-primary mt-6 w-full"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </Card>
      </div>
    );
  }

  if (accessState === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle
            size={32}
            className="mx-auto mb-4 text-red-400"
          />

          <h2 className="mb-2 text-lg font-bold text-white">
            تعذر التحقق من صلاحية الوصول
          </h2>

          <p className="text-sm leading-7 text-neutral-400">
            حدث خطأ أثناء الاتصال بقاعدة البيانات.
            لم يتم عرض المحتوى لحين نجاح التحقق.
          </p>

          <button
            type="button"
            onClick={() => setRetryKey(value => value + 1)}
            className="btn-primary mt-6 w-full"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default StudentContentGuard;


import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Users,
  GraduationCap,
  Brain,
  UserCircle,
  ShieldCheck,
  ShieldOff,
  Loader2,
  RefreshCw,
  Mail,
  School,
  CalendarDays,
} from 'lucide-react';

import {
  Card,
  Badge,
  Avatar,
  IconButton,
  EmptyState,
} from '@/components/ui';

import {
  TEACHERS,
  PARENTS,
} from '@/data/mockData';

import { SUBJECT_META } from '@/data/subjects';

import {
  adminFetchStudents,
  adminUpdateStudentContentAccess,
  type AdminStudentRow,
} from '@/lib/adminCurriculumApi';

import type { AdminPageProps } from './types';

type Tab = 'students' | 'teachers' | 'parents';

type Notice = {
  type: 'success' | 'error';
  text: string;
} | null;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] || '')
    .join('')
    .toUpperCase() || 'ST';
}

function getSubscriptionBadge(status: string | null) {
  switch (status) {
    case 'active':
      return {
        label: 'مشترك',
        variant: 'success' as const,
      };

    case 'trial':
      return {
        label: 'فترة تجريبية',
        variant: 'warning' as const,
      };

    case 'expired':
      return {
        label: 'منتهي',
        variant: 'error' as const,
      };

    case 'warning':
      return {
        label: 'تحذير',
        variant: 'warning' as const,
      };

    default:
      return {
        label: 'غير محدد',
        variant: 'neutral' as const,
      };
  }
}

function formatDate(date: string): string {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminUsers(_: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('students');

  const [search, setSearch] = useState('');

  const [students, setStudents] = useState<AdminStudentRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [updatingStudents, setUpdatingStudents] = useState<Set<string>>(
    new Set()
  );

  const [notice, setNotice] = useState<Notice>(null);

  // ==========================================
  // Load real students from Supabase
  // ==========================================

  const loadStudents = useCallback(async () => {
    setRefreshing(true);
    setNotice(null);

    try {
      const result = await adminFetchStudents();

      setStudents(result);

    } catch (error) {
      console.error('Admin students loading error:', error);

      setNotice({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'تعذر تحميل الطلاب.',
      });

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  // ==========================================
  // Search and filtering
  // ==========================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter(student => {
      return [
        student.name,
        student.grade,
        student.grade_code,
        student.school_name,
        student.email,
        student.student_email,
        student.parent_name,
      ].some(value =>
        (value || '').toString().toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return TEACHERS.filter(teacher =>
      teacher.name.toLowerCase().includes(query)
    );
  }, [search]);

  const filteredParents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return PARENTS.filter(parent =>
      parent.name.toLowerCase().includes(query)
    );
  }, [search]);

  // ==========================================
  // Change one student's content permission
  // ==========================================

  async function handleToggleContentAccess(
    student: AdminStudentRow
  ) {
    const newPermission = !student.content_access_enabled;

    const confirmationMessage = newPermission
      ? `هل تريد السماح للطالب ${student.name} بالوصول إلى المحتوى التعليمي؟`
      : `هل تريد منع الطالب ${student.name} من الوصول إلى المحتوى التعليمي؟`;

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) return;

    setNotice(null);

    setUpdatingStudents(previous => {
      const next = new Set(previous);
      next.add(student.id);
      return next;
    });

    try {
      const updatedStudent =
        await adminUpdateStudentContentAccess(
          student.id,
          newPermission
        );

      setStudents(previous =>
        previous.map(item =>
          item.id === student.id
            ? updatedStudent
            : item
        )
      );

      setNotice({
        type: 'success',
        text: newPermission
          ? `تم السماح للطالب ${student.name} بالمحتوى.`
          : `تم منع الطالب ${student.name} من المحتوى.`,
      });

    } catch (error) {
      console.error(
        'Student content permission update error:',
        error
      );

      setNotice({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'تعذر تحديث صلاحية الطالب.',
      });

    } finally {
      setUpdatingStudents(previous => {
        const next = new Set(previous);
        next.delete(student.id);
        return next;
      });
    }
  }

  // ==========================================
  // Tabs
  // ==========================================

  const tabs: {
    id: Tab;
    label: string;
    icon: typeof Users;
    count: number;
  }[] = [
    {
      id: 'students',
      label: 'الطلاب',
      icon: Users,
      count: students.length,
    },
    {
      id: 'teachers',
      label: 'المدرّسين',
      icon: GraduationCap,
      count: TEACHERS.length,
    },
    {
      id: 'parents',
      label: 'أولياء الأمور',
      icon: Brain,
      count: PARENTS.length,
    },
  ];

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">

      {/* Tabs */}

      <div className="flex items-center gap-2 overflow-x-auto">

        {tabs.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`
              flex items-center gap-2
              rounded-xl px-4 py-2.5
              text-sm font-medium
              transition whitespace-nowrap
              ${
                tab === item.id
                  ? 'bg-white text-black'
                  : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#2a2a2a]'
              }
            `}
          >
            <item.icon size={16} />

            {item.label}

            <span
              className={`
                rounded-full px-2 py-0.5 text-[10px]
                ${
                  tab === item.id
                    ? 'bg-black/10'
                    : 'bg-neutral-800'
                }
              `}
            >
              {item.count}
            </span>
          </button>
        ))}

        <button className="btn-primary text-xs mr-auto whitespace-nowrap">
          <Plus size={16} />
          إضافة مستخدم
        </button>

      </div>

      {/* Search */}

      <div className="flex items-center gap-3">

        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">

          <Search
            size={18}
            className="text-neutral-500"
          />

          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={
              tab === 'students'
                ? 'ابحث باسم الطالب أو البريد أو الصف...'
                : 'ابحث بالاسم...'
            }
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
          />

        </div>

        {tab === 'students' && (
          <button
            onClick={() => void loadStudents()}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            تحديث
          </button>
        )}

      </div>

      {/* Notice */}

      {notice && (
        <div
          className={`
            rounded-xl border p-4 text-sm
            ${
              notice.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }
          `}
        >
          {notice.text}
        </div>
      )}

      {/* ====================================== */}
      {/* Students */}
      {/* ====================================== */}

      {tab === 'students' && (

        <Card className="overflow-x-auto">

          {loading ? (

            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">

              <Loader2
                size={32}
                className="animate-spin mb-3"
              />

              <p className="text-sm">
                جاري تحميل الطلاب من قاعدة البيانات...
              </p>

            </div>

          ) : students.length === 0 ? (

            <EmptyState
              icon={<UserCircle size={28} />}
              title="لا يوجد طلاب مسجلون"
              description="سيظهر هنا الطلاب المسجلون في قاعدة البيانات."
            />

          ) : filteredStudents.length === 0 ? (

            <EmptyState
              icon={<Search size={28} />}
              title="لم يتم العثور على الطالب"
              description="جرّب البحث باسم مختلف أو بريد إلكتروني آخر."
            />

          ) : (

            <table className="w-full text-right">

              <thead>
                <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">

                  <th className="pb-3 pr-4 font-medium">
                    الطالب
                  </th>

                  <th className="pb-3 font-medium">
                    الصف
                  </th>

                  <th className="pb-3 font-medium">
                    المدرسة
                  </th>

                  <th className="pb-3 font-medium">
                    بيانات التواصل
                  </th>

                  <th className="pb-3 font-medium">
                    الاشتراك
                  </th>

                  <th className="pb-3 font-medium">
                    صلاحية المحتوى
                  </th>

                  <th className="pb-3 font-medium">
                    تاريخ التسجيل
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredStudents.map(student => {

                  const subscription =
                    getSubscriptionBadge(
                      student.subscription_status
                    );

                  const isUpdating =
                    updatingStudents.has(student.id);

                  const hasAccess =
                    student.content_access_enabled;

                  const email =
                    student.student_email ||
                    student.email ||
                    '';

                  return (

                    <tr
                      key={student.id}
                      className="border-b border-[#1c1c1c] hover:bg-[#141414] transition"
                    >

                      {/* Student */}

                      <td className="py-4 pr-4">

                        <div className="flex items-center gap-3">

                          <Avatar
                            initials={getInitials(student.name)}
                            size="sm"
                          />

                          <div className="min-w-0">

                            <p className="text-sm font-medium text-white">
                              {student.name}
                            </p>

                            <p className="text-[10px] text-neutral-500">
                              {student.parent_name
                                ? `ولي الأمر: ${student.parent_name}`
                                : 'طالب'}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Grade */}

                      <td className="text-xs text-neutral-400 whitespace-nowrap">

                        {student.grade || 'غير محدد'}

                      </td>

                      {/* School */}

                      <td className="text-xs text-neutral-400">

                        <div className="flex items-center gap-1.5">

                          <School size={13} />

                          {student.school_name || 'غير محدد'}

                        </div>

                      </td>

                      {/* Contact */}

                      <td className="text-xs text-neutral-400">

                        {email ? (

                          <div className="flex items-center gap-1.5">

                            <Mail size={13} />

                            <span dir="ltr">
                              {email}
                            </span>

                          </div>

                        ) : (

                          'غير متاح'

                        )}

                      </td>

                      {/* Subscription */}

                      <td>

                        <Badge variant={subscription.variant}>
                          {subscription.label}
                        </Badge>

                      </td>

                      {/* Content permission */}

                      <td>

                        <div className="flex flex-col items-start gap-2">

                          <Badge
                            variant={
                              hasAccess
                                ? 'success'
                                : 'error'
                            }
                          >

                            {hasAccess ? (
                              <>
                                <ShieldCheck size={13} />
                                مسموح
                              </>
                            ) : (
                              <>
                                <ShieldOff size={13} />
                                ممنوع
                              </>
                            )}

                          </Badge>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void handleToggleContentAccess(
                                student
                              )
                            }
                            className={`
                              rounded-lg px-3 py-1.5
                              text-xs font-medium
                              transition
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              ${
                                hasAccess
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              }
                            `}
                          >

                            {isUpdating ? (

                              <span className="flex items-center gap-1.5">

                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />

                                جاري الحفظ...

                              </span>

                            ) : (

                              hasAccess
                                ? 'منع المحتوى'
                                : 'السماح بالمحتوى'

                            )}

                          </button>

                        </div>

                      </td>

                      {/* Registration date */}

                      <td className="text-xs text-neutral-400 whitespace-nowrap">

                        <div className="flex items-center gap-1.5">

                          <CalendarDays size={13} />

                          {formatDate(student.created_at)}

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          )}

        </Card>

      )}

      {/* ====================================== */}
      {/* Teachers */}
      {/* ====================================== */}

      {tab === 'teachers' && (

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

          {filteredTeachers.map(teacher => {

            const meta = SUBJECT_META[teacher.subject];

            return (

              <Card
                key={teacher.id}
                hover
              >

                <div className="flex items-center gap-3 mb-4">

                  <Avatar
                    initials={teacher.avatar}
                    size="md"
                  />

                  <div className="flex-1">

                    <h3 className="text-sm font-semibold text-white">
                      {teacher.name}
                    </h3>

                    <p className="text-xs text-neutral-500">
                      {teacher.schoolName}
                    </p>

                  </div>

                  <IconButton>
                    <MoreVertical size={16} />
                  </IconButton>

                </div>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-1.5">

                    <div
                      className="h-5 w-5 rounded flex items-center justify-center"
                      style={{
                        background: meta.accentSoft,
                        color: meta.accent,
                      }}
                    >

                      <meta.icon size={11} />

                    </div>

                    <span className="text-xs text-neutral-300">
                      {meta.labelAr}
                    </span>

                  </div>

                  <Badge variant="info">
                    {teacher.studentsCount} طالب
                  </Badge>

                </div>

              </Card>

            );

          })}

          {filteredTeachers.length === 0 && (
            <div className="sm:col-span-2 md:col-span-3">

              <EmptyState
                icon={<GraduationCap size={28} />}
                title="لا يوجد مدرسون"
              />

            </div>
          )}

        </div>

      )}

      {/* ====================================== */}
      {/* Parents */}
      {/* ====================================== */}

      {tab === 'parents' && (

        <Card className="overflow-x-auto">

          <table className="w-full text-right">

            <thead>

              <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">

                <th className="pb-3 pr-4 font-medium">
                  ولي الأمر
                </th>

                <th className="pb-3 font-medium">
                  الهاتف
                </th>

                <th className="pb-3 font-medium">
                  عدد الأبناء
                </th>

                <th className="pb-3 font-medium"></th>

              </tr>

            </thead>

            <tbody>

              {filteredParents.map(parent => (

                <tr
                  key={parent.id}
                  className="border-b border-[#1c1c1c] hover:bg-[#141414] transition"
                >

                  <td className="py-3 pr-4">

                    <div className="flex items-center gap-3">

                      <Avatar
                        initials={parent.name
                          .split(' ')
                          .map(word => word[0])
                          .join('')}
                        size="sm"
                      />

                      <span className="text-sm font-medium text-white">
                        {parent.name}
                      </span>

                    </div>

                  </td>

                  <td className="text-xs text-neutral-400">
                    {parent.phone}
                  </td>

                  <td>

                    <Badge variant="info">
                      {parent.childrenIds.length} طفل
                    </Badge>

                  </td>

                  <td>

                    <IconButton>
                      <MoreVertical size={16} />
                    </IconButton>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredParents.length === 0 && (

            <EmptyState
              icon={<UserCircle size={28} />}
              title="لا يوجد أولياء أمور"
            />

          )}

        </Card>

      )}

    </div>
  );
}

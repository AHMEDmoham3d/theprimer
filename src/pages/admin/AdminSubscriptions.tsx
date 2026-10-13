import { useState, useEffect } from 'react';
import {
  CreditCard, RefreshCw, Zap, Settings, CheckCircle2, XCircle,
  Calendar, ToggleLeft, ToggleRight, Clock, Lock, Unlock, Plus,
  Loader2, Gift, AlertTriangle, Shield, GraduationCap, UserPlus, X,
} from 'lucide-react';
import { Card, Badge, Avatar, StatCard } from '@/components/ui';
import { SUBJECT_META, ALL_SUBJECTS } from '@/data/subjects';
import type { Subject } from '@/types';
import {
  fetchStudents, fetchSubscriptionSettings, updateSubscriptionSettings,
  renewStudentSubscription, grantTrial, extendTrial, revokeTrial,
  updateTrialSubjects, activateStudent, createStudent,
  isTrialExpired, getTrialDaysLeft,
  type StudentRow, type SubscriptionSettingsRow,
} from '@/lib/db';
import { cn } from '@/lib/utils';
import type { AdminPageProps } from './types';

export function AdminSubscriptions({}: AdminPageProps) {
  const [settings, setSettings] = useState<SubscriptionSettingsRow | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState<string | null>(null);
  const [actionStudent, setActionStudent] = useState<StudentRow | null>(null);
  const [actionType, setActionType] = useState<'grant' | 'extend' | 'subjects' | null>(null);
  const [trialDays, setTrialDays] = useState(14);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(ALL_SUBJECTS);
  const [processing, setProcessing] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', grade: '', parentPhone: '' });
  const [newStudentTrial, setNewStudentTrial] = useState(true);
  const [newStudentDays, setNewStudentDays] = useState(14);
  const [newStudentSubjects, setNewStudentSubjects] = useState<string[]>(ALL_SUBJECTS);
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    (async () => {
      const [settingsData, studentsData] = await Promise.all([
        fetchSubscriptionSettings(),
        fetchStudents(),
      ]);
      setSettings(settingsData);
      setStudents(studentsData);
      setLoading(false);
    })();
  }, []);

  const refreshStudents = async () => {
    const data = await fetchStudents();
    setStudents(data);
  };

  const toggleMode = async () => {
    if (!settings) return;
    const newMode = settings.renewal_mode === 'auto' ? 'manual' : 'auto';
    const ok = await updateSubscriptionSettings(settings.id, { renewal_mode: newMode });
    if (ok) setSettings({ ...settings, renewal_mode: newMode });
  };

  const handleRenew = async (studentId: string) => {
    setRenewing(studentId);
    await renewStudentSubscription(studentId, 30);
    await refreshStudents();
    setRenewing(null);
  };

  const openGrant = (student: StudentRow) => {
    setActionStudent(student);
    setActionType('grant');
    setTrialDays(14);
    setSelectedSubjects(student.trial_subjects ?? ALL_SUBJECTS);
  };

  const openExtend = (student: StudentRow) => {
    setActionStudent(student);
    setActionType('extend');
    setTrialDays(7);
  };

  const openSubjects = (student: StudentRow) => {
    setActionStudent(student);
    setActionType('subjects');
    setSelectedSubjects(student.trial_subjects ?? ALL_SUBJECTS);
  };

  const closeAction = () => {
    setActionStudent(null);
    setActionType(null);
    setProcessing(false);
  };

  const handleGrantTrial = async () => {
    if (!actionStudent) return;
    setProcessing(true);
    await grantTrial(actionStudent.id, trialDays, selectedSubjects);
    await refreshStudents();
    closeAction();
  };

  const handleExtendTrial = async () => {
    if (!actionStudent) return;
    setProcessing(true);
    await extendTrial(actionStudent.id, trialDays);
    await refreshStudents();
    closeAction();
  };

  const handleUpdateSubjects = async () => {
    if (!actionStudent) return;
    setProcessing(true);
    await updateTrialSubjects(actionStudent.id, selectedSubjects);
    await refreshStudents();
    closeAction();
  };

  const handleRevoke = async (student: StudentRow) => {
    setRenewing(student.id);
    await revokeTrial(student.id);
    await refreshStudents();
    setRenewing(null);
  };

  const handleActivate = async (student: StudentRow) => {
    setRenewing(student.id);
    await activateStudent(student.id);
    await refreshStudents();
    setRenewing(null);
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.parentPhone.trim()) return;
    setAddingStudent(true);
    const grades = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
    const student = await createStudent({
      name: newStudent.name,
      grade: newStudent.grade || grades[0],
      school_id: null,
      school_name: '',
      curriculum_id: null,
      curriculum_name: '',
      parent_name: '',
      parent_phone: newStudent.parentPhone,
      parent_email: '',
      student_phone: '',
      student_email: '',
    });
    if (student) {
      if (newStudentTrial) {
        await grantTrial(student.id, newStudentDays, newStudentSubjects);
      } else {
        await activateStudent(student.id);
      }
      await refreshStudents();
    }
    setAddingStudent(false);
    setShowAddStudent(false);
    setNewStudent({ name: '', grade: '', parentPhone: '' });
  };

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const activeCount = students.filter((s) => s.subscription_status === 'active').length;
  const trialCount = students.filter((s) => s.subscription_status === 'trial').length;
  const expiredCount = students.filter((s) => isTrialExpired(s)).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#181818] to-[#141414]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <CreditCard size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">إدارة الاشتراكات والفترة التجريبية</h2>
            <p className="text-sm text-neutral-400 mt-1">تحكم في فترات التجربة، المواد المتاحة، وتجديد الاشتراكات</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="مشتركين" value={activeCount} icon={<CheckCircle2 size={20} />} change="نشط" trend="up" />
        <StatCard label="فترة تجربة" value={trialCount} icon={<Calendar size={20} />} change="مؤقت" trend="up" />
        <StatCard label="منتهي/محظور" value={expiredCount} icon={<XCircle size={20} />} change="محتاج تجديد" trend="down" />
      </div>

      {/* Renewal mode toggle */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              settings?.renewal_mode === 'auto' ? 'bg-emerald-500/10' : 'bg-neutral-800'
            )}>
              {settings?.renewal_mode === 'auto'
                ? <Zap size={22} className="text-emerald-400" />
                : <Settings size={22} className="text-neutral-400" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">نمط التجديد</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {loading ? 'جاري التحميل...' :
                  settings?.renewal_mode === 'auto'
                    ? 'أوتوماتيك — الاشتراكات بتتجدد لوحدها'
                    : 'يدوي — لازم تجدّد كل اشتراك بنفسك'}
              </p>
            </div>
          </div>
          {settings && (
            <button
              onClick={toggleMode}
              className={cn(
                'flex items-center gap-3 rounded-xl px-5 py-3 transition',
                settings.renewal_mode === 'auto'
                  ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              )}
            >
              {settings.renewal_mode === 'auto' ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              <span className="text-sm font-bold">
                {settings.renewal_mode === 'auto' ? 'أوتوماتيك' : 'يدوي'}
              </span>
            </button>
          )}
        </div>
      </Card>

      {/* Students subscription table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-white">حالة اشتراكات الطلاب</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-neutral-200"
            >
              <UserPlus size={14} />
              إضافة طالب
            </button>
            <span className="text-xs text-neutral-500">{students.length} طالب</span>
          </div>
        </div>
        <div className="space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-neutral-500" />
            </div>
          )}
          {!loading && students.map((student) => {
            const isActive = student.subscription_status === 'active';
            const isTrial = student.subscription_status === 'trial';
            const expired = isTrialExpired(student);
            const daysLeft = getTrialDaysLeft(student);
            const trialSubjects = student.trial_subjects ?? ALL_SUBJECTS;

            return (
              <div
                key={student.id}
                className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={student.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{student.name}</p>
                    <p className="text-[10px] text-neutral-500">{student.grade} — {student.school_name || 'فردي'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <Badge variant="success">مشترك</Badge>}
                    {isTrial && !expired && <Badge variant="warning">تجربة — {daysLeft} يوم</Badge>}
                    {expired && <Badge variant="error">منتهي</Badge>}
                  </div>
                </div>

                {/* Trial subjects preview */}
                {isTrial && !expired && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-neutral-500">المواد المتاحة:</span>
                    {trialSubjects.map((subj) => {
                      const meta = SUBJECT_META[subj as Subject];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      return (
                        <span key={subj} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px]" style={{ background: meta.accent + '15', color: meta.accent }}>
                          <Icon size={10} />
                          {meta.labelAr}
                        </span>
                      );
                    })}
                    {trialSubjects.length === 0 && <span className="text-[10px] text-red-400">مفيش مواد متاحة</span>}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#2a2a2a]">
                  {(expired || isTrial) && (
                    <button
                      onClick={() => openGrant(student)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                      <Gift size={13} />
                      {expired ? 'فتح فترة تجربة' : 'إعادة فتح التجربة'}
                    </button>
                  )}
                  {isTrial && !expired && (
                    <>
                      <button
                        onClick={() => openExtend(student)}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20"
                      >
                        <Clock size={13} />
                        تمديد
                      </button>
                      <button
                        onClick={() => openSubjects(student)}
                        className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700"
                      >
                        <GraduationCap size={13} />
                        المواد
                      </button>
                      <button
                        onClick={() => handleRevoke(student)}
                        disabled={renewing === student.id}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                      >
                        <Lock size={13} />
                        إلغاء التجربة
                      </button>
                    </>
                  )}
                  {isActive && (
                    <button
                      onClick={() => handleActivate(student)}
                      disabled={renewing === student.id}
                      className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-700"
                    >
                      <Shield size={13} />
                      مشترك سنة
                    </button>
                  )}
                  {!isActive && (
                    <button
                      onClick={() => handleActivate(student)}
                      disabled={renewing === student.id}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                      <Unlock size={13} />
                      تفعيل اشتراك
                    </button>
                  )}
                  {renewing === student.id && <Loader2 size={14} className="animate-spin text-neutral-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action modal */}
      {actionStudent && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={closeAction}>
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={actionStudent.avatar} size="sm" />
                <div>
                  <p className="text-sm font-bold text-white">{actionStudent.name}</p>
                  <p className="text-[10px] text-neutral-400">{actionStudent.grade}</p>
                </div>
              </div>
              <button onClick={closeAction} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition">
                <X size={18} />
              </button>
            </div>

            {actionType === 'grant' && (
              <>
                <h3 className="text-base font-bold text-white mb-4">فتح فترة تجربة جديدة</h3>
                <label className="text-sm font-medium text-neutral-200 mb-2 block">عدد أيام التجربة</label>
                <div className="flex gap-2 mb-5">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setTrialDays(d)}
                      className={cn(
                        'flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition',
                        trialDays === d ? 'border-white bg-white text-black' : 'border-[#333] bg-[#222] text-neutral-300 hover:border-[#555]'
                      )}
                    >
                      {d} يوم
                    </button>
                  ))}
                </div>
                <label className="text-sm font-medium text-neutral-200 mb-2 block">المواد المتاحة في التجربة</label>
                <p className="text-xs text-neutral-500 mb-3">اختار المواد اللي الطالب يقدر يذاكرها في فترة التجربة</p>
                <SubjectPicker selected={selectedSubjects} onToggle={toggleSubject} />
                <button onClick={handleGrantTrial} disabled={processing} className="btn-primary w-full mt-5">
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                  فتح التجربة
                </button>
              </>
            )}

            {actionType === 'extend' && (
              <>
                <h3 className="text-base font-bold text-white mb-4">تمديد فترة التجربة</h3>
                <div className="mb-5 rounded-xl bg-blue-500/10 border border-blue-500/30 p-3">
                  <p className="text-sm text-blue-300">
                    الأيام المتبقية حالياً: {getTrialDaysLeft(actionStudent)} يوم
                  </p>
                </div>
                <label className="text-sm font-medium text-neutral-200 mb-2 block">أضف أيام إضافية</label>
                <div className="flex gap-2 mb-5">
                  {[3, 7, 14].map((d) => (
                    <button
                      key={d}
                      onClick={() => setTrialDays(d)}
                      className={cn(
                        'flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition',
                        trialDays === d ? 'border-white bg-white text-black' : 'border-[#333] bg-[#222] text-neutral-300 hover:border-[#555]'
                      )}
                    >
                      +{d} يوم
                    </button>
                  ))}
                </div>
                <button onClick={handleExtendTrial} disabled={processing} className="btn-primary w-full">
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                  تمديد التجربة
                </button>
              </>
            )}

            {actionType === 'subjects' && (
              <>
                <h3 className="text-base font-bold text-white mb-2">اختيار المواد المتاحة في التجربة</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  الطالب يقدر يذاكر المواد المحددة فقط. لو ملخّصها كلها، كل المواد متاحة.
                </p>
                <SubjectPicker selected={selectedSubjects} onToggle={toggleSubject} />
                <button onClick={handleUpdateSubjects} disabled={processing} className="btn-primary w-full mt-5">
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  حفظ المواد
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Student modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowAddStudent(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">إضافة طالب جديد</h3>
              <button onClick={() => setShowAddStudent(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-200 mb-1.5 block">اسم الطالب</label>
                <input
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="أحمد محمد"
                  className="w-full rounded-xl border border-[#333] bg-[#222] px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-200 mb-1.5 block">الصف</label>
                <select
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="w-full rounded-xl border border-[#333] bg-[#222] px-4 py-3 text-sm text-white focus:outline-none focus:border-white"
                >
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-200 mb-1.5 block">رقم ولي الأمر (واتساب)</label>
                <input
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  placeholder="010xxxxxxxx"
                  className="w-full rounded-xl border border-[#333] bg-[#222] px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-3 border-t border-[#333]">
                <label className="text-sm font-medium text-neutral-200 mb-2 block">نوع الاشتراك</label>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setNewStudentTrial(true)}
                    className={cn(
                      'flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition',
                      newStudentTrial ? 'border-white bg-white text-black' : 'border-[#333] bg-[#222] text-neutral-300 hover:border-[#555]'
                    )}
                  >
                    فترة تجربة
                  </button>
                  <button
                    onClick={() => setNewStudentTrial(false)}
                    className={cn(
                      'flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition',
                      !newStudentTrial ? 'border-white bg-white text-black' : 'border-[#333] bg-[#222] text-neutral-300 hover:border-[#555]'
                    )}
                  >
                    اشتراك كامل
                  </button>
                </div>

                {newStudentTrial && (
                  <>
                    <label className="text-sm font-medium text-neutral-200 mb-2 block">مدة التجربة</label>
                    <div className="flex gap-2 mb-4">
                      {[7, 14, 30].map((d) => (
                        <button
                          key={d}
                          onClick={() => setNewStudentDays(d)}
                          className={cn(
                            'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                            newStudentDays === d ? 'border-white bg-white text-black' : 'border-[#333] bg-[#222] text-neutral-300 hover:border-[#555]'
                          )}
                        >
                          {d} يوم
                        </button>
                      ))}
                    </div>
                    <label className="text-sm font-medium text-neutral-200 mb-2 block">المواد المتاحة</label>
                    <SubjectPicker selected={newStudentSubjects} onToggle={(s) => setNewStudentSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])} />
                  </>
                )}
              </div>

              <button
                onClick={handleAddStudent}
                disabled={addingStudent || !newStudent.name.trim() || !newStudent.parentPhone.trim()}
                className="btn-primary w-full mt-5"
              >
                {addingStudent ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                إضافة الطالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectPicker({ selected, onToggle }: { selected: string[]; onToggle: (s: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_SUBJECTS.map((subj) => {
        const meta = SUBJECT_META[subj];
        const Icon = meta.icon;
        const isSelected = selected.includes(subj);
        return (
          <button
            key={subj}
            onClick={() => onToggle(subj)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition',
              isSelected
                ? 'border-white bg-white/10 text-white'
                : 'border-[#2a2a2a] bg-[#0f0f0f] text-neutral-500 hover:border-[#444]'
            )}
          >
            <Icon size={14} style={{ color: isSelected ? meta.accent : undefined }} />
            {meta.labelAr}
            {isSelected && <CheckCircle2 size={12} className="mr-auto text-white" />}
          </button>
        );
      })}
    </div>
  );
}

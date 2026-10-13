import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Mail, Phone, X, Loader2, Users, GraduationCap } from 'lucide-react';
import { Card, Badge, Avatar, IconButton, StatCard } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import { fetchTeachers, fetchSchools, createTeacher, type TeacherRow, type SchoolRow } from '@/lib/db';
import type { Subject } from '@/types';
import type { AdminPageProps } from './types';

export function AdminTeachers(_: AdminPageProps) {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    Promise.all([fetchTeachers(), fetchSchools()]).then(([t, s]) => {
      setTeachers(t);
      setSchools(s);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const totalTeachers = teachers.length;
  const totalStudentsManaged = teachers.reduce((a, t) => a + t.students_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">إدارة المدرّسين</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs"><Plus size={16} /> إضافة مدرّس</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي المدرّسين" value={totalTeachers} icon={<GraduationCap size={20} />} />
        <StatCard label="طلاب تحت إشراف" value={totalStudentsManaged} icon={<Users size={20} />} />
        <StatCard label="متوسط الطلاب/مدرّس" value={totalTeachers > 0 ? Math.round(totalStudentsManaged / totalTeachers) : 0} icon={<Users size={20} />} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-neutral-500" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {teachers.map((t) => {
            const meta = SUBJECT_META[t.subject as Subject] ?? SUBJECT_META.math;
            return (
              <Card key={t.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={t.avatar} size="lg" />
                    <div>
                      <h3 className="font-bold text-white">{t.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{t.school_name || 'مدرّس مستقل'}</p>
                    </div>
                  </div>
                  <IconButton><MoreVertical size={16} /></IconButton>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                    <meta.icon size={16} />
                  </div>
                  <span className="text-sm text-white">{meta.labelAr}</span>
                  <Badge variant="info" className="mr-auto">{t.students_count} طالب</Badge>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Mail size={14} /> {t.email || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Phone size={14} /> {t.phone || '—'}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showAdd && <AddTeacherModal schools={schools} onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); setLoading(true); load(); }} />}
    </div>
  );
}

function AddTeacherModal({ schools, onClose, onCreated }: { schools: SchoolRow[]; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [subject, setSubject] = useState<string>('math');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedSchool = schools.find((s) => s.id === schoolId);

  const submit = async () => {
    if (!name.trim()) { setError('اكتب اسم المدرّس'); return; }
    if (!schoolId) { setError('اختر مدرسة'); return; }
    setSubmitting(true);
    const teacher = await createTeacher({
      name,
      school_id: schoolId,
      school_name: selectedSchool?.name ?? '',
      subject,
      phone,
      email,
    });
    setSubmitting(false);
    if (teacher) { onCreated(); } else { setError('حصل خطأ. حاول تاني.'); }
  };

  const subjectKeys = Object.keys(SUBJECT_META);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><GraduationCap size={20} /> إضافة مدرّس</h3>
          <IconButton onClick={onClose}><X size={18} /></IconButton>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">اسم المدرّس</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="أ. محمود سعيد" className="input-base" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">المدرسة</label>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="input-base">
              <option value="">اختر مدرسة</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">المادة</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-base">
              {subjectKeys.map((k) => <option key={k} value={k}>{SUBJECT_META[k as Subject].labelAr}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">رقم الهاتف</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010xxxxxxxx" className="input-base" />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">الإيميل</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu" className="input-base" />
            </div>
          </div>

          {selectedSchool && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3 text-xs text-green-300">
              سيتم ربط المدرّس بـ: {selectedSchool.name}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <button onClick={submit} disabled={submitting} className="btn-primary w-full mt-5 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {submitting ? 'جاري الإضافة...' : 'إضافة المدرّس'}
        </button>
      </div>
    </div>
  );
}

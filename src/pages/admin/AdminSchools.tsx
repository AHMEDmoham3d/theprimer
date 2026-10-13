import { useState, useEffect } from 'react';
import { Plus, MoreVertical, MapPin, Users, GraduationCap, Wallet, Copy, Check, Link, BookOpen, X, Loader2, Building2, Globe } from 'lucide-react';
import { Card, Badge, Avatar, IconButton, StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { fetchSchools, createSchool, type SchoolRow } from '@/lib/db';
import type { AdminPageProps } from './types';

export function AdminSchools(_: AdminPageProps) {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'student' | 'teacher' | null>(null);

  const load = () => { fetchSchools().then((d) => { setSchools(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const copyLink = (schoolId: string, slug: string, type: 'student' | 'teacher') => {
    const link = `https://theprimer.edu/${type === 'teacher' ? 'teachers' : 'portal'}/${slug}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiedId(schoolId);
    setCopiedType(type);
    setTimeout(() => { setCopiedId(null); setCopiedType(null); }, 2000);
  };

  const active = schools.filter((s) => s.contract_status === 'active').length;
  const trial = schools.filter((s) => s.contract_status === 'trial').length;
  const pending = schools.filter((s) => s.contract_status === 'pending').length;
  const totalStudents = schools.reduce((a, s) => a + s.students_count, 0);
  const totalReferral = schools.reduce((a, s) => a + s.monthly_referral_fee, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">إدارة المدارس</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs"><Plus size={16} /> إضافة مدرسة</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="مدارس فعالة" value={active} icon={<GraduationCap size={20} />} />
        <StatCard label="تحت التجربة" value={trial} icon={<Users size={20} />} />
        <StatCard label="إجمالي الطلاب" value={totalStudents} icon={<Users size={20} />} />
        <StatCard label="إجمالي العمولات" value={formatCurrency(totalReferral)} icon={<Wallet size={20} />} />
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm text-blue-300">
          كل مدرسة ليها رابطين فريدين بالإنجليزية — رابط للطلاب وأولياء الأمور، ورابط للمدرّسين. انسخ الرابط وابعه للمدرسة.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-neutral-500" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {schools.map((school) => (
            <Card key={school.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white font-bold text-lg">
                    {school.name_en[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{school.name}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {school.location}
                    </p>
                    <p className="text-[10px] text-neutral-600 flex items-center gap-1 mt-0.5">
                      <Globe size={10} /> {school.name_en}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={school.contract_status === 'active' ? 'success' : school.contract_status === 'trial' ? 'warning' : 'neutral'}>
                    {school.contract_status === 'active' ? 'فعال' : school.contract_status === 'trial' ? 'تجربة' : 'معلق'}
                  </Badge>
                  <IconButton><MoreVertical size={16} /></IconButton>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-[#141414] p-3 text-center">
                  <p className="text-xl font-bold text-white">{school.students_count}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">طالب</p>
                </div>
                <div className="rounded-xl bg-[#141414] p-3 text-center">
                  <p className="text-xl font-bold text-white">{school.teachers_count}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">مدرّس</p>
                </div>
                <div className="rounded-xl bg-[#141414] p-3 text-center">
                  <p className="text-xl font-bold text-white">{school.monthly_referral_fee > 0 ? formatCurrency(school.monthly_referral_fee) : '—'}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">عمولة شهرية</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Link size={14} className="text-blue-400" />
                    <span className="text-xs font-medium text-neutral-300">رابط الطلاب وأولياء الأمور</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate text-xs text-neutral-400 bg-[#141414] rounded-lg px-3 py-2">
                      theprimer.edu/portal/{school.slug}
                    </code>
                    <button
                      onClick={() => copyLink(school.id, school.slug, 'student')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-white hover:text-black transition shrink-0"
                    >
                      {copiedId === school.id && copiedType === 'student' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-neutral-300">رابط المدرّسين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate text-xs text-neutral-400 bg-[#141414] rounded-lg px-3 py-2">
                      theprimer.edu/teachers/{school.slug}
                    </code>
                    <button
                      onClick={() => copyLink(school.id, school.slug, 'teacher')}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-white hover:text-black transition shrink-0"
                    >
                      {copiedId === school.id && copiedType === 'teacher' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-neutral-500">
                <span>انضم: {new Date(school.join_date).toLocaleDateString('ar-EG')}</span>
                <span>عمولة لكل طالب: {school.referral_per_student} جنيه</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAdd && <AddSchoolModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); setLoading(true); load(); }} />}
    </div>
  );
}

function AddSchoolModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [location, setLocation] = useState('');
  const [schoolType, setSchoolType] = useState<'international' | 'national' | 'private'>('national');
  const [contractStatus, setContractStatus] = useState<'active' | 'pending' | 'trial'>('trial');
  const [referralPerStudent, setReferralPerStudent] = useState(80);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const slugPreview = (nameEn || name)
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, 40) || 'school-name';

  const submit = async () => {
    if (!name.trim() || !nameEn.trim()) { setError('اكتب اسم المدرسة بالعربي والإنجليزي'); return; }
    setSubmitting(true);
    const school = await createSchool({ name, name_en: nameEn, location, school_type: schoolType, contract_status: contractStatus, referral_per_student: referralPerStudent });
    setSubmitting(false);
    if (school) { onCreated(); } else { setError('حصل خطأ. حاول تاني.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Building2 size={20} /> إضافة مدرسة</h3>
          <IconButton onClick={onClose}><X size={18} /></IconButton>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">اسم المدرسة (عربي)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مدرسة المستقبل الدولية" className="input-base" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">اسم المدرسة (إنجليزي)</label>
            <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Future International School" className="input-base" />
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">الموقع</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="القاهرة — مدينة نصر" className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">نوع المدرسة</label>
              <select value={schoolType} onChange={(e) => setSchoolType(e.target.value as 'international' | 'national' | 'private')} className="input-base">
                <option value="national">ناشونال</option>
                <option value="international">إنترناشونال</option>
                <option value="private">خاصة</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1.5 block">حالة العقد</label>
              <select value={contractStatus} onChange={(e) => setContractStatus(e.target.value as 'active' | 'pending' | 'trial')} className="input-base">
                <option value="trial">تجربة</option>
                <option value="active">فعال</option>
                <option value="pending">معلق</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">عمولة لكل طالب (جنيه)</label>
            <input type="number" value={referralPerStudent} onChange={(e) => setReferralPerStudent(Number(e.target.value))} className="input-base" />
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-xs text-neutral-400 mb-1">معاينة الروابط:</p>
            <code className="text-xs text-blue-300 block">theprimer.edu/portal/{slugPreview}</code>
            <code className="text-xs text-green-300 block">theprimer.edu/teachers/{slugPreview}</code>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <button onClick={submit} disabled={submitting} className="btn-primary w-full mt-5 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {submitting ? 'جاري الإضافة...' : 'إضافة المدرسة'}
        </button>
      </div>
    </div>
  );
}

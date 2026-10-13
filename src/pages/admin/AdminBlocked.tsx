import { useState, useEffect } from 'react';
import { Ban, Shield, Unlock, Plus, Search, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, Badge, Avatar, StatCard, IconButton, EmptyState } from '@/components/ui';
import { fetchBlockedUsers, fetchStudents, fetchTeachers, blockUser, unblockUser, type BlockedUserRow } from '@/lib/db';
import type { AdminPageProps } from './types';

export function AdminBlocked(_: AdminPageProps) {
  const [blocked, setBlocked] = useState<BlockedUserRow[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([fetchBlockedUsers(), fetchStudents(), fetchTeachers()]).then(([b, s, t]) => {
      setBlocked(b);
      setStudentCount(s.length);
      setTeacherCount(t.length);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const filtered = blocked.filter((b) => b.email.includes(search) || b.name.includes(search));

  const handleUnblock = async (id: string) => {
    await unblockUser(id);
    load();
  };

  const handleBlock = async () => {
    if (!newEmail.trim()) return;
    setSubmitting(true);
    await blockUser({ email: newEmail, name: newName || newEmail.split('@')[0], role: 'student', reason: newReason || 'حظر يدوي' });
    setSubmitting(false);
    setNewEmail('');
    setNewName('');
    setNewReason('');
    setShowAdd(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <Ban size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">إدارة الحظر</h2>
            <p className="text-sm text-neutral-400">حظر وفك حظر المستخدمين</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-xs">
          <Plus size={16} /> حظر إيميل
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="مستخدمون محظورون" value={blocked.length} icon={<Ban size={20} />} />
        <StatCard label="طلاب نشطون" value={studentCount} icon={<Shield size={20} />} />
        <StatCard label="مدرّسون" value={teacherCount} icon={<Shield size={20} />} />
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">
            المستخدم المحظور مش هيقدر يدخل على السيستم أو يستخدمه بأي طريقة. فك الحظر بيكون فوري.
          </p>
        </div>
      </div>

      {showAdd && (
        <Card className="animate-fade-in">
          <h3 className="mb-4 font-bold text-white">حظر إيميل جديد</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 mb-2 block">الإيميل المراد حظره</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3">
                <Mail size={18} className="text-neutral-500" />
                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-2 block">الاسم (اختياري)</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم المستخدم..."
                className="input-base"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-2 block">السبب</label>
              <input
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="سبب الحظر..."
                className="input-base"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleBlock} disabled={submitting} className="btn-primary text-xs disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} حظر
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-xs">إلغاء</button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <Search size={18} className="text-neutral-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في المحظورين..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-neutral-500" /></div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-xs text-neutral-500">
                <th className="pb-3 pr-4 font-medium">المستخدم</th>
                <th className="pb-3 font-medium">الإيميل</th>
                <th className="pb-3 font-medium">السبب</th>
                <th className="pb-3 font-medium">تاريخ الحظر</th>
                <th className="pb-3 font-medium">بواسطة</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[#1c1c1c] hover:bg-[#141414] transition">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'XX'} size="sm" />
                      <div>
                        <p className="text-sm text-white">{user.name}</p>
                        <p className="text-[10px] text-neutral-500">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-neutral-400">{user.email}</td>
                  <td>
                    <Badge variant="error" className="text-[10px]">{user.reason}</Badge>
                  </td>
                  <td className="text-xs text-neutral-500">{new Date(user.blocked_at).toLocaleDateString('ar-EG')}</td>
                  <td className="text-xs text-neutral-400">{user.blocked_by}</td>
                  <td>
                    <button
                      onClick={() => handleUnblock(user.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition"
                    >
                      <Unlock size={14} /> فك الحظر
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState icon={<Shield size={28} />} title="مفيش مستخدمين محظورين" description="كل المستخدمين نشطون" />
          )}
        </Card>
      )}
    </div>
  );
}

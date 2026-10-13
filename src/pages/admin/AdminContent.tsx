import { useState, useEffect } from 'react';
import {
  BookOpen, Plus, ChevronLeft, ChevronDown, Search, Loader2,
  GraduationCap, FolderTree, Layers, FileText, Globe, Building2,
} from 'lucide-react';
import { Card, Badge, IconButton, StatCard } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import {
  fetchCurricula, fetchCurriculumSubjects, fetchUnits, fetchLessons,
  type CurriculumRow, type CurriculumSubjectRow, type CurriculumUnitRow, type CurriculumLessonRow,
} from '@/lib/db';
import type { Subject } from '@/types';
import type { AdminPageProps } from './types';

export function AdminContent(_: AdminPageProps) {
  const [curricula, setCurricula] = useState<CurriculumRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCurriculum, setExpandedCurriculum] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Record<string, CurriculumSubjectRow[]>>({});
  const [units, setUnits] = useState<Record<string, CurriculumUnitRow[]>>({});
  const [lessons, setLessons] = useState<Record<string, CurriculumLessonRow[]>>({});
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCurricula().then((d) => { setCurricula(d); setLoading(false); }); }, []);

  const loadSubjects = async (curriculumId: string) => {
    if (subjects[curriculumId]) return;
    const data = await fetchCurriculumSubjects(curriculumId);
    setSubjects((prev) => ({ ...prev, [curriculumId]: data }));
  };

  const loadUnits = async (subjectId: string) => {
    if (units[subjectId]) return;
    const data = await fetchUnits(subjectId);
    setUnits((prev) => ({ ...prev, [subjectId]: data }));
  };

  const loadLessons = async (unitId: string) => {
    if (lessons[unitId]) return;
    const data = await fetchLessons(unitId);
    setLessons((prev) => ({ ...prev, [unitId]: data }));
  };

  const toggleCurriculum = (id: string) => {
    const next = expandedCurriculum === id ? null : id;
    setExpandedCurriculum(next);
    setExpandedSubject(null);
    setExpandedUnit(null);
    if (next) loadSubjects(next);
  };

  const toggleSubject = (id: string) => {
    const next = expandedSubject === id ? null : id;
    setExpandedSubject(next);
    setExpandedUnit(null);
    if (next) loadUnits(next);
  };

  const toggleUnit = (id: string) => {
    const next = expandedUnit === id ? null : id;
    setExpandedUnit(next);
    if (next) loadLessons(next);
  };

  const typeLabel: Record<string, string> = { international: 'إنترناشونال', national: 'ناشونال', private: 'خاصة' };
  const typeIcon: Record<string, React.ReactNode> = {
    international: <Globe size={14} />,
    national: <Building2 size={14} />,
    private: <Building2 size={14} />,
  };

  const filteredCurricula = curricula.filter((c) =>
    !search || c.name.includes(search) || c.name_ar.includes(search) || c.school_type.includes(search)
  );

  const totalSubjects = Object.values(subjects).reduce((a, s) => a + s.length, 0);
  const totalUnits = Object.values(units).reduce((a, u) => a + u.length, 0);
  const totalLessons = Object.values(lessons).reduce((a, l) => a + l.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">إدارة المناهج والمحتوى</h2>
        <button className="btn-primary text-xs"><Plus size={16} /> إضافة منهج</button>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm text-blue-300">
          المناهج مرتبة حسب نوع المدرسة: إنترناشونال، ناشونال، أو خاصة. كل منهج له مواد، كل مادة لها وحدات، كل وحدة لها دروس. الذكاء الاصطناعي يستخدم هذا التسلسل ليعرف منهج كل طالب بناءً على مدرسته أو اختياره الفردي.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="المناهج" value={curricula.length} icon={<GraduationCap size={20} />} />
        <StatCard label="المواد" value={totalSubjects} icon={<BookOpen size={20} />} />
        <StatCard label="الوحدات" value={totalUnits} icon={<Layers size={20} />} />
        <StatCard label="الدروس" value={totalLessons} icon={<FileText size={20} />} />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <Search size={18} className="text-neutral-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منهج..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-neutral-500" /></div>
      ) : (
        <div className="space-y-3">
          {filteredCurricula.map((curr) => {
            const isExpanded = expandedCurriculum === curr.id;
            const currSubjects = subjects[curr.id] ?? [];
            return (
              <Card key={curr.id}>
                <button
                  onClick={() => toggleCurriculum(curr.id)}
                  className="flex w-full items-center gap-4 text-right"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white">
                    <FolderTree size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{curr.name}</h3>
                      <Badge variant="info" className="text-[10px] flex items-center gap-1">
                        {typeIcon[curr.school_type]} {typeLabel[curr.school_type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{curr.name_ar} — {curr.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">{currSubjects.length} مواد</span>
                    {isExpanded ? <ChevronDown size={18} className="text-neutral-500" /> : <ChevronLeft size={18} className="text-neutral-500" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-[#2a2a2a] pt-4">
                    {currSubjects.length === 0 && (
                      <p className="text-xs text-neutral-500 py-2">مفيش مواد لهذا المنهج بعد</p>
                    )}
                    {currSubjects.map((cs) => {
                      const meta = SUBJECT_META[cs.subject_key as Subject] ?? SUBJECT_META.math;
                      const isSubExpanded = expandedSubject === cs.id;
                      const subUnits = units[cs.id] ?? [];
                      return (
                        <div key={cs.id}>
                          <button
                            onClick={() => toggleSubject(cs.id)}
                            className="flex w-full items-center gap-3 rounded-xl bg-[#0f0f0f] p-3 text-right transition hover:bg-[#141414]"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: meta.accentSoft, color: meta.accent }}>
                              <meta.icon size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{cs.subject_name_ar}</p>
                              <p className="text-[10px] text-neutral-500">{cs.subject_name}</p>
                            </div>
                            <span className="text-xs text-neutral-400">{subUnits.length} وحدات</span>
                            {isSubExpanded ? <ChevronDown size={16} className="text-neutral-500" /> : <ChevronLeft size={16} className="text-neutral-500" />}
                          </button>

                          {isSubExpanded && (
                            <div className="mr-4 mt-2 space-y-2 border-r border-[#2a2a2a] pr-4">
                              {subUnits.length === 0 && (
                                <p className="text-xs text-neutral-500 py-2">مفيش وحدات لهذه المادة بعد</p>
                              )}
                              {subUnits.map((u) => {
                                const isUnitExpanded = expandedUnit === u.id;
                                const unitLessons = lessons[u.id] ?? [];
                                return (
                                  <div key={u.id}>
                                    <button
                                      onClick={() => toggleUnit(u.id)}
                                      className="flex w-full items-center gap-3 rounded-lg bg-[#0f0f0f] p-3 text-right transition hover:bg-[#141414]"
                                    >
                                      <Layers size={14} className="text-neutral-500" />
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-neutral-200">{u.name_ar || u.name}</p>
                                      </div>
                                      <span className="text-[10px] text-neutral-500">{unitLessons.length} دروس</span>
                                      {isUnitExpanded ? <ChevronDown size={14} className="text-neutral-500" /> : <ChevronLeft size={14} className="text-neutral-500" />}
                                    </button>

                                    {isUnitExpanded && (
                                      <div className="mr-4 mt-1 space-y-1 border-r border-[#2a2a2a] pr-4">
                                        {unitLessons.length === 0 && (
                                          <p className="text-xs text-neutral-500 py-2">مفيش دروس لهذه الوحدة بعد</p>
                                        )}
                                        {unitLessons.map((l) => (
                                          <div key={l.id} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#141414] transition">
                                            <FileText size={12} className="text-neutral-600" />
                                            <span className="text-xs text-neutral-300">{l.name_ar || l.name}</span>
                                            <IconButton className="mr-auto !p-1"><Plus size={12} /></IconButton>
                                          </div>
                                        ))}
                                        <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 hover:text-white transition">
                                          <Plus size={12} /> إضافة درس
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 hover:text-white transition">
                                <Plus size={12} /> إضافة وحدة
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 hover:text-white transition">
                      <Plus size={12} /> إضافة مادة للمنهج
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

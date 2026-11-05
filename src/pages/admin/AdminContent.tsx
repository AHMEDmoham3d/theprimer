import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Plus, ChevronLeft, ChevronDown, Search, Loader2,
  GraduationCap, FolderTree, Layers, FileText, Pencil, Trash2,
} from 'lucide-react';
import { Card, Badge, StatCard } from '@/components/ui';
import { SUBJECT_META } from '@/data/subjects';
import {
  fetchCurricula, fetchCurriculumGrades, fetchCurriculumSubjects, fetchUnits, fetchLessons,
  fetchCurriculumPublicationSettings,
  type CurriculumRow, type CurriculumGradeRow, type CurriculumSubjectRow, type CurriculumUnitRow, type CurriculumLessonRow,
} from '@/lib/db';
import {
  adminCreateCurriculum, adminUpdateCurriculum, adminDeleteCurriculum,
  adminCreateGrade, adminUpdateGrade, adminDeleteGrade,
  adminCreateSubject, adminUpdateSubject, adminDeleteSubject,
  adminCreateUnit, adminUpdateUnit, adminDeleteUnit,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
  adminUpdatePublicationSettings,
  type PublicationTerm,
} from '@/lib/adminCurriculumApi';
import type { Subject } from '@/types';
import type { AdminPageProps } from './types';

type Notice = { kind: 'success' | 'error'; text: string } | null;

export function AdminContent(_: AdminPageProps) {
  const [curricula, setCurricula] = useState<CurriculumRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [expandedCurriculum, setExpandedCurriculum] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, CurriculumGradeRow[]>>({});
  const [subjects, setSubjects] = useState<Record<string, CurriculumSubjectRow[]>>({});
  const [units, setUnits] = useState<Record<string, CurriculumUnitRow[]>>({});
  const [lessons, setLessons] = useState<Record<string, CurriculumLessonRow[]>>({});
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<Notice>(null);

  const [currentTerm, setCurrentTerm] = useState<PublicationTerm>('first');
  const [savedCurrentTerm, setSavedCurrentTerm] = useState<PublicationTerm>('first');
  const [publicationLoading, setPublicationLoading] = useState(true);

  async function refreshCurricula() {
    setLoading(true);

    try {
      setCurricula(await fetchCurricula());
    } catch (e) {
      setNotice({ kind: 'error', text: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  async function loadPublicationSettings() {
    setPublicationLoading(true);

    try {
      const settings = await fetchCurriculumPublicationSettings();
      setCurrentTerm(settings.current_term);
      setSavedCurrentTerm(settings.current_term);
    } catch (e) {
      setNotice({ kind: 'error', text: errorMessage(e) });
    } finally {
      setPublicationLoading(false);
    }
  }

  useEffect(() => {
    void refreshCurricula();
    void loadPublicationSettings();
  }, []);

  function errorMessage(error: unknown) {
    return error instanceof Error
      ? error.message
      : 'حصل خطأ غير متوقع. راجع صلاحيات Supabase.';
  }

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setNotice(null);

    try {
      await action();

      setNotice({
        kind: 'success',
        text: 'تم حفظ التغييرات بنجاح.',
      });
    } catch (e) {
      setNotice({
        kind: 'error',
        text: errorMessage(e),
      });
    } finally {
      setBusy(false);
    }
  }

  async function loadGrades(curriculumId: string) {
    try {
      const data = await fetchCurriculumGrades(curriculumId);

      setGrades(p => ({
        ...p,
        [curriculumId]: data,
      }));
    } catch (e) {
      setNotice({
        kind: 'error',
        text: errorMessage(e),
      });
    }
  }

  async function loadSubjects(curriculumId: string) {
    try {
      const data = await fetchCurriculumSubjects(curriculumId);

      setSubjects(p => ({
        ...p,
        [curriculumId]: data,
      }));
    } catch (e) {
      setNotice({
        kind: 'error',
        text: errorMessage(e),
      });
    }
  }

  async function loadUnits(subjectId: string) {
    try {
      const data = await fetchUnits(subjectId);

      setUnits(p => ({
        ...p,
        [subjectId]: data,
      }));
    } catch (e) {
      setNotice({
        kind: 'error',
        text: errorMessage(e),
      });
    }
  }

  async function loadLessons(unitId: string) {
    try {
      const data = await fetchLessons(unitId);

      setLessons(p => ({
        ...p,
        [unitId]: data,
      }));
    } catch (e) {
      setNotice({
        kind: 'error',
        text: errorMessage(e),
      });
    }
  }

  async function addCurriculum() {
    const name = window.prompt(
      'اسم المنهج بالإنجليزية أو الاسم الأساسي:'
    );

    if (!name?.trim()) return;

    const name_ar =
      window.prompt('اسم المنهج بالعربية:') || '';

    const stage =
      window.prompt(
        'المرحلة (مثال: primary / preparatory / secondary) — اختياري:'
      ) || '';

    const description =
      window.prompt('وصف المنهج — اختياري:') || '';

    await runAction(async () => {
      await adminCreateCurriculum({
        name,
        name_ar,
        stage,
        description,
      });

      await refreshCurricula();
    });
  }

  async function editCurriculum(row: CurriculumRow) {
    const name = window.prompt(
      'اسم المنهج:',
      row.name
    );

    if (!name?.trim()) return;

    const name_ar = window.prompt(
      'الاسم بالعربية:',
      row.name_ar || ''
    ) ?? row.name_ar;

    const description = window.prompt(
      'الوصف:',
      row.description || ''
    ) ?? row.description;

    await runAction(async () => {
      await adminUpdateCurriculum(row.id, {
        name,
        name_ar,
        description,
      });

      await refreshCurricula();
    });
  }

  async function removeCurriculum(row: CurriculumRow) {
    if (
      !window.confirm(
        `حذف منهج «${row.name_ar || row.name}»؟ سيتم حذف الصفوف والمواد والوحدات والدروس التابعة إذا كانت العلاقات مفعّلة بالحذف المتتابع.`
      )
    ) {
      return;
    }

    await runAction(async () => {
      await adminDeleteCurriculum(row.id);
      await refreshCurricula();
    });
  }

  async function addGrade(curriculumId: string) {
    const stage = window.prompt(
      'المرحلة الدراسية (مثال: secondary):'
    );

    if (!stage?.trim()) return;

    const grade_code = window.prompt(
      'كود الصف (مثال: secondary-1):'
    );

    if (!grade_code?.trim()) return;

    const grade_name_ar = window.prompt(
      'اسم الصف بالعربية:'
    );

    if (!grade_name_ar?.trim()) return;

    const grade_name =
      window.prompt(
        'اسم الصف بالإنجليزية:',
        grade_code
      ) || grade_code;

    await runAction(async () => {
      await adminCreateGrade({
        curriculum_id: curriculumId,
        stage,
        grade_code,
        grade_name,
        grade_name_ar,
        sort_order:
          (grades[curriculumId]?.length || 0) + 1,
      });

      await loadGrades(curriculumId);
    });
  }

  async function editGrade(row: CurriculumGradeRow) {
    const grade_name_ar = window.prompt(
      'اسم الصف بالعربية:',
      row.grade_name_ar
    );

    if (!grade_name_ar?.trim()) return;

    const grade_name = window.prompt(
      'اسم الصف بالإنجليزية:',
      row.grade_name
    ) ?? row.grade_name;

    await runAction(async () => {
      await adminUpdateGrade(row.id, {
        grade_name_ar,
        grade_name,
      });

      await loadGrades(row.curriculum_id);
    });
  }

  async function removeGrade(row: CurriculumGradeRow) {
    if (
      !window.confirm(
        `حذف الصف «${row.grade_name_ar}»؟`
      )
    ) {
      return;
    }

    await runAction(async () => {
      await adminDeleteGrade(row.id);
      await loadGrades(row.curriculum_id);
    });
  }

  async function addSubject(curriculumId: string) {
    const stage = window.prompt(
      'المرحلة (اكتب نفس القيمة المستخدمة في curriculum_grades.stage):'
    );

    if (!stage?.trim()) return;

    const grade = window.prompt(
      'كود الصف (نفس curriculum_grades.grade_code):'
    );

    if (!grade?.trim()) return;

    const subject_name_ar = window.prompt(
      'اسم المادة بالعربية:'
    );

    if (!subject_name_ar?.trim()) return;

    const subject_name =
      window.prompt(
        'اسم المادة بالإنجليزية (اختياري):'
      ) || subject_name_ar;

    const subject_key = window.prompt(
      'مفتاح المادة (math / physics / chemistry / biology / english / history / geography):',
      'math'
    );

    if (!subject_key?.trim()) return;

    await runAction(async () => {
      await adminCreateSubject({
        curriculum_id: curriculumId,
        stage,
        grade,
        subject_key,
        subject_name,
        subject_name_ar,
        sort_order:
          (subjects[curriculumId]?.length || 0) + 1,
      });

      await loadSubjects(curriculumId);
    });
  }

  async function editSubject(row: CurriculumSubjectRow) {
    const subject_name_ar = window.prompt(
      'اسم المادة بالعربية:',
      row.subject_name_ar
    );

    if (!subject_name_ar?.trim()) return;

    const subject_name = window.prompt(
      'اسم المادة بالإنجليزية:',
      row.subject_name
    ) ?? row.subject_name;

    await runAction(async () => {
      await adminUpdateSubject(row.id, {
        subject_name_ar,
        subject_name,
      });

      await loadSubjects(row.curriculum_id);
    });
  }

  async function removeSubject(row: CurriculumSubjectRow) {
    if (
      !window.confirm(
        `حذف المادة «${row.subject_name_ar}»؟ سيتم حذف وحداتها ودروسها التابعة.`
      )
    ) {
      return;
    }

    await runAction(async () => {
      await adminDeleteSubject(row.id);
      await loadSubjects(row.curriculum_id);

      setUnits(p => ({
        ...p,
        [row.id]: [],
      }));
    });
  }

  // تحديد المناهج المصرية التي تكون فيها تالتة ثانوي سنة كاملة.
  function isEgyptianThirdSecondary(
    subject: CurriculumSubjectRow
  ): boolean {
    if (
      subject.stage !== 'secondary' ||
      subject.grade !== 'secondary_3'
    ) {
      return false;
    }

    const curriculum = curricula.find(curr =>
      subjects[curr.id]?.some(item => item.id === subject.id)
    );

    if (!curriculum) return false;

    const curriculumName =
      `${curriculum.name || ''} ${curriculum.name_ar || ''}`.toLowerCase();

    const allowedCurricula = [
      'البكالوريا المصرية',
      'التعليم الأزهري',
      'المنهج المصري العام',
      'شهادة مدارس النيل الدولية',
      'egyptian baccalaureate',
      'al-azhar',
      'azhar',
      'egyptian general',
      'nile schools',
      'nile international',
    ];

    return allowedCurricula.some(name =>
      curriculumName.includes(name)
    );
  }

  // حفظ الترم المنشور حاليًا لجميع الطلاب.
  async function savePublishedTerm() {
    await runAction(async () => {
      const settings = await adminUpdatePublicationSettings(currentTerm);

      setCurrentTerm(settings.current_term);
      setSavedCurrentTerm(settings.current_term);
    });
  }

  async function addUnit(subject: CurriculumSubjectRow) {
    const name_ar = window.prompt(
      'اسم الوحدة بالعربية:'
    );

    if (!name_ar?.trim()) return;

    const name =
      window.prompt(
        'اسم الوحدة الأساسي:',
        name_ar
      ) || name_ar;

    const isFullYear = isEgyptianThirdSecondary(subject);

    let term: 'first' | 'second' | 'full_year' = 'first';

    if (isFullYear) {
      term = 'full_year';
    } else {
      const selectedTerm = window.prompt(
        'ترم الوحدة: اكتب first للترم الأول أو second للترم الثاني:',
        'first'
      );

      if (selectedTerm === null) return;

      if (selectedTerm !== 'first' && selectedTerm !== 'second') {
        setNotice({
          kind: 'error',
          text: 'اكتب first أو second فقط.',
        });
        return;
      }

      term = selectedTerm;
    }

    await runAction(async () => {
      await adminCreateUnit({
        subject_id: subject.id,
        name,
        name_ar,
        sort_order:
          (units[subject.id]?.length || 0) + 1,
        term,
      });

      await loadUnits(subject.id);
    });
  }

  async function editUnit(row: CurriculumUnitRow) {
    const name_ar = window.prompt(
      'اسم الوحدة:',
      row.name_ar || row.name
    );

    if (!name_ar?.trim()) return;

    const name =
      window.prompt(
        'الاسم الأساسي:',
        row.name
      ) || row.name;

    const subject = Object.values(subjects)
      .flat()
      .find(item => item.id === row.subject_id);

    const isFullYear = subject
      ? isEgyptianThirdSecondary(subject)
      : row.term === 'full_year';

    let term: 'first' | 'second' | 'full_year' = 'first';

    if (isFullYear) {
      term = 'full_year';
    } else {
      const selectedTerm = window.prompt(
        'ترم الوحدة: اكتب first للترم الأول أو second للترم الثاني:',
        row.term === 'second' ? 'second' : 'first'
      );

      if (selectedTerm === null) return;

      if (selectedTerm !== 'first' && selectedTerm !== 'second') {
        setNotice({
          kind: 'error',
          text: 'اكتب first أو second فقط.',
        });
        return;
      }

      term = selectedTerm;
    }

    await runAction(async () => {
      await adminUpdateUnit(row.id, {
        name,
        name_ar,
        term,
      });

      await loadUnits(row.subject_id);
    });
  }

  async function removeUnit(row: CurriculumUnitRow) {
    if (
      !window.confirm(
        `حذف الوحدة «${row.name_ar || row.name}» ودروسها؟`
      )
    ) {
      return;
    }

    await runAction(async () => {
      await adminDeleteUnit(row.id);
      await loadUnits(row.subject_id);
    });
  }

  async function addLesson(unit: CurriculumUnitRow) {
    const name_ar = window.prompt(
      'اسم الدرس بالعربية:'
    );

    if (!name_ar?.trim()) return;

    const name =
      window.prompt(
        'اسم الدرس الأساسي:',
        name_ar
      ) || name_ar;

    const content =
      window.prompt(
        'محتوى الدرس (يمكنك تركه فارغًا وإضافته لاحقًا):'
      ) || '';

    await runAction(async () => {
      await adminCreateLesson({
        unit_id: unit.id,
        name,
        name_ar,
        content,
        sort_order:
          (lessons[unit.id]?.length || 0) + 1,
      });

      await loadLessons(unit.id);
    });
  }

  async function editLesson(row: CurriculumLessonRow) {
    const name_ar = window.prompt(
      'اسم الدرس:',
      row.name_ar || row.name
    );

    if (!name_ar?.trim()) return;

    const name =
      window.prompt(
        'الاسم الأساسي:',
        row.name
      ) || row.name;

    const content = window.prompt(
      'محتوى الدرس:',
      row.content
    ) ?? row.content;

    await runAction(async () => {
      await adminUpdateLesson(row.id, {
        name,
        name_ar,
        content,
      });

      await loadLessons(row.unit_id);
    });
  }

  async function removeLesson(row: CurriculumLessonRow) {
    if (
      !window.confirm(
        `حذف الدرس «${row.name_ar || row.name}»؟`
      )
    ) {
      return;
    }

    await runAction(async () => {
      await adminDeleteLesson(row.id);
      await loadLessons(row.unit_id);
    });
  }

  const filteredCurricula = useMemo(
    () =>
      curricula.filter(
        c =>
          !search ||
          [
            c.name,
            c.name_ar,
            c.description,
            c.stage,
          ].some(v =>
            v?.toLowerCase().includes(
              search.toLowerCase()
            )
          )
      ),
    [curricula, search]
  );

  const totalSubjects = Object.values(subjects)
    .reduce((n, rows) => n + rows.length, 0);

  const totalUnits = Object.values(units)
    .reduce((n, rows) => n + rows.length, 0);

  const totalLessons = Object.values(lessons)
    .reduce((n, rows) => n + rows.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">
          إدارة المناهج والمحتوى
        </h2>

        <button
          disabled={busy}
          onClick={() => void addCurriculum()}
          className="btn-primary text-xs"
        >
          <Plus size={16} />
          إضافة منهج
        </button>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm text-blue-300">
          أضف المنهج ثم المواد مع تحديد المرحلة وكود الصف،
          وبعدها أضف الوحدات والدروس ومحتواها.
          البيانات مرتبطة بجداول Supabase الفعلية.
        </p>
      </div>

      {/* Global published term settings */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              الترم المنشور حاليًا للطلاب
            </h3>

            <p className="mt-1 text-xs text-neutral-400">
              تغيير الاختيار هنا يطبّق على جميع المناهج والصفوف التي تعمل بنظام الترمين.
              تالتة ثانوي في المناهج المصرية المحددة تظل سنة كاملة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentTerm}
              disabled={publicationLoading || busy}
              onChange={e =>
                setCurrentTerm(e.target.value as PublicationTerm)
              }
              className="rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2 text-sm text-white"
            >
              <option value="first">الترم الأول</option>
              <option value="second">الترم الثاني</option>
            </select>

            <button
              type="button"
              disabled={
                publicationLoading ||
                busy ||
                currentTerm === savedCurrentTerm
              }
              onClick={() => void savePublishedTerm()}
              className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              حفظ الترم المنشور
            </button>
          </div>
        </div>

        {publicationLoading && (
          <p className="mt-2 text-xs text-neutral-500">
            جارٍ تحميل إعدادات الترم...
          </p>
        )}
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-lg border p-3 text-sm ${
            notice.kind === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-green-500/30 bg-green-500/10 text-green-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      {busy && (
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Loader2 size={14} className="animate-spin" />
          جارٍ حفظ التغييرات...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label="المناهج"
          value={curricula.length}
          icon={<GraduationCap size={20} />}
        />

        <StatCard
          label="المواد المحمّلة"
          value={totalSubjects}
          icon={<BookOpen size={20} />}
        />

        <StatCard
          label="الوحدات المحمّلة"
          value={totalUnits}
          icon={<Layers size={20} />}
        />

        <StatCard
          label="الدروس المحمّلة"
          value={totalLessons}
          icon={<FileText size={20} />}
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <Search size={18} className="text-neutral-500" />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن منهج..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2
            size={24}
            className="animate-spin text-neutral-500"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCurricula.map(curr => {
            const isExpanded =
              expandedCurriculum === curr.id;

            const currSubjects =
              subjects[curr.id] ?? [];

            return (
              <Card key={curr.id}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = isExpanded
                        ? null
                        : curr.id;

                      setExpandedCurriculum(next);

                      if (next && !subjects[next]) {
                        void loadSubjects(next);
                      }

                      if (next && !grades[next]) {
                        void loadGrades(next);
                      }
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-right"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-800 text-white">
                      <FolderTree size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white">
                        {curr.name_ar || curr.name}
                      </h3>

                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {curr.name}
                        {curr.stage ? ` — ${curr.stage}` : ''}
                        {curr.description
                          ? ` — ${curr.description}`
                          : ''}
                      </p>
                    </div>

                    <Badge variant="info">
                      {currSubjects.length} مواد
                    </Badge>

                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronLeft size={18} />
                    )}
                  </button>

                  <button
                    title="تعديل المنهج"
                    onClick={() => void editCurriculum(curr)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    title="حذف المنهج"
                    onClick={() => void removeCurriculum(curr)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-[#2a2a2a] pt-4">
                    <div className="rounded-lg border border-[#292929] bg-[#101010] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-neutral-300">
                          الصفوف والمراحل الدراسية
                        </p>

                        <button
                          onClick={() => void addGrade(curr.id)}
                          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
                        >
                          <Plus size={12} />
                          إضافة صف
                        </button>
                      </div>

                      {(grades[curr.id] || []).length === 0 ? (
                        <p className="text-[11px] text-neutral-500">
                          لم تتم إضافة صفوف لهذا المنهج بعد.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {grades[curr.id].map(g => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-2 py-1 text-[11px] text-neutral-300"
                            >
                              {g.grade_name_ar} · {g.stage}

                              <button
                                title="تعديل الصف"
                                onClick={() => void editGrade(g)}
                                className="text-neutral-400 hover:text-white"
                              >
                                <Pencil size={11} />
                              </button>

                              <button
                                title="حذف الصف"
                                onClick={() => void removeGrade(g)}
                                className="text-red-400"
                              >
                                <Trash2 size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {!currSubjects.length && (
                      <p className="py-2 text-xs text-neutral-500">
                        مفيش مواد لهذا المنهج بعد.
                      </p>
                    )}

                    {currSubjects.map(cs => {
                      const meta =
                        SUBJECT_META[cs.subject_key as Subject] ??
                        SUBJECT_META.math;

                      const open =
                        expandedSubject === cs.id;

                      const subUnits =
                        units[cs.id] ?? [];

                      return (
                        <div key={cs.id}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const next = open
                                  ? null
                                  : cs.id;

                                setExpandedSubject(next);

                                if (next && !units[next]) {
                                  void loadUnits(next);
                                }
                              }}
                              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#0f0f0f] p-3 text-right hover:bg-[#171717]"
                            >
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{
                                  background: meta.accentSoft,
                                  color: meta.accent,
                                }}
                              >
                                <meta.icon size={16} />
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block text-sm text-white">
                                  {cs.subject_name_ar}
                                </span>

                                <span className="block text-[10px] text-neutral-500">
                                  {cs.subject_name} · {cs.stage} · {cs.grade}
                                </span>
                              </span>

                              <span className="text-xs text-neutral-400">
                                {subUnits.length} وحدات
                              </span>

                              {open ? (
                                <ChevronDown size={15} />
                              ) : (
                                <ChevronLeft size={15} />
                              )}
                            </button>

                            <button
                              title="تعديل المادة"
                              onClick={() => void editSubject(cs)}
                              className="p-2 text-neutral-400 hover:text-white"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              title="حذف المادة"
                              onClick={() => void removeSubject(cs)}
                              className="p-2 text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {open && (
                            <div className="mr-4 mt-2 space-y-2 border-r border-[#2a2a2a] pr-4">
                              {subUnits.map(unit => {
                                const unitOpen =
                                  expandedUnit === unit.id;

                                const unitLessons =
                                  lessons[unit.id] ?? [];

                                return (
                                  <div key={unit.id}>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          const next = unitOpen
                                            ? null
                                            : unit.id;

                                          setExpandedUnit(next);

                                          if (
                                            next &&
                                            !lessons[next]
                                          ) {
                                            void loadLessons(next);
                                          }
                                        }}
                                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#0f0f0f] p-3 text-right hover:bg-[#171717]"
                                      >
                                        <Layers
                                          size={14}
                                          className="text-neutral-500"
                                        />

                                        <span className="flex-1 text-xs text-neutral-200">
                                          {unit.name_ar || unit.name}
                                        </span>

                                        <span className="rounded-md bg-neutral-800 px-2 py-1 text-[10px] text-neutral-400">
                                          {unit.term === 'full_year'
                                            ? 'سنة كاملة'
                                            : unit.term === 'second'
                                              ? 'الترم الثاني'
                                              : 'الترم الأول'}
                                        </span>

                                        <span className="text-[10px] text-neutral-500">
                                          {unitLessons.length} دروس
                                        </span>

                                        {unitOpen ? (
                                          <ChevronDown size={14} />
                                        ) : (
                                          <ChevronLeft size={14} />
                                        )}
                                      </button>

                                      <button
                                        title="تعديل الوحدة"
                                        onClick={() => void editUnit(unit)}
                                        className="p-2 text-neutral-400"
                                      >
                                        <Pencil size={13} />
                                      </button>

                                      <button
                                        title="حذف الوحدة"
                                        onClick={() => void removeUnit(unit)}
                                        className="p-2 text-red-400"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>

                                    {unitOpen && (
                                      <div className="mr-4 mt-1 space-y-1 border-r border-[#2a2a2a] pr-3">
                                        {unitLessons.map(lesson => (
                                          <div
                                            key={lesson.id}
                                            className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-[#141414]"
                                          >
                                            <FileText
                                              size={12}
                                              className="text-neutral-600"
                                            />

                                            <span className="min-w-0 flex-1 text-xs text-neutral-300">
                                              {lesson.name_ar || lesson.name}
                                            </span>

                                            <button
                                              title="تعديل الدرس والمحتوى"
                                              onClick={() => void editLesson(lesson)}
                                              className="p-1 text-neutral-400"
                                            >
                                              <Pencil size={12} />
                                            </button>

                                            <button
                                              title="حذف الدرس"
                                              onClick={() => void removeLesson(lesson)}
                                              className="p-1 text-red-400"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          onClick={() => void addLesson(unit)}
                                          className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-neutral-400 hover:text-white"
                                        >
                                          <Plus size={12} />
                                          إضافة درس
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              <button
                                onClick={() => void addUnit(cs)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 hover:text-white"
                              >
                                <Plus size={12} />
                                إضافة وحدة
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      onClick={() => void addSubject(curr.id)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 hover:text-white"
                    >
                      <Plus size={12} />
                      إضافة مادة للمنهج
                    </button>
                  </div>
                )}
              </Card>
            );
          })}

          {!filteredCurricula.length && (
            <p className="py-10 text-center text-sm text-neutral-500">
              لا توجد مناهج مطابقة للبحث.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
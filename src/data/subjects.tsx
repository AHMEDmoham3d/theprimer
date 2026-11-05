
import {
  Calculator,
  FlaskConical,
  Atom,
  Leaf,
  BookOpen,
  Globe,
  GraduationCap,
  Brain,
  Shield,
  School,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Subject } from '@/types';

export interface SubjectMeta {
  label: string;
  labelAr: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
}

const DEFAULT_SUBJECT_META: SubjectMeta = {
  label: 'Subject',
  labelAr: 'مادة دراسية',
  icon: BookOpen,
  accent: '#64748b',
  accentSoft: '#f1f5f9',
};

const KNOWN_SUBJECT_META: Record<string, SubjectMeta> = {
  math: {
    label: 'Mathematics',
    labelAr: 'الرياضيات',
    icon: Calculator,
    accent: '#2563eb',
    accentSoft: '#dbeafe',
  },
  chemistry: {
    label: 'Chemistry',
    labelAr: 'الكيمياء',
    icon: FlaskConical,
    accent: '#0891b2',
    accentSoft: '#cffafe',
  },
  physics: {
    label: 'Physics',
    labelAr: 'الفيزياء',
    icon: Atom,
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
  },
  biology: {
    label: 'Biology',
    labelAr: 'الأحياء',
    icon: Leaf,
    accent: '#16a34a',
    accentSoft: '#dcfce7',
  },
  english: {
    label: 'English',
    labelAr: 'الإنجليزي',
    icon: BookOpen,
    accent: '#dc2626',
    accentSoft: '#fee2e2',
  },
  history: {
    label: 'History',
    labelAr: 'التاريخ',
    icon: Globe,
    accent: '#b45309',
    accentSoft: '#fef3c7',
  },
  geography: {
    label: 'Geography',
    labelAr: 'الجغرافيا',
    icon: Globe,
    accent: '#0d9488',
    accentSoft: '#ccfbf1',
  },
};

/**
 * Returns metadata for a subject.
 * Subjects added by the admin are supported automatically and receive
 * a safe default icon and colors until custom metadata is configured.
 */
export function getSubjectMeta(
  subject: Subject | string,
  labelAr?: string,
  labelEn?: string,
): SubjectMeta {
  const knownMeta = KNOWN_SUBJECT_META[subject];

  if (knownMeta) {
    return knownMeta;
  }

  return {
    ...DEFAULT_SUBJECT_META,
    label: labelEn?.trim() || subject,
    labelAr: labelAr?.trim() || DEFAULT_SUBJECT_META.labelAr,
  };
}

/**
 * Compatibility map for existing components that read SUBJECT_META[subject].
 * Unknown subject keys receive default metadata instead of undefined.
 */
export const SUBJECT_META: Record<string, SubjectMeta> = new Proxy(
  KNOWN_SUBJECT_META,
  {
    get(target, property: string | symbol): SubjectMeta | undefined {
      if (typeof property !== 'string') {
        return Reflect.get(target, property) as SubjectMeta | undefined;
      }

      return target[property] ?? {
        ...DEFAULT_SUBJECT_META,
        label: property,
      };
    },
  },
);

/**
 * This list contains only the built-in subjects.
 * Student-facing subject lists must come from active database records,
 * not from ALL_SUBJECTS.
 */
export const ALL_SUBJECTS = Object.keys(KNOWN_SUBJECT_META) as Subject[];

export const ROLE_META = {
  student: {
    label: 'طالب',
    labelEn: 'Student',
    icon: GraduationCap,
  },
  teacher: {
    label: 'مدرّس',
    labelEn: 'Teacher',
    icon: BookOpen,
  },
  parent: {
    label: 'ولي أمر',
    labelEn: 'Parent',
    icon: Brain,
  },
  admin: {
    label: 'مدير النظام',
    labelEn: 'Admin',
    icon: Shield,
  },
  school: {
    label: 'بوابة مدرسة',
    labelEn: 'School Portal',
    icon: School,
  },
};
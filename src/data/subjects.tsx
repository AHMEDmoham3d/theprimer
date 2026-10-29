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
import type { Subject } from '@/types';

export const SUBJECT_META: Record<
  Subject,
  {
    label: string;
    labelAr: string;
    icon: typeof Calculator;
    accent: string;
    accentSoft: string;
  }
> = {
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

export const ALL_SUBJECTS = Object.keys(SUBJECT_META) as Subject[];

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
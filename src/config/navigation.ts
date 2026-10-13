import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  GraduationCap,
  School,
  BookOpen,
  BarChart3,
  Wallet,
  Settings,
  FileText,
  Brain,
  Bell,
  Video,
  Lightbulb,
  Shield,
  Ban,
  MessageCircle,
  Bot,
  ClipboardCheck,
  Building2,
  Sun,
  CreditCard,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_CONFIG: Record<Role, NavItem[]> = {
  student: [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'chat', label: 'مدرّسي الشخصي', icon: MessageSquare },
    { id: 'sessions', label: 'الجلسات', icon: Calendar },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardCheck },
    { id: 'progress', label: 'تقدمي', icon: TrendingUp },
  ],
  teacher: [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'students', label: 'الطلاب', icon: Users },
    { id: 'insights', label: 'الرؤى التعليمية', icon: Lightbulb },
    { id: 'reports', label: 'التقارير', icon: FileText },
  ],
  parent: [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'reports', label: 'تقارير ابني', icon: FileText },
    { id: 'billing', label: 'الاشتراك', icon: Wallet },
  ],
  school: [
    { id: 'portal-dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'portal-students', label: 'الطلاب', icon: Users },
    { id: 'portal-teachers', label: 'المدرّسون', icon: GraduationCap },
    { id: 'portal-activity', label: 'النشاط', icon: BarChart3 },
  ],
  admin: [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'schools', label: 'المدارس', icon: School },
    { id: 'teachers', label: 'المدرّسين', icon: GraduationCap },
    { id: 'content', label: 'المحتوى', icon: BookOpen },
    { id: 'exams', label: 'الامتحانات', icon: ClipboardCheck },
    { id: 'whatsapp', label: 'واتساب', icon: MessageCircle },
    { id: 'ai-templates', label: 'ردود الذكاء', icon: Bot },
    { id: 'student-chats', label: 'محادثات الطلاب', icon: MessageSquare },
    { id: 'summer-courses', label: 'كورسات الصيف', icon: Sun },
    { id: 'subscriptions', label: 'الاشتراكات', icon: CreditCard },
    { id: 'api-usage', label: 'استهلاك AI', icon: Zap },
    { id: 'blocked', label: 'الحظر', icon: Ban },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
    { id: 'finance', label: 'المالية', icon: Wallet },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ],
};

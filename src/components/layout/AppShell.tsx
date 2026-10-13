import { type ReactNode, useState } from 'react';
import { Menu, X, Bell, Search, ChevronLeft, Languages } from 'lucide-react';
import { NAV_CONFIG } from '@/config/navigation';
import { ROLE_META } from '@/data/subjects';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';
import { IconButton, Avatar } from '@/components/ui';
import { useLang } from '@/lib/i18n';
import { Logo } from '@/components/Logo';

interface AppShellProps {
  role: Role;
  activePage: string;
  onNavigate: (page: string) => void;
  onSwitchRole: () => void;
  children: ReactNode;
  notificationsCount?: number;
}

export function AppShell({ role, activePage, onNavigate, onSwitchRole, children, notificationsCount = 3 }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const navItems = NAV_CONFIG[role];
  const roleMeta = ROLE_META[role];
  const RoleIcon = roleMeta.icon;

  const activeItem = navItems.find((n) => n.id === activePage);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-[#1c1c1c] bg-[#0d0d0d] transition-transform duration-300 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[#1c1c1c] px-5">
          <Logo size={36} />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{t.appName}</span>
            <span className="text-[10px] text-neutral-500">{t.appTagline}</span>
          </div>
          <button
            className="mr-auto text-neutral-500 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Role badge */}
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-[#1c1c1c] bg-[#141414] px-4 py-3">
          <RoleIcon size={18} className="text-neutral-300" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">{roleMeta.label}</span>
            <span className="text-[10px] text-neutral-500">{roleMeta.labelEn}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === activePage;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  active
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active && <ChevronLeft size={16} className="mr-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Switch role */}
        <div className="border-t border-[#1c1c1c] p-4">
          <button
            onClick={onSwitchRole}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3 text-sm font-medium text-neutral-300 transition-all hover:border-[#444] hover:text-white"
          >
            <Menu size={16} />
            {lang === 'ar' ? 'تبديل الدور' : 'Switch Role'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-[#1c1c1c] bg-[#0d0d0d] px-6">
          <button
            className="text-neutral-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-bold text-white">{activeItem?.label}</h1>
          <div className="mr-auto flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 rounded-xl border border-[#1c1c1c] bg-[#141414] px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-[#444] hover:text-white"
              title={lang === 'ar' ? 'Switch to English' : 'تحويل للعربية'}
            >
              <Languages size={14} />
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>
            <div className="hidden items-center gap-2 rounded-xl border border-[#1c1c1c] bg-[#141414] px-3 py-2 md:flex">
              <Search size={16} className="text-neutral-500" />
              <input
                placeholder={t.search}
                className="w-32 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
              />
            </div>
            <div className="relative">
              <IconButton>
                <Bell size={18} />
              </IconButton>
              {notificationsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
                  {notificationsCount}
                </span>
              )}
            </div>
            <Avatar initials={role === 'student' ? 'AM' : role === 'teacher' ? 'MS' : role === 'parent' ? 'MA' : 'AD'} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

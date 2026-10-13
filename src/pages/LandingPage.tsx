import { useState } from 'react';
import {
  ArrowLeft, Sparkles, Clock, Brain, BookOpen, BarChart3, Users,
  CheckCircle2, MessageSquare, PenTool, GraduationCap,
  Shield, Zap, Heart, PlayCircle, ChevronLeft, Globe,
  Trophy, TrendingUp, Lightbulb, Eye, Target, Rocket,
  Sun, Moon, Layers, Award, Telescope, Flame,
} from 'lucide-react';
import { FAQS, FAQS_EN, PLAN_TIERS, PLAN_TIERS_EN, SAMPLE_WHITEBOARDS, SAMPLE_WHITEBOARDS_EN } from '@/data/mockData';
import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import { useLang } from '@/lib/i18n';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  onEnter: (role: 'student' | 'teacher' | 'parent' | 'admin' | 'school', schoolId?: string) => void;
}

type Theme = 'dark' | 'light';

export function LandingPage({ onEnter }: LandingPageProps) {
  const { t, lang, setLang } = useLang();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const isAr = lang === 'ar';
  const isDark = theme === 'dark';

  const faqs = isAr ? FAQS : FAQS_EN;
  const plans = isAr ? PLAN_TIERS : PLAN_TIERS_EN;
  const wb = isAr ? SAMPLE_WHITEBOARDS : SAMPLE_WHITEBOARDS_EN;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Theme-aware classes
  const bg = isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]';
  const text = isDark ? 'text-white' : 'text-neutral-900';
  const border = isDark ? 'border-[#1a1a1a]' : 'border-neutral-200';
  const borderCard = isDark ? 'border-[#2a2a2a]' : 'border-neutral-200';
  const cardBg = isDark ? 'bg-[#181818]' : 'bg-white';
  const cardBgAlt = isDark ? 'bg-[#141414]' : 'bg-neutral-50';
  const subtleText = isDark ? 'text-neutral-400' : 'text-neutral-500';
  const mutedText = isDark ? 'text-neutral-500' : 'text-neutral-400';
  const navBg = isDark ? 'bg-[#0a0a0a]/80' : 'bg-white/80';
  const sectionAlt = isDark ? 'bg-[#0d0d0d]' : 'bg-white';
  const bigNumColor = isDark ? 'text-neutral-800/50' : 'text-neutral-200';

  const stats = [
    { icon: Users, value: '24/7', label: isAr ? 'متاح دائماً' : 'Always Available' },
    { icon: BookOpen, value: '7', label: isAr ? 'مواد دراسية' : 'Subjects' },
    { icon: Brain, value: '∞', label: isAr ? 'أسئلة بلا حدود' : 'Unlimited Questions' },
    { icon: Flame, value: '2', label: isAr ? 'أسابيع مجانية' : 'Weeks Free' },
  ];

  const features = [
    { icon: MessageSquare, title: t.featureProactive, desc: t.featureProactiveDesc },
    { icon: PenTool, title: t.featureWhiteboard, desc: t.featureWhiteboardDesc },
    { icon: Brain, title: t.featureRemembers, desc: t.featureRemembersDesc },
    { icon: BarChart3, title: t.featureReports, desc: t.featureReportsDesc },
    { icon: Shield, title: t.featureCurriculum, desc: t.featureCurriculumDesc },
    { icon: Zap, title: t.featureFast, desc: t.featureFastDesc },
  ];

  const steps = [
    { step: '01', title: t.stepChat, desc: t.stepChatDesc, icon: MessageSquare },
    { step: '02', title: t.stepVoice, desc: t.stepVoiceDesc, icon: Zap },
    { step: '03', title: t.stepSession, desc: t.stepSessionDesc, icon: GraduationCap },
  ];

  const subjectShowcase = [
    { key: 'sincos', label: isAr ? 'الرياضيات — sin وcos' : 'Math — sin & cos', badge: 'M', badgeBg: isDark ? '#dbeafe' : '#dbeafe', badgeColor: '#2563eb' },
    { key: 'water', label: isAr ? 'الكيمياء — جزيء الماء' : 'Chemistry — Water Molecule', badge: 'C', badgeBg: '#fef3c7', badgeColor: '#b45309' },
    { key: 'mitosis', label: isAr ? 'الأحياء — الانقسام المتساوي' : 'Biology — Mitosis', badge: 'B', badgeBg: '#dcfce7', badgeColor: '#16a34a' },
    { key: 'revolution1919', label: isAr ? 'التاريخ — ثورة 1919' : 'History — 1919 Revolution', badge: 'H', badgeBg: '#fce7f3', badgeColor: '#be185d' },
  ];

  const trustBadges = isAr ? [
    { icon: Shield, text: 'بياناتك مشفّرة بالكامل' },
    { icon: Award, text: 'مخصص للمنهج المصري 2026' },
    { icon: Heart, text: 'مصنوع في مصر — بمصريين' },
    { icon: Target, text: 'تقرير مهني في آخر الترم' },
  ] : [
    { icon: Shield, text: 'Fully encrypted data' },
    { icon: Award, text: 'Built for Egyptian curriculum 2026' },
    { icon: Heart, text: 'Made in Egypt — by Egyptians' },
    { icon: Target, text: 'Career report at end of term' },
  ];

  return (
    <div className={cn('min-h-screen transition-colors duration-500', bg, text)}>
      {/* Nav */}
      <nav className={cn('fixed top-0 inset-x-0 z-50 border-b transition-colors duration-500', border, navBg, 'backdrop-blur-xl')}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-8">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none">{t.appName}</span>
              <span className={cn('text-[10px]', mutedText)}>{t.appTagline}</span>
            </div>
          </div>
          <div className={cn('hidden items-center gap-6 md:flex', subtleText)}>
            <a href="#features" className={cn('text-sm hover:text-current transition', isDark ? 'hover:text-white' : 'hover:text-neutral-900')}>{isAr ? 'المميزات' : 'Features'}</a>
            <a href="#how" className={cn('text-sm hover:text-current transition', isDark ? 'hover:text-white' : 'hover:text-neutral-900')}>{isAr ? 'كيف يعمل' : 'How It Works'}</a>
            <a href="#why-us" className={cn('text-sm hover:text-current transition', isDark ? 'hover:text-white' : 'hover:text-neutral-900')}>{isAr ? 'ليه معانا' : 'Why Us'}</a>
            <a href="#subjects" className={cn('text-sm hover:text-current transition', isDark ? 'hover:text-white' : 'hover:text-neutral-900')}>{isAr ? 'المواد' : 'Subjects'}</a>
            <a href="#pricing" className={cn('text-sm hover:text-current transition', isDark ? 'hover:text-white' : 'hover:text-neutral-900')}>{isAr ? 'الأسعار' : 'Pricing'}</a>
            <a href="#faq" className={cn('text-sm hover:text-current transition', isDark ? 'hover:text-white' : 'hover:text-neutral-900')}>{isAr ? 'الأسئلة الشائعة' : 'FAQ'}</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn('flex items-center justify-center rounded-xl border px-3 py-2 text-xs transition', borderCard, cardBgAlt, subtleText, isDark ? 'hover:border-white hover:text-white' : 'hover:border-neutral-900 hover:text-neutral-900')}
              title={isDark ? (isAr ? 'الوضع الأبيض' : 'Light Mode') : (isAr ? 'الوضع الداكن' : 'Dark Mode')}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className={cn('flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition', borderCard, cardBgAlt, subtleText, isDark ? 'hover:border-white hover:text-white' : 'hover:border-neutral-900 hover:text-neutral-900')}
            >
              <Globe size={14} /> {lang === 'ar' ? 'EN' : 'ع'}
            </button>
            <button onClick={() => onEnter('student')} className="btn-primary text-xs">
              {t.startNow} <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 md:px-8 overflow-hidden">
        <div className={cn('absolute inset-0 transition-colors', isDark ? 'bg-gradient-to-b from-neutral-900/30 to-transparent' : 'bg-gradient-to-b from-neutral-100/50 to-transparent')} />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fade-in-up">
              <div className={cn('mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs', isDark ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' : 'border-emerald-600/20 bg-emerald-50 text-emerald-700')}>
                <Sparkles size={14} className="animate-pulse" />
                {t.heroBadge}
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] md:text-6xl">
                {t.heroTitle1}
                <br />
                <span className={cn('bg-clip-text text-transparent', isDark ? 'bg-gradient-to-r from-white via-neutral-200 to-neutral-500' : 'bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-400')}>
                  {t.heroTitle2}
                </span>
              </h1>
              <p className={cn('mt-6 max-w-lg text-lg leading-relaxed', subtleText)}>
                {t.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => onEnter('student')} className="btn-primary">
                  <PlayCircle size={18} /> {t.tryTwoWeeks}
                </button>
              </div>
              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
                {trustBadges.map((b) => (
                  <div key={b.text} className={cn('flex items-center gap-1.5 text-xs', mutedText)}>
                    <b.icon size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual: Enhanced whiteboard with smart dashboard mockup */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className={cn('absolute -inset-4 rounded-3xl blur-2xl', isDark ? 'bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent' : 'bg-gradient-to-br from-emerald-100/40 via-blue-100/30 to-transparent')} />
                <div className={cn('relative rounded-2xl border p-4 shadow-2xl', borderCard, cardBgAlt)}>
                  {/* Window chrome */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className={cn('h-2.5 w-2.5 rounded-full', isDark ? 'bg-neutral-700' : 'bg-neutral-300')} />
                      <div className={cn('h-2.5 w-2.5 rounded-full', isDark ? 'bg-neutral-700' : 'bg-neutral-300')} />
                      <div className={cn('h-2.5 w-2.5 rounded-full', isDark ? 'bg-neutral-700' : 'bg-neutral-300')} />
                    </div>
                    <span className={cn('mr-auto text-xs', mutedText)}>{isAr ? 'شرح تفاعلي — sin وcos' : 'Interactive — sin & cos'}</span>
                    <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700')}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                    </span>
                  </div>
                  <Whiteboard steps={wb.sincos} autoPlay className="max-w-full" />
                </div>

                {/* Smart floating side panel — proactive dashboard */}
                <div className={cn('absolute -bottom-8 -left-4 hidden rounded-xl border px-4 py-3 shadow-xl sm:block animate-fade-in-up', borderCard, cardBg)} style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', isDark ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                      <TrendingUp size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{isAr ? 'تقدّم متواصل' : 'On track'}</p>
                      <p className={cn('text-[10px]', mutedText)}>{isAr ? '3 أيام متتالية' : '3 day streak'}</p>
                    </div>
                    <div className={cn('ml-2 rounded-lg px-2 py-1 text-[10px] font-bold', isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-700')}>
                      +85%
                    </div>
                  </div>
                </div>

                {/* AI proactive message bubble */}
                <div className={cn('absolute -top-6 -right-4 hidden rounded-2xl border px-4 py-3 shadow-xl sm:block animate-fade-in-up max-w-[220px]', borderCard, cardBg)} style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-start gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black text-xs font-bold">P</div>
                    <div>
                      <p className={cn('text-[11px] leading-relaxed', subtleText)}>
                        {isAr ? 'محتاج مساعدة في cos؟ خليني أرسمهولك الآن 📐' : 'Need help with cos? Let me draw it for you 📐'}
                      </p>
                      <span className={cn('text-[9px]', mutedText)}>{isAr ? 'النظام بيبادر هو' : 'System-initiated'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className={cn('border-y py-10 transition-colors', border, sectionAlt)}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 text-center">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl border', cardBgAlt, borderCard)}>
                <s.icon size={22} className={isDark ? 'text-neutral-300' : 'text-neutral-600'} />
              </div>
              <span className="text-2xl font-bold md:text-3xl">{s.value}</span>
              <span className={cn('text-xs', mutedText)}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <div className={cn('mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs', borderCard, cardBgAlt, subtleText)}>
              <Lightbulb size={14} className="text-amber-500" />
              {isAr ? 'ليه مش مجرد ChatGPT' : 'Why not just ChatGPT'}
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">{t.whyNotChatGPT}</h2>
            <p className={cn('mt-4 max-w-2xl mx-auto leading-relaxed', subtleText)}>{t.whyNotChatGPTDesc}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className={cn('rounded-2xl border p-6 group transition-all duration-300 hover:border-current/20', cardBg, borderCard)}>
                <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition', isDark ? 'bg-neutral-800 text-white group-hover:bg-white group-hover:text-black' : 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white')}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className={cn('mt-2 text-sm leading-relaxed', subtleText)}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className={cn('border-y py-24 px-4 md:px-8 transition-colors', border, sectionAlt)}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{t.howItWorks}</h2>
            <p className={cn('mt-4', subtleText)}>{t.howItWorksDesc}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className={cn('relative rounded-2xl border p-7 group overflow-hidden', cardBg, borderCard)}>
                <div className={cn('absolute top-4 right-4 text-6xl font-bold transition', bigNumColor, 'group-hover:opacity-100')}>
                  {s.step}
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
                    <s.icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className={cn('text-sm leading-relaxed', subtleText)}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Study With Us — Persuasive Section */}
      <section id="why-us" className="py-24 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <div className={cn('mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs', isDark ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' : 'border-emerald-600/20 bg-emerald-50 text-emerald-700')}>
              <Target size={14} />
              {isAr ? 'ليه The Primer مش مدرّس تقليدي' : 'Why The Primer is not a traditional tutor'}
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">{isAr ? 'ليه تذاكر معانا؟' : 'Why study with us?'}</h2>
            <p className={cn('mt-4 max-w-2xl mx-auto leading-relaxed', subtleText)}>
              {isAr
                ? 'مش بس بنشرح — بنضمن إنك تفهم وتجيب درجات أعلى. النظام بيتابعك خطوة بخطوة وبيبني مسارك التعليمي بالكامل.'
                : 'We don\'t just explain — we guarantee you understand and achieve higher grades.'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className={cn('rounded-2xl border p-7', cardBg, isDark ? 'border-emerald-500/20' : 'border-emerald-600/20')}>
              <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')}>
                <Target size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{isAr ? 'ضمان الدرجات الأعلى' : 'Higher Grades Guarantee'}</h3>
              <p className={cn('text-sm leading-relaxed', subtleText)}>
                {isAr ? 'النظام بيرصد كل سؤال وكل غلطة. لما يحس إنك ضعيف في موضوع، بيركز عليه أكتر.' : 'The system tracks every question and mistake.'}
              </p>
            </div>

            <div className={cn('rounded-2xl border p-7', cardBg, isDark ? 'border-blue-500/20' : 'border-blue-600/20')}>
              <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')}>
                <Eye size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{isAr ? 'فهم حقيقي مش حفظ' : 'Real Understanding'}</h3>
              <p className={cn('text-sm leading-relaxed', subtleText)}>
                {isAr ? 'كل شرح بيترسم على السبورة خطوة بخطوة بأنيميشن، مش مجرد إجابة جاهزة.' : 'Every explanation is drawn on the whiteboard step by step.'}
              </p>
            </div>

            <div className={cn('rounded-2xl border p-7', cardBg, isDark ? 'border-amber-500/20' : 'border-amber-600/20')}>
              <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}>
                <Rocket size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">{isAr ? 'كورس صيفي مخصص ليك' : 'Personalized Summer Course'}</h3>
              <p className={cn('text-sm leading-relaxed', subtleText)}>
                {isAr ? 'بعد الترم، النظام بيبني كورس صيفي مخصوص ليك بناءً على تحليلك.' : 'After the term, a custom summer course is built.'}
              </p>
            </div>
          </div>

          {/* How the summer course works */}
          <div className={cn('rounded-2xl border p-8 md:p-10', cardBg, borderCard, isDark ? 'bg-gradient-to-br from-[#141414] to-[#0f0f0f]' : 'bg-gradient-to-br from-neutral-50 to-white')}>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Rocket size={22} className="text-amber-500" />
                  {isAr ? 'إزاي الكورس الصيفي بيتبني؟' : 'How is the summer course built?'}
                </h3>
                <p className={cn('text-sm leading-relaxed mb-4', subtleText)}>
                  {isAr
                    ? 'الكورس مش قالب جاهز. النظام بيعمل تحليل كامل لكل جلسة مذاكرة عملتها خلال الترم — المواد اللي تفوقت فيها، والمواضيع اللي تعثرت فيها.'
                    : 'The course isn\'t a ready-made template. It analyzes every study session.'}
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: BarChart3, title: isAr ? 'تحليل بيانات الترم' : 'Term Data Analysis', desc: isAr ? 'كل سؤال وكل جلسة وكل غلطة تتحلل بدقة' : 'Every question and session analyzed' },
                  { icon: Telescope, title: isAr ? 'اكتشاف المهارة' : 'Skill Discovery', desc: isAr ? 'اكتشاف مهاراتك الطبيعية ومسارك المهني' : 'Discovering your natural skills' },
                ].map((item, i) => (
                  <div key={i} className={cn('flex items-start gap-3 rounded-xl border p-4', borderCard, cardBgAlt)}>
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700')}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className={cn('text-xs mt-0.5', mutedText)}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects showcase */}
      <section id="subjects" className={cn('border-y py-24 px-4 md:px-8 transition-colors', border, sectionAlt)}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{isAr ? 'السبورة في كل المواد' : 'Whiteboard for Every Subject'}</h2>
            <p className={cn('mt-4', subtleText)}>{isAr ? 'رياضيات، كيمياء، أحياء، وتاريخ' : 'Math, Chemistry, Biology, and History'}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {subjectShowcase.map((subject) => (
              <div key={subject.key}>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: subject.badgeBg, color: subject.badgeColor }}>
                    <span className="text-sm font-bold">{subject.badge}</span>
                  </span>
                  {subject.label}
                </h3>
                <Whiteboard steps={wb[subject.key]} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{t.pricing}</h2>
            <p className={cn('mt-4', subtleText)}>{t.pricingDesc}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn('relative rounded-2xl border p-7', cardBg, borderCard, plan.highlight && (isDark ? 'border-emerald-500/50 bg-[#1a1a1a] ring-1 ring-emerald-500/30' : 'border-emerald-600/50 bg-emerald-50/30 ring-1 ring-emerald-600/20'))}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold text-black">
                    {isAr ? 'الأكثر شيوعاً' : 'Most Popular'}
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={cn('text-sm', subtleText)}>{plan.currency} / {plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={cn('flex items-start gap-2 text-sm', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onEnter('student')}
                  className={`mt-6 w-full ${plan.highlight ? 'btn-primary' : isDark ? 'btn-secondary' : 'font-medium rounded-xl px-5 py-3 text-sm border border-neutral-200 bg-white text-neutral-900 transition-all hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 inline-flex items-center justify-center gap-2'}`}
                >
                  {plan.price === 0 ? (isAr ? 'ابدأ التجربة' : 'Start Trial') : (isAr ? 'اشترك الآن' : 'Subscribe')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={cn('border-y py-24 px-4 md:px-8 transition-colors', border, sectionAlt)}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{t.faq}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className={cn('rounded-2xl border overflow-hidden', cardBg, borderCard)}>
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="text-sm font-semibold">{faq.question}</span>
                  <ChevronLeft size={18} className={cn('shrink-0 transition-transform', mutedText, openFaq === faq.id && '-rotate-90')} />
                </button>
                {openFaq === faq.id && (
                  <div className={cn('px-5 pb-5 text-sm leading-relaxed animate-fade-in', subtleText)}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <Logo size={64} />
          </div>
          <h2 className="text-3xl font-bold md:text-5xl">
            {t.finalCta}
            <br />
            <span className={subtleText}>{t.finalCtaDesc}</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => onEnter('student')} className="btn-primary">{t.tryFree} <ArrowLeft size={18} /></button>
            <button onClick={() => onEnter('parent')} className={isDark ? 'btn-secondary' : 'font-medium rounded-xl px-5 py-3 text-sm border border-neutral-200 bg-white text-neutral-900 transition-all hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 inline-flex items-center justify-center gap-2'}>{t.imParent}</button>
            <button onClick={() => onEnter('teacher')} className={isDark ? 'btn-secondary' : 'font-medium rounded-xl px-5 py-3 text-sm border border-neutral-200 bg-white text-neutral-900 transition-all hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 inline-flex items-center justify-center gap-2'}>{isAr ? 'أنا مدرّس' : 'I am a Teacher'}</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn('border-t py-8 px-4 md:px-8 transition-colors', border, sectionAlt)}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-bold">{t.appName}</span>
          </div>
          <p className={cn('text-xs', mutedText)}>© 2026 {t.appName} — {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
        </div>
      </footer>
    </div>
  );
}
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/adminCurriculumApi';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({
  onSuccess,
  onBack,
}: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (!data.session?.access_token) {
        throw new Error(
          'لم يتم إنشاء جلسة دخول صالحة.'
        );
      }

      try {
        await verifyAdminSession(
          data.session.access_token
        );
      } catch (verificationError) {
        await supabase.auth.signOut();
        throw verificationError;
      }

      onSuccess();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'تعذر تسجيل الدخول.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#090909] px-4 py-10 text-white"
    >
      <section className="w-full max-w-md rounded-2xl border border-[#292929] bg-[#141414] p-7 shadow-2xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-7 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          العودة للموقع
        </button>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
          <ShieldCheck size={27} />
        </div>

        <h1 className="text-2xl font-bold">
          دخول إدارة The Primer
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-400">
          سجّل الدخول بحساب الأدمن المعتمد.
          لن يتم منح صلاحيات الإدارة لمجرد فتح رابط الصفحة.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >
          <label className="block space-y-2">
            <span className="text-sm text-neutral-300">
              البريد الإلكتروني
            </span>

            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-xl border border-[#333] bg-[#0b0b0b] px-4 py-3 text-left text-sm outline-none transition focus:border-cyan-500"
              placeholder="admin@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-neutral-300">
              كلمة المرور
            </span>

            <div className="relative">
              <LockKeyhole
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full rounded-xl border border-[#333] bg-[#0b0b0b] py-3 pl-11 pr-4 text-left text-sm outline-none transition focus:border-cyan-500"
                placeholder="••••••••••••"
              />
            </div>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <LockKeyhole size={17} />
            )}

            {loading
              ? 'جارٍ التحقق من الحساب...'
              : 'تسجيل الدخول'}
          </button>
        </form>
      </section>
    </main>
  );
}
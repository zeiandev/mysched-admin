'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supa().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else window.location.href = '/dashboard';
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-white font-sfpro text-gray-900">
      {/* ---------- FONT SETUP ---------- */}
      <style jsx global>{`
        @font-face {
          font-family: 'SF Pro Rounded';
          src: url('/SF-Pro-Rounded-Regular.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'SF Pro Rounded';
          src: url('/SF-Pro-Rounded-Medium.otf') format('opentype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'SF Pro Rounded';
          src: url('/SF-Pro-Rounded-Bold.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
        }
        body {
          font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont,
            'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #fff;
        }
      `}</style>

      {/* ---------- LOGIN CARD ---------- */}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-[28px] font-bold tracking-tight">
            <span className="text-sky-500">My</span>Sched
          </div>
          <h1 className="text-[22px] font-semibold mt-3">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage schedules and users.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5"
        >
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {err}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-gray-700">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[15px] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-[15px] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all pr-16"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 hover:text-gray-700 font-medium"
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A2B52] text-white rounded-xl py-3 text-[16px] font-semibold tracking-tight shadow-sm active:scale-[.98] transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

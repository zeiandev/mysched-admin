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
    <main className="min-h-screen bg-white grid place-items-center px-6">
      <div className="w-full max-w-md">
        {/* Back chevron area reserved in design */}
        <div className="h-6" />

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="text-[28px] font-semibold">
            <span className="text-sky-500">My</span>Sched
          </div>
          <h1 className="text-2xl font-semibold mt-3">Login</h1>
          <p className="text-sm text-gray-600 mt-1">Access your student account.</p>
        </div>

        {/* Card */}
        <form
          onSubmit={onSubmit}
          className="bg-white border rounded-2xl shadow-sm p-5 space-y-4"
        >
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {err}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm text-gray-700">Email</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-700">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                type={show ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-1">
            <a href="#" className="text-sm text-sky-700 hover:underline">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0A2B52] text-white py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account? <span className="text-sky-700">Register here.</span>
          </p>
        </form>
      </div>
    </main>
  );
}

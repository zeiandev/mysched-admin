// src/app/login/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ---- Server Action: sign in with email/password ----
async function login(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const store = cookies();
  const cookieAdapter = {
    get(name: string) {
      return store.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      store.set({ name, value, ...options } as any);
    },
    remove(name: string, options: CookieOptions) {
      store.set({ name, value: '', ...options } as any);
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter as any }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // back to login with a short message
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error ?? '';

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">MySched Admin</h1>
          </div>
          <Link href="/" className="text-sm text-[#0A2B52] hover:underline">
            Back to site
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-gray-600 mb-6">Administrator access only.</p>

          {error ? (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          ) : null}

          <form action={login} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#0A2B52] px-4 py-2 text-sm font-medium text-white hover:bg-[#083459]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            Only approved admins can sign in. Contact the owner if you need access.
          </p>
        </div>
      </div>
    </main>
  );
}

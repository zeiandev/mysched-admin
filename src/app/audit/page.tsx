import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AuditClient from './audit-client';

function supa() {
  const store = cookies();
  const cookiesAdapter = {
    get(name: string) { return store.get(name)?.value; },
    set(name: string, value: string, options: CookieOptions) { store.set({ name, value, ...options } as any); },
    remove(name: string, options: CookieOptions) { store.set({ name, value: '', ...options } as any); },
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter as any }
  );
}

export default async function AuditPage() {
  const s = supa();

  // auth + admin gate
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await s
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) redirect('/dashboard');

  // initial load (server)
  const { data } = await s.rpc('list_audit', { p_limit: 200 });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Audit Log</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-[#0A2B52] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <AuditClient initial={(data ?? []) as any} />
    </main>
  );
}

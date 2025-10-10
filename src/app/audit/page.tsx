// src/app/audit/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

// --- Supabase Helper ---
function supa() {
  const store = cookies();
  const cookiesAdapter = {
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

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter as any }
  );
}

type Row = {
  id: number;
  table_name: string;
  row_id: number;
  action: 'insert' | 'update' | 'delete';
  at: string;
  user_id: string | null;
  details: any;
};

// --- Main Component ---
export default async function AuditPage() {
  const s = supa();

  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await s
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) redirect('/dashboard');

  const { data, error } = await s
    .from('audit_log')
    .select('id, table_name, row_id, action, at, user_id, details')
    .order('at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold mb-2">Audit Log</h1>
          <p className="text-red-600 mb-4">Failed to load: {error.message}</p>
          <Link href="/dashboard" className="text-sm text-[#0A2B52] underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  let rows: Row[] = (data ?? []) as any;

  // Optional: Map user_id → email
  if (rows.length) {
    const ids = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profs } = await s.from('profiles').select('id, email').in('id', ids);
      const map = new Map((profs ?? []).map(p => [p.id, (p as any).email]));
      rows = rows.map(r => ({
        ...r,
        user_id: r.user_id ? map.get(r.user_id) ?? r.user_id : null,
      }));
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
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

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Table</th>
                <th className="px-3 py-2 text-left">Row ID</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {new Date(r.at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{r.table_name}</td>
                  <td className="px-3 py-2">{r.row_id}</td>
                  <td className="px-3 py-2 font-medium">
                    <span
                      className={
                        r.action === 'insert'
                          ? 'text-green-700'
                          : r.action === 'update'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }
                    >
                      {r.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-800">{r.user_id ?? '—'}</td>
                  <td className="px-3 py-2">
                    <pre className="max-w-[500px] overflow-x-auto whitespace-pre-wrap break-all text-xs bg-gray-50 p-2 rounded border border-gray-100">
                      {JSON.stringify(r.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-gray-500 text-center" colSpan={6}>
                    No audit entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

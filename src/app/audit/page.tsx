import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

function supa() {
  const store = cookies();
  const cookieAdapter = {
    get(name: string) { return store.get(name)?.value; },
    set(name: string, value: string, options: CookieOptions) { store.set({ name, value, ...options } as any); },
    remove(name: string, options: CookieOptions) { store.set({ name, value: '', ...options } as any); },
  };
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter as any }
  );
}

type Row = {
  id: number;
  table_name: string;
  row_id: string;
  action: 'insert'|'update'|'delete';
  at: string;
  actor: string | null; // email if available
  changes: any;
};

export default async function AuditPage() {
  const s = supa();

  // auth + admin gate
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');
  const { data: admin } = await s.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/dashboard');

  // fetch last 100 entries, try to map actor email if profiles table exists
  const { data, error } = await s
    .from('audit_log')
    .select('id, table_name, row_id, action, at, actor, changes')
    .order('at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Audit</h1>
        <p className="text-red-600 mt-2">Failed to load: {error.message}</p>
        <Link href="/dashboard" className="text-blue-600 underline mt-4 inline-block">Back</Link>
      </main>
    );
  }

  // Best-effort actor email lookup
  let rows: Row[] = (data ?? []).map(r => ({
    ...r,
    actor: r.actor as any,
  })) as any;

  if (rows.length > 0) {
    const actorIds = Array.from(new Set(rows.map(r => (r as any).actor).filter(Boolean)));
    if (actorIds.length) {
      const { data: profs } = await s.from('profiles')
        .select('id, email')
        .in('id', actorIds as string[]);
      const map = new Map((profs ?? []).map(p => [p.id, (p as any).email]));
      rows = rows.map(r => ({ ...r, actor: r.actor ? (map.get(r.actor as any) ?? r.actor) : null }));
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 underline">Back to dashboard</Link>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Table</th>
                <th className="px-3 py-2 text-left">Row ID</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Actor</th>
                <th className="px-3 py-2 text-left">Changes (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(r.at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.table_name}</td>
                  <td className="px-3 py-2">{r.row_id}</td>
                  <td className="px-3 py-2">
                    <span className={
                      r.action === 'insert' ? 'text-green-700' :
                      r.action === 'update' ? 'text-amber-700' : 'text-red-700'
                    }>{r.action}</span>
                  </td>
                  <td className="px-3 py-2">{r.actor ?? '—'}</td>
                  <td className="px-3 py-2">
                    <pre className="max-w-[520px] overflow-x-auto whitespace-pre-wrap break-all text-xs bg-gray-50 p-2 rounded">
                      {JSON.stringify(r.changes, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr><td className="px-3 py-6 text-gray-500" colSpan={6}>No audit entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

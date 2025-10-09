'use client';
import { useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Row = {
  at: string; email: string | null; action: string; table_name: string;
  row_id: number | null; title: string | null; details: any;
};

export default function AuditClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(200);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.email ?? '', r.action, r.table_name, r.title ?? ''].some(v => v.toLowerCase().includes(s))
    );
  }, [rows, q]);

  async function refresh() {
    const { data, error } = await supa().rpc('list_audit', { p_limit: limit });
    if (error) return alert(error.message);
    setRows((data ?? []) as Row[]);
  }

  return (
    <main className="p-6 space-y-4 max-w-6xl">
      <h1 className="text-xl font-semibold">Audit Log</h1>
      <div className="flex gap-2 items-center">
        <input className="border rounded p-2" placeholder="Search email, action, table, title"
          value={q} onChange={e=>setQ(e.target.value)} />
        <input className="border rounded p-2 w-28" type="number" min={50} step={50}
          value={limit} onChange={e=>setLimit(Number(e.target.value))} />
        <button className="border rounded px-3" onClick={refresh}>Refresh</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border p-2">Time</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">Table</th>
              <th className="border p-2">Row</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td className="border p-2">{new Date(r.at).toLocaleString()}</td>
                <td className="border p-2">{r.email ?? ''}</td>
                <td className="border p-2">{r.action}</td>
                <td className="border p-2">{r.table_name}</td>
                <td className="border p-2">{r.row_id ?? ''}</td>
                <td className="border p-2">{r.title ?? ''}</td>
                <td className="border p-2">
                  <details><summary>view</summary>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(r.details, null, 2)}</pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

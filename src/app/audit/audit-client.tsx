'use client';

import { useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

type Row = {
  at: string;
  email: string | null;
  action: string;
  table_name: string;
  row_id: number | null;
  title: string | null;
  details: any;
};

export default function AuditClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(200);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.email ?? '', r.action, r.table_name, r.title ?? ''].some((v) =>
        v.toLowerCase().includes(s)
      )
    );
  }, [rows, search]);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supa().rpc('list_audit', { p_limit: limit });
    if (error) alert(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit Records</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by table, action, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <input
            type="number"
            min={50}
            step={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-24 rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Table</th>
              <th className="px-3 py-2 text-left">Row</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(r.at).toLocaleString()}
                </td>
                <td className="px-3 py-2">{r.email ?? '—'}</td>
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
                <td className="px-3 py-2">{r.table_name}</td>
                <td className="px-3 py-2">{r.row_id ?? '—'}</td>
                <td className="px-3 py-2">{r.title ?? '—'}</td>
                <td className="px-3 py-2">
                  <details>
                    <summary className="cursor-pointer text-[#0A2B52] text-xs">
                      View
                    </summary>
                    <pre className="mt-1 max-w-[500px] overflow-x-auto whitespace-pre-wrap break-all rounded border border-gray-100 bg-gray-50 p-2 text-xs">
                      {JSON.stringify(r.details, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  No audit entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

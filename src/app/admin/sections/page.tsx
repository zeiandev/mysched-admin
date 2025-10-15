'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Shell, Card, CardBody, Button, Input, Table, Th, Td, Danger } from '@/components/ui';
import { api, useApiWithToast } from '@/lib/fetcher';

type Row = { id: number; code: string | null };

export default function SectionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Partial<Row>>({});
  const [limit, setLimit] = useState(15);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const withToast = useApiWithToast();

  const load = useCallback(async () => {
    setLoading(true)
    try { setRows(await api('/api/sections')) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const [filtered, setFiltered] = useState<Row[]>(rows)
  const debRef = useRef<number | null>(null)
  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current)
    debRef.current = window.setTimeout(() => {
      const t = q.trim().toLowerCase()
      setFiltered(rows.filter(r => (r.code ?? '').toLowerCase().includes(t)))
    }, 300)
    return () => { if (debRef.current) window.clearTimeout(debRef.current) }
  }, [q, rows])

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * limit, (page - 1) * limit + limit),
    [filtered, page, limit]
  );

  const create = async () => withToast(async () => {
    const code = (draft.code ?? '').trim();
    if (!code) throw new Error('Code is required');
    await api('/api/sections', { method: 'POST', body: JSON.stringify({ code }) });
    setDraft({}); await load();
  });

  const update = async (id: number, codeRaw: string) => withToast(async () => {
    const code = codeRaw.trim();
    if (!code) throw new Error('Code is required');
    await api(`/api/sections/${id}`, { method: 'PATCH', body: JSON.stringify({ code }) });
    await load();
  });

  const remove = async (id: number) => withToast(async () => {
    await api(`/api/sections/${id}`, { method: 'DELETE' });
    await load();
  });

  return (
    <Shell title="Sections">
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Input
              placeholder="Search section..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
              className="w-48"
            />
            <span className="text-sm text-gray-500">
              Showing {pageRows.length} / {filtered.length} section(s)
            </span>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-gray-600">Per page</label>
              <select
                value={limit}
                onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                className="rounded-xl border border-gray-300 bg-white px-2 py-2 text-sm"
              >
                {[10, 15, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <Button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Reload'}</Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              placeholder="New section code (e.g. BSCS 4-1)"
              value={draft.code ?? ''}
              onChange={e => setDraft({ code: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') create(); }}
            />
            <Button onClick={create}>Add Section</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {loading && <div className="py-3 text-sm text-gray-500">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="py-6 text-sm text-gray-500">No sections found.</div>
          )}
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Code</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(r => (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                  <Td><div className="w-[6rem]">{r.id}</div></Td>
                  <Td>
                    <Input
                      defaultValue={r.code ?? ''}
                      onBlur={e => update(r.id, e.target.value)}
                    />
                  </Td>
                  <Td>
                    <div className="whitespace-nowrap">
                      <Danger onClick={() => remove(r.id)}>Delete</Danger>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-4 flex items-center justify-end gap-3">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
            <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
          </div>
        </CardBody>
      </Card>
    </Shell>
  );
}

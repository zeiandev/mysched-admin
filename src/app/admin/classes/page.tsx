'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Shell, Card, CardBody, Button, Input, Table, Th, Td, Danger } from '@/components/ui';
import { api } from '@/lib/fetcher';
import { useToast } from '@/components/toast';

type Row = {
  id: number; section_id: number | null; day: number | null;
  start: string | null; end: string | null; code: string | null; title: string | null;
  units: number | null; room: string | null; instructor: string | null;
};
type Section = { id: number; code: string | null };

const DAYS = [
  { n: 1, label: 'Monday' },
  { n: 2, label: 'Tuesday' },
  { n: 3, label: 'Wednesday' },
  { n: 4, label: 'Thursday' },
  { n: 5, label: 'Friday' },
  { n: 6, label: 'Saturday' },
  { n: 7, label: 'Sunday' },
];
const nameOfDay = (n?: number | null) => DAYS.find(d => d.n === (n ?? 0))?.label ?? '—';

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [qTitle, setQTitle] = useState('');
  const [qCode, setQCode] = useState('');
  const [draft, setDraft] = useState<Partial<Row>>({});
  const [limit, setLimit] = useState(15);
  const [page, setPage] = useState(1);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const loadSections = useCallback(async () => {
    try { setSections(await api('/api/sections')); } catch {/* ignore */}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (sectionId !== 'all') p.set('section_id', sectionId);
      if (dayFilter !== 'all') p.set('day', dayFilter);
      p.set('page', String(page));
      p.set('limit', String(limit));
      const url = `/api/classes?${p}`;
      const res = await api<{ rows: Row[]; count: number; page: number; limit: number }>(url);
      setRows(res.rows);
      setCount(res.count);
    } finally {
      setLoading(false);
    }
  }, [sectionId, dayFilter, page, limit]);

  useEffect(() => { loadSections(); }, [loadSections]);
  useEffect(() => { load(); }, [load]);

  // Debounced client-side filtering
  const [filtered, setFiltered] = useState<Row[]>(rows);
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const t = qTitle.trim().toLowerCase();
      const c = qCode.trim().toLowerCase();
      setFiltered(rows.filter(r =>
        (!t || (r.title ?? '').toLowerCase().includes(t)) &&
        (!c || (r.code ?? '').toLowerCase().includes(c))
      ));
    }, 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [qTitle, qCode, rows]);

  const pageRows = filtered;
  // derived total pages (unused in logic below, but could be used for UI)
  // totalPages no longer needed (was only for potential UI display) – removed to satisfy lint

  function validate(input: Partial<Row>): boolean {
    const f = (name: string, valid: boolean) => {
      if (!valid) {
        toast({ kind: 'error', msg: `${name} is invalid` });
      }
      return valid;
    };
    // simple checks
    if (!f('Title', !!(input.title && input.title.trim()))) return false;
    if (!f('Code', !!(input.code && input.code.trim()))) return false;
    if (!f('Section', !!(input.section_id && input.section_id > 0))) return false;
    if (input.start && input.end && !(input.start < input.end)) {
      toast({ kind: 'error', msg: 'Time range is invalid' });
      return false;
    }
    return true;
  }

  const create = async () => {
    if (!validate(draft)) return;
    try {
      await api('/api/classes', { method: 'POST', body: JSON.stringify(draft) });
      setDraft({});
      await load();
    } catch {
      toast({ kind: 'error', msg: 'Create failed' });
    }
  };

  const update = async (id: number, patch: Partial<Row>, revert: () => void) => {
    // client validation (only fields present)
    const v: Partial<Row> = { ...patch };
    if (v.title !== undefined) {
      const t = v.title ?? '';
      if (!t.trim()) { toast({ kind: 'error', msg: 'Title is invalid' }); revert(); return; }
    }
    if (v.code !== undefined) {
      const c = v.code ?? '';
      if (!c.trim()) { toast({ kind: 'error', msg: 'Code is invalid' }); revert(); return; }
    }
    if (v.section_id !== undefined) {
      const sid = v.section_id ?? 0;
      if (!(sid > 0)) { toast({ kind: 'error', msg: 'Section is invalid' }); revert(); return; }
    }
    if (v.start !== undefined && v.end !== undefined && v.start && v.end && !(v.start < v.end)) { toast({ kind: 'error', msg: 'Time range invalid' }); revert(); return; }
    try {
      await api(`/api/classes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch {
      toast({ kind: 'error', msg: 'Update failed' });
      revert();
    }
  };

  const remove = async (id: number) => {
    try {
      await api(`/api/classes/${id}`, { method: 'DELETE' });
      await load();
    } catch {
      toast({ kind: 'error', msg: 'Delete failed' });
    }
  };

  return (
    <Shell title="Classes">
      <Card><CardBody>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.code ?? `Section ${s.id}`}</option>
            ))}
          </select>

          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Days</option>
            {DAYS.map((d) => <option key={d.n} value={d.n}>{d.label}</option>)}
          </select>

          <Input
            placeholder="Filter Title"
            value={qTitle}
            onChange={(e) => setQTitle(e.target.value)}
            className="w-32 sm:w-48"
          />

          <Input
            placeholder="Filter Code"
            value={qCode}
            onChange={(e) => setQCode(e.target.value)}
            className="w-32 sm:w-48"
          />

          <Button onClick={() => { setPage(1); load(); }} className="ml-auto" disabled={loading}>{loading ? 'Loading…' : 'Reload'}</Button>
        </div>

        {/* Create row */}
        <div className="grid gap-3 sm:grid-cols-5">
          <Input placeholder="Title" value={draft.title ?? ''} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
          <Input placeholder="Code" value={draft.code ?? ''} onChange={e => setDraft(d => ({ ...d, code: e.target.value }))} />
          <Input placeholder="Section ID" type="number" value={draft.section_id ?? ''} onChange={e => setDraft(d => ({ ...d, section_id: Number(e.target.value) }))} />
          <select
            value={draft.day?.toString() ?? ''}
            onChange={e => setDraft(d => ({ ...d, day: e.target.value ? Number(e.target.value) : null }))}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Day</option>
            {DAYS.map(d => <option key={d.n} value={d.n}>{d.label}</option>)}
          </select>
          <Button onClick={create}>Add Class</Button>
        </div>
      </CardBody></Card>

      <Card><CardBody>
  {loading && <div className="py-4 text-sm text-gray-500">Loading…</div>}
  <Table>
          <thead>
            <tr>
              <Th>ID</Th><Th>Title</Th><Th>Code</Th><Th>Section</Th><Th>Day</Th><Th>Start</Th><Th>End</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(r => (
              <tr key={r.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <Td>{r.id}</Td>
                <Td><Input defaultValue={r.title ?? ''} onBlur={e => {
                  const old = r.title;
                  const val = e.target.value;
                  setRows(rs => rs.map(x => x.id === r.id ? { ...x, title: val } : x));
                  update(r.id, { title: val }, () => setRows(rs => rs.map(x => x.id === r.id ? { ...x, title: old } : x)));
                }} /></Td>
                <Td><Input defaultValue={r.code ?? ''} onBlur={e => {
                  const old = r.code;
                  const val = e.target.value;
                  setRows(rs => rs.map(x => x.id === r.id ? { ...x, code: val } : x));
                  update(r.id, { code: val }, () => setRows(rs => rs.map(x => x.id === r.id ? { ...x, code: old } : x)));
                }} /></Td>
                <Td><Input type="number" defaultValue={r.section_id ?? 0} onBlur={e => {
                  const old = r.section_id;
                  const val = Number(e.target.value);
                  setRows(rs => rs.map(x => x.id === r.id ? { ...x, section_id: val } : x));
                  update(r.id, { section_id: val }, () => setRows(rs => rs.map(x => x.id === r.id ? { ...x, section_id: old } : x)));
                }} /></Td>
                <Td>
                  <select
                    defaultValue={r.day ? String(r.day) : ''}
                    onChange={(e) => {
                      const old = r.day;
                      const val = e.target.value ? Number(e.target.value) : null;
                      setRows(rs => rs.map(x => x.id === r.id ? { ...x, day: val } : x));
                      update(r.id, { day: val }, () => setRows(rs => rs.map(x => x.id === r.id ? { ...x, day: old } : x)));
                    }}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm w-full"
                  >
                    <option value="">—</option>
                    {DAYS.map(d => <option key={d.n} value={d.n}>{d.label}</option>)}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">{nameOfDay(r.day)}</div>
                </Td>
                <Td><Input defaultValue={r.start ?? ''} onBlur={e => {
                  const old = r.start;
                  const val = e.target.value;
                  setRows(rs => rs.map(x => x.id === r.id ? { ...x, start: val } : x));
                  update(r.id, { start: val, end: r.end ?? undefined }, () => setRows(rs => rs.map(x => x.id === r.id ? { ...x, start: old } : x)));
                }} /></Td>
                <Td><Input defaultValue={r.end ?? ''} onBlur={e => {
                  const old = r.end;
                  const val = e.target.value;
                  setRows(rs => rs.map(x => x.id === r.id ? { ...x, end: val } : x));
                  update(r.id, { end: val, start: r.start ?? undefined }, () => setRows(rs => rs.map(x => x.id === r.id ? { ...x, end: old } : x)));
                }} /></Td>
                <Td><Danger onClick={() => remove(r.id)}>Delete</Danger></Td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Per page</span>
            <select
              value={limit}
              onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
              className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-sm"
            >
              {[10,15,20,30,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <span className="text-sm text-gray-600">Page {page} / {Math.max(1, Math.ceil(count / limit))}</span>
            <Button disabled={page * limit >= count} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
          <div className="text-xs text-gray-500">Showing {rows.length} of {count}. Page {page} / {Math.max(1, Math.ceil(count/limit))}</div>
        </div>
      </CardBody></Card>
    </Shell>
  );
}

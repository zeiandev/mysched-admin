'use client';
import { useCallback, useEffect, useState } from 'react';
import { Shell, Card, CardBody, Button, Input, Table, Th, Td } from '@/components/ui';
import { api } from '@/lib/fetcher';

type AuditRow = {
  id?: number;
  created_at?: string;
  user_id?: string;
  table_name?: string;
  action?: string;
  row_id?: number | string | null;
};

const TABLES = [
  { v: 'all', label: 'All Tables' },
  { v: 'classes', label: 'Classes' },
  { v: 'sections', label: 'Sections' },
];

export default function Page() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [table, setTable] = useState('all');
  const [userId, setUserId] = useState('');

  const load = useCallback(async () => {
    const p = new URLSearchParams()
    if (table !== 'all') p.set('table', table)
    if (userId.trim()) p.set('user_id', userId.trim())
    const url = p.toString() ? `/api/audit?${p}` : '/api/audit'
    setRows(await api<AuditRow[]>(url))
  }, [table, userId])

  useEffect(() => { load() }, [load])

  return (
    <Shell title="Audit Log">
      <Card><CardBody>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={table}
            onChange={e => setTable(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {TABLES.map(t => <option key={t.v} value={t.v}>{t.label}</option>)}
          </select>
          <Input placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} className="w-48" />
          <Button onClick={load} className="ml-auto">Reload</Button>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>TS</Th><Th>User</Th><Th>Table</Th><Th>Action</Th><Th>Row</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id ?? `${r.table_name}-${r.created_at}-${r.row_id}`} className="odd:bg-white even:bg-gray-50">
                <Td>{r.created_at?.replace('T',' ').replace('Z','')}</Td>
                <Td>{r.user_id}</Td>
                <Td>{r.table_name}</Td>
                <Td>{r.action}</Td>
                <Td>{r.row_id}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="text-xs text-gray-500 mt-3">Showing {rows.length} (max 200 newest).</div>
      </CardBody></Card>
    </Shell>
  );
}
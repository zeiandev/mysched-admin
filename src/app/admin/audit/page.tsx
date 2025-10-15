// src/app/admin/audit/page.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { Shell, Card, CardBody, Button, Input, Table, Th, Td } from '@/components/ui'

type AuditRowRaw = {
  id?: number
  at?: string
  created_at?: string
  user_id?: string | null
  table_name?: string | null
  action?: string | null
  row_id?: number | string | null
  details?: unknown
}

type AuditRow = Required<Pick<AuditRowRaw, 'id'>> & {
  ts: string
  user_id: string | null
  table_name: string | null
  action: string | null
  row_id: number | string | null
  details?: unknown
}

const TABLES = [
  { v: 'all', label: 'All Tables' },
  { v: 'classes', label: 'Classes' },
  { v: 'sections', label: 'Sections' },
] as const

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [table, setTable] = useState<string>('all')
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const debRef = useRef<number | null>(null)
  const userIdDebounced = useDebounced(userId, 300, debRef)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const p = new URLSearchParams()
      if (table !== 'all') p.set('table', table)
      if (userIdDebounced.trim()) p.set('user_id', userIdDebounced.trim())
      p.set('_', String(Date.now()))
      const url = p.toString() ? `/api/audit?${p}` : `/api/audit?_=${Date.now()}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = (await res.json()) as AuditRowRaw[] | { rows: AuditRowRaw[] }
      const list = Array.isArray(payload) ? payload : payload.rows ?? []
      const mapped: AuditRow[] = list.map((r, i) => ({
        id: r.id ?? i,
        ts: formatTs(r.at ?? r.created_at ?? ''),
        user_id: r.user_id ?? null,
        table_name: r.table_name ?? null,
        action: r.action ?? null,
        row_id: r.row_id ?? null,
        details: r.details,
      }))
      setRows(mapped)
    } catch {
      setErr('Failed to load audit log')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [table, userIdDebounced])

  useEffect(() => {
    load()
  }, [load])

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Shell title="Audit Log">
          <Card>
            <CardBody>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {TABLES.map((t) => (
                    <option key={t.v} value={t.v}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Filter by User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-56"
                />

                <Button onClick={load} className="ml-auto" disabled={loading}>
                  {loading ? 'Loading…' : 'Reload'}
                </Button>
              </div>

              {err && <div className="py-3 text-sm text-red-600">{err}</div>}
              {loading && <div className="py-3 text-sm text-gray-500">Loading…</div>}
              {!loading && !err && rows.length === 0 && (
                <div className="py-6 text-sm text-gray-500">No audit entries found.</div>
              )}

              {!loading && !err && rows.length > 0 && (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Timestamp</Th>
                        <Th>User</Th>
                        <Th>Table</Th>
                        <Th>Action</Th>
                        <Th>Row</Th>
                        <Th>Details</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                          <Td>{r.ts}</Td>
                          <Td>
                            <code className="text-xs">{r.user_id || '—'}</code>
                          </Td>
                          <Td>{r.table_name || '—'}</Td>
                          <Td className="capitalize">{r.action || '—'}</Td>
                          <Td>{r.row_id ?? '—'}</Td>
                          <Td>
                            {r.details ? (
                              <pre className="max-w-[26rem] overflow-x-auto whitespace-pre-wrap break-words rounded bg-gray-50 p-2 text-[11px] text-gray-700">
                                {safeStringify(r.details)}
                              </pre>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="mt-3 text-xs text-gray-500">
                    Showing {rows.length} item(s) · newest first · capped by the API.
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Shell>
      </div>
    </main>
  )
}

/* helpers */
function useDebounced<T>(value: T, ms: number, ref: React.MutableRefObject<number | null>) {
  const [v, setV] = useState(value)
  useEffect(() => {
    if (ref.current) window.clearTimeout(ref.current)
    ref.current = window.setTimeout(() => setV(value), ms)
    return () => {
      if (ref.current) window.clearTimeout(ref.current)
    }
  }, [value, ms]) // eslint-disable-line react-hooks/exhaustive-deps
  return v
}

const fmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function formatTs(ts: string) {
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? '—' : fmt.format(d)
}

function safeStringify(v: unknown): string {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

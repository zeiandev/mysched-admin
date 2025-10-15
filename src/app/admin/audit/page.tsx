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

type AuditRow = {
  id: number
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
  const [openIds, setOpenIds] = useState<Set<number>>(new Set())

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

  const toggle = (id: number) =>
    setOpenIds(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

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
                    <option key={t.v} value={t.v}>{t.label}</option>
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
                        <Th>Summary</Th>
                        <Th>Details</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const parsed = parseDetails(r.details)
                        const summary = buildSummary(parsed)

                        return (
                          <tr key={r.id} className="align-top odd:bg-white even:bg-gray-50">
                            <Td className="whitespace-nowrap">{r.ts}</Td>
                            <Td>
                              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                                {shorten(r.user_id)}
                              </code>
                            </Td>
                            <Td>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                                {r.table_name || '—'}
                              </span>
                            </Td>
                            <Td>{actionBadge(r.action)}</Td>
                            <Td>
                              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                                {r.row_id ?? '—'}
                              </code>
                            </Td>
                            <Td>
                              {summary.length ? (
                                <div className="flex max-w-[22rem] flex-wrap gap-1">
                                  {summary.map((k) => (
                                    <span
                                      key={k}
                                      className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                                    >
                                      {k}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </Td>
                            <Td>
                              <Button
                                onClick={() => toggle(r.id)}
                                className="px-3 py-1 text-sm"
                                variant="secondary"
                              >
                                {openIds.has(r.id) ? 'Hide' : 'View'}
                              </Button>
                              {openIds.has(r.id) && (
                                <div className="mt-2 max-w-[36rem] overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                                  <pre className="whitespace-pre-wrap break-words text-[11.5px] leading-snug text-gray-800">
                                    {pretty(parsed)}
                                  </pre>
                                </div>
                              )}
                            </Td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>

                  <div className="mt-3 text-xs text-gray-500">
                    Showing {rows.length} item(s). Newest first.
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

function shorten(id: string | null) {
  if (!id) return '—'
  if (id.length <= 10) return id
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}

function actionBadge(action: string | null) {
  const a = (action || '').toUpperCase()
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  if (a === 'INSERT' || a === 'CREATE')
    return <span className={`${base} bg-green-50 text-green-700`}>CREATE</span>
  if (a === 'UPDATE')
    return <span className={`${base} bg-blue-50 text-blue-700`}>UPDATE</span>
  if (a === 'DELETE' || a === 'REMOVE')
    return <span className={`${base} bg-red-50 text-red-700`}>DELETE</span>
  return <span className={`${base} bg-gray-100 text-gray-700`}>{a || '—'}</span>
}

function parseDetails(v: unknown): unknown {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return v
    }
  }
  return v
}

function pretty(v: unknown): string {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

/** Build a compact summary list of interesting fields for chips */
function buildSummary(v: unknown): string[] {
  if (!v || typeof v !== 'object') return []
  const obj = v as Record<string, unknown>

  // Prefer domain fields if present
  const interesting = [
    'title',
    'code',
    'section_id',
    'day',
    'start',
    'start_time',
    'end',
    'end_time',
    'room',
    'instructor',
    'units',
  ]

  const keys = Object.keys(obj)
  const chosen = keys.filter((k) => interesting.includes(k))
  if (chosen.length) return chosen

  // Fallback: show first few keys, excluding noisy metadata
  const exclude = new Set(['id', 'user_id', 'created_at', 'updated_at', 'at'])
  return keys.filter((k) => !exclude.has(k)).slice(0, 6)
}

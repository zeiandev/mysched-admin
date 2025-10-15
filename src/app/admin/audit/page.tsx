// src/app/admin/audit/page.tsx
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import StatusTicker from '@/components/StatusTicker'
import { Shell, Card, CardBody, Button, Input, Table, Th, Td } from '@/components/ui'
import { api } from '@/lib/fetcher'

type AuditRow = {
  id?: number
  created_at?: string
  user_id?: string
  table_name?: string
  action?: string
  row_id?: number | string | null
}

const TABLES = [
  { v: 'all', label: 'All Tables' },
  { v: 'classes', label: 'Classes' },
  { v: 'sections', label: 'Sections' },
] as const

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
    </svg>
  )
}

const fmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [table, setTable] = useState<string>('all')
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const deb = useRef<number | null>(null)
  const userIdDebounced = useDebounced<string>(userId, 300, deb)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (table !== 'all') p.set('table', table)
      if (userIdDebounced.trim()) p.set('user_id', userIdDebounced.trim())
      const url = p.toString() ? `/api/audit?${p}` : '/api/audit'
      setRows(await api<AuditRow[]>(url))
    } finally {
      setLoading(false)
    }
  }, [table, userIdDebounced])

  useEffect(() => { load() }, [load])

  const pretty = useMemo(
    () =>
      rows.map(r => {
        const d = r.created_at ? new Date(r.created_at) : null
        return {
          ...r,
          created_display: d && !Number.isNaN(d.getTime()) ? fmt.format(d) : (r.created_at ?? ''),
        }
      }),
    [rows],
  )

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />
      <StatusTicker />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Shell title="Audit Log">
          <Card>
            <CardBody>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                  value={table}
                  onChange={e => setTable(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {TABLES.map(t => (
                    <option key={t.v} value={t.v}>{t.label}</option>
                  ))}
                </select>

                <Input
                  placeholder="Filter by User ID"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-56"
                />

                <Button onClick={load} className="ml-auto inline-flex items-center gap-2" disabled={loading}>
                  {loading ? (<><Spinner /><span>Refreshing</span></>) : 'Reload'}
                </Button>
              </div>

              {loading && <div className="py-3 text-sm text-gray-500">Loading…</div>}
              {!loading && pretty.length === 0 && (
                <div className="py-6 text-sm text-gray-500">No audit entries found.</div>
              )}

              {pretty.length > 0 && (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Timestamp</Th>
                        <Th>User</Th>
                        <Th>Table</Th>
                        <Th>Action</Th>
                        <Th>Row</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pretty.map(r => (
                        <tr
                          key={r.id ?? `${r.table_name}-${r.created_at}-${r.row_id}`}
                          className="odd:bg-white even:bg-gray-50"
                        >
                          <Td>{r.created_display}</Td>
                          <Td><code className="text-xs">{r.user_id || '—'}</code></Td>
                          <Td>{r.table_name}</Td>
                          <Td className="capitalize">{r.action}</Td>
                          <Td>{r.row_id ?? '—'}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="mt-3 text-xs text-gray-500">
                    Showing {rows.length} item(s) · newest first · capped at 200.
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

/* generic debounce helper with types */
function useDebounced<T>(value: T, ms: number, ref: React.MutableRefObject<number | null>) {
  const [v, setV] = useState<T>(value)
  useEffect(() => {
    if (ref.current) window.clearTimeout(ref.current)
    ref.current = window.setTimeout(() => setV(value), ms)
    return () => { if (ref.current) window.clearTimeout(ref.current) }
  }, [value, ms]) // eslint-disable-line react-hooks/exhaustive-deps
  return v
}

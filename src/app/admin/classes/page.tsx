// src/app/admin/classes/page.tsx
'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import AdminNav from '@/components/AdminNav'
import {
  Shell,
  Card,
  CardBody,
  Button,
  Input,
  Table,
  Th,
  Td,
  Danger,
} from '@/components/ui'
import { api } from '@/lib/fetcher'
import { useToast } from '@/components/toast'

type Row = {
  id: number
  section_id: number | null
  day: number | null
  start: string | null
  end: string | null
  code: string | null
  title: string | null
  units: number | null
  room: string | null
  instructor: string | null
}
type Section = { id: number; code: string | null }

const DAYS = [
  { n: 1, label: 'Monday' },
  { n: 2, label: 'Tuesday' },
  { n: 3, label: 'Wednesday' },
  { n: 4, label: 'Thursday' },
  { n: 5, label: 'Friday' },
  { n: 6, label: 'Saturday' },
  { n: 7, label: 'Sunday' },
]
const nameOfDay = (n?: number | null) =>
  DAYS.find((d) => d.n === (n ?? 0))?.label ?? '—'

// simple spinner
function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <svg className={`animate-spin ${cls}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
    </svg>
  )
}

// gray skeleton block
function Skel({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${w} ${h}`} />
}

export default function ClassesPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [count, setCount] = useState(0)
  const [sections, setSections] = useState<Section[]>([])
  const [sectionId, setSectionId] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')
  const [qTitle, setQTitle] = useState('')
  const [qCode, setQCode] = useState('')
  const [draft, setDraft] = useState<Partial<Row>>({})
  const [limit, setLimit] = useState(15)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const debounceRef = useRef<number | null>(null)
  const toast = useToast()

  const loadSections = useCallback(async () => {
    setLoadingSections(true)
    try {
      setSections(await api('/api/sections'))
    } finally {
      setLoadingSections(false)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (sectionId !== 'all') p.set('section_id', sectionId)
      if (dayFilter !== 'all') p.set('day', dayFilter)
      p.set('page', String(page))
      p.set('limit', String(limit))
      const res = await api<{ rows: Row[]; count: number }>(`/api/classes?${p.toString()}`)
      setRows(res.rows)
      setCount(res.count)
    } finally {
      setLoading(false)
    }
  }, [sectionId, dayFilter, page, limit])

  useEffect(() => { loadSections() }, [loadSections])
  useEffect(() => { load() }, [load])

  // Debounced filter
  const [filtered, setFiltered] = useState<Row[]>(rows)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const t = qTitle.trim().toLowerCase()
      const c = qCode.trim().toLowerCase()
      setFiltered(
        rows.filter(
          (r) =>
            (!t || (r.title ?? '').toLowerCase().includes(t)) &&
            (!c || (r.code ?? '').toLowerCase().includes(c)),
        ),
      )
    }, 300)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [qTitle, qCode, rows])

  // validation
  function validate(input: Partial<Row>): boolean {
    const fail = (field: string, valid: boolean) => {
      if (!valid) toast({ kind: 'error', msg: `${field} is invalid` })
      return valid
    }
    if (!fail('Title', !!(input.title && input.title.trim()))) return false
    if (!fail('Code', !!(input.code && input.code.trim()))) return false
    if (!fail('Section', !!(input.section_id && input.section_id > 0))) return false
    if (input.start && input.end && !(input.start < input.end)) {
      toast({ kind: 'error', msg: 'Start time must be before end time' })
      return false
    }
    return true
  }

  const create = async () => {
    if (!validate(draft)) return
    try {
      await api('/api/classes', { method: 'POST', body: JSON.stringify(draft) })
      setDraft({})
      await load()
      toast({ kind: 'success', msg: 'Class created' })
    } catch {
      toast({ kind: 'error', msg: 'Create failed' })
    }
  }

  const update = async (id: number, patch: Partial<Row>, revert: () => void) => {
    try {
      await api(`/api/classes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      toast({ kind: 'success', msg: 'Updated' })
    } catch {
      toast({ kind: 'error', msg: 'Update failed' })
      revert()
    }
  }

  const remove = async (id: number) => {
    try {
      await api(`/api/classes/${id}`, { method: 'DELETE' })
      await load()
      toast({ kind: 'success', msg: 'Deleted' })
    } catch {
      toast({ kind: 'error', msg: 'Delete failed' })
    }
  }

  const pageRows = useMemo(() => filtered, [filtered])

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* admin top bar like dashboard */}
      <AdminNav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Shell title="Classes">
          {/* Controls */}
          <Card>
            <CardBody>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {/* Sections select with skeleton */}
                {loadingSections ? (
                  <div className="w-40">
                    <Skel h="h-9" />
                  </div>
                ) : (
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All Sections</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code ?? `Section ${s.id}`}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All Days</option>
                  {DAYS.map((d) => (
                    <option key={d.n} value={d.n}>
                      {d.label}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Filter Title"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="w-36 sm:w-48"
                />
                <Input
                  placeholder="Filter Code"
                  value={qCode}
                  onChange={(e) => setQCode(e.target.value)}
                  className="w-36 sm:w-48"
                />

                <Button
                  onClick={() => { setPage(1); load() }}
                  className="ml-auto inline-flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (<><Spinner /><span>Refreshing</span></>) : 'Reload'}
                </Button>
              </div>

              {/* Create row (show skeleton for button during loading to avoid flicker) */}
              <div className="grid gap-3 sm:grid-cols-5">
                <Input
                  placeholder="Title"
                  value={draft.title ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
                <Input
                  placeholder="Code"
                  value={draft.code ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                />
                <Input
                  placeholder="Section ID"
                  type="number"
                  value={draft.section_id ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, section_id: Number(e.target.value) }))
                  }
                />
                <select
                  value={draft.day?.toString() ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      day: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d.n} value={d.n}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <Button onClick={create} disabled={loading}>
                  {loading ? 'Working…' : 'Add Class'}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Table */}
          <Card>
            <CardBody>
              {/* Header skeleton while loading */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="grid grid-cols-8 gap-3">
                      <Skel />
                      <Skel />
                      <Skel />
                      <Skel />
                      <Skel />
                      <Skel />
                      <Skel />
                      <Skel />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <Th>ID</Th>
                        <Th>Title</Th>
                        <Th>Code</Th>
                        <Th>Section</Th>
                        <Th>Day</Th>
                        <Th>Start</Th>
                        <Th>End</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((r) => (
                        <tr key={r.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                          <Td>{r.id}</Td>
                          <Td>
                            <Input
                              defaultValue={r.title ?? ''}
                              onBlur={(e) => {
                                const old = r.title
                                const val = e.target.value
                                setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, title: val } : x)))
                                update(r.id, { title: val }, () =>
                                  setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, title: old } : x))),
                                )
                              }}
                            />
                          </Td>
                          <Td>
                            <Input
                              defaultValue={r.code ?? ''}
                              onBlur={(e) => {
                                const old = r.code
                                const val = e.target.value
                                setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, code: val } : x)))
                                update(r.id, { code: val }, () =>
                                  setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, code: old } : x))),
                                )
                              }}
                            />
                          </Td>
                          <Td>
                            <Input
                              type="number"
                              defaultValue={r.section_id ?? 0}
                              onBlur={(e) => {
                                const old = r.section_id
                                const val = Number(e.target.value)
                                setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, section_id: val } : x)))
                                update(r.id, { section_id: val }, () =>
                                  setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, section_id: old } : x))),
                                )
                              }}
                            />
                          </Td>
                          <Td>
                            <select
                              defaultValue={r.day ? String(r.day) : ''}
                              onChange={(e) => {
                                const old = r.day
                                const val = e.target.value ? Number(e.target.value) : null
                                setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, day: val } : x)))
                                update(r.id, { day: val }, () =>
                                  setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, day: old } : x))),
                                )
                              }}
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">—</option>
                              {DAYS.map((d) => (
                                <option key={d.n} value={d.n}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                            <div className="mt-1 text-xs text-gray-500">{nameOfDay(r.day)}</div>
                          </Td>
                          <Td>
                            <Input
                              defaultValue={r.start ?? ''}
                              onBlur={(e) => {
                                const old = r.start
                                const val = e.target.value
                                setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, start: val } : x)))
                                update(
                                  r.id,
                                  { start: val, end: r.end ?? undefined },
                                  () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, start: old } : x))),
                                )
                              }}
                            />
                          </Td>
                          <Td>
                            <Input
                              defaultValue={r.end ?? ''}
                              onBlur={(e) => {
                                const old = r.end
                                const val = e.target.value
                                setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, end: val } : x)))
                                update(
                                  r.id,
                                  { end: val, start: r.start ?? undefined },
                                  () => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, end: old } : x))),
                                )
                              }}
                            />
                          </Td>
                          <Td>
                            <Danger onClick={() => remove(r.id)}>Delete</Danger>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Per page</span>
                      <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
                        className="rounded-xl border border-gray-300 bg-white px-2 py-1 text-sm"
                      >
                        {[10, 15, 20, 30, 50, 100].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Prev
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {page} / {Math.max(1, Math.ceil(count / limit))}
                      </span>
                      <Button disabled={page * limit >= count} onClick={() => setPage((p) => p + 1)}>
                        Next
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">Showing {rows.length} of {count}</div>
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

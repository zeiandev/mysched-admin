// src/app/admin/classes/page.tsx
'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import AdminNav from '@/components/AdminNav'
import { Shell, Card, CardBody, Button, Input, Table, Th, Td, Danger } from '@/components/ui'
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
const nameOfDay = (n?: number | null) => DAYS.find(d => d.n === (n ?? 0))?.label ?? '—'

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
    </svg>
  )
}

export default function ClassesPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [count, setCount] = useState(0)
  const [sections, setSections] = useState<Section[]>([])
  const [sectionId, setSectionId] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')
  const [qTitle, setQTitle] = useState('')
  const [qCode, setQCode] = useState('')
  const [limit, setLimit] = useState(15)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)

  // inline editor
  const [editingId, setEditingId] = useState<number | null>(null)
  const [edit, setEdit] = useState<Partial<Row>>({})
  const toast = useToast()
  const deb = useRef<number | null>(null)

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
      const r = await api<{ rows: Row[]; count: number }>(`/api/classes?${p}`)
      setRows(r.rows)
      setCount(r.count)
    } finally {
      setLoading(false)
    }
  }, [sectionId, dayFilter, page, limit])

  useEffect(() => { loadSections() }, [loadSections])
  useEffect(() => { load() }, [load])

  // client filter
  const [filtered, setFiltered] = useState<Row[]>(rows)
  useEffect(() => {
    if (deb.current) window.clearTimeout(deb.current)
    deb.current = window.setTimeout(() => {
      const t = qTitle.trim().toLowerCase()
      const c = qCode.trim().toLowerCase()
      setFiltered(rows.filter(r =>
        (!t || (r.title ?? '').toLowerCase().includes(t)) &&
        (!c || (r.code ?? '').toLowerCase().includes(c)),
      ))
    }, 250)
    return () => { if (deb.current) window.clearTimeout(deb.current) }
  }, [qTitle, qCode, rows])

  const pageRows = useMemo(() => filtered, [filtered])

  // editor helpers
  function startEdit(r: Row) {
    setEditingId(r.id)
    setEdit({
      title: r.title ?? '',
      code: r.code ?? '',
      section_id: r.section_id ?? 0,
      day: r.day ?? null,
      start: r.start ?? '',
      end: r.end ?? '',
      room: r.room ?? '',
      instructor: r.instructor ?? '',
      units: r.units ?? null,
    })
  }
  function cancelEdit() {
    setEditingId(null)
    setEdit({})
  }
  async function saveEdit(row: Row) {
    const keys: (keyof Row)[] = ['title','code','section_id','day','start','end','room','instructor','units']
    let patch: Partial<Row> = {}
    for (const k of keys) {
      const newVal = edit[k]
      const oldVal = row[k]
      if (typeof newVal !== 'undefined' && newVal !== oldVal) {
        patch = { ...patch, [k]: newVal }
      }
    }
    if (Object.keys(patch).length === 0) { cancelEdit(); return }
    try {
      await api(`/api/classes/${row.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      toast({ kind: 'success', msg: 'Saved' })
      setRows(rs => rs.map(x => (x.id === row.id ? { ...x, ...patch } as Row : x)))
      cancelEdit()
    } catch {
      toast({ kind: 'error', msg: 'Save failed' })
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Shell title="Classes">
          <Card>
            <CardBody>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[160px_160px_1fr_1fr_auto]">
                {loadingSections ? (
                  <div className="h-9 animate-pulse rounded-lg bg-gray-200" />
                ) : (
                  <select value={sectionId} onChange={e => setSectionId(e.target.value)}
                          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600">
                    <option value="all">All Sections</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.code ?? `Section ${s.id}`}</option>)}
                  </select>
                )}
                <select value={dayFilter} onChange={e => setDayFilter(e.target.value)}
                        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600">
                  <option value="all">All Days</option>
                  {DAYS.map(d => <option key={d.n} value={d.n}>{d.label}</option>)}
                </select>
                <Input value={qTitle} onChange={e => setQTitle(e.target.value)} placeholder="Filter Title" className="h-9" />
                <Input value={qCode} onChange={e => setQCode(e.target.value)} placeholder="Filter Code" className="h-9" />
                <Button onClick={() => { setPage(1); load() }} disabled={loading} className="h-9">
                  {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Refreshing</span> : 'Reload'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr>
                      <Th className="w-[60px]">ID</Th>
                      <Th className="w-[28%]">Title</Th>
                      <Th className="w-[14%]">Code</Th>
                      <Th className="w-[10%]">Section</Th>
                      <Th className="w-[14%]">Day</Th>
                      <Th className="w-[12%]">Start</Th>
                      <Th className="w-[12%]">End</Th>
                      <Th className="w-[10%]">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map(r => (
                      <React.Fragment key={r.id}>
                        <tr className="odd:bg-white even:bg-gray-50">
                          <Td>{r.id}</Td>
                          <Td>{r.title ?? '—'}</Td>
                          <Td>{r.code ?? '—'}</Td>
                          <Td>{r.section_id ?? '—'}</Td>
                          <Td>{nameOfDay(r.day)}</Td>
                          <Td>{r.start ?? '—'}</Td>
                          <Td>{r.end ?? '—'}</Td>
                          <Td className="whitespace-nowrap">
                            <Button onClick={() => startEdit(r)} className="mr-2">Edit</Button>
                            <Danger
                              onClick={async () => {
                                await api(`/api/classes/${r.id}`, { method: 'DELETE' })
                                setRows(rs => rs.filter(x => x.id !== r.id))
                              }}
                            >
                              Delete
                            </Danger>
                          </Td>
                        </tr>

                        {editingId === r.id && (
                          <tr>
                            <td colSpan={8} className="bg-gray-50">
                              <div className="animate-slideDown rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Title</label>
                                    <Input value={edit.title ?? ''} onChange={e => setEdit(s => ({ ...s, title: e.target.value }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Code</label>
                                    <Input value={edit.code ?? ''} onChange={e => setEdit(s => ({ ...s, code: e.target.value }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Section ID</label>
                                    <Input type="number" value={edit.section_id ?? 0}
                                           onChange={e => setEdit(s => ({ ...s, section_id: Number(e.target.value) }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Day</label>
                                    <select
                                      value={edit.day?.toString() ?? ''}
                                      onChange={e => setEdit(s => ({ ...s, day: e.target.value ? Number(e.target.value) : null }))}
                                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
                                    >
                                      <option value="">—</option>
                                      {DAYS.map(d => <option key={d.n} value={d.n}>{d.label}</option>)}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Start</label>
                                    <Input value={edit.start ?? ''} onChange={e => setEdit(s => ({ ...s, start: e.target.value }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">End</label>
                                    <Input value={edit.end ?? ''} onChange={e => setEdit(s => ({ ...s, end: e.target.value }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Room</label>
                                    <Input value={edit.room ?? ''} onChange={e => setEdit(s => ({ ...s, room: e.target.value }))} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-gray-600">Instructor</label>
                                    <Input value={edit.instructor ?? ''} onChange={e => setEdit(s => ({ ...s, instructor: e.target.value }))} />
                                  </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                  <Button onClick={() => saveEdit(r)} className="min-w-[88px]">Save</Button>
                                  <Button onClick={cancelEdit} className="min-w-[88px] bg-gray-200 text-gray-900 hover:bg-gray-300">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Per page</span>
                  <select
                    value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
                    className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-sm"
                  >
                    {[10, 15, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                  <span className="text-sm text-gray-600">Page {page} / {Math.max(1, Math.ceil(count / limit))}</span>
                  <Button disabled={page * limit >= count} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
                <div className="text-xs text-gray-500">Showing {rows.length} of {count}</div>
              </div>
            </CardBody>
          </Card>
        </Shell>
      </div>

      <style jsx global>{`
        .animate-slideDown { animation: slideDown .18s ease-out; }
        @keyframes slideDown { from { opacity:.0; transform: translateY(-6px) } to { opacity:1; transform: translateY(0) } }
      `}</style>
    </main>
  )
}

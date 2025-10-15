// src/app/admin/sections/page.tsx
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import { Shell, Card, CardBody, Button, Input, Table, Th, Td, Danger } from '@/components/ui'
import { api } from '@/lib/fetcher'

type Row = { id: number; code: string | null }

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
    </svg>
  )
}

export default function SectionsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState<Partial<Row>>({})
  const [limit, setLimit] = useState(15)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // inline editor
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCode, setEditCode] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await api('/api/sections'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // debounce filter
  const [filtered, setFiltered] = useState<Row[]>(rows)
  const debRef = useRef<number | null>(null)
  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current)
    debRef.current = window.setTimeout(() => {
      const t = q.trim().toLowerCase()
      setFiltered(rows.filter(r => (r.code ?? '').toLowerCase().includes(t)))
      setPage(1)
    }, 250)
    return () => { if (debRef.current) window.clearTimeout(debRef.current) }
  }, [q, rows])

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * limit, (page - 1) * limit + limit),
    [filtered, page, limit],
  )

  // CRUD
  async function create() {
    const code = (draft.code ?? '').trim()
    if (!code) return
    await api('/api/sections', { method: 'POST', body: JSON.stringify({ code }) })
    setDraft({})
    await load()
  }

  async function remove(id: number) {
    await api(`/api/sections/${id}`, { method: 'DELETE' })
    setRows(rs => rs.filter(r => r.id !== id))
  }

  function startEdit(r: Row) {
    setEditingId(r.id)
    setEditCode(r.code ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditCode('')
  }

  async function saveEdit(r: Row) {
    const next = editCode.trim()
    if (!next || next === (r.code ?? '')) { cancelEdit(); return }
    await api(`/api/sections/${r.id}`, { method: 'PATCH', body: JSON.stringify({ code: next }) })
    setRows(rs => rs.map(x => (x.id === r.id ? { ...x, code: next } : x)))
    cancelEdit()
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Shell title="Sections">
          {/* Controls */}
          <Card>
            <CardBody>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Search section…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className="w-48"
                />
                <span className="text-sm text-gray-500">
                  Showing {pageRows.length} / {filtered.length} section(s)
                </span>

                <div className="ml-auto flex items-center gap-2">
                  <label className="text-sm text-gray-600">Per page</label>
                  <select
                    value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
                    className="rounded-xl border border-gray-300 bg-white px-2 py-2 text-sm"
                  >
                    {[10, 15, 20, 30, 50].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <Button onClick={load} disabled={loading}>
                    {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Reloading</span> : 'Reload'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  placeholder="New section code (e.g. BSCS 4-1)"
                  value={draft.code ?? ''}
                  onChange={e => setDraft({ code: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') create() }}
                />
                <Button onClick={create}>Add Section</Button>
              </div>
            </CardBody>
          </Card>

          {/* Table with inline editor */}
          <Card>
            <CardBody>
              {loading && <div className="py-3 text-sm text-gray-500">Loading…</div>}
              {!loading && filtered.length === 0 && (
                <div className="py-6 text-sm text-gray-500">No sections found.</div>
              )}

              <Table>
                <thead>
                  <tr>
                    <Th className="w-[6rem]">ID</Th>
                    <Th>Code</Th>
                    <Th className="w-[12rem]">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map(r => (
                    <React.Fragment key={r.id}>
                      <tr className="odd:bg-white even:bg-gray-50">
                        <Td>{r.id}</Td>
                        <Td>{r.code ?? '—'}</Td>
                        <Td className="whitespace-nowrap">
                          <Button onClick={() => startEdit(r)} className="mr-2">Edit</Button>
                          <Danger onClick={() => remove(r.id)}>Delete</Danger>
                        </Td>
                      </tr>

                      {editingId === r.id && (
                        <tr>
                          <td colSpan={3} className="bg-gray-50">
                            <div className="animate-slideDown rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                              <div className="space-y-1">
                                <label className="text-xs text-gray-600">Code</label>
                                <Input value={editCode} onChange={e => setEditCode(e.target.value)} />
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <Button onClick={() => saveEdit(r)} className="min-w-[88px]">Save</Button>
                                <Button
                                  onClick={cancelEdit}
                                  className="min-w-[88px] bg-gray-200 text-gray-900 hover:bg-gray-300"
                                >
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

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-end gap-3">
                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                  Prev
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
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

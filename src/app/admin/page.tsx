// src/app/admin/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
import { Card, CardBody, Button } from '@/components/ui'

type Status = {
  db: { ok: boolean; latencyMs: number }
  counts: { classes: number; sections: number; errors: number }
  lastUpdate: { classes: string | null; sections: string | null }
  auth?: { ok: boolean; authed: boolean; userId: string | null; isAdmin: boolean }
  env?: {
    nodeEnv: string
    hasSupabaseUrl: boolean
    hasSupabaseAnon: boolean
    hasServiceRole: boolean
    hasSiteUrl: boolean
    supabaseEnvOk?: boolean
  }
  hasUrl?: boolean
  hasKey?: boolean
  metrics?: {
    activeAdmins?: number
    uptimeMs?: number
    storagePct?: number
    version?: string
  }
}

type AuditRow = {
  id?: number
  at?: string
  created_at?: string
  user_id?: string | null
  table_name?: string | null
  action?: string | null
  row_id?: number | string | null
}

const fmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: 'numeric',
  minute: '2-digit',
})

function formatTs(ts: string | null | undefined) {
  if (!ts) return 'N/A'
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? 'N/A' : fmt.format(d)
}

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  )
}
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/70 ${className}`} />
}

export default function AdminHome() {
  const [s, setS] = useState<Status | null>(null)
  const [at, setAt] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [apiLatency, setApiLatency] = useState<number | null>(null)

  const [feed, setFeed] = useState<AuditRow[]>([])
  const [feedLoading, setFeedLoading] = useState<boolean>(true)

  const load = async () => {
    setLoading(true)
    try {
      const t0 = performance.now()
      const res = await fetch('/api/status', { cache: 'no-store' })
      const json: Status = await res.json()
      setS(json)
      setAt(new Date().toLocaleTimeString())
      const t1 = performance.now()
      setApiLatency(Math.round(t1 - t0))
    } finally {
      setLoading(false)
    }
  }

  const loadFeed = async () => {
    setFeedLoading(true)
    try {
      const res = await fetch('/api/audit?limit=5', { cache: 'no-store' })
      const rows = (await res.json()) as AuditRow[] | { rows: AuditRow[] }
      setFeed(Array.isArray(rows) ? rows : rows.rows ?? [])
    } catch {
      setFeed([])
    } finally {
      setFeedLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadFeed()
    const id = setInterval(() => {
      load()
      loadFeed()
    }, 30000)
    return () => clearInterval(id)
  }, [])

  const classesUpdated = useMemo(() => formatTs(s?.lastUpdate.classes), [s])
  const sectionsUpdated = useMemo(() => formatTs(s?.lastUpdate.sections), [s])

  // Notifications (config + recent changes, not errors)
  const notifications: string[] = useMemo(() => {
    const notes: string[] = []
    if (s?.counts.errors && s.counts.errors > 0) notes.push(`${s.counts.errors} change(s) in audit log recently`)
    if (s?.env?.supabaseEnvOk === false) notes.push('Supabase environment missing or invalid')
    if (!s?.env?.hasSupabaseUrl && s?.hasUrl === false) notes.push('Missing SUPABASE_URL')
    if (!s?.env?.hasSupabaseAnon && s?.hasKey === false) notes.push('Missing SUPABASE_ANON_KEY')
    return notes
  }, [s])

  // Fallbacks to avoid “—”
  const activeAdmins = s?.metrics?.activeAdmins ?? (s?.auth?.isAdmin ? 1 : 0)
  const version =
    (process.env.NEXT_PUBLIC_APP_VERSION as string | undefined) ??
    s?.metrics?.version ??
    (process.env.NODE_ENV === 'production' ? '1.0.0' : 'dev')
  const storagePct = s?.metrics?.storagePct
  const storageDisplay = storagePct != null ? `${Math.round(storagePct)}%` : 'Unknown'

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          {loading ? <Spinner className="h-5 w-5 text-blue-600" /> : null}
        </div>

        {notifications.length > 0 && !loading && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <ul className="list-disc pl-5">
              {notifications.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {/* KPIs */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Database</div>
              {loading ? (
                <>
                  <Skeleton className="mt-2 h-7 w-28" />
                  <Skeleton className="mt-2 h-4 w-44" />
                </>
              ) : (
                <>
                  <div className={`mt-1 text-2xl font-semibold ${s?.db.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {s?.db.ok ? 'Healthy' : 'Error'}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    DB latency: {s ? `${s.db.latencyMs} ms` : apiLatency != null ? `${apiLatency} ms` : 'N/A'}
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Totals</div>
              {loading ? (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-y-2 text-[15px]">
                  <div>Classes</div>
                  <div className="text-right font-medium">{s?.counts.classes ?? 0}</div>
                  <div>Sections</div>
                  <div className="text-right font-medium">{s?.counts.sections ?? 0}</div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Informational audit counter */}
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Audit Changes</div>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <div className={`mt-1 text-2xl font-semibold ${s && s.counts.errors > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                  {s ? s.counts.errors : 0}
                </div>
              )}
              {!loading && <div className="mt-1 text-xs text-gray-500">Recorded changes in audit logs</div>}
            </CardBody>
          </Card>
        </div>

        {/* Compact metrics row */}
        <div className="grid gap-6 sm:grid-cols-4">
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Active Admins</div>
              {loading ? <Skeleton className="mt-2 h-6 w-16" /> : <div className="mt-1 text-xl">{activeAdmins}</div>}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">API Latency</div>
              {loading ? (
                <Skeleton className="mt-2 h-6 w-20" />
              ) : (
                <div className="mt-1 text-xl">{apiLatency != null ? `${apiLatency} ms` : 'N/A'}</div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Version</div>
              {loading ? <Skeleton className="mt-2 h-6 w-24" /> : <div className="mt-1 text-xl">{version}</div>}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Storage</div>
              {loading ? <Skeleton className="mt-2 h-6 w-24" /> : <div className="mt-1 text-xl">{storageDisplay}</div>}
            </CardBody>
          </Card>
        </div>

        {/* Diagnostics */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardBody>
              <div className="mb-2 text-sm text-gray-600">Auth</div>
              {loading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div>
                    User: <span className="font-mono">{s?.auth?.userId || 'N/A'}</span>
                  </div>
                  <div className="mt-1">
                    Admin:{' '}
                    <span className={`font-semibold ${s?.auth?.isAdmin ? 'text-green-700' : 'text-red-700'}`}>
                      {String(!!s?.auth?.isAdmin)}
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-2 text-sm text-gray-600">Environment</div>
              {loading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div>
                    Supabase OK:{' '}
                    <span className={`font-semibold ${s?.env?.supabaseEnvOk ? 'text-green-700' : 'text-red-700'}`}>
                      {String(!!s?.env?.supabaseEnvOk)}
                    </span>
                  </div>
                  <div className="mt-1">hasUrl: {String(!!(s?.hasUrl ?? s?.env?.hasSupabaseUrl))}</div>
                  <div className="mt-1">hasKey: {String(!!(s?.hasKey ?? s?.env?.hasSupabaseAnon))}</div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recent changes feed */}
        <Card>
          <CardBody>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-gray-600">Recent Changes</div>
              <Link href="/admin/audit" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {feedLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : feed.length === 0 ? (
              <div className="text-sm text-gray-500">No recent changes.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {feed.map((r, i) => (
                  <li key={r.id ?? i} className="py-2 text-sm">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                        {formatTs(r.at ?? r.created_at)}
                      </span>
                      <span className="capitalize text-gray-800">{r.action ?? 'update'}</span>
                      <span className="text-gray-500">on</span>
                      <span className="font-medium">{r.table_name ?? 'N/A'}</span>
                      {r.row_id != null && (
                        <>
                          <span className="text-gray-500">row</span>
                          <span className="font-mono text-gray-800">{String(r.row_id)}</span>
                        </>
                      )}
                      <span className="text-gray-500">by</span>
                      <span className="font-mono text-gray-800">{r.user_id ?? 'N/A'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Last updates + refresh */}
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-gray-600">Last Updates</div>
                {loading ? (
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ) : (
                  <div className="mt-2 space-y-1 text-[15px]">
                    <div>
                      Classes: <span className="font-medium">{classesUpdated}</span>
                    </div>
                    <div>
                      Sections: <span className="font-medium">{sectionsUpdated}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => { load(); loadFeed() }} disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Refreshing
                    </span>
                  ) : (
                    'Refresh'
                  )}
                </Button>
                <span className="text-xs text-gray-500">as of {loading ? 'N/A' : at || 'N/A'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardBody>
            <div className="mb-3 text-sm text-gray-600">Quick Actions</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/admin/classes">
                <Button className="w-full">Add / Edit Classes</Button>
              </Link>
              <Link href="/admin/sections">
                <Button className="w-full">Add / Edit Sections</Button>
              </Link>
              <Link href="/admin/audit">
                <Button className="w-full">Audit Logs</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  )
}

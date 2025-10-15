// src/app/admin/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardBody, Button } from '@/components/ui'
import AdminNav from '@/components/AdminNav'

type Status = {
  db: { ok: boolean; latencyMs: number }
  counts: { classes: number; sections: number; errors: number } // errors = audit entries (legacy)
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
}

const fmt = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: 'numeric',
  minute: '2-digit',
})

function formatTs(ts: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? ts : fmt.format(d)
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

/** Derive real “alerts” from health signals. */
function deriveAlerts(s: Status | null): string[] {
  if (!s) return []
  const alerts: string[] = []
  if (!s.db.ok) alerts.push('Database unreachable')
  if (s.db.latencyMs > 800) alerts.push(`High DB latency (${s.db.latencyMs} ms)`)
  if (!s.env?.supabaseEnvOk) alerts.push('Supabase env vars invalid')
  if (!s.env?.hasSupabaseUrl) alerts.push('Missing SUPABASE_URL')
  if (!s.env?.hasSupabaseAnon) alerts.push('Missing SUPABASE_ANON_KEY')
  if (!s.env?.hasSiteUrl) alerts.push('Missing SITE_URL')
  if (!s.auth?.ok) alerts.push('Auth service not responding')
  return alerts
}

export default function AdminHome() {
  const [s, setS] = useState<Status | null>(null)
  const [at, setAt] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/status', { cache: 'no-store' })
      const json = (await res.json()) as Status
      setS(json)
      setAt(new Date().toLocaleTimeString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const classesUpdated = useMemo(() => formatTs(s?.lastUpdate.classes ?? null), [s])
  const sectionsUpdated = useMemo(() => formatTs(s?.lastUpdate.sections ?? null), [s])

  // Treat legacy counts.errors as “audit activity” instead of errors.
  const auditActivity = s?.counts.errors ?? 0

  const alerts = deriveAlerts(s)

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          {loading ? <Spinner className="h-5 w-5 text-blue-600" /> : null}
        </div>

        {/* System alerts (real health issues) */}
        {!loading && alerts.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="font-semibold mb-1">System alerts</div>
            <ul className="list-inside list-disc space-y-1">
              {alerts.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* KPIs */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Database */}
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
                  <div className="mt-1 text-sm text-gray-500">Latency: {s ? `${s.db.latencyMs} ms` : '—'}</div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Totals */}
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
                  <div className="text-right font-medium">{s?.counts.classes ?? '—'}</div>
                  <div>Sections</div>
                  <div className="text-right font-medium">{s?.counts.sections ?? '—'}</div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Audit activity (24h) */}
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Audit activity (24h)</div>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-24" />
              ) : (
                <div className={`mt-1 text-2xl font-semibold ${auditActivity > 0 ? 'text-blue-600' : 'text-gray-700'}`}>
                  {auditActivity}
                </div>
              )}
              {!loading && auditActivity > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Changes recorded in audit log.{' '}
                  <Link href="/admin/audit" className="text-blue-600 underline underline-offset-2">
                    View
                  </Link>
                </div>
              )}
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
                    User: <span className="font-mono">{s?.auth?.userId || '—'}</span>
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

        {/* Last updates */}
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
                <Button onClick={load} disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Refreshing
                    </span>
                  ) : (
                    'Refresh'
                  )}
                </Button>
                <span className="text-xs text-gray-500">as of {loading ? '—' : at || '—'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Manage */}
        <Card>
          <CardBody>
            <div className="mb-3 text-sm text-gray-600">Manage</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/admin/classes">
                <Button className="w-full">Classes</Button>
              </Link>
              <Link href="/admin/sections">
                <Button className="w-full">Sections</Button>
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

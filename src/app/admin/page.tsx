// src/app/admin/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardBody, Button } from '@/components/ui'
import AdminNav from '@/components/AdminNav'

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
  if (Number.isNaN(d.getTime())) return ts
  return fmt.format(d)
}

export default function AdminHome() {
  const [s, setS] = useState<Status | null>(null)
  const [at, setAt] = useState<string>('')

  const load = async () => {
    const res = await fetch('/api/status', { cache: 'no-store' })
    setS(await res.json())
    setAt(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const classesUpdated = useMemo(() => formatTs(s?.lastUpdate.classes ?? null), [s])
  const sectionsUpdated = useMemo(() => formatTs(s?.lastUpdate.sections ?? null), [s])

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

        {s && s.counts.errors > 0 && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {s.counts.errors} error(s) detected. Check audit logs for details.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Database</div>
              <div className={`mt-1 text-2xl font-semibold ${s?.db.ok ? 'text-green-600' : 'text-red-600'}`}>
                {s?.db.ok ? 'Healthy' : 'Error'}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Latency: {s ? `${s.db.latencyMs} ms` : '—'}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Totals</div>
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-[15px]">
                <div>Classes</div>
                <div className="text-right font-medium">{s?.counts.classes ?? '—'}</div>
                <div>Sections</div>
                <div className="text-right font-medium">{s?.counts.sections ?? '—'}</div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Errors</div>
              <div className={`mt-1 text-2xl font-semibold ${s && s.counts.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {s ? s.counts.errors : '—'}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardBody>
              <div className="mb-2 text-sm text-gray-600">Auth</div>
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
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-2 text-sm text-gray-600">Environment</div>
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
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-gray-600">Last Updates</div>
                <div className="mt-2 space-y-1 text-[15px]">
                  <div>
                    Classes: <span className="font-medium">{classesUpdated}</span>
                  </div>
                  <div>
                    Sections: <span className="font-medium">{sectionsUpdated}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={load}>Refresh</Button>
                <span className="text-xs text-gray-500">as of {at || '—'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

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

// src/app/test/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { sbBrowser } from '@/lib/supabase-browser'

type Row = Record<string, unknown>

function pretty(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }
  return String(v)
}

export default function Test() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setStatus('loading')
      const sb = sbBrowser()
      const { data, error } = await sb.from('classes').select('*').limit(5)
      if (error) {
        setError(error.message)
        setStatus('error')
      } else {
        setRows(data ?? [])
        setStatus('success')
      }
    }
    run()
  }, [])

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Supabase Test Page</h1>

      {status === 'loading' && <p className="text-gray-500">Loading sample data…</p>}
      {status === 'error' && <p className="text-red-600">Error: {error}</p>}

      {status === 'success' && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left font-medium text-gray-700">
              <tr>
                {Object.keys(rows[0]).map((k) => (
                  <th key={k} className="border-b border-gray-200 px-3 py-2">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {Object.entries(r).map(([k, v]) => (
                    <td key={k} className="border-b border-gray-100 px-3 py-2 text-gray-800">
                      {pretty(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === 'success' && rows.length === 0 && (
        <p className="text-gray-500">No data in <code>classes</code>.</p>
      )}
    </main>
  )
}

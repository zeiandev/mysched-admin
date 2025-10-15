// src/app/test/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { sbBrowser } from '@/lib/supabase-browser'

export default function Test() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setStatus('loading')
      const sb = sbBrowser()
      const { data, error } = await sb.from('classes').select('*').limit(5)

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        setStatus('error')
      } else {
        console.log('Supabase data:', data)
        setRows(data || [])
        setStatus('success')
      }
    }
    run()
  }, [])

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Supabase Test Page</h1>

      {status === 'loading' && <p className="text-gray-500">Loading sample data…</p>}

      {status === 'error' && (
        <p className="text-red-600">Error fetching data: {error}</p>
      )}

      {status === 'success' && rows.length === 0 && (
        <p className="text-gray-500">No data found in <code>classes</code>.</p>
      )}

      {status === 'success' && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left font-medium text-gray-700">
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-3 py-2 border-b border-gray-200">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {Object.entries(r).map(([k, v]) => (
                    <td key={k} className="px-3 py-2 border-b border-gray-100 text-gray-800">
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

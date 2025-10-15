// src/app/login/page.tsx
'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const router = useRouter()
  const qs = useSearchParams()
  const reason = qs.get('reason') || null

  const sb = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)

    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      setErr(error.message)
      return
    }

    // sync tokens to HTTP-only cookies
    await fetch('/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'SIGNED_IN', session: data.session }),
    })

    // client redirect + server verify; hard reload fallback avoids SPA stalls
    router.replace('/admin')
    router.refresh()
    setTimeout(() => {
      if (typeof window !== 'undefined') window.location.href = '/admin'
    }, 50)
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, border: '1px solid #555' }}>
      <h1>Login</h1>
      {reason ? <p style={{ color: 'red' }}>Access denied: {reason}</p> : null}
      {err ? <p style={{ color: 'red' }}>{err}</p> : null}
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
          required
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}

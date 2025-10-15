'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const router = useRouter()
  const qs = useSearchParams()
  const reason = qs.get('reason')

  const sb = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createBrowserClient(url, anon)
  }, [])

  const subRef = useRef<ReturnType<typeof sb.auth.onAuthStateChange> | null>(null)
  useEffect(() => {
    subRef.current = sb.auth.onAuthStateChange(async (event, session) => {
      await fetch('/auth/callback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, session }) })
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') router.replace('/admin')
    })
    return () => subRef.current?.data.subscription.unsubscribe()
  }, [sb, router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    const { error } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr(error.message)
  }

  if (!mounted) return null

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, border: '1px solid #555' }}>
      <h1>Login</h1>
      {reason ? <p style={{ color: 'red' }}>Access denied: {reason}</p> : null}
      {err ? <p style={{ color: 'red' }}>{err}</p> : null}
      <form onSubmit={onSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" style={{ width: '100%', padding: 10, margin: '8px 0' }} required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" style={{ width: '100%', padding: 10, margin: '8px 0' }} required />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>{loading ? 'Signing in…' : 'Login'}</button>
      </form>
    </div>
  )
}

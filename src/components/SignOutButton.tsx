// src/components/SignOutButton.tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

type Props = {
  className?: string
  children?: React.ReactNode
  ariaLabel?: string
}

export default function SignOutButton({
  className = '',
  children = 'Logout',
  ariaLabel = 'Sign out',
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Memoize to avoid recreating the client on every render
  const sb = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  )

  async function handleSignOut() {
    if (loading) return
    setLoading(true)
    try {
      // Best-effort client sign-out
      await sb.auth.signOut().catch(() => {})

      // Clear server cookies
      await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
      }).catch(() => {})

      // Navigate and refresh server state. Hard reload fallback prevents SPA stalls.
      router.replace('/login')
      router.refresh()
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = '/login'
      }, 50)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      aria-label={ariaLabel}
      aria-busy={loading}
      disabled={loading}
      className={[
        // minimal white UI + focus ring
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium',
        'text-red-600 hover:text-red-700',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          Signing out…
        </span>
      ) : (
        children
      )}
    </button>
  )
}

// src/components/SignOutButton.tsx
'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return (
    <button
      onClick={async () => {
        await sb.auth.signOut()
        await fetch('/auth/callback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'SIGNED_OUT', session: null }) })
        router.replace('/login')
      }}
    >
      Sign out
    </button>
  )
}

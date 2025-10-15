// src/components/AdminNav.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sbBrowser } from '@/lib/supabase-browser'

export default function AdminNav() {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)

  useEffect(() => {
    const sb = sbBrowser()
    sb.auth.getUser().then(({ data }) => {
      const u = data?.user
      if (u) setUser({ email: u.email ?? undefined, name: u.user_metadata?.name ?? undefined })
    })
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-md"
          aria-label="Go to Dashboard"
        >
          <div className="h-6 w-6 rounded-lg bg-blue-600" />
          <span className="text-base font-semibold text-gray-900">MySched</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {user ? (
              <>Logged in as <span className="font-medium text-gray-900">{user.name || user.email}</span></>
            ) : (
              'Loading user...'
            )}
          </span>

          <form action="/api/logout" method="POST">
            <button
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Sign out"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

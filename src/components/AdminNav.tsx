// src/components/AdminNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { NavLink } from './ui'

export default function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const items = [
    { href: '/admin/classes', label: 'Classes', active: pathname.startsWith('/admin/classes') },
    { href: '/admin/sections', label: 'Sections', active: pathname.startsWith('/admin/sections') },
  ] as const

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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {items.map((it) => (
            <NavLink key={it.href} href={it.href} label={it.label} active={it.active} />
          ))}
          <form action="/api/logout" method="POST" className="ml-1">
            <button
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Sign out"
            >
              Logout
            </button>
          </form>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:hidden"
          aria-label="Toggle menu"
          aria-controls="admin-mobile-nav"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      <div
        id="admin-mobile-nav"
        className={`sm:hidden ${open ? 'block' : 'hidden'} border-t bg-white`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={it.active ? 'page' : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                it.active ? 'text-blue-700 bg-blue-50' : 'text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </Link>
          ))}
          <form action="/api/logout" method="POST">
            <button
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Sign out"
              onClick={() => setOpen(false)}
            >
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}

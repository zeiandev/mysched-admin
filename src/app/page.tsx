// src/app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 py-24">
        <div className="inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">MySched</h1>
        </div>

        <p className="text-center text-sm text-gray-600">
          Manage your classes and sections from a clean, minimal dashboard.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Go to Dashboard"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Admin Login"
          >
            Admin Login
          </Link>
        </div>

        <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/admin/classes"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Manage Classes"
          >
            Classes
          </Link>
          <Link
            href="/admin/sections"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Manage Sections"
          >
            Sections
          </Link>
        </div>
      </div>
    </main>
  )
}

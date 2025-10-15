'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLink } from './ui';

export default function AdminNav() {
  const p = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
        {/* Brand → always goes to /admin */}
        <Link href="/admin" className="flex items-center gap-2" aria-label="Go to Dashboard">
          <div className="h-6 w-6 rounded-lg bg-blue-600" />
          <span className="text-lg font-semibold">MySched</span>
        </Link>

        <nav className="flex gap-2">
          <NavLink href="/admin/classes" label="Classes" active={p.startsWith('/admin/classes')} />
          <NavLink href="/admin/sections" label="Sections" active={p.startsWith('/admin/sections')} />
          <form action="/api/logout" method="POST">
            <button className="px-3 py-2 text-sm text-red-600 hover:underline">Logout</button>
          </form>
        </nav>
      </div>
    </header>
  );
}

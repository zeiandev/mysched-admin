'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Error logging out. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <nav className="flex items-center gap-4 border-b bg-white px-6 py-3 text-sm text-gray-700">
      <div className="flex items-center gap-2 font-semibold text-[#0A2B52]">
        <div className="h-7 w-7 flex items-center justify-center rounded-md bg-[#0A2B52] text-white text-xs font-bold">
          MS
        </div>
        <span>MySched Admin</span>
      </div>

      <div className="flex gap-4 ml-6">
        <Link href="/dashboard" className="hover:text-[#0A2B52] transition">
          Dashboard
        </Link>
        <Link href="/sections" className="hover:text-[#0A2B52] transition">
          Sections
        </Link>
        <Link href="/classes" className="hover:text-[#0A2B52] transition">
          Classes
        </Link>
        <Link href="/admins" className="hover:text-[#0A2B52] transition">
          Admins
        </Link>
        <Link href="/audit" className="hover:text-[#0A2B52] transition">
          Audit
        </Link>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="ml-auto rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-[#0A2B52] hover:bg-gray-50 disabled:opacity-50 transition"
      >
        {loading ? 'Logging out…' : 'Logout'}
      </button>
    </nav>
  );
}

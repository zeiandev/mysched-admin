'use client';
import Link from 'next/link';

export default function Nav() {
  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }
  return (
    <nav className="border-b px-4 py-2 flex gap-4 items-center">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/sections">Sections</Link>
      <Link href="/classes">Classes</Link>
      <Link href="/admins">Admins</Link>
      <button onClick={logout} className="ml-auto border px-3 rounded">Logout</button>
    </nav>
  );
}

import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/components/Nav';

export default async function Dashboard() {
  const gate = await requireAdmin(); if (!gate.ok) redirect('/login');
  return (
    <>
      <Nav />
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <ul className="list-disc pl-6">
          <li><Link className="underline" href="/sections">Manage Sections</Link></li>
          <li><Link className="underline" href="/classes">Manage Classes</Link></li>
        </ul>
      </main>
    </>
  );
}

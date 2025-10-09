import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) return (
    <main className="p-6">
      <p>Not authorized. <a href="/login" className="underline">Login</a></p>
    </main>
  );

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <ul className="list-disc pl-6">
        <li><Link className="underline" href="/sections">Manage Sections</Link></li>
        <li><Link className="underline" href="/classes">Manage Classes</Link></li>
      </ul>
    </main>
  );
}

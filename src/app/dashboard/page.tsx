import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Nav from '../../components/Nav';
import Link from 'next/link';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  return (
    <>
      <Nav />
      <main className="p-6 space-y-4 max-w-3xl">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">
          Manage schedules, sections, administrators, and review activity logs.
        </p>

        <ul className="list-disc pl-6 space-y-1">
          <li>
            <Link className="underline" href="/sections">
              Manage Sections
            </Link>
          </li>
          <li>
            <Link className="underline" href="/classes">
              Manage Classes
            </Link>
          </li>
          <li>
            <Link className="underline" href="/classes/grid">
              Timetable Grid View
            </Link>
          </li>
          <li>
            <Link className="underline" href="/admins">
              Manage Admins
            </Link>
          </li>
          <li>
            <Link className="underline" href="/audit">
              Audit Log
            </Link>
          </li>
        </ul>
      </main>
    </>
  );
}

import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center px-6 py-10">
      {/* Header */}
      <header className="w-full max-w-2xl flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage schedules, sections, and administrators.
          </p>
        </div>

        {/* Logout posts to /api/logout */}
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-[14px] font-medium bg-[#0A2B52] text-white hover:opacity-90 active:scale-[.98] transition"
          >
            Logout
          </button>
        </form>
      </header>

      {/* Quick access card */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Quick Access</h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/sections"
            className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-medium text-[#0A2B52] mb-1">Manage Sections</h3>
            <p className="text-sm text-gray-500">Add or edit academic sections.</p>
          </Link>

          <Link
            href="/classes"
            className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-medium text-[#0A2B52] mb-1">Manage Classes</h3>
            <p className="text-sm text-gray-500">Edit class details and schedules.</p>
          </Link>

          <Link
            href="/classes/grid"
            className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-medium text-[#0A2B52] mb-1">Timetable Grid View</h3>
            <p className="text-sm text-gray-500">View all classes visually by day.</p>
          </Link>

          <Link
            href="/admins"
            className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-medium text-[#0A2B52] mb-1">Manage Admins</h3>
            <p className="text-sm text-gray-500">Add or remove admin accounts.</p>
          </Link>

          <Link
            href="/audit"
            className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition sm:col-span-2"
          >
            <h3 className="font-medium text-[#0A2B52] mb-1">Audit Log</h3>
            <p className="text-sm text-gray-500">Review system activity and changes.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}

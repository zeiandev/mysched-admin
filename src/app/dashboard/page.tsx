// src/app/dashboard/page.tsx
import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/audit" className="text-sm text-[#0A2B52] hover:underline">
              Audit Log
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* Quick Access */}
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Quick Access</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard href="/sections" title="Sections" desc="Manage academic sections">
              <IconBook />
            </ActionCard>
            <ActionCard href="/classes" title="Classes" desc="Manage schedules and details">
              <IconCalendar />
            </ActionCard>
            <ActionCard href="/classes/grid" title="Grid View" desc="View timetable layout">
              <IconGrid />
            </ActionCard>
            <ActionCard href="/admins" title="Admins" desc="Manage admin accounts">
              <IconUsers />
            </ActionCard>
          </div>
        </section>

        {/* Info */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <h3 className="text-base font-semibold mb-2">Guidelines</h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>• Use <span className="font-medium">Classes → Import</span> for bulk uploads</li>
              <li>• Check the <Link href="/audit" className="text-[#0A2B52] underline">Audit Log</Link> after edits</li>
              <li>• All updates auto-track timestamps for consistency</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-base font-semibold mb-3">System Info</h3>
            <div className="space-y-2 text-sm">
              <Row label="Status">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Online
                </span>
              </Row>
              <Row label="Security">RLS, CSP, Sentry</Row>
              <Row label="Environment">Production</Row>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

/* ---------- Components ---------- */
function ActionCard({
  href,
  title,
  desc,
  children,
}: {
  href: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-200 bg-white p-5 hover:shadow-sm hover:border-gray-300 transition"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700">
        {children}
      </div>
      <h3 className="font-medium text-[#0A2B52]">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </Link>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-gray-200 bg-white p-5 ${className}`}>{children}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-800">{children}</span>
    </div>
  );
}

/* ---------- Icons ---------- */
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M7 7h7" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

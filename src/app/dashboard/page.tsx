import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <div className="border-b">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2B52] text-white font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/audit"
              className="text-sm text-[#0A2B52] hover:underline"
            >
              Audit log
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Quick actions */}
        <section>
          <h2 className="text-sm font-medium text-gray-600 mb-3">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard href="/sections" title="Manage Sections" desc="Create or edit sections">
              <IconBook />
            </ActionCard>
            <ActionCard href="/classes" title="Manage Classes" desc="Add or edit classes">
              <IconCalendar />
            </ActionCard>
            <ActionCard href="/classes/grid" title="Timetable Grid" desc="Visual weekly view">
              <IconGrid />
            </ActionCard>
            <ActionCard href="/admins" title="Manage Admins" desc="Add or remove admins">
              <IconUsers />
            </ActionCard>
          </div>
        </section>

        {/* Guidance / links */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold mb-2">Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Dot /> Use <span className="mx-1 font-medium">Classes → Import</span> for CSV/JSON uploads.
                </li>
                <li className="flex items-start gap-2">
                  <Dot /> Check <Link href="/audit" className="text-[#0A2B52] underline">Audit Log</Link> after bulk edits.
                </li>
                <li className="flex items-start gap-2">
                  <Dot /> Edits auto-track <span className="mx-1 font-medium">created_at</span> and <span className="mx-1 font-medium">updated_at</span>.
                </li>
              </ul>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold mb-3">System</h3>
              <div className="space-y-3 text-sm">
                <Row label="Status">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" /> Healthy
                  </span>
                </Row>
                <Row label="Security">
                  CSP, RLS, Sentry
                </Row>
                <Row label="Shortcuts">
                  <div className="flex flex-wrap gap-2">
                    <Chip href="/classes">Classes</Chip>
                    <Chip href="/sections">Sections</Chip>
                    <Chip href="/admins">Admins</Chip>
                    <Chip href="/audit">Audit</Chip>
                  </div>
                </Row>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- UI bits (no extra deps) ---------- */

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
      className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {children}
      </div>
      <div className="font-medium text-[#0A2B52]">{title}</div>
      <div className="text-sm text-gray-500">{desc}</div>
      <div className="mt-3 text-xs text-[#0A2B52] opacity-0 transition group-hover:opacity-100">
        Open →
      </div>
    </Link>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-800">{children}</div>
    </div>
  );
}

function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

function Dot() {
  return <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />;
}

/* ---------- minimal inline icons ---------- */

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

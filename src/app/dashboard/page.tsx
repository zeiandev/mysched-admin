import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  return (
    <main className="min-h-screen bg-[url('/bg-pattern.svg')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-md bg-white/50" />

      <div className="relative z-10 flex flex-col min-h-screen text-gray-900">
        {/* Header */}
        <header className="border-b border-white/30 bg-white/40 backdrop-blur-xl sticky top-0">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0A2B52]/80 text-white flex items-center justify-center font-bold">
                MS
              </div>
              <h1 className="text-lg font-semibold tracking-tight">MySched Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/audit"
                className="text-sm text-[#0A2B52] hover:underline"
              >
                Audit Log
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
          {/* Quick Access */}
          <section>
            <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">
              Quick Access
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard href="/sections" title="Sections" desc="Manage academic sections">
                <IconBook />
              </GlassCard>
              <GlassCard href="/classes" title="Classes" desc="Edit schedules and details">
                <IconCalendar />
              </GlassCard>
              <GlassCard href="/classes/grid" title="Grid View" desc="Visualize timetable">
                <IconGrid />
              </GlassCard>
              <GlassCard href="/admins" title="Admins" desc="Manage admin accounts">
                <IconUsers />
              </GlassCard>
            </div>
          </section>

          {/* Info Section */}
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <GlassPanel>
                <h3 className="text-base font-semibold mb-2">System Overview</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><Dot /> All changes logged to Audit Log</li>
                  <li><Dot /> Auto tracks created_at / updated_at</li>
                  <li><Dot /> Secure server-only admin access</li>
                </ul>
              </GlassPanel>
            </div>
            <div>
              <GlassPanel>
                <h3 className="text-base font-semibold mb-3">Status</h3>
                <div className="space-y-3 text-sm">
                  <Row label="App">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> Online
                    </span>
                  </Row>
                  <Row label="Security">RLS + CSP + Sentry</Row>
                  <Row label="Env">Production</Row>
                </div>
              </GlassPanel>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------- components ---------- */
function GlassCard({ href, title, desc, children }: any) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl 
      hover:bg-white/60 hover:shadow-md transition transform hover:-translate-y-0.5 p-5"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-gray-700">
        {children}
      </div>
      <h3 className="font-medium text-[#0A2B52]">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </Link>
  );
}

function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-5">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800">{children}</span>
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 mr-1" />;
}

/* ---------- icons ---------- */
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

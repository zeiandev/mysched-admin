// src/app/dashboard/page.tsx
import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';

export default async function Dashboard() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  return (
    <main className="relative min-h-screen text-gray-900 antialiased">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,#c7d2fe_10%,transparent_40%),radial-gradient(1000px_500px_at_110%_10%,#bae6fd_10%,transparent_40%),radial-gradient(800px_400px_at_50%_120%,#fde68a_10%,transparent_40%)]" />
        <div className="absolute inset-0 animate-slow-breathe bg-[radial-gradient(900px_500px_at_-10%_110%,#e9d5ff_12%,transparent_45%),radial-gradient(700px_400px_at_120%_90%,#fbcfe8_12%,transparent_45%)] mix-blend-soft-light" />
      </div>

      {/* Frost overlay */}
      <div className="absolute inset-0 -z-10 backdrop-blur-2xl bg-white/50" />

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A2B52] to-[#1d4d7a] text-white text-sm font-bold shadow-sm">
              MS
            </div>
            <h1 className="text-[15px] font-semibold tracking-tight">MySched Admin</h1>
          </div>
          <nav className="flex items-center gap-3">
            <NavChip href="/audit" label="Audit Log" />
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Hero strip */}
        <div className="mb-8 rounded-3xl border border-white/40 bg-white/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600/90">Overview</p>
              <p className="mt-0.5 text-[22px] font-semibold leading-tight">Manage schedules with clarity</p>
            </div>
            <div className="flex gap-2">
              <Pill href="/classes">Classes</Pill>
              <Pill href="/sections">Sections</Pill>
              <Pill href="/admins">Admins</Pill>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-700/90">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard href="/sections" title="Sections" desc="Create and edit sections">
              <IconBook />
            </GlassCard>
            <GlassCard href="/classes" title="Classes" desc="Manage schedule entries">
              <IconCalendar />
            </GlassCard>
            <GlassCard href="/classes/grid" title="Grid View" desc="Weekly visual timetable">
              <IconGrid />
            </GlassCard>
            <GlassCard href="/admins" title="Admins" desc="Add or remove admins">
              <IconUsers />
            </GlassCard>
          </div>
        </section>

        {/* Status + Tips */}
        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <GlassPanel className="lg:col-span-2">
            <h3 className="mb-2 text-base font-semibold">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <Tip>Use <span className="font-medium text-gray-900">Classes → Import</span> for CSV/JSON bulk adds.</Tip>
              <Tip>Check <Link href="/audit" className="underline decoration-[#0A2B52]/40 underline-offset-4">Audit Log</Link> after bulk edits.</Tip>
              <Tip>Edits auto-update <span className="font-medium text-gray-900">updated_at</span> for traceability.</Tip>
            </ul>
          </GlassPanel>

          <GlassPanel>
            <h3 className="mb-3 text-base font-semibold">System</h3>
            <KeyVal k="Status">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Healthy
              </span>
            </KeyVal>
            <KeyVal k="Security">RLS · CSP · Sentry</KeyVal>
            <KeyVal k="Actions">
              <div className="flex flex-wrap gap-2">
                <Micro href="/classes">Classes</Micro>
                <Micro href="/sections">Sections</Micro>
                <Micro href="/admins">Admins</Micro>
                <Micro href="/audit">Audit</Micro>
              </div>
            </KeyVal>
          </GlassPanel>
        </section>
      </div>

      {/* Smoothness helpers */}
      <style jsx global>{`
        @keyframes slow-breathe {
          0%   { transform: translate3d(0,0,0) scale(1);    opacity: .9; }
          50%  { transform: translate3d(0,-10px,0) scale(1.02); opacity: 1; }
          100% { transform: translate3d(0,0,0) scale(1);    opacity: .9; }
        }
        .animate-slow-breathe { animation: slow-breathe 18s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-slow-breathe { animation: none; }
        }
      `}</style>
    </main>
  );
}

/* ---------- pieces ---------- */

function GlassCard({
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
      className="group rounded-3xl border border-white/40 bg-white/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-md"
    >
      <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-gray-700 shadow-sm">
        {children}
      </div>
      <div className="font-medium text-[#0A2B52]">{title}</div>
      <p className="text-sm text-gray-600">{desc}</p>
      <div className="mt-3 text-xs text-[#0A2B52] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Open →
      </div>
    </Link>
  );
}

function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/40 bg-white/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
      <span>{children}</span>
    </li>
  );
}

function KeyVal({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-600">{k}</span>
      <span className="text-gray-900">{children}</span>
    </div>
  );
}

function NavChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/40 bg-white/50 px-3 py-1.5 text-xs text-[#0A2B52] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl transition hover:bg-white/70"
    >
      {label}
    </Link>
  );
}

function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/40 bg-white/60 px-3 py-1.5 text-xs text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl transition hover:bg-white/80"
    >
      {children}
    </Link>
  );
}

/* ---------- icons (inline, no deps) ---------- */

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M7 7h7" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../lib/supabase/server';
import Link from 'next/link';
import SectionsClient from './sections-client';

type Section = { id: number; code: string };

export default async function SectionsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();
  const { data } = await s.from('sections').select('id, code').order('id');
  const sections: Section[] = (data ?? []) as Section[];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">MS</div>
            <h1 className="text-lg font-semibold tracking-tight">Manage Sections</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-[#0A2B52] hover:underline">Back to Dashboard</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <SectionsClient initial={sections} />
      </div>
    </main>
  );
}

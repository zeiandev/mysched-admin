import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../lib/supabase/server';
import Link from 'next/link';
import ClassesClient from './classes-client';

type Section = { id: number; code: string };
type DbClass = {
  id: number;
  section_id: number;
  day: any;
  start: string;
  end: string;
  code: string | null;
  title: string;
  units: any;
  room: string | null;
  instructor: string | null;
};

export default async function ClassesPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();

  const { data: sectionsData } = await s
    .from('sections')
    .select('id, code')
    .order('id');

  const sections: Section[] = (sectionsData ?? []) as Section[];
  const activeSectionId = sections[0]?.id ?? null;

  let classesClean: any[] = [];
  if (activeSectionId) {
    const { data } = await s
      .from('classes')
      .select(
        'id, section_id, day, start, end, code, title, units, room, instructor'
      )
      .eq('section_id', activeSectionId)
      .order('id');

    const raw = (data ?? []) as DbClass[];
    classesClean = raw.map((r) => ({
      ...r,
      day: Number(r.day),
      units: r.units == null ? null : Number(r.units),
    }));
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              Manage Classes
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm text-[#0A2B52] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold">Classes</h2>
          <Link className="underline text-sm text-[#0A2B52]" href="/classes/import">
            Import CSV
          </Link>
          <Link className="underline text-sm text-[#0A2B52]" href="/classes/grid">
            Grid View
          </Link>
        </div>

        <ClassesClient
          sections={sections}
          initialSectionId={activeSectionId}
          initialClasses={classesClean}
        />
      </div>
    </main>
  );
}

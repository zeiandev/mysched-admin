import { requireAdmin } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../lib/supabase/server';
import Nav from '../../components/Nav';
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
    <>
      <Nav />
      <main className="p-6 max-w-5xl">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-semibold">Classes</h1>
          <Link className="underline text-sm" href="/classes/import">
            Import CSV
          </Link>
          <Link className="underline text-sm" href="/classes/grid">
            Grid View
          </Link>
        </div>

        <ClassesClient
          sections={sections}
          initialSectionId={activeSectionId}
          initialClasses={classesClean}
        />
      </main>
    </>
  );
}

import { redirect } from 'next/navigation';
import { requireAdmin } from '../../../lib/auth';
import { supaServer } from '../../../lib/supabase/server';
import GridClient from './grid-client';
import Link from 'next/link';

type Section = { id: number; code: string };
type DbClass = {
  id: number;
  section_id: number;
  day: any;
  start: string;
  end: string;
  code: string | null;
  title: string;
  room: string | null;
  instructor: string | null;
};

/** Must match Row in grid-client.tsx */
type GridRow = {
  id: number;
  section_id: number;
  day: number;
  start: string;
  end: string;
  title: string;
  code: string | null;
  room: string | null;
  instructor: string | null;
};

export default async function GridPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();

  // load sections
  const { data: sectionsData } = await s
    .from('sections')
    .select('id, code')
    .order('id');

  const sections: Section[] = (sectionsData ?? []) as Section[];

  // pick first section for initial load
  const initialSectionId: number | null =
    sections.length > 0 ? sections[0].id : null;

  let initial: GridRow[] = [];
  if (initialSectionId !== null) {
    const { data } = await s
      .from('classes')
      .select('id, section_id, day, start, end, code, title, room, instructor')
      .eq('section_id', initialSectionId)
      .order('day, start, id');

    const raw = (data ?? []) as DbClass[];
    initial = raw.map((r) => ({
      id: r.id,
      section_id: r.section_id,
      day: Number(r.day),
      start: r.start,
      end: r.end,
      title: r.title,
      code: r.code,
      room: r.room,
      instructor: r.instructor,
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
              Timetable Grid
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm text-[#0A2B52] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <GridClient
        sections={sections}
        initialSectionId={initialSectionId}
        initial={initial}
      />
    </main>
  );
}

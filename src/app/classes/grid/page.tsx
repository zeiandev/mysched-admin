import { requireAdmin } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import { supaServer } from '../../../lib/supabase/server';
import Nav from '../../../components/Nav';
import GridClient from './grid-client';

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

  const { data: sectionsData } = await s
    .from('sections')
    .select('id, code')
    .order('id');

  const sections: Section[] = (sectionsData ?? []) as Section[];

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
    <>
      <Nav />
      <GridClient
        sections={sections}
        initialSectionId={initialSectionId}
        initial={initial}
      />
    </>
  );
}

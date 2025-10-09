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

export default async function GridPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect('/login');

  const s = supaServer();

  const { data: sectionsData } = await s
    .from('sections')
    .select('id, code')
    .order('id');

  // Force to a non-null array
  const sections: Section[] = Array.isArray(sectionsData)
    ? (sectionsData as Section[])
    : [];

  // Safe first ID
  const first = sections.length > 0 ? sections[0] : undefined;
  const initialSectionId: number | null = first ? first.id : null;

  let initial: { [k: string]: any }[] = [];
  if (initialSectionId !== null) {
    const { data } = await s
      .from('classes')
      .select(
        'id, section_id, day, start, end, code, title, room, instructor'
      )
      .eq('section_id', initialSectionId)
      .order('day, start, id');

    const raw = (Array.isArray(data) ? data : []) as DbClass[];
    initial = raw.map((r) => ({ ...r, day: Number(r.day) }));
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

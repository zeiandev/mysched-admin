import { notFound } from 'next/navigation';
import { supaServer } from '../../../lib/supabase/server';
import Link from 'next/link';
import ViewGridClient from './view-grid-client';

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

export default async function SectionView({
  params,
}: {
  params: { code: string };
}) {
  const s = supaServer();

  // find section by code (case-insensitive)
  const { data: sec, error: secErr } = await s
    .from('sections')
    .select('id, code')
    .ilike('code', params.code)
    .maybeSingle();

  if (secErr || !sec) notFound();

  const section = sec as Section;

  // get classes for this section
  const { data, error } = await s
    .from('classes')
    .select(
      'id, section_id, day, start, end, code, title, room, instructor'
    )
    .eq('section_id', section.id)
    .order('day, start, id');

  if (error) console.error('Failed to load classes:', error.message);

  const rows =
    (data ?? []).map((r: DbClass) => ({
      id: r.id,
      section_id: r.section_id,
      day: Number(r.day),
      start: r.start,
      end: r.end,
      title: r.title,
      code: r.code,
      room: r.room,
      instructor: r.instructor,
    })) ?? [];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              Timetable — {section.code}
            </h1>
          </div>
          <Link href="/view" className="text-sm text-[#0A2B52] hover:underline">
            All Sections
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <ViewGridClient initial={rows} />
      </div>
    </main>
  );
}

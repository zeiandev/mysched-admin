import { supaServer } from '../../lib/supabase/server';
import Link from 'next/link';

type Section = { id:number; code:string };

export default async function ViewIndex() {
  const s = supaServer();
  const { data = [] } = await s.from('sections').select('id, code').order('code');
  const sections = data as Section[];

  return (
    <main className="p-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Schedules</h1>
      <p className="text-sm opacity-80">Select a section to view its timetable.</p>
      <ul className="list-disc pl-6 space-y-1">
        {sections.map(sec => (
          <li key={sec.id}>
            <Link className="underline" href={`/view/${encodeURIComponent(sec.code)}`}>
              {sec.code}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

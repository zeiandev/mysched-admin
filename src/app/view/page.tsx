import { supaServer } from '../../lib/supabase/server';
import Link from 'next/link';

type Section = { id: number; code: string };

export default async function ViewIndex() {
  const s = supaServer();

  const { data, error } = await s
    .from('sections')
    .select('id, code')
    .order('code');

  if (error) console.error('Failed to load sections:', error.message);

  const sections: Section[] = (data ?? []) as Section[];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0A2B52] text-white flex items-center justify-center font-bold">
              MS
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              View Schedules
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm text-[#0A2B52] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">All Sections</h2>
          <p className="text-sm text-gray-600">
            Select a section below to view its full timetable.
          </p>
        </div>

        {sections.length === 0 ? (
          <p className="text-gray-500 text-sm border rounded-md p-4 bg-white shadow-sm">
            No sections found. Please add sections in the admin panel.
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {sections.map((sec) => (
              <li key={sec.id}>
                <Link
                  href={`/view/${encodeURIComponent(sec.code)}`}
                  className="block rounded-md border border-gray-200 bg-white px-4 py-3 text-[#0A2B52] font-medium hover:shadow-sm hover:border-gray-300 transition"
                >
                  {sec.code}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

type Section = { id: number; code: string };
type Row = {
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

const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export default function GridClient({
  sections,
  initialSectionId,
  initial,
}: {
  sections: Section[];
  initialSectionId: number | null;
  initial: Row[];
}) {
  const [sectionId, setSectionId] = useState<number | ''>(
    initialSectionId ?? ''
  );
  const [rows, setRows] = useState<Row[]>(initial ?? []);
  const [ppm, setPpm] = useState(2); // pixels per minute (zoom)
  const [loading, setLoading] = useState(false);

  // reload classes when section changes
  useEffect(() => {
    if (!sectionId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supa()
        .from('classes')
        .select(
          'id, section_id, day, start, end, code, title, room, instructor'
        )
        .eq('section_id', Number(sectionId))
        .order('day, start, id');
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      setRows(
        (data ?? []).map((r: any) => ({ ...r, day: Number(r.day) })) as Row[]
      );
      setLoading(false);
    })();
  }, [sectionId]);

  // time grid config
  const startMin = 7 * 60; // 07:00
  const endMin = 20 * 60; // 20:00
  const slotMin = 30;

  // group by day
  const byDay = useMemo(() => {
    const map: Record<number, Row[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    rows.forEach((r) => map[r.day]?.push(r));
    Object.values(map).forEach((list) =>
      list.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    );
    return map;
  }, [rows]);

  return (
    <main className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-semibold">Timetable</h2>

        <div className="flex items-center gap-2">
          <span>Section:</span>
          <select
            className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400"
            value={sectionId}
            onChange={(e) =>
              setSectionId(e.target.value ? Number(e.target.value) : '')
            }
          >
            {!sectionId && <option value="">Select section</option>}
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>

          <label className="ml-4 text-sm flex items-center gap-2">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.5}
              value={ppm}
              onChange={(e) => setPpm(Number(e.target.value))}
            />
            <span>{ppm}×</span>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading schedule...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="min-w-[900px]">
            {/* Hour header */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `120px repeat(${(endMin - startMin) / slotMin}, 1fr)`,
              }}
            >
              <div></div>
              {Array.from({ length: (endMin - startMin) / slotMin }).map(
                (_, i) => {
                  const m = startMin + i * slotMin;
                  const h = String(Math.floor(m / 60)).padStart(2, '0');
                  const mm = String(m % 60).padStart(2, '0');
                  return (
                    <div
                      key={i}
                      className="text-[11px] text-center border-b border-l py-1 text-gray-600"
                    >
                      {h}:{mm}
                    </div>
                  );
                }
              )}
            </div>

            {/* Per-day rows */}
            {([1, 2, 3, 4, 5, 6, 7] as const).map((d) => (
              <div
                key={d}
                className="relative grid"
                style={{ gridTemplateColumns: `120px 1fr` }}
              >
                <div className="border-b py-8 pr-2 text-right font-medium text-gray-700">
                  {days[d]}
                </div>

                <div className="relative border-b">
                  {/* Slot grid */}
                  <div
                    className="absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${(endMin - startMin) / slotMin}, 1fr)`,
                    }}
                  >
                    {Array.from({
                      length: (endMin - startMin) / slotMin,
                    }).map((_, i) => (
                      <div
                        key={i}
                        className="border-l last:border-r border-dashed opacity-20"
                      ></div>
                    ))}
                  </div>

                  {/* Events */}
                  <div
                    className="relative"
                    style={{ height: `${(endMin - startMin) * ppm}px` }}
                  >
                    {byDay[d].map((ev) => {
                      const s = clamp(toMinutes(ev.start), startMin, endMin);
                      const e = clamp(toMinutes(ev.end), startMin, endMin);
                      const top = (s - startMin) * ppm;
                      const height = Math.max(32, (e - s) * ppm);
                      return (
                        <div
                          key={ev.id}
                          className="absolute left-2 right-2 border rounded-md bg-gray-50 p-2 text-xs shadow-sm hover:shadow-md transition"
                          style={{
                            top,
                            height,
                          }}
                          title={`${ev.title} (${ev.start}-${ev.end})`}
                        >
                          <div className="font-semibold truncate text-[#0A2B52]">
                            {ev.title}
                          </div>
                          <div className="truncate text-gray-700">
                            {ev.code ?? ''} {ev.room ? `• ${ev.room}` : ''}
                          </div>
                          <div className="text-gray-500 truncate">
                            {ev.start}–{ev.end} {ev.instructor ?? ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

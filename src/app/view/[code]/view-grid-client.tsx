'use client';

import { useMemo } from 'react';

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

export default function ViewGridClient({ initial }: { initial: Row[] }) {
  const startMin = 7 * 60; // 07:00
  const endMin = 20 * 60; // 20:00
  const slotMin = 30;
  const PPM = 2; // pixels per minute (zoom)

  const byDay = useMemo(() => {
    const map: Record<number, Row[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };
    initial.forEach((r) => map[r.day]?.push(r));
    Object.values(map).forEach((list) =>
      list.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    );
    return map;
  }, [initial]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="min-w-[900px]">
        {/* Hour header */}
        <div
          className="grid sticky top-0 bg-gray-50 z-10"
          style={{
            gridTemplateColumns: `120px repeat(${(endMin - startMin) / slotMin}, 1fr)`,
          }}
        >
          <div></div>
          {Array.from({ length: (endMin - startMin) / slotMin }).map((_, i) => {
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
          })}
        </div>

        {/* Per-day schedule */}
        {([1, 2, 3, 4, 5, 6, 7] as const).map((d) => (
          <div
            key={d}
            className="relative grid"
            style={{ gridTemplateColumns: `120px 1fr` }}
          >
            <div className="border-b py-8 pr-2 text-right font-medium text-gray-700">
              {days[d]}
            </div>

            <div className="relative border-b bg-gray-50/40">
              {/* Background slot grid */}
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
                style={{ height: `${(endMin - startMin) * PPM}px` }}
              >
                {byDay[d].map((ev) => {
                  const s = clamp(toMinutes(ev.start), startMin, endMin);
                  const e = clamp(toMinutes(ev.end), startMin, endMin);
                  const top = (s - startMin) * PPM;
                  const height = Math.max(32, (e - s) * PPM);
                  return (
                    <div
                      key={ev.id}
                      className="absolute left-2 right-2 border rounded-md bg-white p-2 text-xs shadow-sm hover:shadow-md transition"
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
  );
}

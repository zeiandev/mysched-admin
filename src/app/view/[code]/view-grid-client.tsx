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
  const PPM = 2; // fixed zoom for public view

  const byDay = useMemo(() => {
    const map: Record<number, Row[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    initial.forEach((r) => map[r.day]?.push(r));
    Object.values(map).forEach((list) =>
      list.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    );
    return map;
  }, [initial]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* hour header */}
        <div
          className="grid"
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
                className="text-xs text-center border-b border-l py-1"
              >
                {h}:{mm}
              </div>
            );
          })}
        </div>

        {/* per-day tracks */}
        {([1, 2, 3, 4, 5, 6, 7] as const).map((d) => (
          <div
            key={d}
            className="relative grid"
            style={{ gridTemplateColumns: `120px 1fr` }}
          >
            <div className="border-b py-8 pr-2 text-right font-medium">
              {days[d]}
            </div>

            <div className="relative border-b">
              {/* slot grid */}
              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${(endMin - startMin) / slotMin}, 1fr)`,
                }}
              >
                {Array.from({ length: (endMin - startMin) / slotMin }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="border-l last:border-r border-dashed opacity-30"
                    ></div>
                  )
                )}
              </div>

              {/* events */}
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
                      className="absolute left-2 right-2 border rounded p-2 text-xs bg-white"
                      style={{
                        top,
                        height,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      }}
                      title={`${ev.title} (${ev.start}-${ev.end})`}
                    >
                      <div className="font-semibold truncate">{ev.title}</div>
                      <div className="truncate">
                        {ev.code ?? ''} {ev.room ? `• ${ev.room}` : ''}
                      </div>
                      <div className="opacity-70 truncate">
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

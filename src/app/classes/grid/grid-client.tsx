'use client';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supa = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Section = { id:number; code:string };
type Row = {
  id:number; section_id:number; day:number; start:string; end:string;
  title:string; code:string|null; room:string|null; instructor:string|null;
};

// helpers
const days = ['', 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;
function toMinutes(t: string) { const [h,m] = t.split(':').map(Number); return h*60 + m; }
function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max, n)); }

export default function GridClient({
  sections, initialSectionId, initial
}: { sections: Section[]; initialSectionId: number|null; initial: Row[] }) {

  const [sectionId, setSectionId] = useState<number | ''>(initialSectionId ?? '');
  const [rows, setRows] = useState<Row[]>(initial ?? []);

  // load classes on section change
  useEffect(() => {
    if (!sectionId) return;
    (async () => {
      const { data, error } = await supa()
        .from('classes')
        .select('id, section_id, day, start, end, code, title, room, instructor')
        .eq('section_id', Number(sectionId))
        .order('day, start, id');
      if (error) return alert(error.message);
      setRows((data ?? []).map((r:any)=>({ ...r, day: Number(r.day) })) as Row[]);
    })();
  }, [sectionId]);

  // grid settings
  const startMin = 7*60;   // 07:00
  const endMin   = 20*60;  // 20:00
  const slotMin  = 30;

  // group by day
  const byDay = useMemo(() => {
    const map: Record<number, Row[]> = {1:[],2:[],3:[],4:[],5:[],6:[],7:[]};
    rows.forEach(r => map[r.day]?.push(r));
    Object.values(map).forEach(list => list.sort((a,b)=>toMinutes(a.start)-toMinutes(b.start)));
    return map;
  }, [rows]);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Timetable Grid</h1>

      <div className="flex gap-2 items-center">
        <span>Section:</span>
        <select
          className="border rounded p-2"
          value={sectionId}
          onChange={e=>setSectionId(e.target.value ? Number(e.target.value) : '')}
        >
          {!sectionId && <option value="">Select section</option>}
          {sections.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
        </select>
        <a className="underline ml-4" href="/classes">Back to Classes</a>
      </div>

      {/* header hours */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${(endMin-startMin)/slotMin}, 1fr)` }}>
            {/* top-left empty cell */}
            <div></div>
            {Array.from({length:(endMin-startMin)/slotMin}).map((_,i)=>{
              const m = startMin + i*slotMin;
              const h = Math.floor(m/60).toString().padStart(2,'0');
              const mm = (m%60).toString().padStart(2,'0');
              return <div key={i} className="text-xs text-center border-b border-l py-1">{h}:{mm}</div>;
            })}
          </div>

          {/* rows per day */}
          {([1,2,3,4,5,6,7] as const).map(d => (
            <div key={d} className="relative grid" style={{ gridTemplateColumns: `120px 1fr` }}>
              {/* day label */}
              <div className="border-b py-8 pr-2 text-right font-medium">{days[d]}</div>

              {/* track */}
              <div className="relative border-b">
                {/* background slot lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${(endMin-startMin)/slotMin}, 1fr)` }}>
                  {Array.from({length:(endMin-startMin)/slotMin}).map((_,i)=>(
                    <div key={i} className="border-l last:border-r border-dashed opacity-30"></div>
                  ))}
                </div>

                {/* events */}
                <div className="relative" style={{ height: `${(endMin-startMin)}px` }}>
                  {byDay[d].map(ev => {
                    const s = clamp(toMinutes(ev.start), startMin, endMin);
                    const e = clamp(toMinutes(ev.end),   startMin, endMin);
                    const top = s - startMin;
                    const height = Math.max(24, e - s); // min height
                    return (
                      <div
                        key={ev.id}
                        className="absolute left-2 right-2 border rounded p-2 text-xs bg-white"
                        style={{ top, height, boxShadow:'0 1px 3px rgba(0,0,0,0.12)' }}
                        title={`${ev.title} (${ev.start}-${ev.end})`}
                      >
                        <div className="font-semibold truncate">{ev.title}</div>
                        <div className="truncate">{ev.code ?? ''} {ev.room ? `• ${ev.room}` : ''}</div>
                        <div className="opacity-70 truncate">{ev.start}–{ev.end} {ev.instructor ?? ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

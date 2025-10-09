'use client';
import { useState } from 'react';

type Section = { id:number; code:string };
type Row = { day:string; start:string; end:string; code?:string; title:string; units?:string; room?:string; instructor?:string };

export default function ImportClient({ sections }: { sections: Section[] }) {
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [csvText, setCsvText] = useState('');
  const [status, setStatus] = useState<string>('');

  function parseCsv(text: string): Row[] {
    // very small CSV parser: header-based, comma-separated, no quotes escaping
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const obj: any = {};
      headers.forEach((h, i) => obj[h] = cols[i] ?? '');
      return obj as Row;
    });
  }

  async function submit() {
    if (!sectionId) return alert('Pick a section');
    const rows = parseCsv(csvText);
    if (!rows.length) return alert('No rows parsed');

    // basic client validation
    for (const r of rows) {
      if (!/^[1-7]$/.test(String(r.day))) return alert('Invalid day in some row');
      if (!/^\d{1,2}:\d{2}/.test(String(r.start)) || !/^\d{1,2}:\d{2}/.test(String(r.end)))
        return alert('Invalid time in some row');
      if (!r.title) return alert('Missing title in some row');
    }

    setStatus('Uploading...');
    const res = await fetch('/api/classes/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: Number(sectionId), rows })
    });
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      setStatus(`Error: ${j.error ?? res.statusText}`);
    } else {
      setStatus('Done. Go to /classes to verify.');
    }
  }

  return (
    <main className="p-6 space-y-4 max-w-4xl">
      <h1 className="text-xl font-semibold">Import Classes (CSV)</h1>
      <div className="flex gap-2 items-center">
        <span>Section:</span>
        <select className="border rounded p-2" value={sectionId} onChange={e=>setSectionId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Select section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
        </select>
      </div>

      <p className="text-sm">CSV headers required: <code>day,start,end,code,title,units,room,instructor</code></p>
      <textarea
        className="border rounded p-2 w-full h-64 font-mono"
        placeholder="day,start,end,code,title,units,room,instructor&#10;1,08:00,09:00,CS101,Intro to CS,3,LAB A,Prof X"
        value={csvText}
        onChange={e=>setCsvText(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="border rounded px-3" onClick={submit}>Import</button>
        <span>{status}</span>
      </div>
    </main>
  );
}

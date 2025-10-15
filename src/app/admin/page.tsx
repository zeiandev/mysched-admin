'use client';
import { useEffect, useState } from 'react';
import { Shell, Card, CardBody, Button } from '@/components/ui';
import Link from 'next/link';

type Status = {
  db: { ok: boolean; latencyMs: number };
  counts: {
    classes: number;
    sections: number;
    errors: number;
  };
  lastUpdate: { classes: string | null; sections: string | null };
  auth?: { ok: boolean; authed: boolean; userId: string | null; isAdmin: boolean };
  env?: { nodeEnv: string; hasSupabaseUrl: boolean; hasSupabaseAnon: boolean; hasServiceRole: boolean; hasSiteUrl: boolean; supabaseEnvOk?: boolean };
  hasUrl?: boolean;
  hasKey?: boolean;
};

export default function AdminHome() {
  const [s, setS] = useState<Status | null>(null);
  const [at, setAt] = useState<string>('');

  const load = async () => {
    const res = await fetch('/api/status', { cache: 'no-store' });
    setS(await res.json());
    setAt(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Shell title="Dashboard">
        {s && s.counts.errors > 0 && (
          <div className="mb-4 rounded-xl bg-red-600/10 text-red-600 px-4 py-3">
            {s.counts.errors} error(s) detected. Check audit_log for details.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Database</div>
              <div className={`text-2xl font-bold ${s?.db.ok ? 'text-green-600' : 'text-red-600'}`}>
                {s?.db.ok ? 'Healthy' : 'Error'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Latency: {s ? `${s.db.latencyMs} ms` : '—'}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Totals</div>
              <div className="mt-1 grid grid-cols-2 gap-y-1 text-sm">
                <div>Classes</div>
                <div className="text-right font-semibold">{s?.counts.classes ?? '—'}</div>
                <div>Sections</div>
                <div className="text-right font-semibold">{s?.counts.sections ?? '—'}</div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm text-gray-600">Errors</div>
              <div className={`text-2xl font-bold ${s && s.counts.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {s ? s.counts.errors : '—'}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody>
            <div className="text-sm text-gray-600 mb-2">Diagnostics</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded border p-3 bg-white">
                <div className="text-gray-600">Auth</div>
                <div>User: <span className="font-mono">{s?.auth?.userId || '—'}</span></div>
                <div>Admin: <span className={`font-semibold ${s?.auth?.isAdmin ? 'text-green-700' : 'text-red-700'}`}>{String(!!s?.auth?.isAdmin)}</span></div>
              </div>
              <div className="rounded border p-3 bg-white">
                <div className="text-gray-600">Env</div>
                <div>supabaseEnvOk: <span className={`font-semibold ${s?.env?.supabaseEnvOk ? 'text-green-700' : 'text-red-700'}`}>{String(!!s?.env?.supabaseEnvOk)}</span></div>
                <div>hasUrl: {String(!!(s?.hasUrl ?? s?.env?.hasSupabaseUrl))}</div>
                <div>hasKey: {String(!!(s?.hasKey ?? s?.env?.hasSupabaseAnon))}</div>
              </div>
              <div className="rounded border p-3 bg-white">
                <div className="text-gray-600">Actions</div>
                <div className="flex gap-2">
                  <Button onClick={load}>Reload status</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-gray-600">Last updates</div>
                <div className="mt-1 text-sm">
                  <div>Classes: <span className="font-medium">{s?.lastUpdate.classes ?? '—'}</span></div>
                  <div>Sections: <span className="font-medium">{s?.lastUpdate.sections ?? '—'}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={load}>Refresh</Button>
                <span className="text-xs text-gray-500">as of {at || '—'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-sm text-gray-600 mb-3">Manage</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/admin/classes"><Button className="w-full">Classes</Button></Link>
              <Link href="/admin/sections"><Button className="w-full">Sections</Button></Link>
            </div>
          </CardBody>
        </Card>
      </Shell>
    </div>
  );
}

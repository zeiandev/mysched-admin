import { NextRequest, NextResponse } from 'next/server';
import { sbService } from '@/lib/supabase-service';
import { requireAdmin } from '@/lib/authz';

function bad(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(); // admin only
    const sp = new URL(req.url).searchParams;
    const table = sp.get('table');
    const user_id = sp.get('user_id');
    const limitRaw = Number(sp.get('limit') || '0');
    const limit = Math.min(200, limitRaw > 0 ? limitRaw : 200);

    let q = sbService()
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (table && table !== 'all') q = q.eq('table_name', table);
    if (user_id) q = q.eq('user_id', user_id);

    const { data, error } = await q;
    if (error) return bad('Failed to load audit log');
    return NextResponse.json(data ?? []);
  } catch (e: unknown) {
    const msg = (e as { message?: string } | null)?.message;
    if (msg === 'unauthorized') return bad('Unauthorized', 401);
    if (msg === 'forbidden') return bad('Forbidden', 403);
    return bad('Failed to load audit log');
  }
}

export const dynamic = 'force-dynamic';
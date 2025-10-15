import { sbService } from '@/lib/supabase-service'

export async function audit(user_id: string, table_name: string, action: 'insert' | 'update' | 'delete', row_id: number | string, details?: unknown) {
  try {
    const sb = sbService()
    await sb.from('audit_log').insert([{ user_id, table_name, action, row_id, details }])
  } catch {
    // ignore
  }
}

export async function auditError(user_id: string, table_name: string, message: string, details?: unknown) {
  try {
    const sb = sbService()
    const mergedDetails = typeof details === 'object' && details !== null
      ? { message, ...(details as Record<string, unknown>) }
      : { message }
    await sb.from('audit_log').insert({
      user_id,
      table_name,
      action: 'error',
      details: mergedDetails
    })
  } catch (err) {
    console.error('Failed to record audit error', err)
  }
}

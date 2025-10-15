export function logErr(route: string, e: unknown, extra?: Record<string, unknown>) {
  const msg = e instanceof Error ? e.message : String(e)
  const stack = (typeof e === 'object' && e && 'stack' in e) ? (e as { stack?: string }).stack : undefined
  console.error({ route, msg, stack, ...extra })
  return msg
}
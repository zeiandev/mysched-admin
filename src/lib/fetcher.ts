import { useToast } from '@/components/toast';

/**
 * JSON fetch with same-origin cookies and normalized errors.
 */
export async function api<T = unknown>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined;
  const res = await fetch(input, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(hasBody ? { 'content-type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // ignore non-JSON bodies
  }

  if (!res.ok) {
    const p = payload as unknown as { error?: string; details?: { message?: string }[] } | null;
    const base = p && p.error ? p.error : 'Request failed';
    const details = Array.isArray(p?.details)
      ? `: ${p!.details!.map(d => d.message).join(', ')}`
      : '';
    throw new Error(`${base}${details}`);
  }
  return payload as T;
}

/**
 * Wrap any async API call and surface errors via toast.
 */
export function useApiWithToast() {
  const toast = useToast();
  return async <T>(fn: () => Promise<T>) => {
    try {
      return await fn();
    } catch (e: unknown) {
      const msg = (e as { message?: string } | null)?.message || 'Something went wrong';
      toast({ kind: 'error', msg });
      throw e;
    }
  };
}

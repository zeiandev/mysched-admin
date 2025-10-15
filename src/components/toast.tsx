// src/components/toast.tsx
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ToastKind = 'error' | 'success' | 'info'
type ToastInput = { kind: ToastKind; msg: string }
type Toast = ToastInput & { id: number }

const ToastCtx = createContext<(o: ToastInput) => void>(() => {})

const DUR = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const timers = useRef(new Map<number, number>())

  const remove = useCallback((id: number) => {
    setItems((v) => v.filter((t) => t.id !== id))
    const t = timers.current.get(id)
    if (t) {
      clearTimeout(t)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (o: ToastInput) => {
      const id = Date.now() + Math.random()
      setItems((v) => [...v, { id, ...o }])
      timers.current.set(
        id,
        // @ts-expect-error Node vs DOM timer types
        setTimeout(() => remove(id), DUR)
      )
    },
    [remove]
  )

  // derive styles once
  const styles = useMemo(
    () => ({
      base:
        'pointer-events-auto w-80 max-w-[92vw] rounded-xl border bg-white text-sm text-gray-900 shadow-lg ring-1 ring-black/5',
      row: 'flex items-start gap-3 px-4 py-3',
      msg: 'flex-1 leading-5',
      btn:
        'shrink-0 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      stripe: {
        error: 'bg-red-500',
        success: 'bg-green-500',
        info: 'bg-blue-500',
      } as Record<ToastKind, string>,
      icon: {
        error:
          'M12 9v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z',
        success:
          'M12 22a10 10 0 110-20 10 10 0 010 20zm-2-10l2 2 4-4',
        info:
          'M12 2a10 10 0 110 20 10 10 0 010-20zm0 6h.01M11 10h2v6h-2',
      } as Record<ToastKind, string>,
    }),
    []
  )

  return (
    <ToastCtx.Provider value={push}>
      {children}

      {/* polite live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {items.length ? items[items.length - 1].msg : ''}
      </div>

      {/* toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`${styles.base} transition-all motion-reduce:transition-none data-[enter]:translate-y-2 data-[enter]:opacity-0 data-[show]:translate-y-0 data-[show]:opacity-100`}
            data-enter=""
            // flip to show state on mount for smooth fade-in
            ref={(el) => {
              if (el) requestAnimationFrame(() => el.setAttribute('data-show', ''))
            }}
          >
            <div className={`h-1 rounded-t-xl ${styles.stripe[t.kind]}`} />
            <div className={styles.row}>
              <svg
                className="mt-0.5 h-5 w-5 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={styles.icon[t.kind]} />
              </svg>

              <p className={styles.msg} role={t.kind === 'error' ? 'alert' : 'status'}>
                {t.msg}
              </p>

              <button
                type="button"
                onClick={() => remove(t.id)}
                className={styles.btn}
                aria-label="Dismiss notification"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}

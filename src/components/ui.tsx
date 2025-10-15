// src/components/ui.tsx
'use client'

import React, { forwardRef } from 'react'
import Link from 'next/link'

/* ────────────────────────────────────────────────────────── */
/* utilities                                                 */
/* ────────────────────────────────────────────────────────── */

function cn(...xs: Array<string | undefined | false>) {
  return xs.filter(Boolean).join(' ')
}

/* ────────────────────────────────────────────────────────── */
/* layout                                                     */
/* ────────────────────────────────────────────────────────── */

export const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    {children}
  </div>
)

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>{children}</div>
)

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('border-b border-gray-200 px-5 py-4', className)}>{children}</div>
)

export const CardBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('px-5 py-4', className)}>{children}</div>
)

/* ────────────────────────────────────────────────────────── */
/* controls                                                   */
/* ────────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  }
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...props} />
})
Button.displayName = 'Button'

export const Danger = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <Button variant="ghost" className={cn('text-red-600 hover:text-red-700', props.className)} {...props} />
)

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}>(({ className, error, ...props }, ref) => (
  <div className="space-y-1.5">
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        error ? 'border-red-500' : 'border-gray-300',
        className
      )}
      {...props}
    />
    {error ? <p className="text-xs text-red-600">{error}</p> : null}
  </div>
))
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

/* ────────────────────────────────────────────────────────── */
/* table                                                      */
/* ────────────────────────────────────────────────────────── */

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('overflow-x-auto', className)}>
    <table className="min-w-full border-separate border-spacing-0 text-sm text-gray-900">{children}</table>
  </div>
)

export const THead = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>
export const TBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>

export const Th = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th
    className={cn(
      'sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700',
      'first:rounded-tl-xl last:rounded-tr-xl',
      className
    )}
  >
    {children}
  </th>
)

export const Tr = ({ children }: { children: React.ReactNode }) => <tr className="even:bg-gray-50/40">{children}</tr>

export const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn('border-b border-gray-100 px-3 py-2 align-top', className)}>{children}</td>
)

/* ────────────────────────────────────────────────────────── */
/* nav link                                                   */
/* ────────────────────────────────────────────────────────── */

export const NavLink = ({
  href,
  label,
  active,
  className,
}: {
  href: string
  label: string
  active: boolean
  className?: string
}) => (
  <Link
    href={href}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'rounded-md px-3 py-2 text-sm font-medium focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
      className
    )}
  >
    {label}
  </Link>
)

/* ────────────────────────────────────────────────────────── */
/* badges / helpers                                           */
/* ────────────────────────────────────────────────────────── */

export const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
    {children}
  </span>
)

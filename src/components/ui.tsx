'use client';
import React from 'react';
import Link from 'next/link';

export const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mx-auto max-w-6xl p-6 space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    {children}
  </div>
);

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">{children}</div>
);

export const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 sm:p-6">{children}</div>
);

export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium
      bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ${props.className ?? ''}`}
  >
    {children}
  </button>
);

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-600 ${className ?? ''}`}
  />
);

export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-separate border-spacing-0 text-sm">
      {children}
    </table>
  </div>
);

export const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="sticky top-0 z-10 bg-gray-50 text-left font-semibold text-gray-700
                 px-3 py-2 border-b border-gray-200 first:rounded-tl-xl last:rounded-tr-xl">
    {children}
  </th>
);

export const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-3 py-2 border-b border-gray-100">{children}</td>
);

export const Danger = (
  { children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>
) => (
  <button
    {...props}
    className={`text-red-600 hover:underline ${className ?? ''}`}
  >
    {children}
  </button>
);

export const NavLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`px-3 py-2 rounded-lg text-sm font-medium ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {label}
  </Link>
);

'use client'
import { useEffect, useState } from 'react'

type Geo = {
  ip: string | null
  city: string | null
  region: string | null
  country: string | null
  secure: boolean
}

export default function StatusTicker() {
  const [text, setText] = useState('CONNECTING…')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/geo', { cache: 'no-store' })
        const g: Geo = await r.json()
        const ip = g.ip || 'Unknown'
        const loc = [g.city, g.region, g.country].filter(Boolean).join(', ') || 'Unknown'
        const sec = g.secure ? 'SECURE' : 'INSECURE'
        if (alive) setText(`CONNECTED | IP: ${ip} | LOCATION: ${loc} | STATUS: ${sec}`)
      } catch {
        if (alive) setText('CONNECTED | STATUS: UNKNOWN')
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  return (
    <div className="sticky top-0 z-50 w-screen border-b border-gray-200 bg-white text-xs text-gray-700">
      {/* full-width track with fade edges */}
      <div
        className="relative overflow-hidden"
        style={{
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          maskImage:
            'linear-gradient(90deg, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
        }}
      >
        <div className="whitespace-nowrap py-1 will-change-transform animate-[marquee_22s_linear_infinite]">
          <span className="mx-6">{text}</span>
          <span className="mx-6">{text}</span>
          <span className="mx-6">{text}</span>
          <span className="mx-6">{text}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[marquee_22s_linear_infinite] { animation: none; }
        }
      `}</style>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'

type Geo = { ip: string|null; city:string|null; region:string|null; country:string|null; secure:boolean }

export default function StatusTicker() {
  const [t, setT] = useState<string>('CONNECTING…')

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const r = await fetch('/api/geo', { cache: 'no-store' })
        const g: Geo = await r.json()
        const ip = g.ip || 'unknown'
        const loc = [g.city, g.region, g.country].filter(Boolean).join(', ') || 'Unknown'
        const sec = g.secure ? 'SECURE' : 'INSECURE'
        if (alive) setT(`CONNECTED | IP: ${ip} | LOCATION: ${loc} | STATUS: ${sec}`)
      } catch {
        if (alive) setT('CONNECTED | STATUS: UNKNOWN')
      }
    }
    run()
    const id = setInterval(run, 60_000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-black text-white">
      <div className="mx-auto max-w-6xl overflow-hidden">
        <div className="whitespace-nowrap py-2 animate-[marquee_18s_linear_infinite]">
          <span className="mx-4">{t}</span>
          <span className="mx-4">{t}</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      `}</style>
    </div>
  )
}

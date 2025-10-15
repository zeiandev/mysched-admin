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
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/geo', { cache: 'no-store' })
        const g: Geo = await res.json()
        const ip = g.ip || 'Unknown'
        const loc = [g.city, g.region, g.country].filter(Boolean).join(', ') || 'Unknown'
        const sec = g.secure ? 'SECURE' : 'INSECURE'
        if (active) setText(`CONNECTED | IP: ${ip} | LOCATION: ${loc} | STATUS: ${sec}`)
      } catch {
        if (active) setText('CONNECTED | STATUS: UNKNOWN')
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  return (
    <div className="w-full border-b border-gray-200 bg-white text-xs text-gray-700">
      <div className="mx-auto max-w-6xl overflow-hidden">
        <div className="whitespace-nowrap py-1 animate-[marquee_25s_linear_infinite]">
          <span className="mx-4">{text}</span>
          <span className="mx-4">{text}</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

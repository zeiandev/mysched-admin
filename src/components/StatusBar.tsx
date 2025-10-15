'use client'
import { useEffect, useState } from 'react'

type EdgeInfo = {
  ip: string
  location: string
  secure: boolean
}

export default function StatusBar() {
  const [info, setInfo] = useState<EdgeInfo | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/edge-info', { cache: 'no-store' })
        const j = (await r.json()) as EdgeInfo
        if (alive) setInfo(j)
      } catch {
        // ignore
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const text = info
    ? `CONNECTED | IP: ${info.ip} | LOCATION: ${info.location} | STATUS: ${
        info.secure ? 'SECURE' : 'INSECURE'
      }`
    : 'CONNECTING…'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden bg-blue-600 py-2 text-white">
      <div className="animate-marquee whitespace-nowrap px-4 font-medium">
        {text} &nbsp;&nbsp;&nbsp;&nbsp; {text}
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 200%;
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  )
}

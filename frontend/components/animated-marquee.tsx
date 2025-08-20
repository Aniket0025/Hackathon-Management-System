"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type MarqueeProps = {
  items?: React.ReactNode[]
  speed?: number // seconds per full loop
}

const DEFAULT_ITEMS: React.ReactNode[] = [
  <Badge key="ai" variant="secondary" className="bg-emerald-100 text-emerald-700">Efficient Team Matching</Badge>,
  <Badge key="realtime" variant="secondary" className="bg-cyan-100 text-cyan-700">Real-time Updates</Badge>,
  <Badge key="secure" variant="secondary" className="bg-blue-100 text-blue-700">Secure by Design</Badge>,
  <Button key="cta" size="sm" variant="cta" className="px-5 py-2 rounded-full shadow-md hover:shadow-lg">Get Started</Button>,
  <Button key="learn" size="sm" variant="outline" className="px-5 py-2 rounded-full bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-sm">Learn More</Button>,
]

export default function AnimatedMarquee({ items = DEFAULT_ITEMS, speed = 22 }: MarqueeProps) {
  const styleVar = { ["--marquee-duration" as any]: `${speed}s` }
  return (
    <div className="relative overflow-hidden py-6 select-none rounded-xl border bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur shadow-sm" aria-label="Highlights" style={styleVar}>
      <div className="flex items-center gap-6 md:gap-10 animate-marquee will-change-transform" role="list">
        {[...items, ...items].map((node, idx) => (
          <div role="listitem" key={idx} className="opacity-100 transition-transform duration-200 hover:scale-[1.04] hover:shadow-md rounded-lg">
            {node}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          width: max-content;
          animation: marquee var(--marquee-duration) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation-duration: calc(var(--marquee-duration) * 2); }
        }
      `}</style>
    </div>
  )
}

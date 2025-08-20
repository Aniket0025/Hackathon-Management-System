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
  <Button key="cta" size="sm" variant="cta" className="px-4">Get Started</Button>,
  <Button key="learn" size="sm" variant="outline" className="border-2">Learn More</Button>,
]

export default function AnimatedMarquee({ items = DEFAULT_ITEMS, speed = 22 }: MarqueeProps) {
  const styleVar = { ["--marquee-duration" as any]: `${speed}s` }
  return (
    <div className="relative overflow-hidden py-6 select-none" aria-label="Highlights" style={styleVar}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-900" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-900" />

      <div className="flex items-center gap-6 md:gap-10 animate-marquee will-change-transform" role="list">
        {[...items, ...items].map((node, idx) => (
          <div role="listitem" key={idx} className="opacity-90 hover:opacity-100 transition-opacity">
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
      `}</style>
    </div>
  )
}

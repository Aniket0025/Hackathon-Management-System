"use client"

import React, { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type MarqueeProps = {
  items?: React.ReactNode[]
  speed?: number // seconds per full loop
  animate?: boolean // whether to run marquee animation
}

const DEFAULT_ITEMS: React.ReactNode[] = [
  <Badge key="ai" variant="secondary" className="bg-emerald-100 text-emerald-700">Efficient Team Matching</Badge>,
  <Badge key="realtime" variant="secondary" className="bg-cyan-100 text-cyan-700">Real-time Updates</Badge>,
  <Badge key="secure" variant="secondary" className="bg-blue-100 text-blue-700">Secure by Design</Badge>,
  <Button key="cta" size="sm" variant="cta" className="px-5 py-2 rounded-full shadow-md hover:shadow-lg">Get Started</Button>,
  <Button key="learn" size="sm" variant="outline" className="px-5 py-2 rounded-full bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-sm">Learn More</Button>,
]

export default function AnimatedMarquee({ items = DEFAULT_ITEMS, speed = 22, animate = false }: MarqueeProps) {
  const styleVar = { ["--marquee-duration" as any]: `${speed}s` }
  const frameRef = useRef<number | null>(null)
  const rectRef = useRef<DOMRect | null>(null)

  return (
    <div
      className="relative overflow-hidden py-6 md:py-8 px-4 md:px-6 select-none rounded-2xl border border-slate-200/60 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_8px_30px_rgba(2,132,199,0.08)]"
      aria-label="Highlights"
      style={styleVar}
      onMouseEnter={(e) => { rectRef.current = e.currentTarget.getBoundingClientRect() }}
      onMouseLeave={() => { rectRef.current = null; if (frameRef.current) cancelAnimationFrame(frameRef.current); frameRef.current = null; }}
      onMouseMove={(e) => {
        if (!rectRef.current) rectRef.current = e.currentTarget.getBoundingClientRect()
        const rect = rectRef.current
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        if (frameRef.current) return
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null
          const el = e.currentTarget as HTMLElement
          el.style.setProperty('--mx', `${x}px`)
          el.style.setProperty('--my', `${y}px`)
        })
      }}
    >
      <div className={`flex items-center justify-center flex-wrap gap-3 sm:gap-4 md:gap-6 ${animate ? "animate-marquee" : ""} will-change-transform`} role="list">
        {items.map((node, idx) => (
          <div
            role="listitem"
            key={idx}
            className="opacity-100 transition-all duration-200 hover:-translate-y-0.5 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200 px-3.5 py-2 shadow-sm hover:shadow-md"
          >
            {node}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          width: max-content;
          animation: marquee var(--marquee-duration) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee { animation-duration: calc(var(--marquee-duration) * 2); }
        }
        /* Soft vignette edges */
        div[aria-label="Highlights"]::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04), inset 0 -20px 40px rgba(14, 165, 233, 0.08), inset 0 20px 40px rgba(16, 185, 129, 0.06);
          border-radius: 1rem;
        }
      `}</style>
    </div>
  )
}

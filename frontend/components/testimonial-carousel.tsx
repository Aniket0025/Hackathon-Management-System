"use client"

import { useEffect, useRef, useState } from "react"

type Testimonial = {
  quote: string
  name: string
  role: string
}

const DEFAULT_ITEMS: Testimonial[] = [
  {
    quote: "HackHost made our 48-hour hack smooth and thrilling—live analytics kept everyone engaged.",
    name: "Aarav Shah",
    role: "Organizer, ByteFest",
  },
  {
    quote: "Best judging flow I've used. Real-time submissions and team stats were clutch.",
    name: "Meera Iyer",
    role: "Judge",
  },
  {
    quote: "We formed a team on the platform and shipped a functional MVP before dawn!",
    name: "Rohit Verma",
    role: "Participant",
  },
]

export default function TestimonialCarousel({ items = DEFAULT_ITEMS, interval = 4500 }: { items?: Testimonial[]; interval?: number }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % items.length), interval)
    return () => { timerRef.current && clearInterval(timerRef.current) }
  }, [items.length, interval])

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div
        className="relative overflow-hidden rounded-2xl border glass-card glow-ring spotlight-hover p-8 shadow-xl"
        onMouseEnter={(e) => { (e.currentTarget as any)._rect = e.currentTarget.getBoundingClientRect() }}
        onMouseLeave={(e) => { (e.currentTarget as any)._rect = null; if ((e.currentTarget as any)._raf) cancelAnimationFrame((e.currentTarget as any)._raf); (e.currentTarget as any)._raf = null; }}
        onMouseMove={(e) => {
          const el = e.currentTarget as any
          if (!el._rect) el._rect = el.getBoundingClientRect()
          const rect = el._rect as DOMRect
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          if (el._raf) return
          el._raf = requestAnimationFrame(() => {
            el._raf = null
            el.style.setProperty('--mx', `${x}px`)
            el.style.setProperty('--my', `${y}px`)
          })
        }}
      >
        {items.map((t, i) => (
          <div
            key={i}
            className={`absolute inset-0 p-4 transition-all duration-700 ease-out transform-gpu ${i === index ? "opacity-100 translate-x-0" : i < index ? "opacity-0 -translate-x-6" : "opacity-0 translate-x-6"}`}
            aria-hidden={i !== index}
          >
            <figure>
              <blockquote className="text-lg md:text-xl font-medium text-slate-800">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{t.name}</span> · {t.role}
              </figcaption>
            </figure>
          </div>
        ))}
        {/* gradient glow backdrop */}
        <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-blue-500/30 opacity-25 blur-2xl" />
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            aria-label={`Go to slide ${i + 1}`}
            key={i}
            onClick={() => setIndex(i)}
            className={`relative h-2.5 w-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
              i === index ? "bg-emerald-600 w-6 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

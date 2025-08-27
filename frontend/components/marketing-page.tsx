"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export type MarketingSection = {
  heading: string
  items?: string[]
  content?: string
}

export type MarketingPageProps = {
  title: string
  subtitle?: string
  sections?: MarketingSection[]
  cta?: { label: string; href: string }
}

export default function MarketingPage({ title, subtitle, sections = [], cta }: MarketingPageProps) {
  return (
    <main className="min-h-[60vh] bg-white">
      {/* Hero */}
      <section className="py-14 md:py-18 px-4 bg-gradient-to-b from-white to-slate-50/60">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-3">{title}</h1>
          {subtitle && (
            <p className="text-base md:text-lg text-slate-600 mb-6 max-w-3xl">{subtitle}</p>
          )}
          {cta && (
            <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-500 shadow-md">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          )}
        </div>
      </section>

      {sections.length > 0 && (
        <section className="py-10 md:py-14 px-4">
          <div className="container mx-auto max-w-5xl space-y-6">
            {sections.map((s, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">{s.heading}</h2>
                {s.content && <p className="text-slate-600 mb-4 max-w-3xl">{s.content}</p>}
                {s.items && s.items.length > 0 && (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {s.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-slate-700 hover:bg-white hover:border-cyan-200 transition-colors"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

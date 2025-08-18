"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import AITeamMatching from "@/components/ai-team-matching"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Mail, Calendar } from "lucide-react"

type MyRegistration = {
  _id: string
  event: string
  eventName?: string
  registrationType: "individual" | "team"
  createdAt: string
  teamInfo?: {
    teamName?: string
    teamDescription?: string
    lookingForMembers?: boolean
    desiredSkills?: string[]
    members?: Array<{
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
    }>
  }
  personalInfo?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    organization?: string
    experience?: string
    bio?: string
    gender?: string
    instituteName?: string
    type?: string
    domain?: string
    graduatingYear?: string
    courseDuration?: string
    differentlyAbled?: string
    location?: string
  }
  preferences?: {
    track?: string
    dietaryRestrictions?: string
    tshirtSize?: string
    emergencyContact?: string
  }
}

export default function TeamsPage() {
  const [email, setEmail] = useState("")
  const [authedEmail, setAuthedEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regs, setRegs] = useState<MyRegistration[]>([])

  // Load saved email and try to detect logged-in user
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("hh_my_email")
    if (saved) {
      setEmail(saved)
      // auto fetch for saved email when not authed yet
      setTimeout(() => {
        if (!authedEmail && saved) fetchMine()
      }, 0)
    }

    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
    // Try to get authenticated user
    fetch(`${base}/api/auth/me`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json().catch(() => ({}))
        const em = data?.user?.email || data?.email
        if (em) {
          setAuthedEmail(em)
          setEmail(em)
          // auto fetch for authed user
          setTimeout(() => fetchMine(), 0)
        }
        return null
      })
      .catch(() => null)
  }, [])

  const grouped = useMemo(() => {
    const map: Record<string, MyRegistration[]> = {}
    for (const r of regs) {
      const key = r.eventName || r.event
      map[key] = map[key] || []
      map[key].push(r)
    }
    return map
  }, [regs])

  const teamsByEvent = useMemo(() => {
    const m = new Map<string, MyRegistration[]>()
    for (const r of regs) {
      if (r.registrationType !== "team") continue
      const arr = m.get(r.event) || []
      arr.push(r)
      m.set(r.event, arr)
    }
    return m
  }, [regs])

  const appliedEvents = useMemo(() => {
    // Unique by event id
    const byId = new Map<string, { id: string; name: string; count: number }>()
    for (const r of regs) {
      const prev = byId.get(r.event)
      if (prev) {
        prev.count += 1
      } else {
        byId.set(r.event, { id: r.event, name: r.eventName || r.event, count: 1 })
      }
    }
    return Array.from(byId.values())
  }, [regs])

  const fetchMine = async () => {
    setError(null)
    if (!email) {
      setRegs([])
      return
    }
    try {
      setLoading(true)
      if (typeof window !== "undefined") localStorage.setItem("hh_my_email", email)
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/registrations/mine?full=true&email=${encodeURIComponent(email)}`, { credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to load registrations")
      setRegs(Array.isArray(data?.registrations) ? data.registrations : [])
    } catch (e: any) {
      setError(e?.message || "Failed to load registrations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch if email is present
    if (email) fetchMine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/teams" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-3">
            <Users className="w-4 h-4 mr-2" />
            AI Teams
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Form High-Impact Teams</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Use our AI-powered matching to build balanced teams that win.
          </p>
        </div>

        <AITeamMatching />
      
      </main>
    </div>
  )
}

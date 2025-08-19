"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import AITeamMatching from "@/components/ai-team-matching"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search } from "lucide-react"

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
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regs, setRegs] = useState<MyRegistration[]>([])

  // Team search state
  type Team = { _id: string; name: string; eventName?: string; members?: Array<{ name?: string }> }
  const [q, setQ] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<Team[]>([])

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
    fetch(`${base}/api/auth/me`, { credentials: "include", headers: (() => {
      const h: Record<string, string> = {}
      try {
        const t = localStorage.getItem('token')
        if (t) h['Authorization'] = `Bearer ${t}`
      } catch {}
      return h
    })() })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json().catch(() => ({}))
        const em = data?.user?.email || data?.email
        const r = data?.user?.role || null
        if (r) setRole(r)
        if (r === 'organizer') {
          try { window.location.replace('/events') } catch {}
        }
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

  const searchTeams = async () => {
    setSearchError(null)
    if (!q.trim()) {
      setResults([])
      return
    }
    try {
      setSearching(true)
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/teams?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to search teams')
      setResults(Array.isArray(data?.teams) ? data.teams : [])
    } catch (e: any) {
      setSearchError(e?.message || 'Failed to search teams')
    } finally {
      setSearching(false)
    }
  }

  // Fallback: if organizer and not yet redirected, show a simple notice
  if (role === 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Badge variant="secondary" className="mb-3">Access Restricted</Badge>
          <h1 className="text-2xl font-bold mb-2">Teams is unavailable for organizers</h1>
          <p className="text-slate-600 mb-4">This section is intended for participants. You can manage your events from the Events page.</p>
          <Link href="/events">
            <Button className="bg-cyan-600 hover:bg-cyan-700">Go to Events</Button>
          </Link>
        </div>
      </div>
    )
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

        {/* Team Search */}
        <section className="mt-10">
          <Card className="border-2 border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Search className="w-5 h-5 text-slate-600" />
                Search Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  placeholder="Search by team name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchTeams() }}
                />
                <Button onClick={searchTeams} disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              {searchError && (
                <p className="text-red-600 text-sm mt-3">{searchError}</p>
              )}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((t) => (
                  <Card key={t._id} className="hover:shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">{t.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{t.eventName || 'Event'}</p>
                      <p className="text-xs text-slate-500 mt-1">Members: {t.members?.length ?? 0}</p>
                    </CardContent>
                  </Card>
                ))}
                {!searching && q && results.length === 0 && !searchError && (
                  <p className="text-slate-500 text-sm">No teams found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      
      </main>
    </div>
  )
}

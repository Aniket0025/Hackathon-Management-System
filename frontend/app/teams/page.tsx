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

        {/* Applied Events */}
        <div className="mt-16 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Applied Events</h2>
          {appliedEvents.length === 0 ? (
            <div className="text-sm text-slate-600">No event applications yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {appliedEvents.map((e) => (
                <Card key={e.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="truncate" title={e.name}>{e.name}</span>
                      <Badge variant="secondary">{e.count}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/events/${e.id}`} className="text-cyan-700 hover:underline">View event</Link>
                    {(() => {
                      const teams = teamsByEvent.get(e.id) || []
                      if (teams.length === 0) return null
                      return (
                        <details className="mt-3">
                          <summary className="text-cyan-700 hover:underline cursor-pointer">View team details</summary>
                          <div className="mt-2 space-y-3 text-sm">
                            {teams.map((t) => (
                              <div key={t._id} className="rounded border p-2">
                                <div className="font-medium">{t.teamInfo?.teamName || "Unnamed Team"}</div>
                                {Array.isArray(t.teamInfo?.members) && t.teamInfo!.members!.length > 0 ? (
                                  <ul className="list-disc pl-5 mt-1">
                                    {t.teamInfo!.members!.map((m, i) => (
                                      <li key={i}>
                                        {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email || "Member"}
                                        {m.email ? ` - ${m.email}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-slate-500">No members listed</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )
                    })()}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My Registrations */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Check registered</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Look up by your registration email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!authedEmail ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Button onClick={fetchMine} disabled={loading || !email}>
                    {loading ? "Loading…" : "Fetch"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                  <div>
                    <span className="font-medium">Signed in as:</span> {authedEmail}
                  </div>
                  <Button onClick={fetchMine} disabled={loading}>
                    {loading ? "Loading…" : "Refresh"}
                  </Button>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">{error}</div>
              )}

              {/* Summary */}
              {regs.length > 0 && (
                <div className="text-sm text-slate-700">
                  <span className="font-medium">Total registrations:</span> {regs.length}
                </div>
              )}

              {/* Results */}
              {Object.keys(grouped).length === 0 && !loading && (
                <div className="text-sm text-slate-600">No registrations found.</div>
              )}

              <div className="space-y-4">
                {Object.entries(grouped).map(([eventName, items]) => (
                  <Card key={eventName} className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{eventName}</span>
                        <span className="ml-2 text-slate-500 text-sm">({items.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {items.map((r) => (
                        <details key={r._id} className="border rounded-md p-3">
                          <summary className="flex items-center justify-between cursor-pointer">
                            <div className="space-y-1">
                              <div className="text-sm text-slate-900 font-medium capitalize">{r.registrationType}</div>
                              {r.registrationType === "team" && r.teamInfo?.teamName && (
                                <div className="text-sm text-slate-600">Team: {r.teamInfo.teamName}</div>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {fmtDate(r.createdAt)}
                            </div>
                          </summary>
                          <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-800">Personal Info</div>
                              <div>Name: {r.personalInfo?.firstName} {r.personalInfo?.lastName}</div>
                              <div>Email: {r.personalInfo?.email}</div>
                              {r.personalInfo?.phone && <div>Phone: {r.personalInfo.phone}</div>}
                              {r.personalInfo?.organization && <div>Org: {r.personalInfo.organization}</div>}
                              {r.personalInfo?.instituteName && <div>Institute: {r.personalInfo.instituteName}</div>}
                              {(r.personalInfo?.type || r.personalInfo?.domain) && (
                                <div>Type/Domain: {r.personalInfo?.type} {r.personalInfo?.domain && `· ${r.personalInfo.domain}`}</div>
                              )}
                              {r.personalInfo?.location && <div>Location: {r.personalInfo.location}</div>}
                              {r.personalInfo?.bio && <div className="text-slate-600">Bio: {r.personalInfo.bio}</div>}
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-800">Preferences</div>
                              {r.preferences?.track && <div>Track: {r.preferences.track}</div>}
                              {r.preferences?.dietaryRestrictions && <div>Diet: {r.preferences.dietaryRestrictions}</div>}
                              {r.preferences?.tshirtSize && <div>T-shirt: {r.preferences.tshirtSize}</div>}
                              {r.preferences?.emergencyContact && <div>Emergency: {r.preferences.emergencyContact}</div>}
                            </div>
                            {r.registrationType === "team" && (
                              <div className="md:col-span-2 space-y-1">
                                <div className="font-semibold text-slate-800">Team Info</div>
                                {r.teamInfo?.teamDescription && <div>Description: {r.teamInfo.teamDescription}</div>}
                                {Array.isArray(r.teamInfo?.desiredSkills) && r.teamInfo!.desiredSkills!.length > 0 && (
                                  <div>Desired Skills: {r.teamInfo!.desiredSkills!.join(', ')}</div>
                                )}
                                {Array.isArray(r.teamInfo?.members) && r.teamInfo!.members!.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="font-medium">Members ({r.teamInfo!.members!.length})</div>
                                    <ul className="list-disc pl-5">
                                      {r.teamInfo!.members!.map((m, i) => (
                                        <li key={i}>{[m.firstName, m.lastName].filter(Boolean).join(' ')} {m.email && `- ${m.email}`}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </details>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

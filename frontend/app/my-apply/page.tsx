"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AdvancedNavigation } from "@/components/advanced-navigation"
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

export default function MyApplyPage() {
  const [email, setEmail] = useState("")
  const [authedEmail, setAuthedEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regs, setRegs] = useState<MyRegistration[]>([])
  const [formByEvent, setFormByEvent] = useState<Record<string, {
    teamName?: string
    title: string
    description: string
    repoUrl: string
    docsUrl: string
    videoUrl: string
    submitting?: boolean
    message?: string
    error?: string
  }>>({})

  // Helper: get auth header from localStorage token
  const getAuthHeader = (): Record<string, string> => {
    const h: Record<string, string> = {}
    if (typeof window === 'undefined') return h
    try {
      const t = localStorage.getItem('token')
      if (t) h['Authorization'] = `Bearer ${t}`
    } catch {}
    return h
  }

  // Load saved email and try to detect logged-in user
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("hh_my_email")
    if (saved) {
      setEmail(saved)
      setTimeout(() => {
        if (!authedEmail && saved) fetchMine()
      }, 0)
    }

    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
    fetch(`${base}/api/auth/me`, { credentials: "include", headers: { ...getAuthHeader() } })
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json().catch(() => ({}))
        const em = data?.user?.email || data?.email
        const r = data?.user?.role || null
        if (r) setRole(r)
        // Redirect organizers away from this page
        if (r === 'organizer') {
          try { window.location.replace('/events') } catch {}
        }
        if (em) {
          setAuthedEmail(em)
          setEmail(em)
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

  // Seed empty project submission forms per event (once per event)
  useEffect(() => {
    const ids = Array.from(new Set(regs.map(r => r.event)))
    setFormByEvent((prev) => {
      let changed = false
      const next = { ...prev }
      for (const id of ids) {
        if (!next[id]) {
          next[id] = { title: "", description: "", repoUrl: "", docsUrl: "", videoUrl: "" }
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [regs])

  const updateForm = (eventId: string, field: keyof NonNullable<typeof formByEvent[string]>, value: string) => {
    setFormByEvent((prev) => ({
      ...prev,
      [eventId]: { ...(prev[eventId] || { title: "", description: "", repoUrl: "", docsUrl: "", videoUrl: "" }), [field]: value, message: undefined, error: undefined }
    }))
  }

  const submitProject = async (eventId: string) => {
    const f = formByEvent[eventId]
    if (!f || !f.title) {
      updateForm(eventId, 'error', 'Title is required')
      return
    }
    const teams = teamsByEvent.get(eventId) || []
    const selectedTeamName = f.teamName || (teams[0]?.teamInfo?.teamName || '')
    if (!selectedTeamName) {
      updateForm(eventId, 'error', 'Team name is required')
      return
    }
    try {
      setFormByEvent((prev) => ({ ...prev, [eventId]: { ...(prev[eventId] as any), submitting: true, error: undefined, message: undefined } }))
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
      const res = await fetch(`${base}/api/submissions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          event: eventId,
          teamName: selectedTeamName,
          title: f.title,
          description: f.description,
          repoUrl: f.repoUrl,
          docsUrl: f.docsUrl,
          videoUrl: f.videoUrl,
        })
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) throw new Error('Please sign in to submit your project')
      if (!res.ok) throw new Error(data?.message || 'Failed to submit project')
      setFormByEvent((prev) => ({ ...prev, [eventId]: { ...(prev[eventId] as any), submitting: false, message: 'Submission saved!', error: undefined } }))
    } catch (e: any) {
      setFormByEvent((prev) => ({ ...prev, [eventId]: { ...(prev[eventId] as any), submitting: false, error: e?.message || 'Submission failed' } }))
    }
  }

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

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
  }

  // Fallback: if organizer and not yet redirected, show a simple notice
  if (role === 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Badge variant="secondary" className="mb-3">Access Restricted</Badge>
          <h1 className="text-2xl font-bold mb-2">My Apply is unavailable for organizers</h1>
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
      <AdvancedNavigation currentPath="/my-apply" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-3">
            <Users className="w-4 h-4 mr-2" />
            My Apply
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            View all events you have applied to and their team details.
          </p>
        </div>

        {/* Look up / refresh */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-base">Look up by your registration email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { if (!authedEmail) setEmail(e.target.value) }}
                    readOnly={!!authedEmail}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button onClick={fetchMine} disabled={loading || !email}>
                {loading ? "Loading…" : authedEmail ? "Refresh" : "Check"}
              </Button>
            </div>

            {authedEmail && (
              <div className="text-sm text-slate-700">
                <span className="font-medium">Signed in as:</span> {authedEmail}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">{error}</div>
            )}

            {regs.length > 0 && (
              <div className="text-sm text-slate-700">
                <span className="font-medium">Total registrations:</span> {regs.length}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applied Events */}
        <div className="mt-4 space-y-4">
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

                    {/* Project Submission */}
                    <div className="mt-6 border-t pt-4">
                      <div className="font-semibold text-slate-900 mb-2">Project Submission</div>
                      {/* form state pre-seeded via useEffect when regs load */}
                      <div className="grid gap-3">
                        {/* Team selector when multiple teams */}
                        {(() => {
                          const teams = teamsByEvent.get(e.id) || []
                          if (teams.length <= 1) return null
                          const value = formByEvent[e.id]?.teamName || teams[0]?.teamInfo?.teamName || ''
                          return (
                            <div>
                              <label className="block text-sm text-slate-700 mb-1">Team</label>
                              <select
                                className="border rounded-md px-3 py-2 w-full text-sm"
                                value={value}
                                onChange={(ev) => updateForm(e.id, 'teamName', ev.target.value)}
                              >
                                {teams.map((t) => (
                                  <option key={t._id} value={t.teamInfo?.teamName || ''}>{t.teamInfo?.teamName || 'Unnamed Team'}</option>
                                ))}
                              </select>
                            </div>
                          )
                        })()}

                        <div>
                          <label className="block text-sm text-slate-700 mb-1">Title</label>
                          <Input value={formByEvent[e.id]?.title || ''} onChange={(ev) => updateForm(e.id, 'title', ev.target.value)} placeholder="Project Title" />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700 mb-1">Description</label>
                          <textarea
                            className="border rounded-md px-3 py-2 w-full text-sm"
                            rows={3}
                            value={formByEvent[e.id]?.description || ''}
                            onChange={(ev) => updateForm(e.id, 'description', ev.target.value)}
                            placeholder="Short description"
                          />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm text-slate-700 mb-1">GitHub Repo</label>
                            <Input value={formByEvent[e.id]?.repoUrl || ''} onChange={(ev) => updateForm(e.id, 'repoUrl', ev.target.value)} placeholder="https://github.com/..." />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-700 mb-1">Docs</label>
                            <Input value={formByEvent[e.id]?.docsUrl || ''} onChange={(ev) => updateForm(e.id, 'docsUrl', ev.target.value)} placeholder="Docs link (Notion, Google Doc, etc.)" />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-700 mb-1">Video</label>
                            <Input value={formByEvent[e.id]?.videoUrl || ''} onChange={(ev) => updateForm(e.id, 'videoUrl', ev.target.value)} placeholder="Demo video URL (YouTube, Drive)" />
                          </div>
                        </div>

                        {formByEvent[e.id]?.error && (
                          <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">{formByEvent[e.id]?.error}</div>
                        )}
                        {formByEvent[e.id]?.message && (
                          <div className="text-sm text-green-700 border border-green-200 rounded p-2 bg-green-50">{formByEvent[e.id]?.message}</div>
                        )}

                        <div>
                          <Button onClick={() => submitProject(e.id)} disabled={!!formByEvent[e.id]?.submitting}>
                            {formByEvent[e.id]?.submitting ? 'Submitting…' : 'Submit Project'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Full list of registrations */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">All Registrations</h2>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {regs.length === 0 && !loading && (
                <div className="text-sm text-slate-600">No registrations found.</div>
              )}

              {regs.map((r) => (
                <details key={r._id} className="border rounded-md p-3">
                  <summary className="flex items-center justify-between cursor-pointer">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-900 font-medium capitalize">{r.registrationType}</div>
                      <div className="text-sm text-slate-600">Event: {r.eventName || r.event}</div>
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
        </div>
      </main>
    </div>
  )
}

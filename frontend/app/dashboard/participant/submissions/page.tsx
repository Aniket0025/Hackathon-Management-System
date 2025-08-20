"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, ArrowLeft } from "lucide-react"

// Mock submissions data
const mockSubmissions = [
  {
    id: 1,
    eventId: 1,
    eventName: "AI Innovation Challenge 2024",
    projectName: "EcoAI Assistant",
    description: "An AI-powered assistant that helps users make environmentally conscious decisions",
    status: "submitted",
    submittedAt: "2024-03-14T15:30:00",
    lastUpdated: "2024-03-14T15:30:00",
    round: "final",
    teamName: "AI Pioneers",
    githubUrl: "https://github.com/ai-pioneers/ecoai-assistant",
    demoUrl: "https://ecoai-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo123",
    files: [
      { name: "project-documentation.pdf", size: "2.4 MB", type: "application/pdf" },
      { name: "demo-video.mp4", size: "45.2 MB", type: "video/mp4" },
      { name: "presentation.pptx", size: "8.1 MB", type: "application/vnd.ms-powerpoint" },
    ],
    judgeScore: 8.5,
    feedback: "Excellent implementation with strong environmental impact potential.",
  },
  {
    id: 2,
    eventId: 2,
    eventName: "Sustainable Tech Hackathon",
    projectName: "GreenTracker",
    description: "Mobile app for tracking personal carbon footprint",
    status: "draft",
    submittedAt: null,
    lastUpdated: "2024-02-20T10:15:00",
    round: "preliminary",
    teamName: null, // Individual submission
    githubUrl: "https://github.com/johndoe/greentracker",
    demoUrl: "",
    videoUrl: "",
    files: [{ name: "wireframes.pdf", size: "1.2 MB", type: "application/pdf" }],
    judgeScore: null,
    feedback: null,
  },
]

const mockEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    submissionDeadline: "2024-03-15T23:59:00",
    status: "active",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary", "final"],
    currentRound: "final",
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    submissionDeadline: "2024-02-22T23:59:00",
    status: "active",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary"],
    currentRound: "preliminary",
  },
]

export default function SubmissionsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const eventId = useMemo(() => params.get("eventId") || "", [params])

  const [event, setEvent] = useState<{ _id: string; title: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [meEmail, setMeEmail] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<Array<{ _id: string; event: string; eventName: string; registrationType?: string; teamInfo?: { teamName?: string } }>>([])
  const [regsLoading, setRegsLoading] = useState(false)
  const [regsError, setRegsError] = useState<string | null>(null)
  const [eventsById, setEventsById] = useState<Record<string, { _id: string; title: string; bannerUrl?: string }>>({})

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [docsUrl, setDocsUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [teamName, setTeamName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!eventId) { setEvent(null); return }
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${eventId}`, { cache: "no-store" })
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) throw new Error(data?.message || "Failed to load event")
        setEvent({ _id: data?.event?._id, title: data?.event?.title })
      } catch (e: any) {
        setError(e?.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [eventId])

  // Load current user email and their registrations (to show Apply Event cards and prefill team)
  useEffect(() => {
    const loadMeAndRegs = async () => {
      try {
        setRegsLoading(true)
        setRegsError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { setRegsLoading(false); return }
        const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (meRes.ok) {
          const me = await meRes.json().catch(() => ({} as any))
          const email = me?.user?.email || null
          setMeEmail(email)
          if (email) {
            const r = await fetch(`${base}/api/registrations/mine?full=true&email=${encodeURIComponent(email)}`)
            const rData = await r.json().catch(() => ({} as any))
            if (!r.ok) throw new Error(rData?.message || "Failed to load registrations")
            const regs = Array.isArray(rData?.registrations) ? rData.registrations : []
            setRegistrations(regs)
          }
        }
      } catch (e: any) {
        setRegsError(e?.message || "Failed to load registrations")
      } finally {
        setRegsLoading(false)
      }
    }
    loadMeAndRegs()
  }, [])

  // Auto-suggest team name from registration when eventId is set
  useEffect(() => {
    if (!eventId || !registrations.length) return
    const reg = registrations.find(r => String(r.event) === String(eventId))
    if (reg?.teamInfo?.teamName && !teamName) {
      setTeamName(reg.teamInfo.teamName)
    }
  }, [eventId, registrations])

  // After registrations are loaded, fetch banners for those events
  useEffect(() => {
    const fetchEventBanners = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const ids = Array.from(new Set(registrations.map(r => String(r.event))))
        const missing = ids.filter(id => !eventsById[id])
        if (missing.length === 0) return
        const results = await Promise.allSettled(
          missing.map(async (id) => {
            const res = await fetch(`${base}/api/events/${id}`)
            const data = await res.json().catch(() => ({} as any))
            if (!res.ok) throw new Error(data?.message || 'fail')
            const ev = data?.event || {}
            return { id, value: { _id: ev?._id || id, title: ev?.title || '', bannerUrl: ev?.bannerUrl } }
          })
        )
        const update: Record<string, { _id: string; title: string; bannerUrl?: string }> = {}
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value) update[r.value.id] = r.value.value
        }
        if (Object.keys(update).length) setEventsById(prev => ({ ...prev, ...update }))
      } catch {
        // ignore individual fetch errors; cards will fallback
      }
    }
    if (registrations.length) fetchEventBanners()
  }, [registrations, eventsById])

  const canSubmit = Boolean(eventId && title.trim() && teamName.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setSubmitting(true)
      setSubmitMsg(null)
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          event: eventId,
          title: title.trim(),
          description: description.trim() || undefined,
          repoUrl: repoUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          teamName: teamName.trim(),
        }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.message || "Submission failed")
      setSubmitMsg("Submitted successfully")
      // Navigate to event page (client-side)
      router.push(`/events/${eventId}`)
    } catch (e: any) {
      setSubmitMsg(e?.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-6 text-center">
          <div>
            <Badge className="mb-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-transparent mx-auto">Submission</Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{event?.title || "Project Submission"}</h1>
            <div className="text-sm text-slate-600 mt-1">{eventId ? `Event ID: ${eventId}` : "Choose an event to submit to"}</div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-lg shadow-sm">
            <Link href="/my-apply">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Apply
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <Card className="max-w-5xl mx-auto rounded-xl border border-slate-200 shadow-sm bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Project Submission</span>
              <Badge variant="secondary">1</Badge>
            </CardTitle>
            <CardDescription>Submit your project details for the selected event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Helpful tips banner */}
            <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/60 p-3 text-sm text-emerald-800">
              <div className="font-medium mb-1">Tips for a great submission</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use a concise, descriptive title.</li>
                <li>Include a repo link and a short demo video if possible.</li>
                <li>Ensure the team name matches your event registration.</li>
              </ul>
            </div>
            {/* Apply Event Cards inside the submission card when no eventId provided */}
            {!eventId && (
              <div>
                {regsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-56 md:h-64 w-full rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : regsError ? (
                  <div className="text-sm text-red-600">{regsError}</div>
                ) : registrations.length === 0 ? (
                  <div className="text-sm text-slate-600">No registrations found. Register in an event first.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registrations.map((reg) => {
                      const ev = eventsById[String(reg.event)]
                      const title = ev?.title || reg.eventName
                      const banner = ev?.bannerUrl
                      return (
                        <Link
                          key={reg._id}
                          href={`/dashboard/participant/submissions?eventId=${reg.event}`}
                          className="group relative block rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white hover:ring-cyan-300 hover:shadow-lg transition"
                        >
                          {banner ? (
                            <img src={banner} alt={title} className="h-56 md:h-64 w-full object-cover group-hover:scale-[1.02] transition-transform" />
                          ) : (
                            <div className="h-56 md:h-64 w-full bg-gradient-to-r from-cyan-100 to-blue-100" />
                          )}
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          {/* Bottom info row (raised to make space for CTA) */}
                          <div className="absolute bottom-14 left-3 right-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-white font-semibold drop-shadow truncate">{title}</div>
                              {reg.teamInfo?.teamName && (
                                <span className="shrink-0 rounded-md bg-white/90 text-slate-800 text-[12px] px-2.5 py-0.5 border border-white/80 shadow-sm">
                                  {reg.teamInfo.teamName}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Bottom-centered CTA */}
                          <div className="absolute left-0 right-0 bottom-3 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/dashboard/participant/submissions?eventId=${reg.event}`)
                              }}
                              className="inline-flex items-center gap-2 text-sm md:text-base font-semibold rounded-full bg-white/95 text-slate-900 px-4 md:px-5 py-2 md:py-2.5 shadow-md ring-1 ring-slate-200 hover:shadow-lg hover:scale-[1.03] transition transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                            >
                              <Upload className="w-4 h-4" /> Submit
                            </button>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            {eventId && (
              <div className="rounded-xl border bg-gradient-to-r from-white to-white/80 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Selected event</div>
                  <div className="text-lg font-semibold text-slate-900">{event?.title || "Loading…"}</div>
                </div>
                <div className="flex gap-2">
                  {event?._id && (
                    <Link href={`/events/${event._id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-slate-700 hover:bg-slate-50">View event</Link>
                  )}
                  <Link href={`/dashboard/participant/submissions`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-slate-700 hover:bg-slate-50">Change event</Link>
                </div>
              </div>
            )}
            {/* Hide form until an event is selected */}
            {eventId && (
              <div className="max-w-3xl mx-auto space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="team">Team Name</Label>
                  <Input
                    id="team"
                    placeholder="Your team name (must match registration)"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={!!teamName}
                    readOnly={!!teamName}
                    title={teamName ? "Auto-filled from your registration" : undefined}
                  />
                  {teamName ? (
                    <div className="text-xs text-slate-500">Auto-filled from your registration</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 leading-6" />
                  <p className="text-xs text-slate-500">What it does, how it works, and impact. 2–4 sentences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo">GitHub Repo</Label>
                    <Input id="repo" placeholder="https://github.com/..." value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="h-10" />
                    <p className="text-xs text-slate-500">Public or add access notes in description.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="docs">Docs</Label>
                    <Input id="docs" placeholder="Docs link (Notion, Google Doc, etc.)" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} className="h-10" />
                    <p className="text-xs text-slate-500">Optional, but helpful for judges.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video">Video</Label>
                    <Input id="video" placeholder="Demo video URL (YouTube, Drive)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="h-10" />
                    <p className="text-xs text-slate-500">60–120s demo highlighting what matters.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white shadow-md">
                    <Upload className="w-4 h-4 mr-2" /> {submitting ? "Submitting..." : "Submit Project"}
                  </Button>
                  {submitMsg && <span className="text-sm text-slate-600">{submitMsg}</span>}
                </div>
              </div>
            )}

            {event && (
              <div className="pt-2">
                <Link href={`/events/${event._id}`} className="text-sm text-cyan-700 hover:underline">View event details</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

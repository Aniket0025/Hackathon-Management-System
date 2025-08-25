"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Github, FileText, Video as VideoIcon, Save as SaveIcon, Loader2 } from "lucide-react"

interface SubmissionItem {
  _id: string
  title: string
  description?: string
  status?: string
  team?: { _id: string; name: string }
  repoUrl?: string
  docsUrl?: string
  videoUrl?: string
}

export default function JudgeEventSubmissionsPage() {
  const params = useParams<{ id: string }>()
  const eventId = params?.id
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subs, setSubs] = useState<SubmissionItem[]>([])
  const [editedScores, setEditedScores] = useState<Record<string, number | "">>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [wentWell, setWentWell] = useState<Record<string, string>>({})
  const [keyPoints, setKeyPoints] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!eventId) return
    const ctrl = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const url = `${base}/api/submissions?eventId=${encodeURIComponent(String(eventId))}`
        const res = await fetch(url, { signal: ctrl.signal, credentials: "include" })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load submissions")
        const arr = Array.isArray(data?.submissions) ? data.submissions : []
        setSubs(arr)
        // Initialize edited scores/feedback so Save is available immediately
        const initScores: Record<string, number | ""> = {}
        const initFeedbacks: Record<string, string> = {}
        const initWentWell: Record<string, string> = {}
        const initKeyPoints: Record<string, string> = {}
        for (const it of arr) {
          const id = (it as any)?._id
          if (id) {
            initScores[id] = typeof (it as any).score === 'number' ? (it as any).score : ""
            const fb = typeof (it as any).feedback === 'string' ? (it as any).feedback : ""
            initFeedbacks[id] = fb
            if (fb) {
              // naive parse of previously saved structured feedback
              const wwMatch = fb.match(/What went well:\n([\s\S]*?)(\n\n|$)/)
              if (wwMatch) initWentWell[id] = wwMatch[1].trim()
              const kpMatch = fb.match(/Key points:\n([\s\S]*?)(\n\n|$)/)
              if (kpMatch) {
                const lines = kpMatch[1].split(/\r?\n/).map((l: string) => l.replace(/^[-*]\s*/, '')).filter(Boolean).join("\n")
                initKeyPoints[id] = lines
              }
            }
          }
        }
        setEditedScores(initScores)
        setFeedbacks(initFeedbacks)
        setWentWell(initWentWell)
        setKeyPoints(initKeyPoints)
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load submissions")
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => ctrl.abort()
  }, [eventId])

  // Removed auto-redirect to evaluate page since the route was deleted

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Event Submissions</h1>
            <p className="mt-1 text-sm text-slate-600">Review, score, and leave structured feedback. Make sure to save each review.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-lg shadow-sm" onClick={() => router.back()}>Back</Button>
            <Button asChild variant="cta" className="rounded-lg">
              <Link prefetch href={`/events/${eventId}`}>View Event</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="inline-flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading submissions…</span>
            </div>
          </div>
        ) : error ? (
          <Card className="rounded-xl border border-red-200 bg-red-50/50">
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        ) : subs.length === 0 ? (
          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center text-slate-600">No submissions yet for this event.</CardContent>
          </Card>
        ) : (
          <div>
            <div className="mb-4 text-sm text-slate-600">{subs.length} Submission{subs.length !== 1 ? 's' : ''}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {subs.map((s) => {
                const status = (s as any).status || 'pending'
                const statusClasses = status === 'reviewed'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : status === 'in_review'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                return (
                  <Card key={s._id} className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{s.title}</CardTitle>
                          <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-2">
                            {s.team?.name && (
                              <Badge variant="outline" className="rounded-md">Team: {s.team.name}</Badge>
                            )}
                            {status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClasses}`}>{status}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button asChild size="sm" variant="outline" className="rounded-full shadow-sm px-3">
                            <a href={s.repoUrl || '#'} target={s.repoUrl ? "_blank" : undefined} rel="noreferrer" className={`flex items-center gap-1 ${!s.repoUrl ? 'pointer-events-none opacity-50' : ''}`}>
                              <Github className="h-4 w-4" />
                              <span>Repo</span>
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="rounded-full shadow-sm px-3">
                            <a href={s.docsUrl || '#'} target={s.docsUrl ? "_blank" : undefined} rel="noreferrer" className={`flex items-center gap-1 ${!s.docsUrl ? 'pointer-events-none opacity-50' : ''}`}>
                              <FileText className="h-4 w-4" />
                              <span>Docs</span>
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="rounded-full shadow-sm px-3">
                            <a href={s.videoUrl || '#'} target={s.videoUrl ? "_blank" : undefined} rel="noreferrer" className={`flex items-center gap-1 ${!s.videoUrl ? 'pointer-events-none opacity-50' : ''}`}>
                              <VideoIcon className="h-4 w-4" />
                              <span>Video</span>
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid gap-1">
                            <Label htmlFor={`score-${s._id}`} className="text-slate-600">Score</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`score-${s._id}`}
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                className="w-24"
                                value={editedScores[s._id] ?? (typeof (s as any).score === 'number' ? (s as any).score : "")}
                                onChange={(e) => {
                                  const val = e.target.value
                                  const num = val === "" ? "" : Number(val)
                                  if (num === "" || (!Number.isNaN(num) && num >= 0 && num <= 100)) {
                                    setEditedScores((prev) => ({ ...prev, [s._id]: num }))
                                  }
                                }}
                                placeholder="0-100"
                              />
                              <Button
                                size="sm"
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md px-4"
                                disabled={
                                  saving[s._id] ||
                                  !(
                                    (editedScores[s._id] !== undefined && editedScores[s._id] !== "") ||
                                    typeof (s as any).score === 'number'
                                  )
                                }
                                onClick={async () => {
                                  const scoreVal = editedScores[s._id]
                                  const effectiveScore = (scoreVal === "" ? (typeof (s as any).score === 'number' ? (s as any).score : "") : scoreVal)
                                  if (effectiveScore === "" || typeof effectiveScore !== 'number') {
                                    toast.error('Please enter a score between 0 and 100.')
                                    return
                                  }
                                  try {
                                    setSaving((p) => ({ ...p, [s._id]: true }))
                                    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
                                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                                    const combinedFeedback = (() => {
                                      const parts: string[] = []
                                      const f = (feedbacks[s._id] ?? "").trim()
                                      const ww = (wentWell[s._id] ?? "").trim()
                                      const kp = (keyPoints[s._id] ?? "").trim()
                                      if (ww) parts.push(`What went well:\n${ww}`)
                                      if (kp) {
                                        const items = kp.split(/\r?\n/).filter(Boolean).map((l: string) => `- ${l}`)
                                        parts.push(["Key points:", ...items].join("\n"))
                                      }
                                      if (f) parts.push(`Additional notes:\n${f}`)
                                      return parts.join("\n\n")
                                    })()
                                    const res = await fetch(`${base}/api/submissions/${s._id}/score`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                      },
                                      body: JSON.stringify({ score: effectiveScore, feedback: combinedFeedback }),
                                      credentials: 'include',
                                    })
                                    const data = await res.json().catch(() => ({}))
                                    if (!res.ok) throw new Error(data?.message || 'Failed to save score')
                                    // Update the submission locally (score and status)
                                    setSubs((prev) => prev.map((it) => it._id === s._id ? { ...it, status: 'reviewed', ...(typeof data?.submission?.score === 'number' ? { score: data.submission.score } : {}) , ...(typeof data?.submission?.feedback === 'string' ? { feedback: data.submission.feedback } : {}) } as any : it))
                                    setEditedScores((prev) => ({ ...prev, [s._id]: typeof data?.submission?.score === 'number' ? data.submission.score : effectiveScore }))
                                    toast.success('Score saved')
                                  } catch (e) {
                                    console.error(e)
                                    toast.error((e as any)?.message || 'Failed to save score')
                                  } finally {
                                    setSaving((p) => ({ ...p, [s._id]: false }))
                                  }
                                }}
                              >
                                <span className="flex items-center gap-1">
                                  {saving[s._id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <SaveIcon className="h-4 w-4" />
                                  )}
                                  <span>{saving[s._id] ? 'Saving' : 'Save'}</span>
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <div className="grid gap-1">
                            <Label htmlFor={`feedback-${s._id}`} className="text-slate-600">Overall feedback</Label>
                            <Textarea
                              id={`feedback-${s._id}`}
                              rows={2}
                              placeholder="Overall feedback (optional)"
                              value={feedbacks[s._id] ?? ""}
                              onChange={(e) => setFeedbacks((prev) => ({ ...prev, [s._id]: e.target.value }))}
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`wentwell-${s._id}`} className="text-slate-600">What went well</Label>
                            <Textarea
                              id={`wentwell-${s._id}`}
                              rows={2}
                              placeholder="What went well (optional)"
                              value={wentWell[s._id] ?? ""}
                              onChange={(e) => setWentWell((prev) => ({ ...prev, [s._id]: e.target.value }))}
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`kps-${s._id}`} className="text-slate-600">Key points</Label>
                            <Textarea
                              id={`kps-${s._id}`}
                              rows={2}
                              placeholder="Key points (one per line)"
                              value={keyPoints[s._id] ?? ""}
                              onChange={(e) => setKeyPoints((prev) => ({ ...prev, [s._id]: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )})}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

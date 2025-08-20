"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

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
        for (const it of arr) {
          const id = (it as any)?._id
          if (id) {
            initScores[id] = typeof (it as any).score === 'number' ? (it as any).score : ""
            initFeedbacks[id] = typeof (it as any).feedback === 'string' ? (it as any).feedback : ""
          }
        }
        setEditedScores(initScores)
        setFeedbacks(initFeedbacks)
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Event Submissions</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-lg shadow-sm" onClick={() => router.back()}>Back</Button>
            <Button asChild className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg shadow-sm">
              <Link prefetch href={`/events/${eventId}`}>View Event</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-600">Loading submissions…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : subs.length === 0 ? (
          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardContent className="p-6 text-slate-600">No submissions yet for this event.</CardContent>
          </Card>
        ) : (
          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{subs.length} Submission{subs.length !== 1 ? 's' : ''}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {subs.map((s) => (
                  <div key={s._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">{s.title}</div>
                      <div className="text-sm text-slate-600 flex flex-wrap items-center gap-2">
                        {s.team?.name && (
                          <Badge variant="outline" className="rounded-md">Team: {s.team.name}</Badge>
                        )}
                        {s.status && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border text-slate-600">{s.status}</span>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-slate-600">Score</label>
                          <Input
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
                        </div>
                        <div className="sm:col-span-2">
                          <Textarea
                            rows={2}
                            placeholder="Optional feedback"
                            value={feedbacks[s._id] ?? ""}
                            onChange={(e) => setFeedbacks((prev) => ({ ...prev, [s._id]: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-full shadow-sm px-4">
                        <a href={s.repoUrl || '#'} target={s.repoUrl ? "_blank" : undefined} rel="noreferrer" className={!s.repoUrl ? 'pointer-events-none opacity-50' : ''}>Repo</a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full shadow-sm px-4">
                        <a href={s.docsUrl || '#'} target={s.docsUrl ? "_blank" : undefined} rel="noreferrer" className={!s.docsUrl ? 'pointer-events-none opacity-50' : ''}>Docs</a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full shadow-sm px-4">
                        <a href={s.videoUrl || '#'} target={s.videoUrl ? "_blank" : undefined} rel="noreferrer" className={!s.videoUrl ? 'pointer-events-none opacity-50' : ''}>Video</a>
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm"
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
                            const res = await fetch(`${base}/api/submissions/${s._id}/score`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              },
                              body: JSON.stringify({ score: effectiveScore, feedback: feedbacks[s._id] ?? "" }),
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
                        {saving[s._id] ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

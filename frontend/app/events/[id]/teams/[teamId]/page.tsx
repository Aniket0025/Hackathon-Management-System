"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Member = { _id: string; name?: string; email?: string }

type Submission = {
  _id: string
  title: string
  description?: string
  repoUrl?: string
  docsUrl?: string
  videoUrl?: string
  score?: number
  status: string
  createdAt: string
  updatedAt: string
}

type Team = {
  _id: string
  name: string
  score?: number
  members?: Member[]
}

type Review = {
  score: number
  feedback?: string
  createdAt: string
  judge?: { name?: string; email?: string }
}

export default function TeamDetailsPage() {
  const params = useParams<{ id: string; teamId: string }>()
  const eventId = params?.id
  const teamId = params?.teamId
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [subs, setSubs] = useState<Submission[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgReview, setAvgReview] = useState<{ average: number | null; count: number }>({ average: null, count: 0 })

  useEffect(() => {
    if (!teamId) return
    const ctrl = new AbortController()
    const load = async () => {
      try {
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`${base}/api/teams/${teamId}`,
          { signal: ctrl.signal, headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load team details")
        setTeam(data?.team || null)
        setSubs(Array.isArray(data?.submissions) ? data.submissions : [])
        if (data?.averageReview) setAvgReview(data.averageReview)
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load team details")
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => ctrl.abort()
  }, [teamId])

  useEffect(() => {
    if (!teamId) return
    const ctrl = new AbortController()
    const loadReviews = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`${base}/api/teams/${teamId}/reviews`, {
          signal: ctrl.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
        }
      } catch {}
    }
    loadReviews()
    return () => ctrl.abort()
  }, [teamId])

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl">Team Details</CardTitle>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/events/${eventId}/teams`}>Back to Teams</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/events/${eventId}`}>Event</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-slate-600">Loading…</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : !team ? (
              <div className="text-slate-700">Team not found.</div>
            ) : (
              <div className="space-y-6">
                <section className="border rounded-lg p-4 bg-white/70">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{team.name}</h2>
                    {typeof team.score === "number" && (
                      <div className="text-sm text-slate-700">Score: <span className="font-medium">{team.score}</span></div>
                    )}
                  </div>
                  {avgReview && (
                    <div className="mt-1 text-sm text-slate-700">Average judge score: {avgReview.average === null ? 'N/A' : Math.round(avgReview.average * 10) / 10} {avgReview.count ? `(${avgReview.count} review${avgReview.count>1?'s':''})` : ''}</div>
                  )}
                  {team.members && team.members.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium mb-1">Members</div>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-slate-700">
                        {team.members.map(m => (
                          <li key={m._id}>{m.name || m.email || m._id}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                <section className="border rounded-lg p-4 bg-white/70">
                  <h3 className="text-lg font-semibold mb-3">Submissions</h3>
                  {subs.length === 0 ? (
                    <div className="text-slate-700">No submissions yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {subs.map(s => (
                        <div key={s._id} className="border rounded-md p-4 bg-white">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="text-sm text-slate-600">Last updated: {new Date(s.updatedAt || s.createdAt).toLocaleString()}</div>
                            <div className="text-xs px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50">{s.status}</div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-sm text-slate-700 mb-1">Title</div>
                              <div className="text-base font-medium text-slate-900">{s.title || '—'}</div>
                            </div>

                            <div>
                              <div className="text-sm text-slate-700 mb-1">Description</div>
                              <div className="text-sm text-slate-800 whitespace-pre-wrap">{s.description || '—'}</div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-slate-700 mb-1">GitHub Repo</div>
                                {s.repoUrl ? (
                                  <a className="text-cyan-700 underline break-all" href={s.repoUrl} target="_blank" rel="noreferrer">{s.repoUrl}</a>
                                ) : (
                                  <div className="text-sm text-slate-500">—</div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm text-slate-700 mb-1">Docs</div>
                                {s.docsUrl ? (
                                  <a className="text-cyan-700 underline break-all" href={s.docsUrl} target="_blank" rel="noreferrer">{s.docsUrl}</a>
                                ) : (
                                  <div className="text-sm text-slate-500">—</div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm text-slate-700 mb-1">Video</div>
                                {s.videoUrl ? (
                                  <a className="text-cyan-700 underline break-all" href={s.videoUrl} target="_blank" rel="noreferrer">{s.videoUrl}</a>
                                ) : (
                                  <div className="text-sm text-slate-500">—</div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                              {typeof s.score === 'number' && (
                                <span>Score: <span className="font-medium">{s.score}</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="border rounded-lg p-4 bg-white/60">
                  <h3 className="text-lg font-semibold mb-2">Reviews & Feedback</h3>
                  {reviews.length === 0 ? (
                    <div className="text-slate-700 text-sm">No reviews yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r, idx) => (
                        <div key={idx} className="border rounded p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-800">Score: <span className="font-semibold">{r.score}</span></div>
                            <div className="text-xs text-slate-600">{new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                          {r.feedback && <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{r.feedback}</div>}
                          {r.judge && (
                            <div className="mt-1 text-xs text-slate-600">By: {r.judge.name || r.judge.email || 'Judge'}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Star } from "lucide-react"

interface SubmissionItem {
  _id: string
  title: string
  status?: string
  score?: number
  team?: { _id: string; name: string }
  feedback?: string
}

export default function EventScoresPage() {
  const params = useParams<{ id: string }>()
  const eventId = useMemo(() => String(params?.id || ""), [params])
  const router = useRouter()

  const [subs, setSubs] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/submissions?eventId=${encodeURIComponent(eventId)}`, { signal: ctrl.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load submissions")
        const arr: SubmissionItem[] = Array.isArray(data?.submissions) ? data.submissions : []
        setSubs(arr)
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load submissions")
      } finally {
        setLoading(false)
      }
    }
    if (eventId) load()
    return () => ctrl.abort()
  }, [eventId])

  const sorted = [...subs].sort((a, b) => (b.score || 0) - (a.score || 0))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/events/${eventId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event
            </Button>
            <h1 className="text-2xl font-semibold">Team Scores</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>
        )}

        <Card className="rounded-xl border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5"/> Scores Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading scores…</div>
            ) : sorted.length === 0 ? (
              <div className="text-sm text-muted-foreground">No submissions yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Rank</th>
                      <th className="py-2 pr-4">Team</th>
                      <th className="py-2 pr-4">Project</th>
                      <th className="py-2 pr-4">Score</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Feedback</th>
                      <th className="py-2 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s, idx) => (
                      <tr key={s._id} className="border-t">
                        <td className="py-2 pr-4 font-medium">#{idx + 1}</td>
                        <td className="py-2 pr-4">{s.team?.name || "—"}</td>
                        <td className="py-2 pr-4">{s.title || "—"}</td>
                        <td className="py-2 pr-4 font-semibold">{s.score ?? 0}</td>
                        <td className="py-2 pr-4">{s.status || "—"}</td>
                        <td className="py-2 pr-4 max-w-[320px] truncate" title={s.feedback || ""}>{s.feedback || "—"}</td>
                        <td className="py-2 pr-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/judge/events/${eventId}/submissions`)}
                          >
                            View Submission <ExternalLink className="w-4 h-4 ml-2"/>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

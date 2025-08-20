"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Users } from "lucide-react"

interface ReviewItem {
  id: string
  score: number
  feedback?: string
  createdAt: string
  event?: { id: string; title: string } | null
  team?: { id: string; name: string } | null
  judge?: { id: string; name?: string; email?: string } | null
}

export default function JudgeWorkPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const judgeId = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  useEffect(() => {
    const run = async () => {
      if (!judgeId) return
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`${base}/api/judges/${judgeId}/work`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          cache: "no-store",
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load judge work (${res.status})`)
        }
        const data = await res.json()
        setReviews(data.reviews || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load judge work")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [judgeId])

  const avgScore = useMemo(() => {
    if (!reviews.length) return null
    const sum = reviews.reduce((acc, r) => acc + (r.score || 0), 0)
    return +(sum / reviews.length).toFixed(2)
  }, [reviews])

  return (
    <DashboardLayout hideSidebar>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} className="px-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Judge Work</h1>
            <p className="text-slate-600 mt-1">Reviews completed by this judge across your events</p>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Overview of work</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-slate-600">Loading…</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700">Total Reviews:</span>
                  <Badge variant="secondary">{reviews.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-700">Average Score:</span>
                  <Badge variant="secondary">{avgScore ?? "—"}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Review Activity</CardTitle>
            <CardDescription>Most recent first</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-slate-600">Loading…</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : reviews.length === 0 ? (
              <div className="text-slate-600">No reviews yet</div>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="p-3 border rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">
                        {r.team?.name ? `${r.team.name}` : "Team"} — {r.event?.title || "Event"}
                      </div>
                      <Badge>{r.score}</Badge>
                    </div>
                    {r.feedback && (
                      <div className="text-slate-700 mt-2 whitespace-pre-wrap">{r.feedback}</div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

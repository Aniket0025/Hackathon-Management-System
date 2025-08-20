"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Team = {
  _id: string
  name: string
  score?: number
  members?: Array<{ _id: string; name?: string; email?: string }>
}

export default function EventTeamsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    if (!id) return
    const ctrl = new AbortController()
    const load = async () => {
      try {
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const url = new URL("/api/teams", base)
        url.searchParams.set("eventId", String(id))
        url.searchParams.set("limit", "100")
        const res = await fetch(url.toString(), { signal: ctrl.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load teams")
        setTeams(Array.isArray(data?.teams) ? data.teams : [])
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load teams")
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => ctrl.abort()
  }, [id])

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Event Teams</CardTitle>
              <Button asChild variant="outline">
                <Link href={`/events/${id}`}>Back to Event</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-slate-600">Loading teams…</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : teams.length === 0 ? (
              <div className="text-slate-700">No teams found for this event.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((t) => (
                  <div
                    key={t._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/events/${id}/teams/${t._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/events/${id}/teams/${t._id}`)
                      }
                    }}
                    className="border rounded-lg p-4 bg-white/70 flex flex-col gap-2 hover:shadow-sm transition group cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <div className="font-semibold text-lg">{t.name}</div>
                    {typeof t.score === "number" && (
                      <div className="text-sm text-slate-700">Score: {t.score}</div>
                    )}
                    {t.members && t.members.length > 0 && (
                      <div className="mt-2 text-sm text-slate-700">
                        <div className="font-medium mb-1">Members</div>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {t.members.map((m) => (
                            <li key={m._id}>{m.name || m.email || m._id}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-1">
                      <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/events/${id}/teams/${t._id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

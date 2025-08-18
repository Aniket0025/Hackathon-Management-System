"use client"

import { useEffect, useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "next/navigation"

type Team = { _id: string; name: string; score?: number; eventName?: string }
type EventItem = { _id: string; title: string }

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventId, setEventId] = useState<string>("all")
  const searchParams = useSearchParams()

  // Initialize event filter from URL query (?eventId=...)
  useEffect(() => {
    const id = searchParams.get("eventId")
    if (id) setEventId(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const load = async () => {
      setError(null)
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const params = new URLSearchParams({ sort: "score_desc", limit: "9" })
        if (eventId && eventId !== "all") params.set("eventId", eventId)
        const res = await fetch(`${base}/api/teams?${params.toString()}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load leaderboard')
        setLeaders(Array.isArray(data?.teams) ? data.teams : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId])

  // Load events for filter
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load events')
        setEvents(Array.isArray(data?.events) ? data.events : [])
      } catch {
        // non-fatal
      }
    }
    loadEvents()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <AdvancedNavigation currentPath="/leaderboard" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 mb-3">
            <Trophy className="w-4 h-4 mr-2" />
            Live Leaderboard
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Top Performing Teams</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Real-time rankings based on judging, public votes, and impact.
          </p>
          <div className="mt-6 mx-auto flex flex-col items-center gap-2">
            <div className="text-xs uppercase tracking-wide text-slate-500">Filter by event</div>
            <Select value={eventId} onValueChange={(v) => setEventId(v)}>
              <SelectTrigger className="w-64 sm:w-80 bg-white rounded-md shadow-sm border-slate-200">
                <SelectValue placeholder="Choose an event (optional)" />
              </SelectTrigger>
              <SelectContent className="w-64 sm:w-80">
                <SelectItem value="all">All Events</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev._id} value={ev._id}>{ev.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-center mb-6 text-sm">{error}</p>
        )}

        {/* Results summary */}
        {!loading && !error && (
          <div className="flex items-center justify-center mb-4 gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-slate-200 text-slate-700 shadow-sm">
              Showing {leaders.length} team{leaders.length === 1 ? '' : 's'}
            </span>
            {eventId !== 'all' && (
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm">
                {events.find(e => e._id === eventId)?.title || 'Selected Event'}
              </span>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" /> <span className="bg-slate-200 h-4 w-32 inline-block rounded" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-slate-300 mb-2">0</div>
                  <div className="bg-slate-200 h-5 w-24 rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            leaders.length === 0 ? (
              <div className="col-span-full text-center text-slate-600 py-10">
                No teams found for the selected filter.
              </div>
            ) : (
              leaders.map((l) => (
                <Card key={l._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" /> {l.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-slate-900 mb-2">{typeof l.score === 'number' ? l.score : '—'}</div>
                    {l.eventName && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">{l.eventName}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      </main>
    </div>
  )
}

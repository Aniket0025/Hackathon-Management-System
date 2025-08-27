"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"

type Team = { _id: string; name: string; score?: number; eventName?: string }

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string>("")
  const searchParams = useSearchParams()
  const socketRef = useRef<Socket | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000", [])

  // Initialize eventId from URL query (?eventId=...)
  useEffect(() => {
    const id = searchParams.get("eventId")
    if (id) setEventId(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadLeaders = useMemo(() => {
    return async () => {
      setError(null)
      try {
        setLoading(true)
        if (!eventId) throw new Error('Missing eventId. Please open from an event card.')
        const params = new URLSearchParams({ sort: "score_desc", limit: "9" })
        params.set("eventId", eventId)
        const res = await fetch(`${apiBase}/api/teams?${params.toString()}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load leaderboard')
        setLeaders(Array.isArray(data?.teams) ? data.teams : [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
  }, [apiBase, eventId])

  useEffect(() => { loadLeaders() }, [loadLeaders])

  // No events dropdown: page is event-scoped only

  // Real-time updates via Socket.IO with polling fallback
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    // Always set up a polling fallback (every 20s)
    pollRef.current = setInterval(() => {
      loadLeaders()
    }, 20000)

    if (!token) {
      return () => {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }

    // Attempt socket connection when token available
    try {
      const socket = io(apiBase, {
        transports: ["websocket"],
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      })
      socketRef.current = socket

      socket.on('connect', () => {
        // initial refresh after connection
        loadLeaders()
      })
      socket.on('leaderboard:update', (payload: { event?: string; reason?: string }) => {
        // If a specific event is selected, only refresh on matching event
        if (!payload) return
        if (payload.event && payload.event === eventId) {
          loadLeaders()
        }
      })
      socket.on('disconnect', () => {
        // Keep polling fallback active
      })
    } catch {
      // ignore socket errors; polling will keep it fresh
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [apiBase, eventId, loadLeaders])

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
          {/* Event filter removed: this page only shows leaderboard for a specific event via ?eventId=... */}
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
                No teams found for this event.
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

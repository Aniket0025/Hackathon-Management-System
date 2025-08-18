"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, ArrowLeft } from "lucide-react"

type Team = {
  _id: string
  name: string
  event?: string
  eventName?: string
  score?: number
  members?: Array<{ _id?: string; name?: string }>
}

export default function EventTeamsPage() {
  const params = useParams<{ id: string }>()
  const eventId = params?.id

  const [role, setRole] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load role
  useEffect(() => {
    const loadRole = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { setRole(null); return }
        const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (meRes.ok) {
          const me = await meRes.json().catch(() => ({}))
          setRole(me?.user?.role ?? null)
        } else {
          setRole(null)
        }
      } catch {
        setRole(null)
      } finally {
        setLoadingRole(false)
      }
    }
    loadRole()
  }, [])

  // Load teams for event (backend already restricts to organizer-owned events)
  useEffect(() => {
    if (!eventId) return
    const ctrl = new AbortController()
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const params = new URLSearchParams({ eventId: String(eventId) })
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`
        const res = await fetch(`${base}/api/teams?${params.toString()}`, { signal: ctrl.signal, headers })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load teams")
        setTeams(Array.isArray(data?.teams) ? data.teams : [])
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load teams')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => ctrl.abort()
  }, [eventId])

  if (loadingRole) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="text-center text-slate-600">Loading…</div>
        </main>
      </div>
    )
  }

  // Guard: organizers only
  if (role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Badge variant="secondary" className="mb-3 flex items-center gap-1 justify-center"><Shield className="w-4 h-4"/> Access Restricted</Badge>
          <h1 className="text-2xl font-bold mb-2">Organizer Access Only</h1>
          <p className="text-slate-600 mb-4">This page is only available to organizers.</p>
          <Link href={`/events/${eventId}`}>
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4"/>Back to Event</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AdvancedNavigation currentPath="/events" />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 mb-3">
            <Users className="w-4 h-4 mr-2"/>
            Event Teams
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Teams</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">All teams registered for this event.</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-600">Loading teams…</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : teams.length === 0 ? (
          <div className="text-center text-slate-600">No teams found for this event.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {teams.map((t) => (
              <Card key={t._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate" title={t.name}>{t.name}</span>
                    {typeof t.score === 'number' && (
                      <Badge variant="outline">Score: {t.score}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600 space-y-1">
                    {t.eventName && <div>Event: {t.eventName}</div>}
                    <div>Members: {t.members?.length ?? 0}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href={`/events/${eventId}`}>
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4"/>Back to Event</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

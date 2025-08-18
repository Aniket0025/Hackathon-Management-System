"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User, Star } from "lucide-react"

type EventItem = {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  status: "draft" | "upcoming" | "ongoing" | "completed"
  organizer?: { _id: string; name: string; email?: string }
  fees?: number
  website?: string
  registrationDeadline?: string
  participantType?: "individual" | "group"
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  registrationLimit?: number
  bannerUrl?: string
}

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topTeams, setTopTeams] = useState<Array<{ _id: string; name: string; score?: number }>>([])
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const ctrl = new AbortController()
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${id}`, { signal: ctrl.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load event")
        setEvent(data.event)
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => ctrl.abort()
  }, [id])

  // Load current user role (to hide Register for organizers)
  useEffect(() => {
    const loadRole = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) return
        const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (meRes.ok) {
          const me = await meRes.json().catch(() => ({}))
          setRole(me?.user?.role || null)
        }
      } catch {
        // ignore errors
      }
    }
    loadRole()
  }, [])

  // Load top teams for this event
  useEffect(() => {
    if (!id) return
    const ctrl = new AbortController()
    const loadTeams = async () => {
      try {
        setTeamsError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const params = new URLSearchParams({ sort: "score_desc", limit: "5", eventId: String(id) })
        const res = await fetch(`${base}/api/teams?${params.toString()}`, { signal: ctrl.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load teams")
        setTopTeams(Array.isArray(data?.teams) ? data.teams : [])
      } catch (e: any) {
        if (e?.name !== 'AbortError') setTeamsError(e?.message || "Failed to load teams")
      }
    }
    loadTeams()
    return () => ctrl.abort()
  }, [id])

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        {loading ? (
          <Card className="max-w-3xl mx-auto border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="h-6 w-48 bg-slate-200 rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 rounded md:col-span-2" />
              </div>
              <div className="h-10 w-32 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !event ? (
          <div className="text-slate-600">Event not found.</div>
        ) : (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              {event.bannerUrl && (
                <div className="-mx-6 -mt-6 mb-4">
                  <img src={event.bannerUrl} alt={event.title} className="w-full h-56 object-cover rounded-t-md" />
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <Badge variant="outline">{event.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && <p className="text-slate-700 whitespace-pre-wrap">{event.description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {fmtDate(event.startDate)} - {fmtDate(event.endDate)}</div>
                {event.location && (
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-2 md:col-span-2"><User className="w-4 h-4" /> Organized by {event.organizer.name}{event.organizer.email ? ` (${event.organizer.email})` : ""}</div>
                )}
                {typeof event.fees === "number" && (
                  <div className="md:col-span-1">Fees: {event.fees === 0 ? "Free" : event.fees}</div>
                )}
                {event.website && (
                  <div className="md:col-span-1 truncate">Website: <a className="text-cyan-700 underline" href={event.website} target="_blank" rel="noopener noreferrer">{event.website}</a></div>
                )}
                {event.registrationDeadline && (
                  <div className="md:col-span-1">Registration Deadline: {fmtDate(event.registrationDeadline)}</div>
                )}
                {event.participantType && (
                  <div className="md:col-span-1">Participant Type: {event.participantType === "individual" ? "Individual" : "Group"}</div>
                )}
                {typeof event.registrationLimit === "number" && (
                  <div className="md:col-span-1">Registration Limit: {event.registrationLimit}</div>
                )}
                {(event.contactName || event.contactEmail || event.contactPhone) && (
                  <div className="md:col-span-2 space-y-1">
                    <div className="font-medium">Organizer Contact</div>
                    {event.contactName && <div>Name: {event.contactName}</div>}
                    {event.contactEmail && <div>Email: <a className="text-cyan-700 underline" href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a></div>}
                    {event.contactPhone && <div>Phone: {event.contactPhone}</div>}
                  </div>
                )}
              </div>
              <div className="pt-2">
                {role !== 'organizer' && (
                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700 transition-colors">
                    <Link prefetch href={`/events/${event._id}/register`}>Register</Link>
                  </Button>
                )}
              </div>

              {/* Team Performance subsection */}
              <div className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">Team Performance</h3>
                  </div>
                </div>
                {teamsError ? (
                  <div className="text-sm text-red-600">{teamsError}</div>
                ) : topTeams.length === 0 ? (
                  <div className="text-sm text-slate-600">No teams yet for this event.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topTeams.map((t) => (
                      <div key={t._id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">{t.name}</span>
                        </div>
                        <div className="text-xl font-bold">{typeof t.score === 'number' ? t.score : '—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

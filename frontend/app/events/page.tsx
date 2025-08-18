"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Plus, MapPin, Users, Clock } from "lucide-react"

type EventItem = {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  status: "draft" | "upcoming" | "ongoing" | "completed"
  organizer?: { _id: string; name: string }
  registrationDeadline?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        // fetch role if logged in
        if (token) {
          const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          if (meRes.ok) {
            const me = await meRes.json()
            setRole(me?.user?.role || null)
          }
        }

        // Fetch all events for everyone (participants, judges, organizers)
        const evRes = await fetch(`${base}/api/events`)
        if (!evRes.ok) throw new Error(`Failed to load events (${evRes.status})`)
        const data = await evRes.json()
        setEvents(data?.events || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load events")
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            Discover Events
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Browse Events</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            All events are visible to participants and judges. Organizers can also create new events.
          </p>
          {role === "organizer" && (
            <div className="mt-6 flex justify-center">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700 transition-colors">
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />Create Event
                </Link>
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-slate-600">Loading events…</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((ev) => (
              <Card key={ev._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl">{ev.title}</CardTitle>
                    {ev.registrationDeadline && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5" /> Reg: {fmtDate(ev.registrationDeadline)}
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {fmtDate(ev.startDate)} - {fmtDate(ev.endDate)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ev.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Badge variant="outline">{ev.status}</Badge>
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 transition-colors">
                    <Link prefetch href={`/events/${ev._id}/register`}>Register</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="transition-colors">
                    <Link prefetch href={`/events/${ev._id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center text-slate-600">No events found.</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

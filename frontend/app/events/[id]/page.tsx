"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User } from "lucide-react"

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
}

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${id}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load event")
        setEvent(data.event)
      } catch (e: any) {
        setError(e?.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath={`/events/${id}`} />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        {loading ? (
          <div className="text-slate-600">Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !event ? (
          <div className="text-slate-600">Event not found.</div>
        ) : (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
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
                <Button asChild className="bg-gradient-to-r from-cyan-600 to-blue-600">
                  <Link href={`/events/${event._id}/register`}>Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

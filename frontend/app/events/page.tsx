"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

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
  bannerUrl?: string
  // Added to support card requirements
  mode?: "online" | "onsite" | "hybrid"
  fees?: number
  participantType?: "individual" | "group"
  minTeamSize?: number
  maxTeamSize?: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [view, setView] = useState<'all' | 'mine'>('all')
  const [stageFilter, setStageFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all')
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authedEmail, setAuthedEmail] = useState<string | null>(null)
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false)
  const router = useRouter()
  

  // Load current user info (role, id)
  useEffect(() => {
    const loadMe = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (token) {
          const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          if (meRes.ok) {
            const me = await meRes.json()
            const r = me?.user?.role || null
            const id = me?.user?._id || null
            const em = me?.user?.email || null
            setRole(r)
            setUserId(id)
            setAuthedEmail(em)
            if (r === 'organizer') setView('mine')
          }
        }
      } catch {
        // ignore
      } finally {
        setInitialized(true)
      }
    }
    loadMe()
  }, [])

  // Load events based on selected view
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const query = view === 'mine' && userId ? `?organizer=${encodeURIComponent(userId)}` : ''
        const evRes = await fetch(`${base}/api/events${query}`)
        if (!evRes.ok) throw new Error(`Failed to load events (${evRes.status})`)
        const data = await evRes.json()
        setEvents(data?.events || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load events")
      } finally {
        setLoading(false)
      }
    }
    if (!initialized) return // wait for user info determination
    if (view === 'mine' && !userId) return // wait for userId when organizer view
    loadEvents()
  }, [view, userId, initialized])

  // Load participant registrations to determine which events are already registered
  useEffect(() => {
    const loadRegs = async () => {
      try {
        if (!authedEmail) { setRegisteredEventIds(new Set()); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/registrations/mine?full=true&email=${encodeURIComponent(authedEmail)}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        const regs = Array.isArray(data?.registrations) ? data.registrations : []
        const ids = new Set<string>()
        for (const r of regs) {
          if (r?.event) ids.add(String(r.event))
        }
        setRegisteredEventIds(ids)
      } catch {
        setRegisteredEventIds(new Set())
      }
    }
    loadRegs()
  }, [authedEmail])

  

  // Parse a date that may be ISO or mm/dd/yyyy
  const parseAnyDate = (value?: string) => {
    if (!value) return null
    // Try native parsing first
    const d1 = new Date(value)
    if (!isNaN(d1.getTime())) return d1
    // Try mm/dd/yyyy manually
    const m = value.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/)
    if (m) {
      const mm = parseInt(m[1], 10) - 1
      const dd = parseInt(m[2], 10)
      const yyyy = parseInt(m[3], 10)
      const d = new Date(yyyy, mm, dd)
      if (!isNaN(d.getTime())) return d
    }
    return null
  }

  const daysRemaining = (deadline?: string) => {
    const d = parseAnyDate(deadline)
    if (!d) return null
    // Consider end of the day for deadline
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
    const now = new Date()
    const ms = endOfDay.getTime() - now.getTime()
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
    return days
  }

  // Compute status using provided status or fallback to dates
  const computeStatus = (ev: EventItem): 'upcoming' | 'ongoing' | 'completed' => {
    if (ev.status && ['upcoming','ongoing','completed'].includes(ev.status)) return ev.status as any
    const now = new Date()
    const s = parseAnyDate(ev.startDate) || new Date(ev.startDate)
    const e = parseAnyDate(ev.endDate) || new Date(ev.endDate)
    if (now < s) return 'upcoming'
    if (now <= e) return 'ongoing'
    return 'completed'
  }

  const filteredEvents = events.filter((ev) => {
    if (stageFilter === 'all') return true
    return computeStatus(ev) === stageFilter
  });

  const finalEvents = showRegisteredOnly
    ? filteredEvents.filter((ev) => registeredEventIds.has(ev._id))
    : filteredEvents

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
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700 transition-colors">
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />Create Event
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['all','upcoming','ongoing','completed'] as const).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={stageFilter === key ? 'default' : 'outline'}
                className={stageFilter === key ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                onClick={() => setStageFilter(key)}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showRegisteredOnly ? 'default' : 'outline'}
              className={showRegisteredOnly ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
              onClick={() => setShowRegisteredOnly((v) => !v)}
              disabled={!authedEmail}
              title={authedEmail ? 'Show only events you have registered for' : 'Login required to filter by registered'}
            >
              Registered
            </Button>
          </div>
          {/* Organizer view toggle removed as requested */}
        </div>

        {loading ? (
          <div className="text-center text-slate-600">Loading events…</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {finalEvents.length === 0 && (
              <div className="col-span-full text-center text-slate-600">No events found for this filter.</div>
            )}
            {finalEvents.length > 0 && finalEvents.map((ev) => (
                <Card key={ev._id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                  {ev.bannerUrl && (
                    <div className="-mx-6 -mt-6 mb-3">
                      <img
                        src={ev.bannerUrl}
                        alt={ev.title}
                        className="w-full h-40 object-cover rounded-t-md"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl">{ev.title}</CardTitle>
                    {ev.registrationDeadline && (() => {
                      const d = daysRemaining(ev.registrationDeadline)
                      if (d === null) return null
                      if (d < 0) return <span className="text-red-600 font-semibold">Closed</span>
                      return <span className="text-xs font-semibold blink-red-black">{d} days left</span>
                    })()}
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-700">
                    <div>
                      <span className="font-medium">Mode: </span>
                      <span>{ev.mode ? (ev.mode === 'online' ? 'Online' : ev.mode === 'onsite' ? 'Onsite' : 'Hybrid') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Fees: </span>
                      <span>{typeof ev.fees === 'number' ? (ev.fees === 0 ? 'Free' : ev.fees) : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Team Size: </span>
                      <span>
                        {ev.participantType === 'group' && typeof ev.minTeamSize === 'number' && typeof ev.maxTeamSize === 'number'
                          ? `${ev.minTeamSize} - ${ev.maxTeamSize}`
                          : 'Individual'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-3">
                  {role !== "organizer" && (
                    registeredEventIds.has(ev._id) ? (
                      <Button size="sm" variant="outline" disabled>
                        Registered
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 transition-colors"
                        onClick={() => {
                          try {
                            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                            if (!token) {
                              router.push(`/auth/login?next=${encodeURIComponent(`/events/${ev._id}/register`)}`)
                              return
                            }
                            router.push(`/events/${ev._id}/register`)
                          } catch {
                            router.push(`/auth/login?next=${encodeURIComponent(`/events/${ev._id}/register`)}`)
                          }
                        }}
                      >
                        Register
                      </Button>
                    )
                  )}
                  {/* Removed Organizer 'View Teams' link */}
                  <Button asChild size="sm" variant="outline" className="transition-colors">
                    <Link prefetch href={`/events/${ev._id}`}>View Details</Link>
                  </Button>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <style jsx>{`
        @keyframes blinkRB {
          0%, 100% { color: #ef4444; }
          50% { color: #000000; }
        }
        .blink-red-black {
          animation: blinkRB 1s step-end infinite;
        }
      `}</style>
      
    </div>
  )
}

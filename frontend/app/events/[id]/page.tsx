"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, User, Star, ArrowLeft, Trash2 } from "lucide-react"
import { formatDate, formatDateRange } from "@/lib/date"

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
  mode?: "online" | "onsite" | "hybrid"
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  registrationLimit?: number
  bannerUrl?: string
  themes?: string[]
  tracks?: string[]
  rules?: string
  rounds?: Array<{ title: string; description?: string; startDate: string; endDate: string }>
  prizes?: Array<{ type: 'cash' | 'certificate' | 'goodies' | 'other'; title: string; amount?: number }>
  sponsors?: Array<{ title: string; bannerUrl?: string }>
  minTeamSize?: number
  maxTeamSize?: number
}

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topTeams, setTopTeams] = useState<Array<{ _id: string; name: string; score?: number }>>([])
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [authedEmail, setAuthedEmail] = useState<string | null>(null)
  const [isRegisteredForThis, setIsRegisteredForThis] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Notify participants dialog state (organizer only)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyTitle, setNotifyTitle] = useState("")
  const [notifyMessage, setNotifyMessage] = useState("")
  const [notifyType, setNotifyType] = useState<"info" | "update" | "alert">("info")
  const [notifyLink, setNotifyLink] = useState("")
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifyFeedback, setNotifyFeedback] = useState<string | null>(null)

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
          const r = me?.user?.role || null
          const em = me?.user?.email || null
          setRole(r)
          setAuthedEmail(em)
        }
      } catch {
        // ignore errors
      }
    }
    loadRole()
  }, [])

  // Determine if current user is already registered for this event
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        if (!authedEmail || !id) { setIsRegisteredForThis(false); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/registrations/mine?full=true&email=${encodeURIComponent(authedEmail)}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        const regs = Array.isArray(data?.registrations) ? data.registrations : []
        const found = regs.some((r: any) => String(r?.event) === String(id))
        setIsRegisteredForThis(found)
      } catch {
        setIsRegisteredForThis(false)
      }
    }
    checkRegistration()
  }, [authedEmail, id])

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

  // Send notification to participants (organizer only)
  const handleNotifySend = async () => {
    if (!id) return
    setNotifyLoading(true)
    setNotifyFeedback(null)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setNotifyFeedback("You must be logged in")
        setNotifyLoading(false)
        return
      }
      const res = await fetch(`${base}/api/notifications/broadcast-to-event/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: notifyTitle, message: notifyMessage, type: notifyType, link: notifyLink })
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to send notification")
      setNotifyFeedback(`Sent to ${data?.recipients ?? 0} participant(s).`)
      // Reset minimal fields but keep dialog open to show feedback
      setNotifyTitle("")
      setNotifyMessage("")
      setNotifyLink("")
    } catch (e: any) {
      setNotifyFeedback(e?.message || "Failed to send notification")
    } finally {
      setNotifyLoading(false)
    }
  }

  const daysLeft = (iso: string) => {
    const now = new Date()
    const d = new Date(iso)
    const diffMs = d.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  const deadlineBadge = (iso: string) => {
    const d = daysLeft(iso)
    if (d <= 0) return <span className="text-xs font-semibold text-slate-500">Closed</span>
    const base = "text-xs font-semibold inline-block"
    if (d <= 3) return <span className={`${base} text-red-600 blink-red-black`}>{`${d} days left`}</span>
    if (d <= 7) return <span className={`${base} text-amber-600`}>{`${d} days left`}</span>
    return <span className={`${base} text-emerald-600`}>{`${d} days left`}</span>
  }

  // Delete handler for organizer
  const handleDelete = async () => {
    if (!event?._id) return
    try {
      setDeleting(true)
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setDeleting(false)
        router.push(`/auth/login?next=${encodeURIComponent(`/events/${event._id}`)}`)
        return
      }
      const res = await fetch(`${base}/api/events/${event._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `Failed to delete (status ${res.status})`)
      }
      setDeleteDialogOpen(false)
      router.push('/events')
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
      setConfirmText("")
    }
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

              {/* Stages & Timeline (skeleton placeholder) */}
              <div className="pt-6 space-y-3">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-24 w-full bg-slate-200 rounded" />
              </div>
              {/* Prizes (skeleton placeholder) */}
              <div className="pt-6 space-y-3">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="h-24 w-full bg-slate-200 rounded" />
                  <div className="h-24 w-full bg-slate-200 rounded" />
                </div>
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
              {event.bannerUrl ? (
                <div className="-mx-6 -mt-6 mb-4 relative">
                  <img src={event.bannerUrl} alt={event.title} className="w-full h-56 object-cover rounded-t-md" />
                  <div className="absolute top-3 left-3">
                    <Link href="/events">
                      <Button size="sm" variant="outline" className="gap-2 bg-white/80 backdrop-blur hover:bg-white">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-3xl font-semibold tracking-tight leading-snug">{event.title}</CardTitle>
                <div className="text-right">
                  <div className="text-sm text-slate-900 font-medium">{formatDateRange(event.startDate, event.endDate)}</div>
                  {event.registrationDeadline && (
                    <div className="mt-0.5">{deadlineBadge(event.registrationDeadline)}</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.description && <p className="text-slate-700 whitespace-pre-wrap">{event.description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                {event.location && (
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-2 md:col-span-2"><User className="w-4 h-4" /> Organized by {event.organizer.name}{event.organizer.email ? ` (${event.organizer.email})` : ""}</div>
                )}
                {event.mode && (
                  <div className="md:col-span-1">Mode: {event.mode === 'online' ? 'Online' : event.mode === 'onsite' ? 'Onsite' : 'Hybrid'}</div>
                )}
                {typeof event.fees === "number" && (
                  <div className="md:col-span-1">Fees: {event.fees === 0 ? "Free" : event.fees}</div>
                )}
                {event.website && (
                  <div className="md:col-span-1 truncate">Website: <a className="text-cyan-700 underline" href={event.website} target="_blank" rel="noopener noreferrer">{event.website}</a></div>
                )}
                {event.participantType && (
                  <div className="md:col-span-1">Participant Type: {event.participantType === "individual" ? "Individual" : "Group"}</div>
                )}
                {event.participantType === "group" && typeof event.minTeamSize === "number" && typeof event.maxTeamSize === "number" && (
                  <div className="md:col-span-1">Team Size: {event.minTeamSize} - {event.maxTeamSize}</div>
                )}
                {typeof event.registrationLimit === "number" && (
                  <div className="md:col-span-1">Registration Limit: {event.registrationLimit}</div>
                )}
              </div>
              <div className="border-t pt-6" />
              {/* Stages & Timeline */}
              {event.rounds && event.rounds.length > 0 && (
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Stages & Timeline</h3>
                  <div className="relative">
                    {/* vertical line */}
                    <div className="absolute left-7 top-0 bottom-0 w-px bg-slate-200" aria-hidden />
                    <div className="space-y-5">
                      {event.rounds.map((r, idx) => {
                        const sd = new Date(r.startDate)
                        const day = sd.getDate()
                        const month = sd.toLocaleString(undefined, { month: 'short' })
                        return (
                          <div key={idx} className="grid grid-cols-[56px_1fr] gap-3 items-start">
                            {/* date badge + dot */}
                            <div className="relative flex flex-col items-center">
                              <div className="w-12 h-12 rounded-lg bg-white border shadow-sm flex flex-col items-center justify-center">
                                <div className="text-xs font-medium text-slate-500">{month}</div>
                                <div className="text-lg font-bold text-slate-800 leading-none">{day}</div>
                              </div>
                              <div className="mt-2 w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-cyan-100" />
                            </div>
                            {/* content card */}
                            <div className="bg-white/80 border rounded-lg p-4 shadow-sm">
                              <div className="text-base font-semibold">{r.title}</div>
                              <div className="mt-1 text-sm text-slate-700">Start: {formatDate(r.startDate)} · End: {formatDate(r.endDate)}</div>
                              {r.description && (
                                <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{r.description}</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t pt-6" />
              {/* Rules */}
              {event.rules && (
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Rules</h3>
                  <div className="text-slate-700 whitespace-pre-wrap">
                    {event.rules}
                  </div>
                </div>
              )}
              <div className="border-t pt-6" />
            {/* Prizes */}
            {event.prizes && event.prizes.length > 0 && (
              <div className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Prizes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.prizes.map((p, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-white/70 hover:shadow-sm transition-all">
                      <div className="text-base font-semibold flex items-center gap-2">
                        {p.title}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">{p.type}</span>
                      </div>
                      {typeof p.amount === 'number' && (
                        <div className="text-sm text-slate-700">Amount: {p.amount}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
              <div className="border-t pt-6" />
            {/* Sponsors / Partners */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Sponsors / Partners</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.sponsors.map((s, idx) => (
                    <div key={idx} className="border rounded-lg p-4 flex gap-3 items-start bg-white/70 hover:bg-white hover:shadow-sm transition">
                      {s.bannerUrl && (
                        <img src={s.bannerUrl} alt={s.title} className="w-16 h-16 object-contain rounded bg-white border" />
                      )}
                      <div className="space-y-1">
                        <div className="text-base font-semibold">{s.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              <div className="border-t pt-6" />
            {/* Organizer Contact moved above Teams */}
            {(event.contactName || event.contactEmail || event.contactPhone) && (
              <div className="pt-6 md:col-span-2 space-y-1">
                <div className="font-medium">Organizer Contact</div>
                {event.contactName && <div>Name: {event.contactName}</div>}
                {event.contactEmail && <div>Email: <a className="text-cyan-700 underline" href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a></div>}
                {event.contactPhone && <div>Phone: {event.contactPhone}</div>}
              </div>
            )}
            {/* Actions at the very end */}
            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              {role !== 'organizer' ? (
                isRegisteredForThis ? (
                  <Button variant="outline" disabled>Registered</Button>
                ) : (
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-700 transition-colors shadow-sm"
                    onClick={() => {
                      try {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                        const nextUrl = `/events/${event._id}/register`
                        if (!token) {
                          router.push(`/auth/login?next=${encodeURIComponent(nextUrl)}`)
                          return
                        }
                        router.push(nextUrl)
                      } catch {
                        router.push(`/auth/login?next=${encodeURIComponent(`/events/${event._id}/register`)}`)
                      }
                    }}
                  >
                    Register
                  </Button>
                )
              ) : (
                <div className="flex gap-3">

                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700 transition-colors">
                    <Link prefetch href={`/events/${event._id}/teams`}>View Teams</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setNotifyFeedback(null); setNotifyOpen(true) }}
                  >
                    Notify Participants
                  </Button>

                  <Button asChild variant="outline">
                    <Link prefetch href={`/events/${event._id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => { setConfirmText(""); setDeleteDialogOpen(true) }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
    {/* Notify Participants Dialog */}
    <Dialog open={notifyOpen} onOpenChange={setNotifyOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notify participants</DialogTitle>
          <DialogDescription>
            Send a notification to all enrolled participants (team members) of this event.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} placeholder="e.g., Schedule Update" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea value={notifyMessage} onChange={(e) => setNotifyMessage(e.target.value)} placeholder="Include details for participants" rows={5} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={notifyType} onValueChange={(v) => setNotifyType(v as any)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Link (optional)</label>
              <Input value={notifyLink} onChange={(e) => setNotifyLink(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          {notifyFeedback && (
            <div className="text-sm rounded border p-2 bg-slate-50 text-slate-700">{notifyFeedback}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setNotifyOpen(false)} disabled={notifyLoading}>Close</Button>
          <Button onClick={handleNotifySend} disabled={notifyLoading || !notifyTitle.trim()} className="bg-cyan-600 hover:bg-cyan-700">
            {notifyLoading ? 'Sending…' : 'Send Notification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete event?</DialogTitle>
          <DialogDescription>
            This action permanently deletes the event{event?.title ? ` "${event.title}"` : ''}. Type
            <span className="px-1 mx-1 rounded bg-slate-100 border">confirm</span>
            to enable deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            placeholder="Type confirm to proceed"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            disabled={confirmText.trim().toLowerCase() !== 'confirm' || deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
)
}

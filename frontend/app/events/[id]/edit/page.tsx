"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

export default function EditEventPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loadingMe, setLoadingMe] = useState(true)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  const [openReg, setOpenReg] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    mode: "onsite" as "online" | "onsite" | "hybrid",
    fees: "",
    website: "",
    registrationDeadline: "",
    participantType: "individual" as "individual" | "group",
    minTeamSize: "",
    maxTeamSize: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    registrationLimit: "",
    bannerUrl: "",
    themes: "",
    tracks: "",
    rules: "",
    rounds: [] as Array<{ title: string; description: string; startDate: string; endDate: string }>,
    prizes: [] as Array<{ type: 'cash' | 'certificate' | 'goodies' | 'other'; title: string; amount?: string }>,
    sponsors: [] as Array<{ title: string; bannerUrl: string }>,
  })

  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { router.replace("/auth/login"); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!meRes.ok) { localStorage.removeItem("token"); router.replace("/auth/login"); return }
        const me = await meRes.json().catch(() => ({}))
        setRole(me?.user?.role || null)
        if (me?.user?.role !== "organizer") { router.replace(`/events/${id}`); return }
      } catch (e: any) {
        setError(e?.message || "Failed to verify user")
      } finally {
        setLoadingMe(false)
      }
    }
    init()
  }, [router, id])

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${id}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load event")
        const ev = data.event
        // Organizer ownership check (best-effort; backend should also enforce)
        // If organizer mismatch, redirect back
        // This assumes ev.organizer._id exists when populated
        // If not available, we still allow edit UI; server will enforce on PUT
        setForm({
          title: ev.title || "",
          description: ev.description || "",
          startDate: toLocalDateStr(new Date(ev.startDate)),
          endDate: toLocalDateStr(new Date(ev.endDate)),
          location: ev.location || "",
          mode: ev.mode || "onsite",
          fees: typeof ev.fees === 'number' ? String(ev.fees) : "",
          website: ev.website || "",
          registrationDeadline: ev.registrationDeadline ? toLocalDateStr(new Date(ev.registrationDeadline)) : "",
          participantType: ev.participantType || "individual",
          minTeamSize: typeof ev.minTeamSize === 'number' ? String(ev.minTeamSize) : "",
          maxTeamSize: typeof ev.maxTeamSize === 'number' ? String(ev.maxTeamSize) : "",
          contactName: ev.contactName || "",
          contactEmail: ev.contactEmail || "",
          contactPhone: ev.contactPhone || "",
          registrationLimit: typeof ev.registrationLimit === 'number' ? String(ev.registrationLimit) : "",
          bannerUrl: ev.bannerUrl || "",
          themes: Array.isArray(ev.themes) ? ev.themes.join(", ") : "",
          tracks: Array.isArray(ev.tracks) ? ev.tracks.join(", ") : "",
          rules: ev.rules || "",
          rounds: Array.isArray(ev.rounds) ? ev.rounds.map((r: any) => ({
            title: r.title || "",
            description: r.description || "",
            startDate: toLocalDateStr(new Date(r.startDate)),
            endDate: toLocalDateStr(new Date(r.endDate)),
          })) : [],
          prizes: Array.isArray(ev.prizes) ? ev.prizes.map((p: any) => ({
            type: p.type || 'cash',
            title: p.title || "",
            amount: typeof p.amount === 'number' ? String(p.amount) : "",
          })) : [],
          sponsors: Array.isArray(ev.sponsors) ? ev.sponsors.map((s: any) => ({
            title: s.title || "",
            bannerUrl: s.bannerUrl || "",
          })) : [],
        })
      } catch (e: any) {
        setError(e?.message || "Failed to load event")
      } finally {
        setLoadingEvent(false)
      }
    }
    loadEvent()
  }, [id])

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const parseLocalDateString = (s?: string) => {
    if (!s) return null
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return null
    const y = parseInt(m[1], 10)
    const mo = parseInt(m[2], 10) - 1
    const d = parseInt(m[3], 10)
    return new Date(y, mo, d)
  }

  const fmtDisplay = (value?: string) => {
    const d = parseLocalDateString(value)
    return d ? format(d, "MM/dd/yyyy") : ""
  }

  const toLocalDateStr = (d: Date | undefined | null) =>
    d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.title || !form.startDate || !form.endDate) {
      setError("Title, start date, and end date are required.")
      return
    }
    if (parseLocalDateString(form.endDate)! < parseLocalDateString(form.startDate)!) {
      setError("End date must be after start date.")
      return
    }
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      setError("Please provide a valid contact email.")
      return
    }
    if (form.registrationLimit !== "") {
      const n = Number(form.registrationLimit)
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
        setError("Registration limit must be a non-negative integer.")
        return
      }
    }
    if (form.participantType === "group") {
      const min = form.minTeamSize === "" ? 1 : Number(form.minTeamSize)
      const max = form.maxTeamSize === "" ? min : Number(form.maxTeamSize)
      if (!Number.isInteger(min) || min < 1) { setError("Minimum team size must be an integer of at least 1."); return }
      if (!Number.isInteger(max) || max < min) { setError("Maximum team size must be an integer greater than or equal to minimum."); return }
    }
    if (form.fees !== "") {
      const fee = Number(form.fees)
      if (!Number.isFinite(fee) || fee < 0) { setError("Fees must be a non-negative number (0 for free)."); return }
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          startDate: parseLocalDateString(form.startDate)!.toISOString(),
          endDate: parseLocalDateString(form.endDate)!.toISOString(),
          location: form.location || undefined,
          mode: form.mode,
          fees: form.fees !== "" ? Number(form.fees) : 0,
          website: form.website || undefined,
          registrationDeadline: form.registrationDeadline ? parseLocalDateString(form.registrationDeadline)!.toISOString() : undefined,
          participantType: form.participantType,
          minTeamSize: form.participantType === "group" ? (form.minTeamSize ? Number(form.minTeamSize) : 1) : undefined,
          maxTeamSize: form.participantType === "group" ? (form.maxTeamSize ? Number(form.maxTeamSize) : undefined) : undefined,
          contactName: form.contactName || undefined,
          contactEmail: form.contactEmail || undefined,
          contactPhone: form.contactPhone || undefined,
          registrationLimit: form.registrationLimit !== "" ? Number(form.registrationLimit) : undefined,
          bannerUrl: form.bannerUrl || undefined,
          themes: form.themes ? form.themes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          tracks: form.tracks ? form.tracks.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          rules: form.rules || undefined,
          rounds: form.rounds && form.rounds.length ? form.rounds.map((r) => ({
            title: r.title,
            description: r.description || undefined,
            startDate: parseLocalDateString(r.startDate)!.toISOString(),
            endDate: parseLocalDateString(r.endDate)!.toISOString(),
          })) : undefined,
          prizes: form.prizes && form.prizes.length ? form.prizes.map((p) => ({
            type: p.type,
            title: p.title,
            amount: p.type === 'cash' && p.amount ? Number(p.amount) : undefined,
          })) : undefined,
          sponsors: form.sponsors && form.sponsors.length ? form.sponsors.map((s) => ({
            title: s.title,
            bannerUrl: s.bannerUrl || undefined,
          })) : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to update event")
      router.replace(`/events/${id}`)
    } catch (e: any) {
      setError(e?.message || "Failed to update event")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath={`/events/${id}/edit`} />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Card className="max-w-2xl mx-auto glass-card">
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMe || loadingEvent ? (
              <div className="text-slate-600">Loading…</div>
            ) : role !== "organizer" ? (
              <div className="text-slate-600">You must be the organizer to edit this event.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Event Details</TabsTrigger>
                    <TabsTrigger value="rounds">Stages & Timeline (Rounds)</TabsTrigger>
                    <TabsTrigger value="rules_prizes">Rules & Prizes</TabsTrigger>
                    <TabsTrigger value="sponsors">Sponsors & Partnerships</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Start Date</Label>
                        <Popover.Root open={openStart} onOpenChange={setOpenStart}>
                          <Popover.Trigger asChild>
                            <Button type="button" variant="outline" className="w-full justify-start">
                              {form.startDate ? fmtDisplay(form.startDate) : "Pick a date"}
                            </Button>
                          </Popover.Trigger>
                          <Popover.Content className="bg-white p-2 rounded-md shadow-md border" sideOffset={8}>
                            <DayPicker
                              mode="single"
                              selected={parseLocalDateString(form.startDate) || undefined}
                              captionLayout="dropdown"
                              fromYear={2000}
                              toYear={2100}
                              onSelect={(d) => {
                                update("startDate", toLocalDateStr(d || undefined))
                                setOpenStart(false)
                                if (d && form.endDate) {
                                  const end = parseLocalDateString(form.endDate)!
                                  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
                                  if (end < start) update("endDate", "")
                                }
                              }}
                            />
                          </Popover.Content>
                        </Popover.Root>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end">End Date</Label>
                        <Popover.Root open={openEnd} onOpenChange={setOpenEnd}>
                          <Popover.Trigger asChild>
                            <Button type="button" variant="outline" className="w-full justify-start">
                              {form.endDate ? fmtDisplay(form.endDate) : "Pick a date"}
                            </Button>
                          </Popover.Trigger>
                          <Popover.Content className="bg-white p-2 rounded-md shadow-md border" sideOffset={8}>
                            <DayPicker
                              mode="single"
                              selected={parseLocalDateString(form.endDate) || undefined}
                              disabled={form.startDate ? { before: parseLocalDateString(form.startDate)! } : undefined}
                              captionLayout="dropdown"
                              fromYear={2000}
                              toYear={2100}
                              onSelect={(d) => {
                                update("endDate", toLocalDateStr(d || undefined))
                                setOpenEnd(false)
                              }}
                            />
                          </Popover.Content>
                        </Popover.Root>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mode</Label>
                      <Select value={form.mode} onValueChange={(v) => update("mode", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online / Remote</SelectItem>
                          <SelectItem value="onsite">Onsite / At Location</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fees">Fees</Label>
                        <Input id="fees" type="number" min="0" step="0.01" placeholder="0 for free" value={form.fees} onChange={(e) => update("fees", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Official Website</Label>
                        <Input id="website" type="url" placeholder="https://..." value={form.website} onChange={(e) => update("website", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bannerUrl">Banner Image URL</Label>
                      <Input id="bannerUrl" type="url" placeholder="https://example.com/banner.jpg" value={form.bannerUrl} onChange={(e) => update("bannerUrl", e.target.value)} />
                      <p className="text-xs text-slate-500">Provide a public image URL. Upload support can be added later.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                      <Popover.Root open={openReg} onOpenChange={setOpenReg}>
                        <Popover.Trigger asChild>
                          <Button type="button" variant="outline" className="w-full justify-start">
                            {form.registrationDeadline ? fmtDisplay(form.registrationDeadline) : "Pick a date"}
                          </Button>
                        </Popover.Trigger>
                        <Popover.Content className="bg-white p-2 rounded-md shadow-md border" sideOffset={8}>
                          <DayPicker
                            mode="single"
                            selected={parseLocalDateString(form.registrationDeadline) || undefined}
                            captionLayout="dropdown"
                            fromYear={2000}
                            toYear={2100}
                            onSelect={(d) => { update("registrationDeadline", toLocalDateStr(d || undefined)); setOpenReg(false) }}
                          />
                        </Popover.Content>
                      </Popover.Root>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationLimit">Registration Limit</Label>
                      <Input id="registrationLimit" type="number" min="0" step="1" placeholder="e.g., 500" value={form.registrationLimit} onChange={(e) => update("registrationLimit", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Participant Type</Label>
                      <Select value={form.participantType} onValueChange={(v) => update("participantType", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.participantType === "group" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minTeamSize">Minimum Team Members</Label>
                          <Input id="minTeamSize" type="number" min={1} step={1} placeholder="e.g., 2" value={form.minTeamSize} onChange={(e) => update("minTeamSize", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxTeamSize">Maximum Team Members</Label>
                          <Input id="maxTeamSize" type="number" min={form.minTeamSize || 1} step={1} placeholder="e.g., 6" value={form.maxTeamSize} onChange={(e) => update("maxTeamSize", e.target.value)} />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="themes">Themes (comma separated)</Label>
                        <Input id="themes" placeholder="AI, Sustainability, HealthTech" value={form.themes} onChange={(e) => update("themes", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tracks">Tracks (comma separated)</Label>
                        <Input id="tracks" placeholder="Web, Mobile, Data Science" value={form.tracks} onChange={(e) => update("tracks", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} />
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("rounds")} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="rounds" className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Stages & Timeline (Rounds)</Label>
                        <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, rounds: [...p.rounds, { title: "", description: "", startDate: "", endDate: "" }] }))}>Add Round</Button>
                      </div>
                      <div className="space-y-4">
                        {form.rounds.map((r, idx) => (
                          <div key={idx} className="border rounded-md p-3 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Round Title</Label>
                                <Input value={r.title} onChange={(e) => setForm((p) => { const arr = [...p.rounds]; arr[idx] = { ...arr[idx], title: e.target.value }; return { ...p, rounds: arr } })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Round Description</Label>
                                <Input value={r.description} onChange={(e) => setForm((p) => { const arr = [...p.rounds]; arr[idx] = { ...arr[idx], description: e.target.value }; return { ...p, rounds: arr } })} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Start</Label>
                                <Popover.Root>
                                  <Popover.Trigger asChild>
                                    <Button type="button" variant="outline" className="w-full justify-start">{r.startDate ? fmtDisplay(r.startDate) : "Pick a date"}</Button>
                                  </Popover.Trigger>
                                  <Popover.Content className="bg-white p-2 rounded-md shadow-md border" sideOffset={8}>
                                    <DayPicker mode="single" selected={parseLocalDateString(r.startDate) || undefined} captionLayout="dropdown" fromYear={2000} toYear={2100} onSelect={(d) => setForm((p) => { const arr = [...p.rounds]; arr[idx] = { ...arr[idx], startDate: toLocalDateStr(d || undefined) }; return { ...p, rounds: arr } })} />
                                  </Popover.Content>
                                </Popover.Root>
                              </div>
                              <div className="space-y-2">
                                <Label>End</Label>
                                <Popover.Root>
                                  <Popover.Trigger asChild>
                                    <Button type="button" variant="outline" className="w-full justify-start">{r.endDate ? fmtDisplay(r.endDate) : "Pick a date"}</Button>
                                  </Popover.Trigger>
                                  <Popover.Content className="bg-white p-2 rounded-md shadow-md border" sideOffset={8}>
                                    <DayPicker mode="single" selected={parseLocalDateString(r.endDate) || undefined} disabled={r.startDate ? { before: parseLocalDateString(r.startDate)! } : undefined} captionLayout="dropdown" fromYear={2000} toYear={2100} onSelect={(d) => setForm((p) => { const arr = [...p.rounds]; arr[idx] = { ...arr[idx], endDate: toLocalDateStr(d || undefined) }; return { ...p, rounds: arr } })} />
                                  </Popover.Content>
                                </Popover.Root>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button type="button" variant="ghost" onClick={() => setForm((p) => ({ ...p, rounds: p.rounds.filter((_, i) => i !== idx) }))}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("rules_prizes")} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="rules_prizes" className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="rules">Rules</Label>
                      <Textarea id="rules" placeholder="Add participation rules..." value={form.rules} onChange={(e) => update("rules", e.target.value)} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Prizes</Label>
                        <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, prizes: [...p.prizes, { type: 'cash', title: "", amount: "" }] }))}>Add Prize</Button>
                      </div>
                      <div className="space-y-4">
                        {form.prizes.map((pr, idx) => (
                          <div key={idx} className="border rounded-md p-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select value={pr.type} onValueChange={(v) => setForm((p) => { const arr = [...p.prizes]; arr[idx] = { ...arr[idx], type: v as any }; return { ...p, prizes: arr } })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="certificate">Certificate</SelectItem>
                                  <SelectItem value="goodies">Goodies</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input value={pr.title} onChange={(e) => setForm((p) => { const arr = [...p.prizes]; arr[idx] = { ...arr[idx], title: e.target.value }; return { ...p, prizes: arr } })} />
                            </div>
                            {pr.type === 'cash' && (
                              <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" min="0" step="0.01" value={pr.amount || ""} onChange={(e) => setForm((p) => { const arr = [...p.prizes]; arr[idx] = { ...arr[idx], amount: e.target.value }; return { ...p, prizes: arr } })} />
                              </div>
                            )}
                            <div className="md:col-span-4 flex justify-end">
                              <Button type="button" variant="ghost" onClick={() => setForm((p) => ({ ...p, prizes: p.prizes.filter((_, i) => i !== idx) }))}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("sponsors")} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="sponsors" className="space-y-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Sponsors / Partners</Label>
                        <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, sponsors: [...p.sponsors, { title: "", bannerUrl: "" }] }))}>Add Sponsor</Button>
                      </div>
                      <div className="space-y-4">
                        {form.sponsors.map((sp, idx) => (
                          <div key={idx} className="border rounded-md p-3 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={sp.title} onChange={(e) => setForm((p) => { const arr = [...p.sponsors]; arr[idx] = { ...arr[idx], title: e.target.value }; return { ...p, sponsors: arr } })} />
                              </div>
                              <div className="space-y-2">
                                <Label>Banner / Logo Link</Label>
                                <Input placeholder="https://.../logo.png" value={sp.bannerUrl} onChange={(e) => setForm((p) => { const arr = [...p.sponsors]; arr[idx] = { ...arr[idx], bannerUrl: e.target.value }; return { ...p, sponsors: arr } })} />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button type="button" variant="ghost" onClick={() => setForm((p) => ({ ...p, sponsors: p.sponsors.filter((_, i) => i !== idx) }))}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                        {saving ? "Saving…" : "Save Changes"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Lock, Calendar } from "lucide-react"

export default function OrganizerAssignJudgesPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  // Simple client guard; backend should still enforce roles server-side
  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) return setRole(null)
      const payload = JSON.parse(atob(token.split(".")[1] || ""))
      setRole(payload?.role || null)
    } catch {
      setRole(null)
    }
  }, [])

  const [form, setForm] = useState({ email: "", password: "", name: "", eventId: "" })
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [assigned, setAssigned] = useState<Array<{ id: string; judgeId: string | null; name: string; email: string; eventTitle: string }>>([])

  const isOrganizer = role === "organizer"
  const canSubmit = useMemo(() => {
    return isOrganizer && !!form.name && !!form.email && !!form.password
  }, [isOrganizer, form])

  async function fetchAssignments() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/judges/assignments`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        cache: "no-store",
      })
      if (!res.ok) return
      const data = await res.json()
      const items = (data.assignments || []).map((a: any) => ({
        id: a.id, // assignment id (kept if needed)
        judgeId: a.judge?.id || a.judge?._id || null,
        name: a.judge?.name || a.judge?.email?.split("@")[0] || "Judge",
        email: a.judge?.email || "",
        eventTitle: a.event?.title || "Unassigned",
      }))
      setAssigned(items)
    } catch {}
  }

  useEffect(() => {
    if (!isOrganizer) return
    fetchAssignments()
    // fetch organizer events for dropdown
    ;(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(`${base}/api/events`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        })
        if (res.ok) {
          const data = await res.json()
          const items = (data.events || []).map((e: any) => ({ id: e._id || e.id, title: e.title }))
          setEvents(items)
        }
      } catch {}
    })()
    const id = setInterval(fetchAssignments, 10000)
    return () => clearInterval(id)
  }, [isOrganizer])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOrganizer) return
    setLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/judges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, eventId: form.eventId || undefined }),
      })
      if (!res.ok) {
        console.error("Create judge failed", await res.text())
      }
      await fetchAssignments()
      setForm({ email: "", password: "", name: "", eventId: "" })
    } finally {
      setLoading(false)
    }
  }

  if (role !== null && !isOrganizer) {
    return (
      <DashboardLayout hideSidebar hideTopActions>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Forbidden</CardTitle>
              <CardDescription>You don’t have access to assign judges.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout hideSidebar hideTopActions>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Assign Judges</h1>
          <p className="text-slate-600 mt-1">Create judge accounts and assign them to events</p>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>New Judge</CardTitle>
            <CardDescription>Provide email and temporary password. Judges will sign in with these credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Full Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="bg-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="email" required className="pl-9 bg-white" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="judge@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Temporary Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <PasswordInput required className="pl-9 bg-white" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Assign to Event</label>
                <div className="relative">
                  <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    className="pl-9 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={form.eventId}
                    onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md rounded-md disabled:opacity-100 disabled:from-slate-300 disabled:to-slate-400 disabled:text-white disabled:cursor-not-allowed"
                >
                  {loading ? "Assigning..." : "Create & Assign"}
                </Button>
                {!canSubmit && (
                  <span className="text-xs text-slate-500">Fill name, email, and password to enable</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Assigned Judges</CardTitle>
            <CardDescription>Recently created or assigned judges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assigned.map((j) => (
                <div
                  key={j.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { if (j.judgeId) router.push(`/dashboard/organizer/judges/${j.judgeId}`) }}
                  onKeyDown={(e) => { if (j.judgeId && (e.key === 'Enter' || e.key === ' ')) router.push(`/dashboard/organizer/judges/${j.judgeId}`) }}
                  className={`p-3 border rounded-lg flex items-center justify-between ${j.judgeId ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <div>
                    <div className="font-medium">{j.name}</div>
                    <div className="text-sm text-slate-600">{j.email}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{j.eventTitle || "Unassigned"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

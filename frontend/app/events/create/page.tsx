"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateEventPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loadingMe, setLoadingMe] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    status: "upcoming" as "draft" | "upcoming" | "ongoing" | "completed",
  })

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) {
          router.replace("/auth/login")
          return
        }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) {
          localStorage.removeItem("token")
          router.replace("/auth/login")
          return
        }
        const data = await res.json()
        setRole(data?.user?.role || null)
        if (data?.user?.role !== "organizer") {
          router.replace("/events")
        }
      } catch (e: any) {
        setError(e?.message || "Failed to verify user")
      } finally {
        setLoadingMe(false)
      }
    }
    checkRole()
  }, [router])

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.title || !form.startDate || !form.endDate) {
      setError("Title, start date, and end date are required.")
      return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date must be after start date.")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          location: form.location || undefined,
          status: form.status,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create event")
      }
      router.replace("/events")
    } catch (e: any) {
      setError(e?.message || "Failed to create event")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/events/create" />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Card className="max-w-2xl mx-auto glass-card">
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMe ? (
              <div className="text-slate-600">Loading…</div>
            ) : role !== "organizer" ? (
              <div className="text-slate-600">You must be an organizer to create events.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input id="start" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input id="end" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                    {saving ? "Creating…" : "Create Event"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Mail, Building2, MapPin, Phone, CalendarClock, ShieldCheck, Lock, Github, Linkedin, Globe } from "lucide-react"

type Me = {
  _id: string
  name: string
  email: string
  role: string
  organization?: string
  location?: string
  phone?: string
  bio?: string
  social?: { github?: string; linkedin?: string; website?: string 
  }
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({
    name: "",
    role: "participant",
    organization: "",
    location: "",
    phone: "",
    bio: "",
    social: { github: "", linkedin: "", website: "" },
  })

  // Helpers for social links
  const normalizeUrl = (url: string) => {
    if (!url) return ""
    if (/^https?:\/\//i.test(url)) return url
    return `https://${url}`
  }

  const openOrEdit = (url?: string) => {
    if (url && url.trim()) {
      const target = normalizeUrl(url.trim())
      if (typeof window !== "undefined") window.open(target, "_blank", "noopener,noreferrer")
    } else {
      setOpen(true)
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) {
          window.location.href = "/auth/login"
          return
        }

        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/auth/login"
            return
          }
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || `Failed to load profile (${res.status})`)
        }
        const data = await res.json()
        setMe(data?.user || data)
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    if (me) {
      setForm({
        name: me.name || "",
        role: (me as any).role || "participant",
        organization: (me as any).organization || "",
        location: (me as any).location || "",
        phone: (me as any).phone || "",
        bio: (me as any).bio || "",
        social: {
          github: (me as any).social?.github || "",
          linkedin: (me as any).social?.linkedin || "",
          website: (me as any).social?.website || "",
        },
      })
    }
  }, [me])

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        window.location.href = "/auth/login"
        return
      }
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `Failed to save profile (${res.status})`)
      }
      const data = await res.json()
      setMe(data?.user || data)
      setOpen(false)
    } catch (e: any) {
      setError(e?.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/profile" />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">Beta</Badge>
        </div>

        {loading ? (
          <div className="text-center text-slate-600">Loading your profile…</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Overview */}
            <Card className="lg:col-span-1 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  Overview
                </CardTitle>
                <CardDescription>Basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-cyan-100">
                    <AvatarImage src="/abstract-geometric-shapes.png" />
                    <AvatarFallback>{me?.name?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{me?.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">{me?.role}</Badge>
                      {me?.organization ? (
                        <Badge variant="secondary" className="capitalize">{me.organization}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                    <span className="truncate max-w-[60%] text-right">{me?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2"><Building2 className="w-4 h-4" /> Organization</span>
                    <span className="truncate max-w-[60%] text-right">{me?.organization ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                    <span className="truncate max-w-[60%] text-right">{(me as any)?.location || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</span>
                    <span className="truncate max-w-[60%] text-right">{(me as any)?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Joined</span>
                    <span className="truncate max-w-[60%] text-right">Just now</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 w-full">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card className="lg:col-span-2 glass-card">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Recent account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Logged in", "Viewed Community page", "Updated profile"].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg glass-panel flex items-center justify-between">
                    <span>{item}</span>
                    <span className="text-sm text-slate-500">Just now</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Profile completion */}
            <Card className="lg:col-span-1 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Profile Completion
                </CardTitle>
                <CardDescription>Improve your visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-cyan-500 to-blue-500" />
                </div>
                <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                  <li>Add your location</li>
                  <li>Connect GitHub/LinkedIn</li>
                  <li>Write a short bio</li>
                </ul>
              </CardContent>
            </Card>

            {/* Social links */}
            <Card className="lg:col-span-1 glass-card">
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Showcase your work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700"><Github className="w-4 h-4" /> GitHub</div>
                  <Button variant="outline" size="sm" onClick={() => openOrEdit((me as any)?.social?.github)}>
                    {(me as any)?.social?.github ? 'View' : 'Connect'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700"><Linkedin className="w-4 h-4" /> LinkedIn</div>
                  <Button variant="outline" size="sm" onClick={() => openOrEdit((me as any)?.social?.linkedin)}>
                    {(me as any)?.social?.linkedin ? 'View' : 'Connect'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700"><Globe className="w-4 h-4" /> Website</div>
                  <Button variant="outline" size="sm" onClick={() => openOrEdit((me as any)?.social?.website)}>
                    {(me as any)?.social?.website ? 'View' : 'Add'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security quick settings */}
            <Card className="lg:col-span-1 glass-card">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Keep your account safe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700"><Lock className="w-4 h-4" /> Two-factor auth</div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700"><ShieldCheck className="w-4 h-4" /> Last login</div>
                  <span className="text-slate-500">Just now</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">Change password</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Edit Profile Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" value={form.organization} onChange={(e) => setForm((f: any) => ({ ...f, organization: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm((f: any) => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={form.bio} onChange={(e) => setForm((f: any) => ({ ...f, bio: e.target.value }))} rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" placeholder="https://github.com/username" value={form.social.github} onChange={(e) => setForm((f: any) => ({ ...f, social: { ...f.social, github: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/username" value={form.social.linkedin} onChange={(e) => setForm((f: any) => ({ ...f, social: { ...f.social, linkedin: e.target.value } }))} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://your-portfolio.com" value={form.social.website} onChange={(e) => setForm((f: any) => ({ ...f, social: { ...f.social, website: e.target.value } }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

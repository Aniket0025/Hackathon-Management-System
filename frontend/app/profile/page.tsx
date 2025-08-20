"use client"

import { useEffect, useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Building2, MapPin, Phone, CalendarClock, ShieldCheck, Github, Linkedin, Globe } from "lucide-react"

type Me = {
  _id: string
  name: string
  email: string
  role: string
  organization?: string
  location?: string
  phone?: string
  bio?: string
  social?: { github?: string; linkedin?: string; website?: string }
  avatarUrl?: string
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
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Participant details dialog state (fields aligned with event registration)
  const [participantOpen, setParticipantOpen] = useState(false)
  const [participantSaving, setParticipantSaving] = useState(false)
  const [participantForm, setParticipantForm] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    instituteName: "",
    type: "",
    domain: "",
    bio: "",
    graduatingYear: "",
    courseDuration: "",
    differentlyAbled: "",
    location: "",
  })

  // Helpers for social links
  const normalizeUrl = (url: string) => {
    if (!url) return ""
    if (/^https?:\/\//i.test(url)) return url
    return `https://${url}`
  }

  const handleSaveParticipant = async () => {
    try {
      setParticipantSaving(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        window.location.href = "/auth/login"
        return
      }
      // Merge participant fields into profile payload
      const payload = {
        ...form,
        name: [participantForm.firstName, participantForm.lastName].filter(Boolean).join(" ") || form.name,
        email: participantForm.email || (me as any)?.email,
        phone: participantForm.phone,
        bio: participantForm.bio,
        organization: participantForm.instituteName,
        location: participantForm.location,
        // additional participant fields preserved for future backend support
        gender: participantForm.gender,
        participantType: participantForm.type,
        domain: participantForm.domain,
        graduatingYear: participantForm.graduatingYear,
        courseDuration: participantForm.courseDuration,
        differentlyAbled: participantForm.differentlyAbled,
      }
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || `Failed to save profile (${res.status})`)
      }
      const data = await res.json()
      setMe(data?.user || data)
      setParticipantOpen(false)
    } catch (e: any) {
      setError(e?.message || "Failed to save profile")
    } finally {
      setParticipantSaving(false)
    }
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
      setAvatarPreview(me.avatarUrl || null)

      // Prefill participant form from profile when possible
      const name = (me.name || "").trim()
      const firstSpace = name.indexOf(" ")
      const firstName = firstSpace > 0 ? name.slice(0, firstSpace) : name
      const lastName = firstSpace > 0 ? name.slice(firstSpace + 1) : ""
      setParticipantForm((pf: any) => ({
        ...pf,
        firstName,
        lastName,
        email: me.email || pf.email || "",
        phone: (me as any).phone || pf.phone || "",
        instituteName: (me as any).organization || pf.instituteName || "",
        bio: (me as any).bio || pf.bio || "",
        location: (me as any).location || pf.location || "",
      }))
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

  // --- Avatar: upload ---
  const handleUploadAvatar = async () => {
    if (!selectedAvatar) return
    try {
      setUploadingAvatar(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        window.location.href = "/auth/login"
        return
      }
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const fd = new FormData()
      fd.append('avatar', selectedAvatar)
      const res = await fetch(`${base}/api/auth/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `Failed to upload avatar (${res.status})`)
      }
      const data = await res.json()
      setMe(data?.user || data)
      setAvatarPreview(data?.avatarUrl || data?.user?.avatarUrl || null)
      setSelectedAvatar(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // --- Avatar: remove ---
  const handleRemoveAvatar = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        window.location.href = "/auth/login"
        return
      }
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/me/avatar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `Failed to remove avatar (${res.status})`)
      }
      const data = await res.json()
      setMe(data?.user || data)
      setAvatarPreview(null)
      setSelectedAvatar(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to remove avatar')
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
            <Card className="lg:col-span-2 glass-card">
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
                    <AvatarImage src={(me as any)?.avatarUrl || "/abstract-geometric-shapes.png"} />
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

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700"><Github className="w-4 h-4" /> GitHub</div>
                      {(me as any)?.social?.github ? (
                        <a
                          href={normalizeUrl((me as any)?.social?.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-[60%] text-right text-blue-600 hover:underline"
                          title={(me as any)?.social?.github}
                        >
                          {(me as any)?.social?.github}
                        </a>
                      ) : (
                        <span className="truncate max-w-[60%] text-right text-slate-400">Not connected</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700"><Linkedin className="w-4 h-4" /> LinkedIn</div>
                      {(me as any)?.social?.linkedin ? (
                        <a
                          href={normalizeUrl((me as any)?.social?.linkedin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-[60%] text-right text-blue-600 hover:underline"
                          title={(me as any)?.social?.linkedin}
                        >
                          {(me as any)?.social?.linkedin}
                        </a>
                      ) : (
                        <span className="truncate max-w-[60%] text-right text-slate-400">Not connected</span>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 w-full">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>

            

            {/* Profile completion (hidden for judges) */}
            {(((me as any)?.role || "").toLowerCase() !== "judge") && (
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
                  <Button variant="outline" className="w-full" onClick={() => setParticipantOpen(true)}>Update Profile</Button>
                </CardContent>
              </Card>
            )}

            

            
          </div>
        )}
        {/* Edit Profile Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-cyan-100">
                  <AvatarImage src={avatarPreview || (me as any)?.avatarUrl || "/abstract-geometric-shapes.png"} />
                  <AvatarFallback>{me?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Profile photo</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0] || null
                      setSelectedAvatar(f)
                      setAvatarPreview(f ? URL.createObjectURL(f) : (me as any)?.avatarUrl || null)
                    }} />
                    <Button onClick={handleUploadAvatar} disabled={!selectedAvatar || uploadingAvatar}>
                      {uploadingAvatar ? 'Uploading…' : 'Upload'}
                    </Button>
                    <Button variant="outline" onClick={handleRemoveAvatar}>
                      Remove photo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Participant Details Dialog (fields aligned with event registration) */}
        <Dialog open={participantOpen} onOpenChange={setParticipantOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Profile</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={participantForm.firstName} onChange={(e) => setParticipantForm((f: any) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={participantForm.lastName} onChange={(e) => setParticipantForm((f: any) => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={participantForm.email} onChange={(e) => setParticipantForm((f: any) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input type="tel" value={participantForm.phone} onChange={(e) => setParticipantForm((f: any) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={participantForm.gender} onValueChange={(v) => setParticipantForm((f: any) => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Institute Name</Label>
                <Input value={participantForm.instituteName} onChange={(e) => setParticipantForm((f: any) => ({ ...f, instituteName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={participantForm.type} onValueChange={(v) => setParticipantForm((f: any) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="college_student">College Student</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="school_student">School Student</SelectItem>
                    <SelectItem value="fresher">Fresher</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={participantForm.domain} onValueChange={(v) => setParticipantForm((f: any) => ({ ...f, domain: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="arts_science">Arts & Science</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Bio/Skills</Label>
                <Textarea value={participantForm.bio} onChange={(e) => setParticipantForm((f: any) => ({ ...f, bio: e.target.value }))} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Graduating Year</Label>
                <Select value={participantForm.graduatingYear} onValueChange={(v) => setParticipantForm((f: any) => ({ ...f, graduatingYear: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                    <SelectItem value="2029">2029</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course Duration (years)</Label>
                <Select value={participantForm.courseDuration} onValueChange={(v) => setParticipantForm((f: any) => ({ ...f, courseDuration: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Differently Abled</Label>
                <Select value={participantForm.differentlyAbled} onValueChange={(v) => setParticipantForm((f: any) => ({ ...f, differentlyAbled: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={participantForm.location} onChange={(e) => setParticipantForm((f: any) => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setParticipantOpen(false)} disabled={participantSaving}>Cancel</Button>
              <Button onClick={handleSaveParticipant} disabled={participantSaving} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                {participantSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

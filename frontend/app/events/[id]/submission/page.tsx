"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Types aligned with My Apply page
type MyRegistration = {
  _id: string
  event: string
  eventName?: string
  registrationType: "individual" | "team"
  createdAt: string
  teamInfo?: {
    teamName?: string
    teamDescription?: string
    lookingForMembers?: boolean
    desiredSkills?: string[]
    members?: Array<{
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
    }>
  }
  personalInfo?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    organization?: string
    experience?: string
    bio?: string
    gender?: string
    instituteName?: string
    type?: string
    domain?: string
    graduatingYear?: string
    courseDuration?: string
    differentlyAbled?: string
    location?: string
  }
  preferences?: {
    track?: string
    dietaryRestrictions?: string
    tshirtSize?: string
    emergencyContact?: string
  }
}

export default function EventSubmissionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const eventId = params?.id as string

  const [authedEmail, setAuthedEmail] = useState<string | null>(null)
  const [regs, setRegs] = useState<MyRegistration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<{ 
    teamName?: string
    title: string
    description: string
    repoUrl: string
    docsUrl: string
    videoUrl: string
    submitting?: boolean
    message?: string
    error?: string
  }>({ title: "", description: "", repoUrl: "", docsUrl: "", videoUrl: "" })

  const getAuthHeader = (): Record<string, string> => {
    const h: Record<string, string> = {}
    if (typeof window === 'undefined') return h
    try {
      const t = localStorage.getItem('token')
      if (t) h['Authorization'] = `Bearer ${t}`
    } catch {}
    return h
  }

  useEffect(() => {
    // load authed user and registrations for this email
    const load = async () => {
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const meRes = await fetch(`${base}/api/auth/me`, { credentials: "include", headers: { ...getAuthHeader() } })
        const meData = await meRes.json().catch(() => ({} as any))
        const email = meData?.user?.email || meData?.email
        if (!email) {
          setError("Please sign in to submit your project")
          setLoading(false)
          return
        }
        setAuthedEmail(email)
        const res = await fetch(`${base}/api/registrations/mine?full=true&email=${encodeURIComponent(email)}`, { credentials: "include" })
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) throw new Error(data?.message || "Failed to load registrations")
        setRegs(Array.isArray(data?.registrations) ? data.registrations : [])
      } catch (e: any) {
        setError(e?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const teamsForEvent = useMemo(() => {
    return regs.filter(r => r.event === eventId && r.registrationType === 'team')
  }, [regs, eventId])

  const eventName = useMemo(() => {
    const r = regs.find(r => r.event === eventId)
    return r?.eventName || eventId
  }, [regs, eventId])

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value, message: undefined, error: undefined }))
  }

  const submitProject = async () => {
    if (!form.title) {
      setForm(prev => ({ ...prev, error: 'Title is required' }))
      return
    }
    const selectedTeamName = form.teamName || (teamsForEvent[0]?.teamInfo?.teamName || '')
    if (!selectedTeamName) {
      setForm(prev => ({ ...prev, error: 'Team name is required' }))
      return
    }
    try {
      setForm(prev => ({ ...prev, submitting: true, error: undefined, message: undefined }))
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
      const res = await fetch(`${base}/api/submissions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          event: eventId,
          teamName: selectedTeamName,
          title: form.title,
          description: form.description,
          repoUrl: form.repoUrl,
          docsUrl: form.docsUrl,
          videoUrl: form.videoUrl,
        })
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) throw new Error('Please sign in to submit your project')
      if (!res.ok) throw new Error(data?.message || 'Failed to submit project')
      setForm(prev => ({ ...prev, submitting: false, message: 'Submission saved!' }))
    } catch (e: any) {
      setForm(prev => ({ ...prev, submitting: false, error: e?.message || 'Submission failed' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/my-apply" />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-2">Submission</Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{eventName}</h1>
            {authedEmail && (
              <div className="text-sm text-slate-600 mt-1">Signed in as {authedEmail}</div>
            )}
          </div>
          <Button variant="outline" onClick={() => router.push('/my-apply')}>Back to My Apply</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Project Submission</span>
              {teamsForEvent.length > 0 && (
                <Badge variant="secondary">{teamsForEvent.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamsForEvent.length > 1 && (
              <div>
                <label className="block text-sm text-slate-700 mb-1">Team</label>
                <select
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  value={form.teamName || teamsForEvent[0]?.teamInfo?.teamName || ''}
                  onChange={(ev) => updateForm('teamName', ev.target.value)}
                >
                  {teamsForEvent.map((t) => (
                    <option key={t._id} value={t.teamInfo?.teamName || ''}>{t.teamInfo?.teamName || 'Unnamed Team'}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-700 mb-1">Title</label>
              <Input value={form.title} onChange={(ev) => updateForm('title', ev.target.value)} placeholder="Project Title" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Description</label>
              <textarea
                className="border rounded-md px-3 py-2 w-full text-sm"
                rows={3}
                value={form.description}
                onChange={(ev) => updateForm('description', ev.target.value)}
                placeholder="Short description"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-slate-700 mb-1">GitHub Repo</label>
                <Input value={form.repoUrl} onChange={(ev) => updateForm('repoUrl', ev.target.value)} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Docs</label>
                <Input value={form.docsUrl} onChange={(ev) => updateForm('docsUrl', ev.target.value)} placeholder="Docs link (Notion, Google Doc, etc.)" />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Video</label>
                <Input value={form.videoUrl} onChange={(ev) => updateForm('videoUrl', ev.target.value)} placeholder="Demo video URL (YouTube, Drive)" />
              </div>
            </div>

            {form.error && (
              <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">{form.error}</div>
            )}
            {form.message && (
              <div className="text-sm text-green-700 border border-green-200 rounded p-2 bg-green-50">{form.message}</div>
            )}

            <div>
              <Button onClick={submitProject} disabled={!!form.submitting}>
                {form.submitting ? 'Submitting…' : 'Submit Project'}
              </Button>
            </div>

            <div className="pt-4 border-t mt-4">
              <Link href={`/events/${eventId}`} className="text-cyan-700 hover:underline">View event details</Link>
            </div>

            {error && (
              <div className="text-sm text-red-600 border border-red-200 rounded p-2 bg-red-50">{error}</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

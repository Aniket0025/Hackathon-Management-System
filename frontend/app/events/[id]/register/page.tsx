"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Removed RadioGroup imports as Registration Type card is removed
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ArrowLeft, Pencil, Trash2, Crown } from "lucide-react"
import Link from "next/link"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type EventItem = {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  status: "draft" | "upcoming" | "ongoing" | "completed"
  organizer?: { _id: string; name: string; email?: string }
  registrationDeadline?: string
  participantType?: "individual" | "group"
}

interface RegistrationData {
  registrationType: "individual" | "team"
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    organization: string
    experience: string
    bio: string
    gender: "male" | "female" | "other" | "prefer_not_say" | ""
    instituteName: string
    type: "college_student" | "professional" | "school_student" | "fresher" | "other" | ""
    domain: "management" | "engineering" | "arts_science" | "medicine" | "law" | "other" | ""
    graduatingYear: "2026" | "2027" | "2028" | "2029" | ""
    courseDuration: "2" | "3" | "4" | "5" | ""
    differentlyAbled: "no" | "yes" | ""
    location: string
  }

  teamInfo: {
    teamName: string
    teamDescription: string
    lookingForMembers: boolean
    desiredSkills: string[]
    teamSize?: number
    members: Array<{
      firstName: string
      lastName: string
      email: string
      phone: string
      gender: "male" | "female" | "other" | "prefer_not_say" | ""
      instituteName: string
      type: "college_student" | "professional" | "school_student" | "fresher" | "other" | ""
      domain: "management" | "engineering" | "arts_science" | "medicine" | "law" | "other" | ""
      bio: string
      graduatingYear: "2026" | "2027" | "2028" | "2029" | ""
      courseDuration: "2" | "3" | "4" | "5" | ""
      differentlyAbled: "no" | "yes" | ""
      location: string
    }>
  }
  preferences: {
    track: string
    dietaryRestrictions: string
    tshirtSize: string
    emergencyContact: string
  }
  agreements: {
    termsAccepted: boolean
    codeOfConductAccepted: boolean
    dataProcessingAccepted: boolean
  }
}

// Helper: create a correctly typed empty team member
const makeEmptyMember = (): RegistrationData["teamInfo"]["members"][number] => ({
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

export default function EventRegistrationPage() {
  const routeParams = useParams() as { id?: string | string[] }
  const id = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    registrationType: "team",
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organization: "",
      experience: "",
      bio: "",
      gender: "",
      instituteName: "",
      type: "",
      domain: "",
      graduatingYear: "",
      courseDuration: "",
      differentlyAbled: "",
      location: "",
    },
    teamInfo: {
      teamName: "",
      teamDescription: "",
      lookingForMembers: false,
      desiredSkills: [],
      teamSize: undefined,
      members: [],
    },
    preferences: {
      track: "",
      dietaryRestrictions: "",
      tshirtSize: "",
      emergencyContact: "",
    },
    agreements: {
      termsAccepted: false,
      codeOfConductAccepted: false,
      dataProcessingAccepted: false,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${id}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load event")
        setEvent(data.event)
        // Gate: Only allow events created by an organizer (organizer field must exist)
        if (!data?.event?.organizer) {
          setError("Registration is only available for organizer-created events.")
        }
        // Initialize default team size based on event config if present
        const minTS = (data?.event?.minTeamSize ?? data?.event?.minTeamMembers ?? 1) as number
        const normalizedMin = Math.max(1, Number(minTS) || 1)
        const defaultTeamSize = normalizedMin
        setRegistrationData((prev) => {
          const members = prev.teamInfo.members && prev.teamInfo.members.length > 0
            ? prev.teamInfo.members.slice(0, defaultTeamSize)
            : Array.from({ length: defaultTeamSize }, () => makeEmptyMember())
          return {
            ...prev,
            teamInfo: { ...prev.teamInfo, teamSize: defaultTeamSize, members },
          }
        })
      } catch (e: any) {
        setError(e?.message || "Failed to load event")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const updatePersonalInfo = (field: string, value: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }))
  }

  const updateTeamInfo = (field: string, value: any) => {
    setRegistrationData((prev) => ({
      ...prev,
      teamInfo: { ...prev.teamInfo, [field]: value },
    }))
  }

  // Keep team members array length in sync with selected team size
  const updateTeamSize = (size: number) => {
    setRegistrationData((prev) => {
      const eventMin = (event as any)?.minTeamSize ?? (event as any)?.minTeamMembers ?? 1
      const eventMax = (event as any)?.maxTeamSize ?? (event as any)?.maxTeamMembers ?? (event as any)?.teamSize ?? Math.max(1, Number(eventMin) || 1)
      const nextSizeRaw = Math.max(1, Math.floor(Number(size) || 1))
      const nextSize = Math.min(Math.max(nextSizeRaw, Number(eventMin) || 1), Number(eventMax) || nextSizeRaw)
      let members = prev.teamInfo.members
      if (members.length < nextSize) {
        members = [...members, ...Array.from({ length: nextSize - members.length }, () => makeEmptyMember())]
      } else if (members.length > nextSize) {
        members = members.slice(0, nextSize)
      }
      return { ...prev, teamInfo: { ...prev.teamInfo, teamSize: nextSize, members } }
    })
  }

  // Helpers to compute current bounds and state
  const getEventBounds = () => {
    const min = (event as any)?.minTeamSize ?? (event as any)?.minTeamMembers ?? 1
    const max = (event as any)?.maxTeamSize ?? (event as any)?.maxTeamMembers ?? (event as any)?.teamSize ?? Math.max(1, Number(min) || 1)
    return { min: Number(min) || 1, max: Number(max) || (Number(min) || 1) }
  }
  const getMaxAllowed = () => {
    const { max } = getEventBounds()
    return registrationData.teamInfo.teamSize || max
  }
  const atMaxMembers = () => registrationData.teamInfo.members.length >= (Number(getMaxAllowed()) || 1)

  const addMember = () => {
    setRegistrationData((prev) => {
      const eventMin = (event as any)?.minTeamSize ?? (event as any)?.minTeamMembers ?? 1
      const eventMax = (event as any)?.maxTeamSize ?? (event as any)?.maxTeamMembers ?? (event as any)?.teamSize ?? Math.max(1, Number(eventMin) || 1)
      const maxAllowed = prev.teamInfo.teamSize ?? eventMax
      if (prev.teamInfo.members.length >= (Number(maxAllowed) || 1)) return prev
      return {
        ...prev,
        teamInfo: {
          ...prev.teamInfo,
          members: [...prev.teamInfo.members, makeEmptyMember()],
        },
      }
    })
  }

  const updateMember = (index: number, field: string, value: any) => {
    setRegistrationData((prev) => {
      const next = [...prev.teamInfo.members]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, teamInfo: { ...prev.teamInfo, members: next } }
    })
  }

  const removeMember = (index: number) => {
    setRegistrationData((prev) => ({
      ...prev,
      teamInfo: { ...prev.teamInfo, members: prev.teamInfo.members.filter((_, i) => i !== index) },
    }))
  }

  // Copy Personal Information into a team member (used for Member 1 shortcut)
  const copyPersonalToMember = (memberIndex: number) => {
    setRegistrationData((prev) => {
      const p = prev.personalInfo
      const next = [...prev.teamInfo.members]
      if (!next[memberIndex]) {
        next[memberIndex] = {
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
        }
      }
      next[memberIndex] = {
        ...next[memberIndex],
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        email: p.email || "",
        phone: p.phone || "",
        gender: p.gender || "",
        instituteName: p.instituteName || "",
        type: p.type || "",
        domain: p.domain || "",
        bio: p.bio || "",
        graduatingYear: p.graduatingYear || "",
        courseDuration: p.courseDuration || "",
        differentlyAbled: p.differentlyAbled || "",
        location: p.location || "",
      }
      return { ...prev, teamInfo: { ...prev.teamInfo, members: next } }
    })
  }

  // Quick action: if no members, add Member 1 as the registrant
  const addMeAsMember1 = () => {
    setRegistrationData((prev) => {
      const eventMin = (event as any)?.minTeamSize ?? (event as any)?.minTeamMembers ?? 1
      const eventMax = (event as any)?.maxTeamSize ?? (event as any)?.maxTeamMembers ?? (event as any)?.teamSize ?? Math.max(1, Number(eventMin) || 1)
      const maxAllowed = prev.teamInfo.teamSize ?? eventMax
      let nextMembers = prev.teamInfo.members
      if (nextMembers.length === 0) {
        nextMembers = [makeEmptyMember()]
      } else {
        nextMembers = [...nextMembers]
      }
      if (nextMembers.length > (Number(maxAllowed) || 1)) {
        nextMembers = nextMembers.slice(0, Number(maxAllowed) || 1)
      }
      const p = prev.personalInfo
      nextMembers[0] = {
        ...nextMembers[0],
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        email: p.email || "",
        phone: p.phone || "",
        gender: p.gender || "",
        instituteName: p.instituteName || "",
        type: p.type || "",
        domain: p.domain || "",
        bio: p.bio || "",
        graduatingYear: p.graduatingYear || "",
        courseDuration: p.courseDuration || "",
        differentlyAbled: p.differentlyAbled || "",
        location: p.location || "",
      }
      return { ...prev, teamInfo: { ...prev.teamInfo, members: nextMembers } }
    })
  }

  const updatePreferences = (field: string, value: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value },
    }))
  }

  const updateAgreements = (field: string, value: boolean) => {
    setRegistrationData((prev) => ({
      ...prev,
      agreements: { ...prev.agreements, [field]: value },
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      updateTeamInfo("desiredSkills", [...registrationData.teamInfo.desiredSkills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    updateTeamInfo(
      "desiredSkills",
      registrationData.teamInfo.desiredSkills.filter((_, i) => i !== index),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      // Ensure backend-required personalInfo exists: derive from Member 1 if needed
      const derivedPI = (() => {
        const pi = registrationData.personalInfo || ({} as any)
        const m0 = registrationData.teamInfo?.members?.[0] || ({} as any)
        return {
          firstName: (pi.firstName || m0.firstName || "").trim(),
          lastName: (pi.lastName || m0.lastName || "").trim(),
          email: (pi.email || m0.email || "").trim(),
          phone: (pi.phone || m0.phone || "").trim(),
          organization: pi.organization || "",
          experience: pi.experience || "",
          bio: pi.bio || "",
          gender: pi.gender || (m0.gender || ""),
          instituteName: pi.instituteName || (m0.instituteName || ""),
          type: pi.type || (m0.type || ""),
          domain: pi.domain || (m0.domain || ""),
          graduatingYear: pi.graduatingYear || (m0.graduatingYear || ""),
          courseDuration: pi.courseDuration || (m0.courseDuration || ""),
          differentlyAbled: pi.differentlyAbled || (m0.differentlyAbled || ""),
          location: pi.location || (m0.location || ""),
        }
      })()
      const payload = { ...registrationData, personalInfo: derivedPI }

      const res = await fetch(`${base}/api/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Registration failed")
      // Success -> redirect back to the event page
      window.location.href = `/events/${id}`
    } catch (err: any) {
      setSubmitError(err?.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    const { teamInfo, agreements } = registrationData
    const requiredTeamSize = Math.max(1, Number(teamInfo.teamSize || 1))
    const members = teamInfo.members || []
    const hasEnoughMembers = members.length >= requiredTeamSize
    const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test((v || "").trim())
    const membersValid = hasEnoughMembers && members.slice(0, requiredTeamSize).every((m) => (
      (m.firstName?.trim() || "") &&
      // last name is optional
      (m.email?.trim() || "") &&
      isValidEmail(m.email)
    ))

    const teamMetaValid = (teamInfo.teamName?.trim() || "")

    // Backend requires personalInfo.firstName, lastName, email
    const firstMember = members[0] || ({} as any)
    const pi = registrationData.personalInfo || ({} as any)
    const personalInfoValid = Boolean(
      (pi.firstName || firstMember.firstName || "").trim() &&
      (pi.lastName || firstMember.lastName || "").trim() &&
      isValidEmail((pi.email || firstMember.email || "").trim())
    )

    const agreementsValid =
      agreements.termsAccepted &&
      agreements.codeOfConductAccepted &&
      agreements.dataProcessingAccepted

    return Boolean(teamMetaValid && membersValid && personalInfoValid && agreementsValid)
  }

  const formInvalidReason = () => {
    if (loading) return "Loading event..."
    if (isLoading) return "Submitting..."
    if (!isFormValid()) return "Please complete team name, required member fields, and agreements."
    return null
  }

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
  }

  // Accept All logic for agreements
  const allAgreed =
    registrationData.agreements.termsAccepted &&
    registrationData.agreements.codeOfConductAccepted &&
    registrationData.agreements.dataProcessingAccepted
  const someAgreed =
    !allAgreed && (
      registrationData.agreements.termsAccepted ||
      registrationData.agreements.codeOfConductAccepted ||
      registrationData.agreements.dataProcessingAccepted
    )
  const acceptAllState: CheckedState = allAgreed ? true : someAgreed ? "indeterminate" : false

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/events/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground font-sans mb-2">Register for Event</h1>
            {loading ? (
              <div className="text-muted-foreground">Loading…</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : event ? (
              <>
                <h2 className="text-xl text-primary font-sans mb-4">{event.title}</h2>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground font-serif">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {`${fmtDate(event.startDate)} - ${fmtDate(event.endDate)}`}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}
                  {event.status && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Event not found.</div>
            )}
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Team Information - moved to top */}
          {registrationData.registrationType === "team" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans">
                  <Users className="w-5 h-5" />
                  Team Information
                </CardTitle>
                <CardDescription className="font-serif">Set up your team details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Size (from event config if available) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-serif">Team Size</Label>
                    <Select
                      value={(registrationData.teamInfo.teamSize ?? "").toString()}
                      onValueChange={(v) => updateTeamSize(parseInt(v))}
                    >
                      <SelectTrigger className="font-serif">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const minTS = (event as any)?.minTeamSize ?? (event as any)?.minTeamMembers ?? 1
                          const maxTS = (event as any)?.maxTeamSize ?? (event as any)?.maxTeamMembers ?? (event as any)?.teamSize ?? 6
                          const min = Math.max(1, Number(minTS) || 1)
                          const max = Math.max(min, Number(maxTS) || min)
                          const arr = Array.from({ length: max - min + 1 }, (_, i) => i + min)
                          return arr.map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamName" className="font-serif">
                    Team Name *
                  </Label>
                  <Input
                    id="teamName"
                    placeholder="Enter your team name"
                    value={registrationData.teamInfo.teamName}
                    onChange={(e) => updateTeamInfo("teamName", e.target.value)}
                    className="font-serif"
                    required={registrationData.registrationType === "team"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamDescription" className="font-serif">
                    Team Description
                  </Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="Describe your team's vision, goals, and approach..."
                    value={registrationData.teamInfo.teamDescription}
                    onChange={(e) => updateTeamInfo("teamDescription", e.target.value)}
                    className="min-h-[100px] font-serif"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lookingForMembers"
                    checked={registrationData.teamInfo.lookingForMembers}
                    onCheckedChange={(checked) => updateTeamInfo("lookingForMembers", checked)}
                  />
                  <Label htmlFor="lookingForMembers" className="font-serif">
                    We're looking for additional team members
                  </Label>
                </div>

                {registrationData.teamInfo.lookingForMembers && (
                  <div className="space-y-4">
                    <Label className="font-serif">Desired Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g., React, Python, UI/UX)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="font-serif"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {registrationData.teamInfo.desiredSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button type="button" onClick={() => removeSkill(index)} className="ml-1">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Team members list and editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-serif">Team Members</Label>
                    <div className="flex gap-2">
                      {registrationData.teamInfo.members.length === 0 && (
                        <Button type="button" onClick={addMeAsMember1} variant="outline">Add Me as Member 1</Button>
                      )}
                      <Button
                        type="button"
                        onClick={addMember}
                        variant="secondary"
                        disabled={atMaxMembers()}
                        aria-disabled={atMaxMembers()}
                        title={atMaxMembers() ? "Maximum team size reached" : "Add a new team member"}
                      >
                        Add Member
                      </Button>
                    </div>
                  </div>
                  {atMaxMembers() && (
                    <p className="text-xs text-muted-foreground">Maximum team size reached for this event.</p>
                  )}
                  {registrationData.teamInfo.members.length === 0 && (
                    <div className="text-sm text-muted-foreground">Add members and then click a member to edit their details.</div>
                  )}
                  <div className="space-y-2">
                    {registrationData.teamInfo.members.map((m, idx) => {
                      const name = `${m.firstName || ""} ${m.lastName || ""}`.trim() || `Member ${idx + 1}`
                      const phone = m.phone || "—"
                      const initial = (m.firstName || m.lastName || `${idx + 1}`).trim().charAt(0).toUpperCase()
                      return (
                        <div key={idx} className={`flex items-center justify-between rounded-md border px-3 py-2 ${idx===0?"bg-emerald-50":"bg-background"}`}>
                          <button type="button" className="flex items-center gap-3 flex-1 text-left" onClick={() => setEditingMemberIndex(idx)}>
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${idx===0?"border-emerald-400":"border-muted"} bg-background font-medium`}>{initial}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-medium">{name}</span>
                                {idx===0 && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800"><Crown className="w-3 h-3"/> Team Leader</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground font-serif">{phone}</div>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            <Button type="button" size="icon" variant="outline" onClick={() => setEditingMemberIndex(idx)} aria-label="Edit">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button type="button" size="icon" variant="outline" onClick={() => removeMember(idx)} aria-label="Remove">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Member edit dialog */}
                <Dialog open={editingMemberIndex !== null} onOpenChange={(open) => !open && setEditingMemberIndex(null)}>
                  <DialogContent className="max-w-2xl">
                    {editingMemberIndex !== null && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="font-sans">Edit Member {editingMemberIndex + 1}</DialogTitle>
                          <DialogDescription className="font-serif">Update the member details and close the dialog.</DialogDescription>
                        </DialogHeader>
                        {(() => { const idx = editingMemberIndex; const m = registrationData.teamInfo.members[idx]; return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-serif">First Name</Label>
                                <Input value={m.firstName} onChange={(e) => updateMember(idx, "firstName", e.target.value)} className="font-serif" />
                              </div>
                              <div className="space-y-2">
                                <Label className="font-serif">Last Name</Label>
                                <Input value={m.lastName} onChange={(e) => updateMember(idx, "lastName", e.target.value)} className="font-serif" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-serif">Email</Label>
                                <Input type="email" value={m.email} onChange={(e) => updateMember(idx, "email", e.target.value)} className="font-serif" />
                              </div>
                              <div className="space-y-2">
                                <Label className="font-serif">Mobile</Label>
                                <Input type="tel" value={m.phone} onChange={(e) => updateMember(idx, "phone", e.target.value)} className="font-serif" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-serif">Gender</Label>
                                <Select value={m.gender} onValueChange={(v) => updateMember(idx, "gender", v)}>
                                  <SelectTrigger className="font-serif"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer_not_say">Prefer not to say</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-serif">Institute Name</Label>
                                <Input value={m.instituteName} onChange={(e) => updateMember(idx, "instituteName", e.target.value)} className="font-serif" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-serif">Type</Label>
                                <Select value={m.type} onValueChange={(v) => updateMember(idx, "type", v)}>
                                  <SelectTrigger className="font-serif"><SelectValue placeholder="Select type" /></SelectTrigger>
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
                                <Label className="font-serif">Domain</Label>
                                <Select value={m.domain} onValueChange={(v) => updateMember(idx, "domain", v)}>
                                  <SelectTrigger className="font-serif"><SelectValue placeholder="Select domain" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="management">Management</SelectItem>
                                    <SelectItem value="engineering">Engineering</SelectItem>
                                    <SelectItem value="arts_science">Arts and Science</SelectItem>
                                    <SelectItem value="medicine">Medicine</SelectItem>
                                    <SelectItem value="law">Law</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="font-serif">Bio/Skills</Label>
                              <Textarea value={m.bio} onChange={(e) => updateMember(idx, "bio", e.target.value)} className="font-serif min-h-[80px]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-serif">Graduating Year</Label>
                                <Select value={m.graduatingYear} onValueChange={(v) => updateMember(idx, "graduatingYear", v)}>
                                  <SelectTrigger className="font-serif"><SelectValue placeholder="Select year" /></SelectTrigger>
                                  <SelectContent>
                                    {["2026","2027","2028","2029"].map((y) => (
                                      <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-serif">Course Duration (years)</Label>
                                <Select value={m.courseDuration} onValueChange={(v) => updateMember(idx, "courseDuration", v)}>
                                  <SelectTrigger className="font-serif"><SelectValue placeholder="Select duration" /></SelectTrigger>
                                  <SelectContent>
                                    {["2","3","4","5"].map((d) => (
                                      <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-serif">Differently Abled</Label>
                                <Select value={m.differentlyAbled} onValueChange={(v) => updateMember(idx, "differentlyAbled", v)}>
                                  <SelectTrigger className="font-serif"><SelectValue placeholder="Select option" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-serif">Location</Label>
                                <Input value={m.location} onChange={(e) => updateMember(idx, "location", e.target.value)} className="font-serif" />
                              </div>
                            </div>
                            {/* Removed 'Copy from Personal Information' action in modal as requested */}
                          </div>
                        )})()}
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
          {/* Registration Type card removed to enforce Team Registration */}

          {/* Personal Information card removed per request */}


          


          


          {/* Agreements */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Terms & Agreements</CardTitle>
              <CardDescription className="font-serif">Please review and accept the following</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={registrationData.agreements.termsAccepted}
                  onCheckedChange={(checked) => updateAgreements("termsAccepted", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-serif">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="codeOfConduct"
                  checked={registrationData.agreements.codeOfConductAccepted}
                  onCheckedChange={(checked) => updateAgreements("codeOfConductAccepted", checked as boolean)}
                />
                <Label htmlFor="codeOfConduct" className="text-sm font-serif">
                  I agree to abide by the{" "}
                  <Link href="/code-of-conduct" className="text-primary hover:text-primary/80">
                    Code of Conduct
                  </Link>{" "}
                  and event rules
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataProcessing"
                  checked={registrationData.agreements.dataProcessingAccepted}
                  onCheckedChange={(checked) => updateAgreements("dataProcessingAccepted", checked as boolean)}
                />
                <Label htmlFor="dataProcessing" className="text-sm font-serif">
                  I consent to the processing of my personal data for event management and communication purposes
                </Label>
              </div>

              {/* Accept All */}
              <div className="flex items-start space-x-2 pt-2 border-t mt-2">
                <Checkbox
                  id="acceptAll"
                  checked={acceptAllState}
                  onCheckedChange={(val) => {
                    const v = val === true
                    updateAgreements("termsAccepted", v)
                    updateAgreements("codeOfConductAccepted", v)
                    updateAgreements("dataProcessingAccepted", v)
                  }}
                />
                <Label htmlFor="acceptAll" className="text-sm font-serif">
                  Accept all
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit - disabled if event not organizer-created or still loading/error */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/events/${id}`}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || loading || !isFormValid()}
              title={formInvalidReason() || undefined}
            >
              {isLoading ? "Registering..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

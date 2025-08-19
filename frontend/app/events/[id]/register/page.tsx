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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ArrowLeft, User, Mail, Phone } from "lucide-react"
import Link from "next/link"
import type { CheckedState } from "@radix-ui/react-checkbox"

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

export default function EventRegistrationPage({ params }: { params?: { id: string } }) {
  const routeParams = useParams<{ id: string }>()
  const id = params?.id || routeParams?.id
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    registrationType: "individual",
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

  const addMember = () => {
    setRegistrationData((prev) => ({
      ...prev,
      teamInfo: {
        ...prev.teamInfo,
        members: [
          ...prev.teamInfo.members,
          {
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
          },
        ],
      },
    }))
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
      let nextMembers = prev.teamInfo.members
      if (nextMembers.length === 0) {
        nextMembers = [
          {
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
          },
        ]
      } else {
        nextMembers = [...nextMembers]
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
      const res = await fetch(`${base}/api/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
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
    const { personalInfo, agreements } = registrationData
    return (
      personalInfo.firstName &&
      personalInfo.lastName &&
      personalInfo.email &&
      agreements.termsAccepted &&
      agreements.codeOfConductAccepted &&
      agreements.dataProcessingAccepted
    )
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
          {/* Registration Type */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Registration Type</CardTitle>
              <CardDescription className="font-serif">Choose how you want to participate</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={registrationData.registrationType}
                onValueChange={(value) =>
                  setRegistrationData((prev) => ({ ...prev, registrationType: value as "individual" | "team" }))
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="individual" id="individual" />
                  <div className="flex-1">
                    <Label htmlFor="individual" className="font-medium font-sans">
                      Individual Participant
                    </Label>
                    <p className="text-sm text-muted-foreground font-serif">
                      Register as an individual and join or form teams later
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="team" id="team" />
                  <div className="flex-1">
                    <Label htmlFor="team" className="font-medium font-sans">
                      Team Registration
                    </Label>
                    <p className="text-sm text-muted-foreground font-serif">
                      Register with a team name and invite members
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription className="font-serif">Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-serif">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={registrationData.personalInfo.firstName}
                    onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-serif">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={registrationData.personalInfo.lastName}
                    onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-serif">Gender</Label>
                  <Select value={registrationData.personalInfo.gender} onValueChange={(v) => updatePersonalInfo("gender", v)}>
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
                  <Label htmlFor="institute" className="font-serif">Institute Name</Label>
                  <Input id="institute" value={registrationData.personalInfo.instituteName} onChange={(e) => updatePersonalInfo("instituteName", e.target.value)} className="font-serif" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-serif">Type</Label>
                  <Select value={registrationData.personalInfo.type} onValueChange={(v) => updatePersonalInfo("type", v)}>
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
                  <Select value={registrationData.personalInfo.domain} onValueChange={(v) => updatePersonalInfo("domain", v)}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-serif">Graduating Year</Label>
                  <Select value={registrationData.personalInfo.graduatingYear} onValueChange={(v) => updatePersonalInfo("graduatingYear", v)}>
                    <SelectTrigger className="font-serif"><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      {(["2026","2027","2028","2029"] as const).map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-serif">Course Duration (years)</Label>
                  <Select value={registrationData.personalInfo.courseDuration} onValueChange={(v) => updatePersonalInfo("courseDuration", v)}>
                    <SelectTrigger className="font-serif"><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                      {(["2","3","4","5"] as const).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-serif">Differently Abled</Label>
                  <Select value={registrationData.personalInfo.differentlyAbled} onValueChange={(v) => updatePersonalInfo("differentlyAbled", v)}>
                    <SelectTrigger className="font-serif"><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-serif">Location</Label>
                  <Input id="location" value={registrationData.personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} className="font-serif" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-serif">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={registrationData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo("email", e.target.value)}
                      className="pl-10 font-serif"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-serif">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={registrationData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                      className="pl-10 font-serif"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organization" className="font-serif">
                    Organization/University
                  </Label>
                  <Input
                    id="organization"
                    value={registrationData.personalInfo.organization}
                    onChange={(e) => updatePersonalInfo("organization", e.target.value)}
                    className="font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="font-serif">
                    Experience Level
                  </Label>
                  <Select onValueChange={(value) => updatePersonalInfo("experience", value)}>
                    <SelectTrigger className="font-serif">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-4 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                      <SelectItem value="expert">Expert (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="font-serif">
                  Bio/Skills
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your background, skills, and what you hope to achieve at this event..."
                  value={registrationData.personalInfo.bio}
                  onChange={(e) => updatePersonalInfo("bio", e.target.value)}
                  className="min-h-[100px] font-serif"
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-serif">Team Members</Label>
                    <div className="flex gap-2">
                      {registrationData.teamInfo.members.length === 0 && (
                        <Button type="button" onClick={addMeAsMember1} variant="outline">Add Me as Member 1</Button>
                      )}
                      <Button type="button" onClick={addMember} variant="secondary">Add Member</Button>
                    </div>
                  </div>
                  {registrationData.teamInfo.members.length === 0 && (
                    <div className="text-sm text-muted-foreground">Add members and fill their details.</div>
                  )}
                  {registrationData.teamInfo.members.map((m, idx) => (
                    <Card key={idx} className="border-dashed">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-sans">Member {idx + 1}</CardTitle>
                          {idx === 0 && (
                            <Button type="button" size="sm" variant="outline" onClick={() => copyPersonalToMember(0)}>
                              Copy from Personal Information
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                                {(["2026","2027","2028","2029"] as const).map((y) => (
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
                                {(["2","3","4","5"] as const).map((d) => (
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
                        <div className="flex justify-end">
                          <Button type="button" variant="outline" onClick={() => removeMember(idx)}>Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          

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
            <Button type="submit" disabled={isLoading || !isFormValid() || loading || !!error || !event?.organizer}>
              {isLoading ? "Registering..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

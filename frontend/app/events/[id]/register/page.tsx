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
import { Calendar, Users, MapPin, ArrowLeft, Pencil, Trash2, Crown, Ellipsis, Mail } from "lucide-react"
import Link from "next/link"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDateRange } from "@/lib/date"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    type: "college_student" | "professional" | "fresher" | ""
    graduatingYear: "2026" | "2027" | "2028" | "2029" | ""
    courseDuration: "2" | "3" | "4" | "5" | ""
    differentlyAbled: "no" | "yes" | ""
    location: string
  }
  payment?: {
    status: 'paid' | 'free'
    amount: number
    currency: string
    orderId?: string
    paymentId?: string
    signature?: string
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
      type: "college_student" | "professional" | "fresher" | ""
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
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteMemberIndex, setInviteMemberIndex] = useState<number | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  // Draft state
  const [draftLoading, setDraftLoading] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [draftMessage, setDraftMessage] = useState<string | null>(null)
  // Payment state
  const [payment, setPayment] = useState<{
    required: boolean
    amount: number
    currency: string
    status: 'unpaid' | 'paid' | 'free'
    orderId?: string
    paymentId?: string
    signature?: string
    verifying?: boolean
  }>({ required: false, amount: 0, currency: 'INR', status: 'unpaid' })

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${id}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || "Failed to load event")
        setEvent(data.event)
        // Determine if payment is required based on event.fees
        const fee = Number((data?.event as any)?.fees || 0)
        if (fee > 0) {
          setPayment((prev) => ({ ...prev, required: true, amount: fee, currency: 'INR', status: 'unpaid' }))
        } else {
          setPayment((prev) => ({ ...prev, required: false, amount: 0, currency: 'INR', status: 'free' }))
        }
        // Gate: Only allow events created by an organizer (organizer field must exist)
        if (!data?.event?.organizer) {
          setError("Registration is only available for organizer-created events.")
        }
        // Initialize default team size
        // If event is for individual participants, force team size = 1
        const isIndividual = (data?.event?.participantType || '').toLowerCase() === 'individual'
        const minTS = (data?.event?.minTeamSize ?? data?.event?.minTeamMembers ?? 1) as number
        const normalizedMin = Math.max(1, Number(minTS) || 1)
        const defaultTeamSize = isIndividual ? 1 : normalizedMin
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

  // Load logged-in user's profile to prefill personalInfo (and later Member 1)
  useEffect(() => {
    const run = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) return
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
        if (!res.ok) return
        const data = await res.json().catch(() => ({} as any))
        const user = data?.user || data
        if (!user) return
        const fullName = (user.name || "").trim()
        const sp = fullName.indexOf(" ")
        const firstName = sp > 0 ? fullName.slice(0, sp) : fullName
        const lastName = sp > 0 ? fullName.slice(sp + 1) : ""
        // Normalize helper
        const norm = (v: any) => (typeof v === "string" ? v.trim() : "")
        const normGender = (v: any) => {
          const s = norm(v).toLowerCase()
          if (s === "male" || s === "female" || s === "other" || s === "prefer_not_say") return s
          if (s === "prefer not to say") return "prefer_not_say"
          return ""
        }
        const normType = (v: any) => {
          const s = norm(v).toLowerCase().replaceAll(" ", "_")
          const allowed = ["college_student","professional","fresher"] as const
          return (allowed as readonly string[]).includes(s) ? s : ""
        }
        const normYear = (v: any) => {
          const s = norm(v)
          return /^(2026|2027|2028|2029)$/.test(s) ? s : ""
        }
        const normDuration = (v: any) => {
          const s = norm(v)
          return /^(2|3|4|5)$/.test(s) ? s : ""
        }
        const normDiffAbled = (v: any) => {
          const s = norm(v).toLowerCase()
          if (s === "yes" || s === "true" || s === "y") return "yes"
          if (s === "no" || s === "false" || s === "n") return "no"
          return ""
        }
        setCurrentUserRole(user.role || null)
        setRegistrationData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            firstName: firstName || prev.personalInfo.firstName,
            lastName: lastName || prev.personalInfo.lastName,
            email: user.email || prev.personalInfo.email,
            phone: (user as any).phone || prev.personalInfo.phone,
            bio: (user as any).bio || prev.personalInfo.bio,
            instituteName: (user as any).organization || prev.personalInfo.instituteName,
            location: (user as any).location || prev.personalInfo.location,
            // Dropdown fields if profile has them
            gender: (normGender((user as any).gender) as RegistrationData["personalInfo"]["gender"]) || prev.personalInfo.gender,
            type: (normType((user as any).participantType || (user as any).type) as RegistrationData["personalInfo"]["type"]) || prev.personalInfo.type,
            graduatingYear: (normYear((user as any).graduatingYear || (user as any).graduationYear) as RegistrationData["personalInfo"]["graduatingYear"]) || prev.personalInfo.graduatingYear,
            courseDuration: (normDuration((user as any).courseDuration || (user as any).courseDurationYears) as RegistrationData["personalInfo"]["courseDuration"]) || prev.personalInfo.courseDuration,
            differentlyAbled: (normDiffAbled((user as any).differentlyAbled || (user as any).differently_abled) as RegistrationData["personalInfo"]["differentlyAbled"]) || prev.personalInfo.differentlyAbled,
          },
        }))
      } catch {
        // ignore profile prefill errors
      }
    }
    run()
  }, [])

  // Resolve an email to key draft ownership
  const getDraftEmail = () => {
    const piEmail = (registrationData.personalInfo?.email || "").trim()
    const m0Email = (registrationData.teamInfo?.members?.[0]?.email || "").trim()
    if (piEmail || m0Email) return (piEmail || m0Email)
    // Fallback: previously saved leader email for this event
    try {
      if (typeof window !== "undefined" && id) {
        const stored = localStorage.getItem(`draft_email_${id}`) || ""
        return stored.trim()
      }
    } catch {}
    return ""
  }

  // Load existing draft when event id and email are known
  useEffect(() => {
    const run = async () => {
      if (!id) return
      const email = getDraftEmail()
      if (!email) return
      try {
        setDraftLoading(true)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/events/${id}/registration/draft?email=${encodeURIComponent(email)}`, { cache: "no-store" })
        if (res.status === 404) return // no draft
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) throw new Error(data?.message || "Failed to load draft")
        const d = data?.draft
        if (d) {
          setRegistrationData((prev) => ({
            ...prev,
            registrationType: (d.registrationType as any) || prev.registrationType,
            personalInfo: { ...prev.personalInfo, ...(d.personalInfo || {}) },
            teamInfo: {
              ...prev.teamInfo,
              ...(d.teamInfo || {}),
              members: Array.isArray(d?.teamInfo?.members) ? d.teamInfo.members : prev.teamInfo.members,
            },
            preferences: { ...prev.preferences, ...(d.preferences || {}) },
            agreements: { ...prev.agreements, ...(d.agreements || {}) },
          }))
          setDraftMessage("Draft loaded")
        }
      } catch (e: any) {
        // non-fatal
        setDraftMessage(e?.message || "Failed to load draft")
      } finally {
        setDraftLoading(false)
      }
    }
    run()
    // Re-run when email becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, registrationData.personalInfo.email, registrationData.teamInfo.members?.[0]?.email])

  // Helper to detect if a member is empty
  const isEmptyMember = (m: RegistrationData["teamInfo"]["members"][number]) => {
    return !(
      (m.firstName || m.lastName || m.email || m.phone || m.gender || m.instituteName || m.type || m.bio || m.graduatingYear || m.courseDuration || m.differentlyAbled || m.location)
    )
  }

  // When members initialize and/or personalInfo updates, auto-fill Member 1 per-field if missing
  useEffect(() => {
    const m0 = registrationData.teamInfo.members[0]
    if (!m0) return
    const p = registrationData.personalInfo
    const fields: Array<keyof RegistrationData["teamInfo"]["members"][number]> = [
      "firstName","lastName","email","phone","gender","instituteName","type","bio","graduatingYear","courseDuration","differentlyAbled","location",
    ]
    let changed = false
    const next = { ...m0 }
    for (const f of fields) {
      const mv = (next as any)[f]
      const pv = (p as any)[f]
      if ((!mv || String(mv).trim() === "") && pv && String(pv).trim() !== "") {
        ;(next as any)[f] = pv
        changed = true
      }
    }
    if (changed) {
      setRegistrationData((prev) => {
        const members = [...prev.teamInfo.members]
        members[0] = next
        return { ...prev, teamInfo: { ...prev.teamInfo, members } }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationData.teamInfo.members.length, registrationData.personalInfo])

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
      const isIndividual = ((event as any)?.participantType || '').toLowerCase() === 'individual'
      const eventMin = (event as any)?.minTeamSize ?? (event as any)?.minTeamMembers ?? 1
      const eventMax = (event as any)?.maxTeamSize ?? (event as any)?.maxTeamMembers ?? (event as any)?.teamSize ?? Math.max(1, Number(eventMin) || 1)
      const nextSizeRaw = Math.max(1, Math.floor(Number(size) || 1))
      let nextSize = Math.min(Math.max(nextSizeRaw, Number(eventMin) || 1), Number(eventMax) || nextSizeRaw)
      if (isIndividual) nextSize = 1
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

  const openInviteForMember = (index: number) => {
    const existing = registrationData.teamInfo.members[index]?.email || ""
    setInviteMemberIndex(index)
    setInviteEmail(existing)
    setInviteDialogOpen(true)
  }

  const handleSendInvite = async () => {
    const email = (inviteEmail || "").trim()
    const isValid = /\S+@\S+\.\S+/.test(email)
    if (!isValid || inviteMemberIndex == null) {
      return
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          recipientEmail: email,
          eventId: id,
          teamName: registrationData.teamInfo.teamName || undefined,
        }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.message || "Failed to send invite")
      updateMember(inviteMemberIndex, "email", email)
      setInviteDialogOpen(false)
    } catch (e: any) {
      console.error("invite error", e)
      alert(e?.message || "Failed to send invite")
    }
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

  const handlePayNow = async () => {
    try {
      if (!id) throw new Error('Invalid event')
      setSubmitError(null)
      setIsLoading(true)
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
      // Create order from backend using actual event fee
      const res = await fetch(`${base}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id })
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.message || 'Failed to create payment order')

      // If free event
      if (data?.free) {
        setPayment({ required: false, amount: 0, currency: 'INR', status: 'free' })
        return
      }
      // Simulated payment: immediately call verify in mock mode
      try {
        setPayment((p) => ({ ...p, verifying: true }))
        const verifyRes = await fetch(`${base}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data?.order?.id,
            paymentId: `pay_mock_${Date.now()}`,
            signature: `sig_mock_${Date.now()}`,
          }),
        })
        const verifyData = await verifyRes.json().catch(() => ({} as any))
        if (!verifyRes.ok || !verifyData?.verified) throw new Error(verifyData?.message || 'Payment verification failed')

        setPayment({
          required: true,
          amount: (data?.amount || 0) / 100,
          currency: data?.currency || 'INR',
          status: 'paid',
          orderId: data?.order?.id,
          paymentId: `pay_mock_${Date.now()}`,
          signature: `sig_mock_${Date.now()}`,
          verifying: false,
        })
      } catch (e: any) {
        setSubmitError(e?.message || 'Payment verification failed')
        setPayment((p) => ({ ...p, verifying: false }))
      }
    } catch (e: any) {
      setSubmitError(e?.message || 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Guard: only proceed if the submitter is the intended submit button
    const submitterId = (e as any)?.nativeEvent?.submitter?.id as string | undefined
    if (submitterId !== 'submit-register') {
      return
    }
    setSubmitError(null)
    setIsLoading(true)
    try {
      // Client-side guard: block judges proactively
      if (currentUserRole === "judge") {
        throw new Error("Judges are not allowed to register for events")
      }
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
          graduatingYear: pi.graduatingYear || (m0.graduatingYear || ""),
          courseDuration: pi.courseDuration || (m0.courseDuration || ""),
          differentlyAbled: pi.differentlyAbled || (m0.differentlyAbled || ""),
          location: pi.location || (m0.location || ""),
        }
      })()
      const payload = {
        ...registrationData,
        personalInfo: derivedPI,
        payment: payment.status === 'paid'
          ? {
              status: 'paid',
              amount: payment.amount,
              currency: payment.currency,
              orderId: payment.orderId,
              paymentId: payment.paymentId,
              signature: payment.signature,
            }
          : payment.status === 'free'
          ? { status: 'free', amount: 0, currency: 'INR' }
          : undefined,
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Registration failed")
      // Best-effort: clear any saved draft for this event/email
      try {
        const email = getDraftEmail()
        if (email) {
          await fetch(`${base}/api/events/${id}/registration/draft`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
        }
        // Also clear stored draft email for this event
        if (typeof window !== "undefined" && id) {
          localStorage.removeItem(`draft_email_${id}`)
        }
      } catch {}
      // Success -> redirect back to the event page
      window.location.href = `/events/${id}`
    } catch (err: any) {
      setSubmitError(err?.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setDraftMessage(null)
      const email = getDraftEmail()
      if (!email) {
        setDraftMessage("Enter leader email (personal or Member 1) to save draft")
        return
      }
      setDraftSaving(true)
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const payload = { ...registrationData, email }
      const res = await fetch(`${base}/api/events/${id}/registration/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.message || "Failed to save draft")
      // Persist the email so draft auto-loads on revisit
      try {
        if (typeof window !== "undefined" && id && email) {
          localStorage.setItem(`draft_email_${id}`, email)
        }
      } catch {}
      setDraftMessage("Draft saved")
      // Navigate back to the event page after save
      if (typeof window !== "undefined" && id) {
        window.location.href = `/events/${id}`
      }
    } catch (e: any) {
      setDraftMessage(e?.message || "Failed to save draft")
    } finally {
      setDraftSaving(false)
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

    const baseValid = Boolean(teamMetaValid && membersValid && personalInfoValid && agreementsValid)
    const requiresPayment = Number((event as any)?.fees || 0) > 0
    const paidOrFree = payment.status === 'paid' || payment.status === 'free'
    return Boolean(baseValid && (!requiresPayment || paidOrFree))
  }

  const formInvalidReason = () => {
    if (loading) return "Loading event..."
    if (isLoading) return "Submitting..."
    if (!isFormValid()) return "Please complete team name, required member fields, and agreements."
    return null
  }

  // Use shared date formatter for consistency

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
                    {formatDateRange(event.startDate, event.endDate)}
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
                    disabled={(event as any)?.participantType?.toLowerCase?.() === 'individual'}
                  >
                    <SelectTrigger className="font-serif" disabled={(event as any)?.participantType?.toLowerCase?.() === 'individual'}>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const isIndividual = ((event as any)?.participantType || '').toLowerCase() === 'individual'
                        if (isIndividual) {
                          return <SelectItem value="1">1</SelectItem>
                        }
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

              {/* Looking for members UI removed per request */}
              {/* Team members list and editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-serif">Team Members</Label>
                  <div className="flex gap-2">
                    {registrationData.teamInfo.members.length === 0 && (
                      <Button type="button" onClick={addMeAsMember1} variant="outline">Add Me as Member 1</Button>
                    )}
                    {((event as any)?.participantType || '').toLowerCase() !== 'individual' && !atMaxMembers() && (
                      <Button
                        type="button"
                        onClick={addMember}
                        variant="secondary"
                        title="Add a new team member"
                      >
                        Add Member
                      </Button>
                    )}
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
                    if (!m) return null
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" size="icon" variant="outline" aria-label="Actions">
                                <Ellipsis className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openInviteForMember(idx)}>
                                <Mail className="w-4 h-4 mr-2" /> Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingMemberIndex(idx)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => removeMember(idx)} className="text-red-600 focus:text-red-700">
                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Edit Member Dialog */}
              {editingMemberIndex !== null && registrationData.teamInfo.members[editingMemberIndex as number] && (
                <Dialog open={editingMemberIndex !== null} onOpenChange={(open) => { if (!open) setEditingMemberIndex(null) }}>
                  <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-sans">Edit Member {(editingMemberIndex as number) + 1}</DialogTitle>
                    <DialogDescription className="font-serif">Update the member details and close the dialog.</DialogDescription>
                  </DialogHeader>
                  {(() => { const idx = editingMemberIndex as number; const m = registrationData.teamInfo.members[idx]; if (!m) return null; return (
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
                          <Select value={m.gender || undefined} onValueChange={(v) => updateMember(idx, "gender", v)}>
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
                          <Select value={m.type || undefined} onValueChange={(v) => updateMember(idx, "type", v)}>
                            <SelectTrigger className="font-serif"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="college_student">College Student</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="fresher">Fresher</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Domain field removed per request */}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-serif">Bio/Skills</Label>
                        <Textarea value={m.bio} onChange={(e) => updateMember(idx, "bio", e.target.value)} className="font-serif min-h-[80px]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-serif">Graduating Year</Label>
                          <Select value={m.graduatingYear || undefined} onValueChange={(v) => updateMember(idx, "graduatingYear", v)}>
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
                          <Select value={m.courseDuration || undefined} onValueChange={(v) => updateMember(idx, "courseDuration", v)}>
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
                          <Select value={m.differentlyAbled || undefined} onValueChange={(v) => updateMember(idx, "differentlyAbled", v)}>
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
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setEditingMemberIndex(null)}>
                          Cancel
                        </Button>
                        <Button type="button" onClick={() => setEditingMemberIndex(null)}>
                          Save changes
                        </Button>
                      </div>
                    </div>
                  )})()}
                  </DialogContent>
                </Dialog>
              )}

                {/* Invite Member Dialog */}
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-sans">Invite Team Member</DialogTitle>
                      <DialogDescription className="font-serif">Enter the email address of the person you want to invite.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail" className="font-serif">Email</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="name@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="font-serif"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSendInvite}>
                          <Mail className="w-4 h-4 mr-2" /> Send Invite
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
          {/* Registration Type card removed to enforce Team Registration */}

          {/* Personal Information card removed per request */}


          


          


          {/* Draft actions placed between Team Info and Agreements */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {(draftLoading || draftMessage) && (
              <div className="text-xs text-muted-foreground">
                {draftLoading ? "Loading draft..." : draftMessage}
              </div>
            )}
            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={draftSaving || loading}>
                {draftSaving ? "Saving..." : "Save as Draft"}
              </Button>
            </div>
        </div>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Payment</CardTitle>
            <CardDescription className="font-serif">Complete payment to enable registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Number((event as any)?.fees || 0) > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm font-serif">
                  Amount Due: <span className="font-semibold">{payment.amount || (event as any)?.fees} {payment.currency}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${payment.status==='paid'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>
                    {payment.status === 'paid' ? 'Paid' : 'Not Paid'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => { handlePayNow(); }}
                    disabled={payment.status==='paid' || isLoading || payment.verifying}
                  >
                    {payment.status==='paid' ? 'Payment Completed' : (isLoading || payment.verifying) ? 'Processing...' : 'Simulate Payment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground font-serif">No payment required for this event.</div>
            )}
          </CardContent>
        </Card>

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/events/${id}`}>Cancel</Link>
          </Button>
          <Button
            id="submit-register"
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

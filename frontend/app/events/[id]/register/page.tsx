"use client"

import type React from "react"

import { useState } from "react"
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

// Mock event data
const mockEvent = {
  id: 1,
  name: "AI Innovation Challenge 2024",
  description: "Build the next generation of AI-powered applications that solve real-world problems.",
  theme: "Artificial Intelligence",
  type: "hybrid",
  startDate: "2024-03-15T09:00",
  endDate: "2024-03-17T18:00",
  registrationDeadline: "2024-03-10T23:59",
  location: "Tech Hub Convention Center, San Francisco",
  maxParticipants: 500,
  currentParticipants: 156,
  tracks: ["Machine Learning", "Natural Language Processing", "Computer Vision", "Robotics"],
  prizes: [
    { position: "1st Place", amount: "$10,000", description: "Cash prize + 6-month mentorship" },
    { position: "2nd Place", amount: "$5,000", description: "Cash prize + 3-month mentorship" },
    { position: "3rd Place", amount: "$2,500", description: "Cash prize + resources" },
  ],
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
  }
  teamInfo: {
    teamName: string
    teamDescription: string
    lookingForMembers: boolean
    desiredSkills: string[]
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

export default function EventRegistrationPage({ params }: { params: { id: string } }) {
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
    },
    teamInfo: {
      teamName: "",
      teamDescription: "",
      lookingForMembers: false,
      desiredSkills: [],
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
    setIsLoading(true)

    // TODO: Implement actual registration
    console.log("[v0] Registration data:", registrationData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to success page or dashboard
      window.location.href = "/dashboard/participant"
    }, 2000)
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/events/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground font-sans mb-2">Register for Event</h1>
            <h2 className="text-xl text-primary font-sans mb-4">{mockEvent.name}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground font-serif">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(mockEvent.startDate).toLocaleDateString()} -{" "}
                {new Date(mockEvent.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {mockEvent.type === "online" ? "Online Event" : mockEvent.location}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {mockEvent.currentParticipants} / {mockEvent.maxParticipants} registered
              </div>
            </div>
          </div>
        </div>

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
              </CardContent>
            </Card>
          )}

          {/* Event Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Event Preferences</CardTitle>
              <CardDescription className="font-serif">Help us personalize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="track" className="font-serif">
                  Preferred Track
                </Label>
                <Select onValueChange={(value) => updatePreferences("track", value)}>
                  <SelectTrigger className="font-serif">
                    <SelectValue placeholder="Select a track" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEvent.tracks.map((track) => (
                      <SelectItem key={track} value={track}>
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tshirtSize" className="font-serif">
                    T-Shirt Size
                  </Label>
                  <Select onValueChange={(value) => updatePreferences("tshirtSize", value)}>
                    <SelectTrigger className="font-serif">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="xxl">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="font-serif">
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Name and phone number"
                    value={registrationData.preferences.emergencyContact}
                    onChange={(e) => updatePreferences("emergencyContact", e.target.value)}
                    className="font-serif"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions" className="font-serif">
                  Dietary Restrictions/Allergies
                </Label>
                <Textarea
                  id="dietaryRestrictions"
                  placeholder="Please list any dietary restrictions, allergies, or special requirements..."
                  value={registrationData.preferences.dietaryRestrictions}
                  onChange={(e) => updatePreferences("dietaryRestrictions", e.target.value)}
                  className="font-serif"
                />
              </div>
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
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/events/${params.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading || !isFormValid()}>
              {isLoading ? "Registering..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

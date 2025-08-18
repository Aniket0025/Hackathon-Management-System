"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Plus, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

interface EventFormData {
  name: string
  description: string
  theme: string
  type: "online" | "offline" | "hybrid"
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: string
  location: string
  tracks: string[]
  prizes: Array<{ position: string; amount: string; description: string }>
  sponsors: Array<{ name: string; tier: string; logo: string }>
  rules: string
  judgesCriteria: string[]
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    theme: "",
    type: "online",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxParticipants: "",
    location: "",
    tracks: [],
    prizes: [{ position: "1st Place", amount: "", description: "" }],
    sponsors: [],
    rules: "",
    judgesCriteria: ["Innovation", "Technical Implementation", "User Experience"],
  })

  const [newTrack, setNewTrack] = useState("")
  const [newCriteria, setNewCriteria] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTrack = () => {
    if (newTrack.trim()) {
      updateFormData("tracks", [...formData.tracks, newTrack.trim()])
      setNewTrack("")
    }
  }

  const removeTrack = (index: number) => {
    updateFormData(
      "tracks",
      formData.tracks.filter((_, i) => i !== index),
    )
  }

  const addPrize = () => {
    updateFormData("prizes", [...formData.prizes, { position: "", amount: "", description: "" }])
  }

  const updatePrize = (index: number, field: string, value: string) => {
    const updatedPrizes = formData.prizes.map((prize, i) => (i === index ? { ...prize, [field]: value } : prize))
    updateFormData("prizes", updatedPrizes)
  }

  const removePrize = (index: number) => {
    updateFormData(
      "prizes",
      formData.prizes.filter((_, i) => i !== index),
    )
  }

  const addCriteria = () => {
    if (newCriteria.trim()) {
      updateFormData("judgesCriteria", [...formData.judgesCriteria, newCriteria.trim()])
      setNewCriteria("")
    }
  }

  const removeCriteria = (index: number) => {
    updateFormData(
      "judgesCriteria",
      formData.judgesCriteria.filter((_, i) => i !== index),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implement actual event creation
    console.log("[v0] Creating event:", formData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard
      window.location.href = "/dashboard"
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Create New Event</h1>
            <p className="text-muted-foreground font-serif">Set up your hackathon or innovation event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Basic Information</CardTitle>
              <CardDescription className="font-serif">Essential details about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-serif">
                    Event Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="AI Innovation Challenge 2024"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme" className="font-serif">
                    Theme
                  </Label>
                  <Input
                    id="theme"
                    placeholder="Artificial Intelligence, Sustainability, etc."
                    value={formData.theme}
                    onChange={(e) => updateFormData("theme", e.target.value)}
                    className="font-serif"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-serif">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event, its goals, and what participants can expect..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  className="min-h-[100px] font-serif"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="font-serif">
                    Event Type *
                  </Label>
                  <Select onValueChange={(value) => updateFormData("type", value)} defaultValue={formData.type}>
                    <SelectTrigger className="font-serif">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="font-serif">
                    Max Participants
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="500"
                    value={formData.maxParticipants}
                    onChange={(e) => updateFormData("maxParticipants", e.target.value)}
                    className="font-serif"
                  />
                </div>
              </div>

              {(formData.type === "offline" || formData.type === "hybrid") && (
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-serif">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="University Campus, City Convention Center, etc."
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
              <CardDescription className="font-serif">Set important dates for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-serif">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => updateFormData("startDate", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="font-serif">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => updateFormData("endDate", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline" className="font-serif">
                    Registration Deadline *
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => updateFormData("registrationDeadline", e.target.value)}
                    className="font-serif"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracks */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Event Tracks</CardTitle>
              <CardDescription className="font-serif">
                Define different categories or tracks for your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a track (e.g., Web Development, Mobile Apps)"
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="font-serif"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTrack())}
                />
                <Button type="button" onClick={addTrack}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tracks.map((track, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {track}
                    <button type="button" onClick={() => removeTrack(index)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Trophy className="w-5 h-5" />
                Prizes & Awards
              </CardTitle>
              <CardDescription className="font-serif">Configure prizes for winners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.prizes.map((prize, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label className="font-serif">Position</Label>
                    <Input
                      placeholder="1st Place"
                      value={prize.position}
                      onChange={(e) => updatePrize(index, "position", e.target.value)}
                      className="font-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-serif">Amount</Label>
                    <Input
                      placeholder="$5,000"
                      value={prize.amount}
                      onChange={(e) => updatePrize(index, "amount", e.target.value)}
                      className="font-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-serif">Description</Label>
                    <Input
                      placeholder="Cash prize + mentorship"
                      value={prize.description}
                      onChange={(e) => updatePrize(index, "description", e.target.value)}
                      className="font-serif"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => removePrize(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPrize}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prize
              </Button>
            </CardContent>
          </Card>

          {/* Judging Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Judging Criteria</CardTitle>
              <CardDescription className="font-serif">Define how projects will be evaluated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add criteria (e.g., Creativity, Impact)"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  className="font-serif"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCriteria())}
                />
                <Button type="button" onClick={addCriteria}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.judgesCriteria.map((criteria, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {criteria}
                    <button type="button" onClick={() => removeCriteria(index)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rules & Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Rules & Guidelines</CardTitle>
              <CardDescription className="font-serif">Set clear rules and guidelines for participants</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter event rules, code of conduct, submission guidelines, etc."
                value={formData.rules}
                onChange={(e) => updateFormData("rules", e.target.value)}
                className="min-h-[150px] font-serif"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

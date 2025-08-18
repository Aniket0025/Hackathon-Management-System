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
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Github,
  Video,
  FileText,
  X,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock events data
const mockEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    submissionDeadline: "2024-03-15T23:59:00",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip", ".pptx"],
    maxFileSize: "50MB",
    rounds: ["preliminary", "final"],
    currentRound: "final",
    tracks: ["Machine Learning", "Natural Language Processing", "Computer Vision", "Robotics"],
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    submissionDeadline: "2024-02-22T23:59:00",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary"],
    currentRound: "preliminary",
    tracks: ["Clean Energy", "Sustainable Agriculture", "Waste Management", "Green Transportation"],
  },
]

interface SubmissionData {
  eventId: string
  projectName: string
  description: string
  track: string
  round: string
  githubUrl: string
  demoUrl: string
  videoUrl: string
  technologies: string[]
  teamMembers: string
  challenges: string
  solution: string
  impact: string
  futureWork: string
  files: File[]
}

export default function CreateSubmissionPage() {
  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    eventId: "",
    projectName: "",
    description: "",
    track: "",
    round: "",
    githubUrl: "",
    demoUrl: "",
    videoUrl: "",
    technologies: [],
    teamMembers: "",
    challenges: "",
    solution: "",
    impact: "",
    futureWork: "",
    files: [],
  })

  const [newTechnology, setNewTechnology] = useState("")
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  const selectedEvent = mockEvents.find((event) => event.id.toString() === submissionData.eventId)

  const updateSubmissionData = (field: keyof SubmissionData, value: any) => {
    setSubmissionData((prev) => ({ ...prev, [field]: value }))
  }

  const addTechnology = () => {
    if (newTechnology.trim() && !submissionData.technologies.includes(newTechnology.trim())) {
      updateSubmissionData("technologies", [...submissionData.technologies, newTechnology.trim()])
      setNewTechnology("")
    }
  }

  const removeTechnology = (index: number) => {
    updateSubmissionData(
      "technologies",
      submissionData.technologies.filter((_, i) => i !== index),
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) => {
      if (!selectedEvent) return false
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      return selectedEvent.allowedFileTypes.includes(fileExtension)
    })

    // Simulate upload progress
    validFiles.forEach((file) => {
      const fileName = file.name
      setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }))

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[fileName] || 0
          if (currentProgress >= 100) {
            clearInterval(interval)
            return prev
          }
          return { ...prev, [fileName]: currentProgress + 10 }
        })
      }, 200)
    })

    updateSubmissionData("files", [...submissionData.files, ...validFiles])
  }

  const removeFile = (index: number) => {
    const fileName = submissionData.files[index].name
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
    updateSubmissionData(
      "files",
      submissionData.files.filter((_, i) => i !== index),
    )
  }

  const handleSubmit = async (asDraft = false) => {
    setIsLoading(true)
    setIsDraft(asDraft)

    // TODO: Implement actual submission
    console.log("[v0] Submitting project:", { ...submissionData, isDraft: asDraft })

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to submissions page
      window.location.href = "/dashboard/participant/submissions"
    }, 2000)
  }

  const isFormValid = () => {
    return (
      submissionData.eventId &&
      submissionData.projectName &&
      submissionData.description &&
      submissionData.solution &&
      submissionData.githubUrl
    )
  }

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/participant/submissions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Submissions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Create Project Submission</h1>
            <p className="text-muted-foreground font-serif">Submit your hackathon project</p>
          </div>
        </div>

        <form className="space-y-8">
          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Event Selection</CardTitle>
              <CardDescription className="font-serif">Choose the event for your submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event" className="font-serif">
                  Event *
                </Label>
                <Select onValueChange={(value) => updateSubmissionData("eventId", value)}>
                  <SelectTrigger className="font-serif">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEvent && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm font-serif">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>
                      Submission deadline: {new Date(selectedEvent.submissionDeadline).toLocaleDateString()}{" "}
                      {new Date(selectedEvent.submissionDeadline).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground font-serif">
                    <span>Current round: {selectedEvent.currentRound}</span>
                    <span className="mx-2">•</span>
                    <span>Max file size: {selectedEvent.maxFileSize}</span>
                    <span className="mx-2">•</span>
                    <span>Allowed types: {selectedEvent.allowedFileTypes.join(", ")}</span>
                  </div>
                </div>
              )}

              {selectedEvent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="track" className="font-serif">
                      Track
                    </Label>
                    <Select onValueChange={(value) => updateSubmissionData("track", value)}>
                      <SelectTrigger className="font-serif">
                        <SelectValue placeholder="Select a track" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedEvent.tracks.map((track) => (
                          <SelectItem key={track} value={track}>
                            {track}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="round" className="font-serif">
                      Submission Round
                    </Label>
                    <Select
                      onValueChange={(value) => updateSubmissionData("round", value)}
                      defaultValue={selectedEvent.currentRound}
                    >
                      <SelectTrigger className="font-serif">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedEvent.rounds.map((round) => (
                          <SelectItem key={round} value={round}>
                            {round}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Project Information</CardTitle>
              <CardDescription className="font-serif">Basic details about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="font-serif">
                  Project Name *
                </Label>
                <Input
                  id="projectName"
                  placeholder="Enter your project name"
                  value={submissionData.projectName}
                  onChange={(e) => updateSubmissionData("projectName", e.target.value)}
                  className="font-serif"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-serif">
                  Project Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief overview of your project..."
                  value={submissionData.description}
                  onChange={(e) => updateSubmissionData("description", e.target.value)}
                  className="min-h-[100px] font-serif"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-serif">Technologies Used</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology (e.g., React, Python)"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    className="font-serif"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                  />
                  <Button type="button" onClick={addTechnology}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {submissionData.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button type="button" onClick={() => removeTechnology(index)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamMembers" className="font-serif">
                  Team Members
                </Label>
                <Textarea
                  id="teamMembers"
                  placeholder="List team members and their roles..."
                  value={submissionData.teamMembers}
                  onChange={(e) => updateSubmissionData("teamMembers", e.target.value)}
                  className="font-serif"
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Links */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Project Links</CardTitle>
              <CardDescription className="font-serif">Provide links to your project resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="font-serif">
                  GitHub Repository *
                </Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={submissionData.githubUrl}
                    onChange={(e) => updateSubmissionData("githubUrl", e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl" className="font-serif">
                  Live Demo URL
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="demoUrl"
                    type="url"
                    placeholder="https://your-project-demo.com"
                    value={submissionData.demoUrl}
                    onChange={(e) => updateSubmissionData("demoUrl", e.target.value)}
                    className="pl-10 font-serif"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="font-serif">
                  Demo Video URL
                </Label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={submissionData.videoUrl}
                    onChange={(e) => updateSubmissionData("videoUrl", e.target.value)}
                    className="pl-10 font-serif"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Project Details</CardTitle>
              <CardDescription className="font-serif">Detailed information about your solution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="challenges" className="font-serif">
                  Problem & Challenges
                </Label>
                <Textarea
                  id="challenges"
                  placeholder="What problem does your project solve? What challenges did you face?"
                  value={submissionData.challenges}
                  onChange={(e) => updateSubmissionData("challenges", e.target.value)}
                  className="min-h-[100px] font-serif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution" className="font-serif">
                  Solution & Implementation *
                </Label>
                <Textarea
                  id="solution"
                  placeholder="Describe your solution and how you implemented it..."
                  value={submissionData.solution}
                  onChange={(e) => updateSubmissionData("solution", e.target.value)}
                  className="min-h-[120px] font-serif"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact" className="font-serif">
                  Impact & Benefits
                </Label>
                <Textarea
                  id="impact"
                  placeholder="What impact does your project have? Who benefits from it?"
                  value={submissionData.impact}
                  onChange={(e) => updateSubmissionData("impact", e.target.value)}
                  className="min-h-[100px] font-serif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="futureWork" className="font-serif">
                  Future Work & Improvements
                </Label>
                <Textarea
                  id="futureWork"
                  placeholder="What would you do next? How would you improve the project?"
                  value={submissionData.futureWork}
                  onChange={(e) => updateSubmissionData("futureWork", e.target.value)}
                  className="min-h-[100px] font-serif"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Upload className="w-5 h-5" />
                File Attachments
              </CardTitle>
              <CardDescription className="font-serif">
                Upload documentation, presentations, and other project files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <h4 className="font-medium font-sans">Upload Files</h4>
                  <p className="text-sm text-muted-foreground font-serif">
                    {selectedEvent
                      ? `Supported formats: ${selectedEvent.allowedFileTypes.join(", ")} (Max: ${
                          selectedEvent.maxFileSize
                        })`
                      : "Select an event first to see supported formats"}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept={selectedEvent?.allowedFileTypes.join(",")}
                  disabled={!selectedEvent}
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" disabled={!selectedEvent} asChild>
                    <span>Choose Files</span>
                  </Button>
                </Label>
              </div>

              {/* Uploaded Files */}
              {submissionData.files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium font-sans">Uploaded Files</h4>
                  {submissionData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium font-sans">{file.name}</p>
                          <p className="text-sm text-muted-foreground font-serif">{getFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 ? (
                          <div className="flex items-center gap-2">
                            <Progress value={uploadProgress[file.name]} className="w-20" />
                            <span className="text-sm font-serif">{uploadProgress[file.name]}%</span>
                          </div>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/participant/submissions">Cancel</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !submissionData.eventId}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading && isDraft ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !isFormValid()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading && !isDraft ? "Submitting..." : "Submit Project"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

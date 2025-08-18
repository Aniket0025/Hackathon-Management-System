"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, Video, FileText, Plus, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock submissions data
const mockSubmissions = [
  {
    id: 1,
    eventId: 1,
    eventName: "AI Innovation Challenge 2024",
    projectName: "EcoAI Assistant",
    description: "An AI-powered assistant that helps users make environmentally conscious decisions",
    status: "submitted",
    submittedAt: "2024-03-14T15:30:00",
    lastUpdated: "2024-03-14T15:30:00",
    round: "final",
    teamName: "AI Pioneers",
    githubUrl: "https://github.com/ai-pioneers/ecoai-assistant",
    demoUrl: "https://ecoai-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo123",
    files: [
      { name: "project-documentation.pdf", size: "2.4 MB", type: "application/pdf" },
      { name: "demo-video.mp4", size: "45.2 MB", type: "video/mp4" },
      { name: "presentation.pptx", size: "8.1 MB", type: "application/vnd.ms-powerpoint" },
    ],
    judgeScore: 8.5,
    feedback: "Excellent implementation with strong environmental impact potential.",
  },
  {
    id: 2,
    eventId: 2,
    eventName: "Sustainable Tech Hackathon",
    projectName: "GreenTracker",
    description: "Mobile app for tracking personal carbon footprint",
    status: "draft",
    submittedAt: null,
    lastUpdated: "2024-02-20T10:15:00",
    round: "preliminary",
    teamName: null, // Individual submission
    githubUrl: "https://github.com/johndoe/greentracker",
    demoUrl: "",
    videoUrl: "",
    files: [{ name: "wireframes.pdf", size: "1.2 MB", type: "application/pdf" }],
    judgeScore: null,
    feedback: null,
  },
]

const mockEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    submissionDeadline: "2024-03-15T23:59:00",
    status: "active",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary", "final"],
    currentRound: "final",
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    submissionDeadline: "2024-02-22T23:59:00",
    status: "active",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary"],
    currentRound: "preliminary",
  },
]

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "under-review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "scored":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    if (activeTab === "all") return true
    return submission.status === activeTab
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Project Submissions</h1>
            <p className="text-muted-foreground font-serif">Manage your hackathon project submissions</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/participant/submissions/create">
              <Plus className="w-4 h-4 mr-2" />
              New Submission
            </Link>
          </Button>
        </div>

        {/* Active Events */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Active Events</CardTitle>
            <CardDescription className="font-serif">Events accepting submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockEvents
                .filter((event) => event.status === "active")
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium font-sans">{event.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-serif">
                        <span>
                          Deadline: {new Date(event.submissionDeadline).toLocaleDateString()}{" "}
                          {new Date(event.submissionDeadline).toLocaleTimeString()}
                        </span>
                        <span>Round: {event.currentRound}</span>
                        <span>Max file size: {event.maxFileSize}</span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/participant/submissions/create?eventId=${event.id}`}>Submit Project</Link>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="scored">Scored</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredSubmissions.length > 0 ? (
              <div className="grid gap-6">
                {filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="font-sans">{submission.projectName}</CardTitle>
                            <Badge className={getStatusColor(submission.status)} variant="outline">
                              {submission.status}
                            </Badge>
                            <Badge variant="secondary">{submission.round}</Badge>
                          </div>
                          <CardDescription className="font-serif">{submission.eventName}</CardDescription>
                          {submission.teamName && (
                            <p className="text-sm text-muted-foreground font-serif">Team: {submission.teamName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/participant/submissions/${submission.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          {submission.status === "draft" && (
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/participant/submissions/${submission.id}/edit`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm font-serif">{submission.description}</p>

                      {/* Project Links */}
                      <div className="flex flex-wrap gap-4">
                        {submission.githubUrl && (
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-serif"
                          >
                            <Github className="w-4 h-4" />
                            GitHub
                          </a>
                        )}
                        {submission.demoUrl && (
                          <a
                            href={submission.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-serif"
                          >
                            <Eye className="w-4 h-4" />
                            Live Demo
                          </a>
                        )}
                        {submission.videoUrl && (
                          <a
                            href={submission.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-serif"
                          >
                            <Video className="w-4 h-4" />
                            Demo Video
                          </a>
                        )}
                      </div>

                      {/* Files */}
                      {submission.files.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium font-sans">Attached Files</h4>
                          <div className="flex flex-wrap gap-2">
                            {submission.files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm font-serif"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{file.name}</span>
                                <span className="text-muted-foreground">({file.size})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Submission Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground font-serif">
                        <div className="flex items-center gap-4">
                          {submission.submittedAt ? (
                            <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          ) : (
                            <span>Last updated: {new Date(submission.lastUpdated).toLocaleDateString()}</span>
                          )}
                        </div>
                        {submission.judgeScore && (
                          <div className="flex items-center gap-2">
                            <span>Score: {submission.judgeScore}/10</span>
                          </div>
                        )}
                      </div>

                      {/* Judge Feedback */}
                      {submission.feedback && (
                        <div className="p-3 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium font-sans mb-1">Judge Feedback</h4>
                          <p className="text-sm font-serif italic">"{submission.feedback}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-sans mb-2">No Submissions Found</h3>
                  <p className="text-muted-foreground font-serif mb-4">
                    {activeTab === "all"
                      ? "You haven't created any project submissions yet."
                      : `No submissions with status "${activeTab}".`}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/participant/submissions/create">Create Your First Submission</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

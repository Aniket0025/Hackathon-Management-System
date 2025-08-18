"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Github,
  Video,
  FileText,
  ArrowLeft,
  Edit,
  Globe,
  Calendar,
  Users,
  Star,
  MessageSquare,
  Download,
} from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock submission data
const mockSubmission = {
  id: 1,
  eventId: 1,
  eventName: "AI Innovation Challenge 2024",
  projectName: "EcoAI Assistant",
  description: "An AI-powered assistant that helps users make environmentally conscious decisions in their daily lives",
  status: "submitted",
  submittedAt: "2024-03-14T15:30:00",
  lastUpdated: "2024-03-14T15:30:00",
  round: "final",
  track: "Machine Learning",
  teamName: "AI Pioneers",
  githubUrl: "https://github.com/ai-pioneers/ecoai-assistant",
  demoUrl: "https://ecoai-demo.vercel.app",
  videoUrl: "https://youtube.com/watch?v=demo123",
  technologies: ["React", "Python", "TensorFlow", "FastAPI", "PostgreSQL"],
  teamMembers: "John Doe (Team Lead), Jane Smith (Full Stack Developer), Mike Johnson (UI/UX Designer)",
  challenges:
    "The main challenge was creating an AI model that could accurately assess the environmental impact of various daily activities while maintaining user privacy and providing actionable recommendations.",
  solution:
    "We developed a machine learning model trained on environmental impact data that provides personalized recommendations. The system uses a privacy-first approach, processing data locally when possible and using federated learning techniques.",
  impact:
    "Our solution can help individuals reduce their carbon footprint by up to 30% through informed decision-making. It's particularly beneficial for environmentally conscious consumers who want to make a difference but lack the knowledge to do so effectively.",
  futureWork:
    "We plan to integrate with IoT devices for automatic tracking, expand our database to include more products and services, and develop partnerships with eco-friendly brands for seamless sustainable alternatives.",
  files: [
    { name: "project-documentation.pdf", size: "2.4 MB", type: "application/pdf", url: "#" },
    { name: "demo-video.mp4", size: "45.2 MB", type: "video/mp4", url: "#" },
    { name: "presentation.pptx", size: "8.1 MB", type: "application/vnd.ms-powerpoint", url: "#" },
    { name: "technical-architecture.pdf", size: "1.8 MB", type: "application/pdf", url: "#" },
  ],
  judgeScores: [
    {
      judge: "Dr. Sarah Wilson",
      score: 9,
      feedback: "Excellent technical implementation and clear environmental impact.",
    },
    { judge: "Prof. Michael Chen", score: 8, feedback: "Great user experience design, could improve scalability." },
    { judge: "Alex Rodriguez", score: 8.5, feedback: "Innovative approach to privacy-preserving AI recommendations." },
  ],
  averageScore: 8.5,
  teamMembers: [
    {
      id: 1,
      name: "John Doe",
      role: "Team Lead",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Full Stack Developer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "UI/UX Designer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

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

  const getFileIcon = (type: string) => {
    if (type.includes("video")) return <Video className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/participant/submissions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Submissions
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground font-sans">{mockSubmission.projectName}</h1>
                <Badge className={getStatusColor(mockSubmission.status)} variant="outline">
                  {mockSubmission.status}
                </Badge>
                <Badge variant="secondary">{mockSubmission.round}</Badge>
              </div>
              <p className="text-muted-foreground font-serif">{mockSubmission.eventName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mockSubmission.status === "draft" && (
              <Button asChild>
                <Link href={`/dashboard/participant/submissions/${params.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Average Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{mockSubmission.averageScore}/10</div>
              <p className="text-xs text-muted-foreground font-serif">
                From {mockSubmission.judgeScores.length} judges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Track</CardTitle>
              <Badge variant="outline">{mockSubmission.track}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-serif">{mockSubmission.track}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{mockSubmission.teamMembers.length}</div>
              <p className="text-xs text-muted-foreground font-serif">Team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Submitted</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-sans">{new Date(mockSubmission.submittedAt).toLocaleDateString()}</div>
              <p className="text-xs text-muted-foreground font-serif">
                {new Date(mockSubmission.submittedAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Project Overview</CardTitle>
                <CardDescription className="font-serif">{mockSubmission.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Links */}
                <div className="flex flex-wrap gap-4">
                  {mockSubmission.githubUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={mockSubmission.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub Repository
                      </a>
                    </Button>
                  )}
                  {mockSubmission.demoUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={mockSubmission.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {mockSubmission.videoUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={mockSubmission.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4 mr-2" />
                        Demo Video
                      </a>
                    </Button>
                  )}
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                  <h4 className="font-medium font-sans">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockSubmission.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium font-sans">Problem & Solution</h4>
                    <p className="text-sm font-serif">{mockSubmission.solution}</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium font-sans">Impact</h4>
                    <p className="text-sm font-serif">{mockSubmission.impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Problem & Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-serif">{mockSubmission.challenges}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Solution & Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-serif">{mockSubmission.solution}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Impact & Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-serif">{mockSubmission.impact}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Future Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-serif">{mockSubmission.futureWork}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Project Files</CardTitle>
                <CardDescription className="font-serif">Uploaded documentation and media files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockSubmission.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium font-sans">{file.name}</p>
                          <p className="text-sm text-muted-foreground font-serif">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Team Members</CardTitle>
                <CardDescription className="font-serif">Meet the team behind this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockSubmission.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium font-sans">{member.name}</h4>
                        <p className="text-sm text-muted-foreground font-serif">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {mockSubmission.judgeScores.length > 0 ? (
              <div className="grid gap-6">
                {mockSubmission.judgeScores.map((judge, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-sans">{judge.judge}</CardTitle>
                          <CardDescription className="font-serif">Judge Evaluation</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500 fill-current" />
                          <span className="text-lg font-bold font-sans">{judge.score}/10</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-serif italic">"{judge.feedback}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-sans mb-2">No Feedback Yet</h3>
                  <p className="text-muted-foreground font-serif">
                    Judges haven't provided feedback for this submission yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

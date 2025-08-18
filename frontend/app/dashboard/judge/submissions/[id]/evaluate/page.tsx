"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Video, Globe, ArrowLeft, Save, Send, Star, FileText, Download } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock submission data
const mockSubmission = {
  id: 1,
  eventId: 1,
  eventName: "AI Innovation Challenge 2024",
  projectName: "EcoAI Assistant",
  description: "An AI-powered assistant that helps users make environmentally conscious decisions in their daily lives",
  teamName: "AI Pioneers",
  track: "Machine Learning",
  submittedAt: "2024-03-14T15:30:00",
  githubUrl: "https://github.com/ai-pioneers/ecoai-assistant",
  demoUrl: "https://ecoai-demo.vercel.app",
  videoUrl: "https://youtube.com/watch?v=demo123",
  technologies: ["React", "Python", "TensorFlow", "FastAPI", "PostgreSQL"],
  teamMembers: [
    { id: 1, name: "John Doe", role: "Team Lead", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 2, name: "Jane Smith", role: "Full Stack Developer", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 3, name: "Mike Johnson", role: "UI/UX Designer", avatar: "/placeholder.svg?height=40&width=40" },
  ],
  solution:
    "We developed a machine learning model trained on environmental impact data that provides personalized recommendations. The system uses a privacy-first approach, processing data locally when possible and using federated learning techniques.",
  impact:
    "Our solution can help individuals reduce their carbon footprint by up to 30% through informed decision-making. It's particularly beneficial for environmentally conscious consumers who want to make a difference but lack the knowledge to do so effectively.",
  files: [
    { name: "project-documentation.pdf", size: "2.4 MB", type: "application/pdf", url: "#" },
    { name: "demo-video.mp4", size: "45.2 MB", type: "video/mp4", url: "#" },
    { name: "presentation.pptx", size: "8.1 MB", type: "application/vnd.ms-powerpoint", url: "#" },
  ],
}

// Mock judging criteria
const judgingCriteria = [
  {
    id: "innovation",
    name: "Innovation & Creativity",
    description: "Originality of the idea and creative approach to problem-solving",
    weight: 25,
    maxScore: 10,
  },
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality of code, architecture, and technical execution",
    weight: 25,
    maxScore: 10,
  },
  {
    id: "impact",
    name: "Impact & Usefulness",
    description: "Potential real-world impact and practical value",
    weight: 20,
    maxScore: 10,
  },
  {
    id: "presentation",
    name: "Presentation & Demo",
    description: "Quality of presentation, demo, and documentation",
    weight: 15,
    maxScore: 10,
  },
  {
    id: "completion",
    name: "Completeness",
    description: "How complete and polished the project is",
    weight: 15,
    maxScore: 10,
  },
]

interface EvaluationData {
  scores: { [key: string]: number }
  feedback: { [key: string]: string }
  overallFeedback: string
  strengths: string
  improvements: string
  recommendation: "accept" | "reject" | "conditional"
}

export default function EvaluateSubmissionPage({ params }: { params: { id: string } }) {
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    scores: {},
    feedback: {},
    overallFeedback: "",
    strengths: "",
    improvements: "",
    recommendation: "accept",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  const updateScore = (criteriaId: string, score: number) => {
    setEvaluationData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [criteriaId]: score },
    }))
  }

  const updateFeedback = (criteriaId: string, feedback: string) => {
    setEvaluationData((prev) => ({
      ...prev,
      feedback: { ...prev.feedback, [criteriaId]: feedback },
    }))
  }

  const updateField = (field: keyof EvaluationData, value: any) => {
    setEvaluationData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateWeightedScore = () => {
    let totalScore = 0
    let totalWeight = 0

    judgingCriteria.forEach((criteria) => {
      const score = evaluationData.scores[criteria.id] || 0
      totalScore += score * (criteria.weight / 100)
      totalWeight += criteria.weight / 100
    })

    return totalWeight > 0 ? totalScore : 0
  }

  const handleSubmit = async (asDraft = false) => {
    setIsLoading(true)
    setIsDraft(asDraft)

    // TODO: Implement actual evaluation submission
    console.log("[v0] Submitting evaluation:", { ...evaluationData, isDraft: asDraft })

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to judge dashboard
      window.location.href = "/dashboard/judge"
    }, 2000)
  }

  const isEvaluationComplete = () => {
    return (
      judgingCriteria.every((criteria) => evaluationData.scores[criteria.id] > 0) &&
      evaluationData.overallFeedback.trim() !== ""
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/judge">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Evaluate Submission</h1>
            <p className="text-muted-foreground font-serif">{mockSubmission.projectName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-sans">{mockSubmission.projectName}</CardTitle>
                        <CardDescription className="font-serif">{mockSubmission.eventName}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{mockSubmission.track}</Badge>
                        <Badge variant="outline">Team: {mockSubmission.teamName}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-serif">{mockSubmission.description}</p>

                    <div className="flex flex-wrap gap-4">
                      {mockSubmission.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={mockSubmission.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans">Project Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockSubmission.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockSubmission.teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-4">
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
            </Tabs>
          </div>

          {/* Evaluation Panel */}
          <div className="space-y-6">
            {/* Score Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans">
                  <Star className="w-5 h-5" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold font-sans mb-2">{calculateWeightedScore().toFixed(1)}/10</div>
                  <p className="text-sm text-muted-foreground font-serif">Weighted average</p>
                </div>
              </CardContent>
            </Card>

            {/* Judging Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Evaluation Criteria</CardTitle>
                <CardDescription className="font-serif">Score each criterion from 1-10</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {judgingCriteria.map((criteria) => (
                  <div key={criteria.id} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Label className="font-medium font-sans">{criteria.name}</Label>
                        <p className="text-sm text-muted-foreground font-serif mt-1">{criteria.description}</p>
                        <p className="text-xs text-muted-foreground font-serif">Weight: {criteria.weight}%</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold font-sans">
                          {evaluationData.scores[criteria.id] || 0}/{criteria.maxScore}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[evaluationData.scores[criteria.id] || 0]}
                      onValueChange={([value]) => updateScore(criteria.id, value)}
                      max={criteria.maxScore}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <Textarea
                      placeholder={`Feedback for ${criteria.name.toLowerCase()}...`}
                      value={evaluationData.feedback[criteria.id] || ""}
                      onChange={(e) => updateFeedback(criteria.id, e.target.value)}
                      className="min-h-[60px] font-serif"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Overall Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Overall Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="strengths" className="font-serif">
                    Strengths
                  </Label>
                  <Textarea
                    id="strengths"
                    placeholder="What are the project's main strengths?"
                    value={evaluationData.strengths}
                    onChange={(e) => updateField("strengths", e.target.value)}
                    className="font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements" className="font-serif">
                    Areas for Improvement
                  </Label>
                  <Textarea
                    id="improvements"
                    placeholder="What could be improved?"
                    value={evaluationData.improvements}
                    onChange={(e) => updateField("improvements", e.target.value)}
                    className="font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overallFeedback" className="font-serif">
                    Overall Comments *
                  </Label>
                  <Textarea
                    id="overallFeedback"
                    placeholder="Provide your overall assessment and feedback..."
                    value={evaluationData.overallFeedback}
                    onChange={(e) => updateField("overallFeedback", e.target.value)}
                    className="min-h-[100px] font-serif"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={() => handleSubmit(true)} variant="outline" disabled={isLoading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isLoading && isDraft ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isLoading || !isEvaluationComplete()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading && !isDraft ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

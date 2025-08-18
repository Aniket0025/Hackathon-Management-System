"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, Star, Clock, Eye, FileText, TrendingUp, Award, Zap, Activity, Timer } from "lucide-react"
import Link from "next/link"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

const mockJudgeData = {
  id: 1,
  name: "Dr. Sarah Wilson",
  email: "sarah.wilson@university.edu",
  avatar: "/abstract-geometric-shapes.png",
  expertise: ["Machine Learning", "AI Ethics", "Data Science"],
  rating: 4.9,
  totalReviews: 156,
  yearsExperience: 8,
  assignedEvents: [
    {
      id: 1,
      name: "AI Innovation Challenge 2024",
      role: "Lead Judge",
      totalSubmissions: 45,
      evaluatedSubmissions: 32,
      pendingSubmissions: 13,
      deadline: "2024-03-16T23:59:00",
      currentRound: "final",
      averageScore: 7.8,
      topCategory: "Machine Learning",
    },
    {
      id: 2,
      name: "Sustainable Tech Hackathon",
      role: "Technical Judge",
      totalSubmissions: 28,
      evaluatedSubmissions: 28,
      pendingSubmissions: 0,
      deadline: "2024-02-23T23:59:00",
      currentRound: "completed",
      averageScore: 8.2,
      topCategory: "Green Tech",
    },
  ],
}

const mockSubmissions = [
  {
    id: 1,
    eventId: 1,
    projectName: "EcoAI Assistant",
    teamName: "AI Pioneers",
    teamAvatar: "/ai-team.png",
    track: "Machine Learning",
    submittedAt: "2024-03-14T15:30:00",
    status: "pending",
    priority: "high",
    estimatedTime: "45 min",
    technologies: ["React", "Python", "TensorFlow"],
    complexity: "Advanced",
    teamSize: 4,
  },
  {
    id: 2,
    eventId: 1,
    projectName: "Smart City Analytics",
    teamName: "Urban Innovators",
    teamAvatar: "/web-team-collaboration.png",
    track: "Computer Vision",
    submittedAt: "2024-03-14T12:15:00",
    status: "evaluated",
    priority: "medium",
    estimatedTime: "30 min",
    technologies: ["Python", "OpenCV", "FastAPI"],
    score: 8.5,
    complexity: "Intermediate",
    teamSize: 3,
  },
  {
    id: 3,
    eventId: 1,
    projectName: "Healthcare AI Chatbot",
    teamName: "MedTech Solutions",
    teamAvatar: "/diverse-professional-team.png",
    track: "Natural Language Processing",
    submittedAt: "2024-03-13T18:45:00",
    status: "in-review",
    priority: "high",
    estimatedTime: "60 min",
    technologies: ["Node.js", "OpenAI", "React"],
    complexity: "Advanced",
    teamSize: 5,
  },
]

const mockRecentActivity = [
  { id: 1, type: "evaluation", message: "Completed evaluation for EcoAI Assistant", time: "15 min ago" },
  { id: 2, type: "submission", message: "New submission received: Smart City Analytics", time: "1 hour ago" },
  { id: 3, type: "deadline", message: "Reminder: 13 submissions pending review", time: "2 hours ago" },
  { id: 4, type: "achievement", message: "Reached 150+ total evaluations milestone", time: "1 day ago" },
]

export default function JudgeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "evaluated":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    if (activeTab === "overview") return true
    return submission.status === activeTab
  })

  const totalSubmissions = mockJudgeData.assignedEvents.reduce((sum, event) => sum + event.totalSubmissions, 0)
  const evaluatedSubmissions = mockJudgeData.assignedEvents.reduce((sum, event) => sum + event.evaluatedSubmissions, 0)
  const pendingSubmissions = mockJudgeData.assignedEvents.reduce((sum, event) => sum + event.pendingSubmissions, 0)

  return (
    <EnhancedDashboardLayout userRole="judge">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-cyan-100">
              <AvatarImage src={mockJudgeData.avatar || "/placeholder.svg"} alt={mockJudgeData.name} />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Welcome, {mockJudgeData.name.split(" ")[1]}!
              </h1>
              <p className="text-slate-600 mt-1">Review and evaluate hackathon submissions</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {mockJudgeData.rating} Rating
                </Badge>
                <Badge variant="outline">{mockJudgeData.totalReviews} Reviews</Badge>
                <Badge variant="outline">{mockJudgeData.yearsExperience}+ Years</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/judge/profile">
                <Award className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalSubmissions}</div>
              <p className="text-xs text-slate-600">Across all events</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{evaluatedSubmissions}</div>
              <p className="text-xs text-slate-600">Completed reviews</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingSubmissions}</div>
              <p className="text-xs text-slate-600">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockJudgeData.assignedEvents.filter((e) => e.currentRound !== "completed").length}
              </div>
              <p className="text-xs text-slate-600">Currently judging</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Assigned Events</CardTitle>
                <CardDescription>Events you're judging and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJudgeData.assignedEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-lg">{event.name}</h4>
                            <Badge variant="outline">{event.role}</Badge>
                            <Badge
                              variant={event.currentRound === "completed" ? "secondary" : "default"}
                              className="capitalize"
                            >
                              {event.currentRound}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-slate-400" />
                              <div>
                                <div className="font-semibold">
                                  {event.evaluatedSubmissions}/{event.totalSubmissions}
                                </div>
                                <div className="text-slate-500">Progress</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-slate-400" />
                              <div>
                                <div className="font-semibold">{event.averageScore}/10</div>
                                <div className="text-slate-500">Avg Score</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-slate-400" />
                              <div>
                                <div className="font-semibold">{event.topCategory}</div>
                                <div className="text-slate-500">Top Track</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-slate-400" />
                              <div>
                                <div className="font-semibold">
                                  {event.currentRound !== "completed"
                                    ? new Date(event.deadline).toLocaleDateString()
                                    : "Complete"}
                                </div>
                                <div className="text-slate-500">Deadline</div>
                              </div>
                            </div>
                          </div>

                          {event.currentRound !== "completed" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Evaluation Progress</span>
                                <span className="font-medium">
                                  {Math.round((event.evaluatedSubmissions / event.totalSubmissions) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={(event.evaluatedSubmissions / event.totalSubmissions) * 100}
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/judge/events/${event.id}/analytics`}>
                              <Trophy className="w-4 h-4 mr-1" />
                              Results
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/judge/events/${event.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest judging activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-cyan-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{activity.message}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Judge Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Expertise Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {mockJudgeData.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Judge Rating</span>
                      <span className="font-medium">{mockJudgeData.rating}/5.0</span>
                    </div>
                    <Progress value={mockJudgeData.rating * 20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-white shadow-sm border">
              <TabsTrigger value="overview">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {pendingSubmissions > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {pendingSubmissions}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="in-review">In Review</TabsTrigger>
              <TabsTrigger value="evaluated">Evaluated</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Submissions to Review</CardTitle>
                <CardDescription>
                  {activeTab === "overview" ? "All submissions" : `${activeTab} submissions`} requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-lg">{submission.projectName}</h4>
                            <Badge className={getStatusColor(submission.status)} variant="outline">
                              {submission.status}
                            </Badge>
                            <Badge className={getPriorityColor(submission.priority)} variant="outline">
                              {submission.priority}
                            </Badge>
                            <Badge variant="secondary">{submission.track}</Badge>
                          </div>

                          <div className="flex items-center gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={submission.teamAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{submission.teamName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium">{submission.teamName}</div>
                                <div className="text-slate-500">{submission.teamSize} members</div>
                              </div>
                              <div>
                                <div className="font-medium">{submission.complexity}</div>
                                <div className="text-slate-500">Complexity</div>
                              </div>
                              <div>
                                <div className="font-medium">{submission.estimatedTime}</div>
                                <div className="text-slate-500">Est. time</div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {new Date(submission.submittedAt).toLocaleDateString()}
                                </div>
                                <div className="text-slate-500">Submitted</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {submission.technologies.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {submission.technologies.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{submission.technologies.length - 3} more
                              </Badge>
                            )}
                          </div>

                          {submission.score && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="text-sm font-medium">{submission.score}/10</span>
                              <span className="text-xs text-slate-500">Your Score</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/judge/submissions/${submission.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          {submission.status === "pending" && (
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/judge/submissions/${submission.id}/evaluate`}>
                                <Star className="w-4 h-4 mr-1" />
                                Evaluate
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

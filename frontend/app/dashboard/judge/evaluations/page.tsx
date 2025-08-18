"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Search, Filter, Star, FileText, Trophy, Eye } from "lucide-react"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

export default function JudgeEvaluationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const evaluations = [
    {
      id: 1,
      projectName: "EcoTrack - Carbon Footprint Monitor",
      teamName: "GreenTech Innovators",
      event: "Sustainable Tech Hackathon",
      category: "Sustainability",
      submittedAt: "2024-03-15T10:30:00",
      status: "pending",
      priority: "high",
      deadline: "2024-03-18T23:59:00",
      criteria: {
        innovation: 0,
        technical: 0,
        impact: 0,
        presentation: 0,
      },
      totalScore: 0,
      maxScore: 100,
    },
    {
      id: 2,
      projectName: "AI-Powered Learning Assistant",
      teamName: "EduTech Pioneers",
      event: "AI Innovation Challenge 2024",
      category: "Education",
      submittedAt: "2024-03-14T15:45:00",
      status: "in-progress",
      priority: "medium",
      deadline: "2024-03-17T23:59:00",
      criteria: {
        innovation: 22,
        technical: 18,
        impact: 20,
        presentation: 0,
      },
      totalScore: 60,
      maxScore: 100,
    },
    {
      id: 3,
      projectName: "FinSecure - Blockchain Banking",
      teamName: "CryptoSafe",
      event: "FinTech Revolution",
      category: "FinTech",
      submittedAt: "2024-03-13T09:15:00",
      status: "completed",
      priority: "low",
      deadline: "2024-03-16T23:59:00",
      criteria: {
        innovation: 24,
        technical: 23,
        impact: 21,
        presentation: 22,
      },
      totalScore: 90,
      maxScore: 100,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.event.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <EnhancedDashboardLayout userRole="judge">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Project Evaluations
            </h1>
            <p className="text-slate-600 mt-1">Review and score hackathon project submissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              Evaluation Guidelines
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold">28</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Score</p>
                  <p className="text-2xl font-bold">8.2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search projects, teams, or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Evaluations Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6">
              {filteredEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl">{evaluation.projectName}</CardTitle>
                          <Badge className={getStatusColor(evaluation.status)}>{evaluation.status}</Badge>
                          <Badge className={getPriorityColor(evaluation.priority)}>
                            {evaluation.priority} priority
                          </Badge>
                        </div>
                        <CardDescription>
                          Team: {evaluation.teamName} • {evaluation.event}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Submitted: {new Date(evaluation.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {new Date(evaluation.deadline).toLocaleDateString()}
                          </div>
                          <Badge variant="outline">{evaluation.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                          {evaluation.totalScore}/{evaluation.maxScore}
                        </div>
                        <div className="text-sm text-slate-600">Current Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Evaluation Progress</span>
                          <span>{Math.round((evaluation.totalScore / evaluation.maxScore) * 100)}%</span>
                        </div>
                        <Progress value={(evaluation.totalScore / evaluation.maxScore) * 100} className="h-2" />
                      </div>

                      {/* Criteria Scores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(evaluation.criteria).map(([criterion, score]) => (
                          <div key={criterion} className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-lg font-semibold">{score}/25</div>
                            <div className="text-sm text-slate-600 capitalize">{criterion}</div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          View Project
                        </Button>
                        {evaluation.status !== "completed" && (
                          <Button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600">
                            {evaluation.status === "pending" ? "Start Evaluation" : "Continue Evaluation"}
                          </Button>
                        )}
                        {evaluation.status === "completed" && (
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <FileText className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tab contents would filter the evaluations array */}
          <TabsContent value="pending">
            <div className="grid gap-6">
              {filteredEvaluations
                .filter((e) => e.status === "pending")
                .map((evaluation) => (
                  <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
                    {/* Same card structure as above */}
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

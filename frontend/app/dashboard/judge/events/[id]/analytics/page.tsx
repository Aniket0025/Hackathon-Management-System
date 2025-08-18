"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ArrowLeft, Trophy, Star, Users, TrendingUp, Download } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock analytics data
const mockEventData = {
  id: 1,
  name: "AI Innovation Challenge 2024",
  totalSubmissions: 45,
  evaluatedSubmissions: 45,
  averageScore: 7.2,
  topScore: 9.5,
  tracks: ["Machine Learning", "Computer Vision", "Natural Language Processing", "Robotics"],
}

const mockScoreDistribution = [
  { range: "0-2", count: 2 },
  { range: "2-4", count: 5 },
  { range: "4-6", count: 12 },
  { range: "6-8", count: 18 },
  { range: "8-10", count: 8 },
]

const mockTrackPerformance = [
  { track: "Machine Learning", avgScore: 7.8, submissions: 15 },
  { track: "Computer Vision", avgScore: 7.2, submissions: 12 },
  { track: "NLP", avgScore: 6.9, submissions: 10 },
  { track: "Robotics", avgScore: 7.0, submissions: 8 },
]

const mockTopSubmissions = [
  {
    id: 1,
    projectName: "EcoAI Assistant",
    teamName: "AI Pioneers",
    score: 9.5,
    track: "Machine Learning",
    rank: 1,
  },
  {
    id: 2,
    projectName: "Smart City Analytics",
    teamName: "Urban Innovators",
    score: 9.2,
    track: "Computer Vision",
    rank: 2,
  },
  {
    id: 3,
    projectName: "Healthcare AI Chatbot",
    teamName: "MedTech Solutions",
    score: 8.9,
    track: "Natural Language Processing",
    rank: 3,
  },
  {
    id: 4,
    projectName: "Autonomous Delivery Bot",
    teamName: "RoboTech",
    score: 8.7,
    track: "Robotics",
    rank: 4,
  },
  {
    id: 5,
    projectName: "Climate Prediction Model",
    teamName: "Green AI",
    score: 8.5,
    track: "Machine Learning",
    rank: 5,
  },
]

const mockCriteriaAnalysis = [
  { criteria: "Innovation", avgScore: 7.5, maxScore: 10 },
  { criteria: "Technical", avgScore: 7.2, maxScore: 10 },
  { criteria: "Impact", avgScore: 7.0, maxScore: 10 },
  { criteria: "Presentation", avgScore: 6.8, maxScore: 10 },
  { criteria: "Completeness", avgScore: 7.3, maxScore: 10 },
]

const COLORS = ["#0891b2", "#f59e0b", "#dc2626", "#059669", "#7c3aed"]

export default function EventAnalyticsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  const exportResults = () => {
    console.log("[v0] Exporting results for event:", params.id)
    // TODO: Implement actual export functionality
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/judge">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Event Analytics</h1>
              <p className="text-muted-foreground font-serif">{mockEventData.name}</p>
            </div>
          </div>
          <Button onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{mockEventData.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground font-serif">All evaluated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Average Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{mockEventData.averageScore}/10</div>
              <p className="text-xs text-muted-foreground font-serif">Across all submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Top Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{mockEventData.topScore}/10</div>
              <p className="text-xs text-muted-foreground font-serif">Highest submission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">100%</div>
              <p className="text-xs text-muted-foreground font-serif">All submissions evaluated</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="criteria">Criteria</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Score Distribution</CardTitle>
                  <CardDescription className="font-serif">Distribution of submission scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockScoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0891b2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Track Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Track Performance</CardTitle>
                  <CardDescription className="font-serif">Average scores by track</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockTrackPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis dataKey="track" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Track Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Track Summary</CardTitle>
                <CardDescription className="font-serif">Detailed breakdown by track</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockTrackPerformance.map((track) => (
                    <div key={track.track} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium font-sans">{track.track}</h4>
                        <p className="text-sm text-muted-foreground font-serif">{track.submissions} submissions</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-sans">{track.avgScore}/10</div>
                        <p className="text-sm text-muted-foreground font-serif">Average score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Top Submissions</CardTitle>
                <CardDescription className="font-serif">Highest scoring projects in the competition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold font-sans">
                          {submission.rank}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium font-sans">{submission.projectName}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground font-serif">by {submission.teamName}</p>
                            <Badge variant="secondary">{submission.track}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-current" />
                        <span className="text-lg font-bold font-sans">{submission.score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submissions by Track */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Submissions by Track</CardTitle>
                  <CardDescription className="font-serif">Distribution of submissions across tracks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockTrackPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ track, submissions }) => `${track}: ${submissions}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="submissions"
                      >
                        {mockTrackPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Score Trends</CardTitle>
                  <CardDescription className="font-serif">Average scores across evaluation criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockCriteriaAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="criteria" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgScore" stroke="#0891b2" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Criteria Analysis</CardTitle>
                <CardDescription className="font-serif">Performance breakdown by evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCriteriaAnalysis.map((criteria) => (
                    <div key={criteria.criteria} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium font-sans">{criteria.criteria}</h4>
                        <span className="text-sm font-bold font-sans">
                          {criteria.avgScore}/{criteria.maxScore}
                        </span>
                      </div>
                      <Progress value={(criteria.avgScore / criteria.maxScore) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground font-serif">
                        Average score: {criteria.avgScore} out of {criteria.maxScore}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

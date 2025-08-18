"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Calendar,
  Users,
  Trophy,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Timer,
  Award,
  Eye,
} from "lucide-react"
import Link from "next/link"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

const mockEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    status: "active",
    participants: 156,
    submissions: 42,
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    type: "online",
    progress: 65,
    daysLeft: 2,
    prize: "$25,000",
    registrationRate: 85,
    engagementScore: 92,
    topTracks: ["Machine Learning", "Computer Vision", "NLP"],
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    status: "upcoming",
    participants: 89,
    submissions: 0,
    startDate: "2024-04-20",
    endDate: "2024-04-22",
    type: "hybrid",
    progress: 25,
    daysLeft: 35,
    prize: "$15,000",
    registrationRate: 45,
    engagementScore: 78,
    topTracks: ["Green Tech", "IoT", "Sustainability"],
  },
  {
    id: 3,
    name: "FinTech Innovation Sprint",
    status: "completed",
    participants: 234,
    submissions: 67,
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    type: "offline",
    progress: 100,
    daysLeft: 0,
    prize: "$30,000",
    registrationRate: 95,
    engagementScore: 88,
    topTracks: ["Blockchain", "DeFi", "Payment Systems"],
  },
]

const mockRecentActivity = [
  { id: 1, type: "submission", message: "New project submitted to AI Innovation Challenge", time: "5 min ago" },
  { id: 2, type: "registration", message: "15 new participants registered for Sustainable Tech", time: "12 min ago" },
  { id: 3, type: "evaluation", message: "Judge completed evaluation for FinTech project", time: "25 min ago" },
  { id: 4, type: "team", message: "New team formed in AI Innovation Challenge", time: "1 hour ago" },
]

export default function DashboardPage() {
  const [events] = useState(mockEvents)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const totalParticipants = events.reduce((sum, event) => sum + event.participants, 0)
  const totalSubmissions = events.reduce((sum, event) => sum + event.submissions, 0)

  // Deterministic formatting helpers to avoid SSR/CSR locale differences
  const fmtNumber = (n: number) => n.toLocaleString("en-US")
  // startDate/endDate are ISO-like (YYYY-MM-DD). Format without timezone.
  const fmtIsoDate = (iso: string) => {
    const [y, m, d] = iso.split("-")
    // Change to desired order; using en-US style MM/DD/YYYY
    return `${m}/${d}/${y}`
  }
  const activeEvents = events.filter((e) => e.status === "active").length

  return (
    <EnhancedDashboardLayout userRole="organizer">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Event Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Manage your hackathons and innovation events with advanced analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              asChild
            >
              <Link href="/dashboard/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <p className="text-xs text-slate-600">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeEvents}</div>
              <p className="text-xs text-slate-600">Currently running</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{fmtNumber(totalParticipants)}</div>
              <p className="text-xs text-slate-600">Across all events</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <BarChart3 className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{totalSubmissions}</div>
              <p className="text-xs text-slate-600">Projects submitted</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Your Events</h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live Updates</span>
              </div>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="glass-card hover:shadow-2xl transition-all duration-200">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <Badge className={getStatusColor(event.status)} variant="outline">
                            {event.status}
                          </Badge>
                          <Badge variant="secondary">{event.type}</Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {event.prize}
                          </Badge>
                        </div>
                        <CardDescription>
                          {fmtIsoDate(event.startDate)} - {fmtIsoDate(event.endDate)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/events/${event.id}`}>
                            <Settings className="w-4 h-4 mr-1" />
                            Manage
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/events/${event.id}/analytics`}>
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-semibold">{event.participants}</div>
                          <div className="text-slate-500">Participants</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-semibold">{event.submissions}</div>
                          <div className="text-slate-500">Submissions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-semibold">{event.engagementScore}%</div>
                          <div className="text-slate-500">Engagement</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-semibold">{event.daysLeft}</div>
                          <div className="text-slate-500">Days Left</div>
                        </div>
                      </div>
                    </div>

                    {event.status === "active" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Event Progress</span>
                          <span className="font-medium">{event.progress}%</span>
                        </div>
                        <Progress value={event.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {event.topTracks.map((track) => (
                        <Badge key={track} variant="outline" className="text-xs">
                          {track}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-600" />
                  Live Activity
                </CardTitle>
                <CardDescription>Real-time updates from your events</CardDescription>
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

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/events/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Event
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/participants">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Participants
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/communications">
                    <Award className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/analytics">
                    <Eye className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnhancedDashboardLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, Star, Clock, Eye, FileText, TrendingUp, Award, Zap, Activity, Timer } from "lucide-react"
import Link from "next/link"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

export default function JudgeDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [assignedEvents, setAssignedEvents] = useState<Array<{ id: string | number; name: string; role?: string; totalSubmissions?: number; evaluatedSubmissions?: number; pendingSubmissions?: number; deadline?: string; currentRound?: string; averageScore?: number; topCategory?: string }>>([])
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null)
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  useEffect(() => {
    // Load profile (auth user)
    const loadMe = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) return
        const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json().catch(() => ({}))
        const u = data?.user || data
        setUser({ name: u?.name, email: u?.email, avatar: (u as any)?.avatar })
      } catch {}
    }
    const loadAssigned = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) return
        const res = await fetch(`${base}/api/judges/my-events`, { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) return
        const events = Array.isArray(json?.events) ? json.events : []
        // Map to UI shape with safe defaults
        const mapped = events.map((e: any) => ({
          id: e?._id || e?.id,
          name: e?.title || e?.name || "Event",
          role: "Judge",
          totalSubmissions: e?.totalSubmissions ?? 0,
          evaluatedSubmissions: e?.evaluatedSubmissions ?? 0,
          pendingSubmissions: e?.pendingSubmissions ?? Math.max(0, (e?.totalSubmissions ?? 0) - (e?.evaluatedSubmissions ?? 0)),
          deadline: e?.endDate,
          currentRound: e?.status || "ongoing",
          averageScore: e?.averageScore ?? 0,
          topCategory: e?.topCategory || "",
        }))
        setAssignedEvents(mapped)
      } catch {}
    }
    loadMe()
    loadAssigned()
  }, [])

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

  // Until real submissions API exists for judge, show empty list (no mock)
  const filteredSubmissions: any[] = []

  const eventsForUI = assignedEvents
  const totalSubmissions = eventsForUI.reduce((sum, event) => sum + (event.totalSubmissions || 0), 0)
  const evaluatedSubmissions = eventsForUI.reduce((sum, event) => sum + (event.evaluatedSubmissions || 0), 0)
  const pendingSubmissions = eventsForUI.reduce((sum, event) => sum + (event.pendingSubmissions || 0), 0)

  return (
    <EnhancedDashboardLayout userRole="judge">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-cyan-100">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "Judge"} />
              <AvatarFallback>{(user?.name || "J").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Welcome{user?.name ? `, ${user.name.split(" ")[0]}!` : "!"}
              </h1>
              <p className="text-slate-600 mt-1">Review and evaluate hackathon submissions</p>
              {user?.email && (
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">{user.email}</Badge>
                </div>
              )}
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
              <div className="text-2xl font-bold text-purple-600">{eventsForUI.filter((e) => e.currentRound !== "completed").length}</div>
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
                  {eventsForUI.length === 0 ? (
                    <div className="text-sm text-slate-500">No assigned events yet.</div>
                  ) : eventsForUI.map((event) => (
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
                                    ? (event.deadline ? new Date(event.deadline).toLocaleDateString() : "-")
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
                                {(() => {
                                  const total = event.totalSubmissions ?? 0
                                  const evaluated = event.evaluatedSubmissions ?? 0
                                  const pct = total > 0 ? Math.round((evaluated / total) * 100) : 0
                                  return <span className="font-medium">{pct}%</span>
                                })()}
                              </div>
                              {(() => {
                                const total = event.totalSubmissions ?? 0
                                const evaluated = event.evaluatedSubmissions ?? 0
                                const value = total > 0 ? (evaluated / total) * 100 : 0
                                return <Progress value={value} className="h-2" />
                              })()}
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
                  <div className="text-sm text-slate-500">No recent activity to show.</div>
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
                  <div className="text-sm text-slate-500">Profile details will appear here.</div>
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
                  <div className="text-sm text-slate-500">No submissions to display.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

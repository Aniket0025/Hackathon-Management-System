"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"
import AdvancedAnalyticsDashboard from "@/components/advanced-analytics-dashboard"
import { InteractiveStatsDashboard } from "@/components/interactive-stats-dashboard"
import { RealTimeActivityFeed } from "@/components/real-time-activity-feed"
import AITeamMatching from "@/components/ai-team-matching"
import { BarChart3, TrendingUp, Users, Trophy, Calendar, Download, Share, Filter } from "lucide-react"

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <EnhancedDashboardLayout userRole="organizer">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Comprehensive insights and AI-powered analytics for your events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 glass-card rounded-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="real-time">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveStatsDashboard />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    Event Performance
                  </CardTitle>
                  <CardDescription>Detailed metrics for each event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "AI Innovation Challenge", participants: 156, submissions: 42, engagement: 94 },
                      { name: "Sustainable Tech Hackathon", participants: 89, submissions: 0, engagement: 78 },
                      { name: "FinTech Innovation Sprint", participants: 234, submissions: 67, engagement: 88 },
                    ].map((event, index) => (
                      <div key={index} className="p-4 rounded-lg glass-panel">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{event.name}</h4>
                          <span className="text-sm text-slate-600">{event.engagement}% engagement</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span>{event.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-green-500" />
                            <span>{event.submissions} submissions</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Participant Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">+23% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    Active Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">892</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Currently engaged</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Retention Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Above industry avg</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Participant Demographics</CardTitle>
                <CardDescription>Breakdown of participant characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Experience Level</h4>
                    {[
                      { level: "Senior", count: 234, percentage: 45 },
                      { level: "Mid-level", count: 189, percentage: 36 },
                      { level: "Junior", count: 98, percentage: 19 },
                    ].map((item) => (
                      <div key={item.level} className="flex items-center justify-between">
                        <span className="text-sm">{item.level}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Top Skills</h4>
                    {[
                      { skill: "JavaScript", count: 312 },
                      { skill: "Python", count: 289 },
                      { skill: "React", count: 267 },
                      { skill: "Node.js", count: 234 },
                    ].map((item) => (
                      <div key={item.skill} className="flex items-center justify-between">
                        <span className="text-sm">{item.skill}</span>
                        <span className="text-sm text-slate-600">{item.count} participants</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <AITeamMatching />
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealTimeActivityFeed />
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Live Metrics
                  </CardTitle>
                  <CardDescription>Real-time platform statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg glass-panel">
                        <div className="text-2xl font-bold text-blue-600">47</div>
                        <div className="text-sm text-blue-600">Online Now</div>
                      </div>
                      <div className="text-center p-4 rounded-lg glass-panel">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-sm text-green-600">Active Sessions</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Server Response Time</span>
                        <span className="text-green-600">142ms</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Database Queries/sec</span>
                        <span className="text-blue-600">23.4</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Active Connections</span>
                        <span className="text-purple-600">156</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

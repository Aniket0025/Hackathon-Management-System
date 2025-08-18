"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Trophy, Brain, Target, Award, BarChart3, PieChart, Activity, Globe } from "lucide-react"

export default function AdvancedAnalyticsDashboard() {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 1247,
    submissions: 89,
    engagement: 94.2,
    satisfaction: 4.8,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        submissions: prev.submissions + Math.floor(Math.random() * 3),
        engagement: Math.min(100, Math.max(80, prev.engagement + (Math.random() - 0.5) * 2)),
        satisfaction: Math.min(5, Math.max(4, prev.satisfaction + (Math.random() - 0.5) * 0.1)),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const aiInsights = [
    {
      icon: Brain,
      title: "Optimal Team Size Detected",
      description: "AI recommends 4-person teams for 23% higher success rate",
      confidence: 94,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Peak Engagement Hours",
      description: "Participants most active between 2-4 PM and 8-10 PM",
      confidence: 87,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Award,
      title: "Success Pattern Identified",
      description: "Projects with early prototypes have 67% higher win rate",
      confidence: 91,
      gradient: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge variant="secondary" className="hidden sm:inline-flex bg-blue-100 text-blue-700">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-900">{realTimeData.activeUsers.toLocaleString()}</div>
            <p className="text-blue-600 text-sm">Active Participants</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 text-sm">+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Trophy className="w-8 h-8 text-purple-600" />
              <Badge variant="secondary" className="hidden sm:inline-flex bg-purple-100 text-purple-700">
                Updated
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-900">{realTimeData.submissions}</div>
            <p className="text-purple-600 text-sm">Project Submissions</p>
            <div className="flex items-center mt-2">
              <Activity className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 text-sm">+5 in last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <Badge variant="secondary" className="hidden sm:inline-flex bg-green-100 text-green-700">
                Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-900">{realTimeData.engagement.toFixed(1)}%</div>
            <p className="text-green-600 text-sm">Engagement Rate</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 text-sm">Above average</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Award className="w-8 h-8 text-amber-600" />
              <Badge variant="secondary" className="hidden sm:inline-flex bg-amber-100 text-amber-700">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-amber-900">{realTimeData.satisfaction.toFixed(1)}/5</div>
            <p className="text-amber-600 text-sm">Satisfaction Score</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 text-sm">Excellent rating</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Insights */}
      <Card className="bg-gradient-to-br from-slate-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
              <CardDescription>Machine learning analysis of your event performance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {aiInsights.map((insight, index) => (
              <Card key={index} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${insight.gradient} rounded-lg flex items-center justify-center`}
                    >
                      <insight.icon className="w-4 h-4 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-slate-900 mb-2">{insight.title}</h4>
                  <p className="text-sm text-slate-600">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Visualization Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-600" />
              Participation Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-12 h-12 text-cyan-600 mx-auto mb-2" />
                <p className="text-slate-600">Interactive charts would render here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Real-Time Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Team 'AI Innovators' submitted their project",
                "New participant joined 'Blockchain Track'",
                "Judge completed evaluation for Project #47",
                "Mentor session started in Room 3",
                "Team 'Code Warriors' updated their submission",
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-700">{activity}</span>
                  <span className="text-xs text-slate-500 ml-auto">Just now</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

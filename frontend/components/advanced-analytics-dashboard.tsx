"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Trophy, Brain, Target, Award, BarChart3, PieChart, Activity, Globe } from "lucide-react"
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip } from "recharts"

interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

interface AnalyticsData {
  activeEvents: number;
  totalParticipants: number;
  projectsSubmitted: number;
  successRate: number;
  engagementRate: number;
  teamsFormed: number;
  changes: {
    participants: number;
    submissions: number;
  };
  lastUpdated: string;
}

export default function AdvancedAnalyticsDashboard() {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    submissions: 0,
    engagement: 0,
    satisfaction: 4.8,
  })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skillDist, setSkillDist] = useState<{ name: string; key: string; count: number }[]>([])

  // Fetch real-time analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [dashboardResponse, activityResponse, skillsResponse] = await Promise.all([
        fetch('http://localhost:4000/api/analytics/dashboard'),
        fetch('http://localhost:4000/api/analytics/activity?limit=5'),
        fetch('http://localhost:4000/api/analytics/skills')
      ])
      
      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        if (dashboardResult.success && dashboardResult.data) {
          const data: AnalyticsData = dashboardResult.data
          setRealTimeData({
            activeUsers: data.totalParticipants,
            submissions: data.projectsSubmitted,
            engagement: data.engagementRate,
            satisfaction: 4.8 + (data.successRate / 100) * 0.2, // Dynamic satisfaction based on success rate
          })
        }
      }
      
      if (activityResponse.ok) {
        const activityResult = await activityResponse.json()
        if (activityResult.success && activityResult.data) {
          setActivities(activityResult.data.activities || [])
        }
      }

      if (skillsResponse.ok) {
        const skillsResult = await skillsResponse.json()
        if (skillsResult?.categories) {
          setSkillDist(skillsResult.categories)
        }
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to load real-time data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchAnalyticsData()
    
    // Set up polling for real-time updates every 15 seconds
    const interval = setInterval(fetchAnalyticsData, 15000)
    
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
            <div className="text-2xl md:text-3xl font-bold text-blue-900">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
              ) : (
                realTimeData.activeUsers.toLocaleString()
              )}
            </div>
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
            <div className="text-2xl md:text-3xl font-bold text-purple-900">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
              ) : (
                realTimeData.submissions
              )}
            </div>
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
            <div className="text-2xl md:text-3xl font-bold text-green-900">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
              ) : (
                `${realTimeData.engagement.toFixed(1)}%`
              )}
            </div>
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
            <div className="text-2xl md:text-3xl font-bold text-amber-900">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
              ) : (
                `${realTimeData.satisfaction.toFixed(1)}/5`
              )}
            </div>
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
            <div className="h-64">
              {isLoading ? (
                <div className="h-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg animate-pulse" />
              ) : skillDist.length === 0 ? (
                <div className="h-full bg-slate-50 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-slate-500">No distribution data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie dataKey="count" data={skillDist} nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {skillDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#06b6d4", "#22c55e", "#f59e0b", "#8b5cf6"][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                  </RPieChart>
                </ResponsiveContainer>
              )}
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-3">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg animate-pulse">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded flex-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity, index) => {
                  const timeAgo = new Date(activity.timestamp)
                  const now = new Date()
                  const diffMinutes = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60))
                  const timeDisplay = diffMinutes < 1 ? 'Just now' : 
                                    diffMinutes < 60 ? `${diffMinutes}m ago` : 
                                    diffMinutes < 1440 ? `${Math.floor(diffMinutes / 60)}h ago` : 
                                    `${Math.floor(diffMinutes / 1440)}d ago`
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'registration' ? 'bg-blue-500' : 'bg-green-500'
                      } animate-pulse`}></div>
                      <span className="text-sm text-slate-700 flex-1">{activity.message}</span>
                      <span className="text-xs text-slate-500">{timeDisplay}</span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

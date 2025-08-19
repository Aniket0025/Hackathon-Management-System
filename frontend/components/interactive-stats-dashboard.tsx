"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Trophy, Code, Activity, BarChart3, PieChart, LineChart, Target } from "lucide-react"
import { ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface StatCard {
  title: string
  value: number
  change: number
  icon: React.ElementType
  color: string
  suffix?: string
  prefix?: string
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

export function InteractiveStatsDashboard({ eventId }: { eventId?: string }) {
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Active Events", value: 0, change: 0, icon: Activity, color: "from-blue-500 to-cyan-500" },
    { title: "Total Participants", value: 0, change: 0, icon: Users, color: "from-purple-500 to-pink-500" },
    { title: "Projects Submitted", value: 0, change: 0, icon: Code, color: "from-green-500 to-emerald-500" },
    { title: "Success Rate", value: 0, change: 0, icon: Trophy, color: "from-amber-500 to-orange-500", suffix: "%" },
  ])

  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "7d" | "30d">("24h")
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [trends, setTrends] = useState<{ label: string; count: number }[]>([])
  const [trendsLoading, setTrendsLoading] = useState(false)

  // Fetch real-time analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const dashUrl = new URL('http://localhost:4000/api/analytics/dashboard')
      if (eventId) dashUrl.searchParams.set('eventId', eventId)
      const response = await fetch(dashUrl.toString())
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        const data: AnalyticsData = result.data
        
        // Update stats with real data
        const newStats = [
          { 
            title: "Active Events", 
            value: data.activeEvents, 
            change: data.activeEvents > 0 ? 2.0 : 0, 
            icon: Activity, 
            color: "from-blue-500 to-cyan-500" 
          },
          { 
            title: "Total Participants", 
            value: data.totalParticipants, 
            change: data.changes.participants, 
            icon: Users, 
            color: "from-purple-500 to-pink-500" 
          },
          { 
            title: "Projects Submitted", 
            value: data.projectsSubmitted, 
            change: data.changes.submissions, 
            icon: Code, 
            color: "from-green-500 to-emerald-500" 
          },
          { 
            title: "Success Rate", 
            value: data.successRate, 
            change: data.successRate > 90 ? 1.2 : 0.5, 
            icon: Trophy, 
            color: "from-amber-500 to-orange-500", 
            suffix: "%" 
          },
        ]
        
        setStats(newStats)
        setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString())
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch participation trends for selected timeframe
  const fetchTrendsData = async (timeframe: "24h" | "7d" | "30d") => {
    try {
      setTrendsLoading(true)
      const url = new URL('http://localhost:4000/api/analytics/trends')
      url.searchParams.set('timeframe', timeframe)
      if (eventId) url.searchParams.set('eventId', eventId)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      if (json.success && json.data?.trends) {
        const mapped = (json.data.trends as Array<{ _id: number; count: number; date?: string }>)
          .map((t) => ({
            label: String(t._id),
            count: t.count || 0,
          }))
        setTrends(mapped)
      }
    } catch (e) {
      console.error('Error fetching trends data:', e)
    } finally {
      setTrendsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchAnalyticsData()
    fetchTrendsData(selectedTimeframe)
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchAnalyticsData()
      fetchTrendsData(selectedTimeframe)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Refetch trends when timeframe changes
  useEffect(() => {
    fetchTrendsData(selectedTimeframe)
  }, [selectedTimeframe, eventId])

  // Animate stats when they change
  useEffect(() => {
    if (!isLoading) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [stats, isLoading])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Platform Analytics</h3>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <Badge
                  variant={stat.change >= 0 ? "default" : "destructive"}
                  className={`text-xs ${stat.change >= 0 ? "bg-green-100 text-green-700" : ""}`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change >= 0 ? "+" : ""}
                  {typeof stat.change === 'number' ? stat.change.toFixed(1) : '0.0'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {stat.prefix}
                  {isLoading ? (
                    <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
                  ) : (
                    formatNumber(stat.value)
                  )}
                  {stat.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1500 ease-out`}
                  style={{ width: isLoading || isAnimating ? "0%" : "100%" }}
                />
              </div>
            </CardContent>

            {/* Hover Effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />
          </Card>
        ))}
      </div>

      {/* Interactive Chart Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Engagement Trends</h4>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTimeframe === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('24h')}
            >
              24h
            </Button>
            <Button
              variant={selectedTimeframe === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('7d')}
            >
              7d
            </Button>
            <Button
              variant={selectedTimeframe === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('30d')}
            >
              30d
            </Button>
          </div>
        </div>

        {/* Real-time Chart Area */}
        <div className="h-64">
          {trendsLoading ? (
            <div className="h-full bg-gradient-to-br from-slate-50 to-cyan-50 rounded-lg animate-pulse" />
          ) : trends.length === 0 ? (
            <div className="h-full bg-slate-50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-slate-500">No trend data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </RLineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
}

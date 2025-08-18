"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Trophy, Code, Activity, BarChart3, PieChart, LineChart, Target } from "lucide-react"

interface StatCard {
  title: string
  value: number
  change: number
  icon: React.ElementType
  color: string
  suffix?: string
  prefix?: string
}

export function InteractiveStatsDashboard() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Active Events", value: 0, change: 0, icon: Activity, color: "from-blue-500 to-cyan-500" },
    { title: "Total Participants", value: 0, change: 0, icon: Users, color: "from-purple-500 to-pink-500" },
    { title: "Projects Submitted", value: 0, change: 0, icon: Code, color: "from-green-500 to-emerald-500" },
    { title: "Success Rate", value: 0, change: 0, icon: Trophy, color: "from-amber-500 to-orange-500", suffix: "%" },
  ])

  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "7d" | "30d">("24h")
  const [isAnimating, setIsAnimating] = useState(false)

  const targetValues = {
    "24h": [12, 1247, 89, 94],
    "7d": [45, 8934, 567, 96],
    "30d": [156, 34567, 2134, 98],
  }

  const changes = {
    "24h": [+2, +156, +12, +1.2],
    "7d": [+8, +1234, +89, +2.1],
    "30d": [+23, +4567, +234, +1.8],
  }

  useEffect(() => {
    setIsAnimating(true)
    const targets = targetValues[selectedTimeframe]
    const changeValues = changes[selectedTimeframe]

    // Animate to new values
    const duration = 1500
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats((prevStats) =>
        prevStats.map((stat, index) => ({
          ...stat,
          value: Math.floor(targets[index] * progress),
          change: changeValues[index] * progress,
        })),
      )

      if (currentStep >= steps) {
        clearInterval(timer)
        setIsAnimating(false)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [selectedTimeframe])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Platform Analytics</h3>
        <div className="flex items-center gap-2">
          {(["24h", "7d", "30d"] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className={selectedTimeframe === timeframe ? "bg-gradient-to-r from-cyan-600 to-blue-600" : ""}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

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
                  {stat.change.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {stat.prefix}
                  {formatNumber(stat.value)}
                  {stat.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1500 ease-out`}
                  style={{ width: isAnimating ? "0%" : "100%" }}
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
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Bar Chart
            </Button>
            <Button variant="outline" size="sm">
              <LineChart className="w-4 h-4 mr-2" />
              Line Chart
            </Button>
            <Button variant="outline" size="sm">
              <PieChart className="w-4 h-4 mr-2" />
              Pie Chart
            </Button>
          </div>
        </div>

        {/* Simulated Chart Area */}
        <div className="h-64 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10" />
          <div className="text-center z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-semibold text-slate-700">Interactive Charts</p>
            <p className="text-sm text-slate-500">Real-time data visualization coming soon</p>
          </div>

          {/* Animated Elements */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center animate-bounce">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center animate-bounce delay-300">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Code, Zap, Clock, Star } from "lucide-react"

interface Activity {
  id: string
  type: "registration" | "submission" | "team_formed" | "judging" | "achievement"
  user: string
  action: string
  timestamp: Date
  event?: string
  icon: React.ElementType
  color: string
}

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLive, setIsLive] = useState(true)

  const generateActivity = (): Activity => {
    const types = ["registration", "submission", "team_formed", "judging", "achievement"] as const
    const users = ["Alex Chen", "Sarah Kim", "Marcus Johnson", "Elena Rodriguez", "David Park", "Maya Patel"]
    const events = ["AI Innovation Challenge", "Blockchain Hackathon", "Climate Tech Summit", "FinTech Revolution"]
    const actions = {
      registration: ["joined the hackathon", "registered for the event", "signed up"],
      submission: ["submitted their project", "uploaded final demo", "shared their solution"],
      team_formed: ["formed a new team", 'joined team "Innovators"', 'created team "Code Warriors"'],
      judging: ["received feedback", "scored 95/100", "advanced to finals"],
      achievement: ["won first place", 'earned "Best Innovation" award', "completed all challenges"],
    }

    const type = types[Math.floor(Math.random() * types.length)]
    const iconMap = {
      registration: Users,
      submission: Code,
      team_formed: Users,
      judging: Trophy,
      achievement: Star,
    }

    const colorMap = {
      registration: "from-blue-500 to-cyan-500",
      submission: "from-green-500 to-emerald-500",
      team_formed: "from-purple-500 to-pink-500",
      judging: "from-amber-500 to-orange-500",
      achievement: "from-rose-500 to-red-500",
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      user: users[Math.floor(Math.random() * users.length)],
      action: actions[type][Math.floor(Math.random() * actions[type].length)],
      timestamp: new Date(),
      event: events[Math.floor(Math.random() * events.length)],
      icon: iconMap[type],
      color: colorMap[type],
    }
  }

  useEffect(() => {
    // Initialize with some activities
    const initialActivities = Array.from({ length: 5 }, generateActivity)
    setActivities(initialActivities)

    // Add new activities every 3-8 seconds
    const interval = setInterval(
      () => {
        if (isLive) {
          const newActivity = generateActivity()
          setActivities((prev) => [newActivity, ...prev.slice(0, 9)]) // Keep only 10 most recent
        }
      },
      Math.random() * 5000 + 3000,
    )

    return () => clearInterval(interval)
  }, [isLive])

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Live Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
            <span className="text-sm text-muted-foreground">{isLive ? "Live" : "Paused"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
              index === 0 ? "bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200" : "hover:bg-slate-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center flex-shrink-0`}
            >
              <activity.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{activity.user}</span>
                <Badge variant="secondary" className="text-xs">
                  {activity.event}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{activity.action}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

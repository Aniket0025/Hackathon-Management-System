"use client"

import type React from "react"
import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Code, Zap, Clock, Star } from "lucide-react"
import { SocketContext } from "@/components/realtime/socket-provider"

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

export function RealTimeActivityFeed({ active = true }: { active?: boolean }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  const iconFor = (t?: string) => {
    const type = (t || "").toLowerCase()
    if (type.includes("submission")) return Code
    if (type.includes("team")) return Users
    if (type.includes("judge") || type.includes("score") || type.includes("award")) return Trophy
    if (type.includes("achiev") || type.includes("win")) return Star
    if (type.includes("regist")) return Users
    return Users
  }

  const colorFor = (t?: string) => {
    const type = (t || "").toLowerCase()
    if (type.includes("submission")) return "from-green-500 to-emerald-500"
    if (type.includes("team")) return "from-purple-500 to-pink-500"
    if (type.includes("judge") || type.includes("score") || type.includes("award")) return "from-amber-500 to-orange-500"
    if (type.includes("achiev") || type.includes("win")) return "from-rose-500 to-red-500"
    if (type.includes("regist")) return "from-blue-500 to-cyan-500"
    return "from-slate-400 to-slate-500"
  }

  // Maps backend payload flexibly to Activity interface
  const mapItem = (item: any, idx: number): Activity => {
    const id = item?._id || item?.id || `${item?.type || "activity"}-${item?.timestamp || Date.now()}-${idx}`
    const type: Activity["type"] =
      item?.type === "registration" || item?.type === "submission" || item?.type === "team_formed" || item?.type === "judging" || item?.type === "achievement"
        ? item.type
        : (String(item?.type || item?.category || "registration").toLowerCase().includes("team")
            ? "team_formed"
            : String(item?.type || "registration").toLowerCase().includes("subm")
            ? "submission"
            : String(item?.type || "registration").toLowerCase().includes("judge")
            ? "judging"
            : String(item?.type || "registration").toLowerCase().includes("achiev")
            ? "achievement"
            : "registration")
    const user = item?.user?.name || item?.userName || item?.username || item?.user || "User"
    const action = item?.action || item?.message || item?.description || "did something"
    const event = item?.event?.name || item?.eventName || item?.event || undefined
    const timestamp = new Date(item?.timestamp || item?.createdAt || Date.now())
    const icon = iconFor(type)
    const color = colorFor(type)
    return { id, type, user, action, timestamp, event, icon, color }
  }

  const fetchActivities = async () => {
    try {
      setError(null)
      const res = await fetch(`${base}/api/analytics/activity?limit=12`, { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json().catch(() => null)
      const list = (json?.data || json?.activities || json || []) as any[]
      const mapped = Array.isArray(list) ? list.map(mapItem) : []
      setActivities(mapped)
    } catch (e: any) {
      setError(e?.message || "Failed to load activity")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsLive(!!active)
  }, [active])

  useEffect(() => {
    let poll: NodeJS.Timeout | null = null
    fetchActivities()
    // Poll every 10s as a safe fallback
    poll = setInterval(() => {
      if (isLive) fetchActivities()
    }, 10000)
    return () => {
      if (poll) clearInterval(poll)
    }
  }, [isLive])

  // Socket subscriptions for push updates
  const { socket } = useContext(SocketContext)
  useEffect(() => {
    if (!socket) return
    const handler = (payload: any) => {
      if (!isLive) return
      const mapped = mapItem(payload, 0)
      setActivities((prev) => [mapped, ...prev].slice(0, 20))
    }
    // Try multiple event names commonly used in backend
    socket.on("activity:new", handler)
    socket.on("analytics:activity", handler)
    socket.on("activity", handler)
    return () => {
      socket.off("activity:new", handler)
      socket.off("analytics:activity", handler)
      socket.off("activity", handler)
    }
  }, [socket, isLive])

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
        {loading && (
          <div className="p-4 text-sm text-muted-foreground">Loading live activity…</div>
        )}
        {error && !loading && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && activities.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No recent activity yet.</div>
        )}
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

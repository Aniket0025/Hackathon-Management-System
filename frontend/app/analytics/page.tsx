"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Activity, RefreshCw, Download } from "lucide-react"
import { InteractiveStatsDashboard } from "@/components/interactive-stats-dashboard"
import AdvancedAnalytics from "@/components/advanced-analytics-dashboard"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, AreaChart, Area, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"

export default function AnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)
  const [roleError, setRoleError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Trigger refresh in child components
    window.dispatchEvent(new CustomEvent('refreshAnalytics'))
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date().toLocaleTimeString())
    }, 2000)
  }

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  // Determine user role (participant/judge/organizer/admin)
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { setRole(null); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const me = await meRes.json().catch(() => ({}))
        if (!meRes.ok) throw new Error(me?.message || "Failed to fetch user")
        setRole(me?.user?.role || null)
      } catch (e: any) {
        setRoleError(e?.message || "Unable to determine user role")
        setRole(null)
      } finally {
        setLoadingRole(false)
      }
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/analytics" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Real-time Analytics
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Live Data
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Comprehensive Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-3 max-w-3xl mx-auto text-lg">
            Monitor hackathon performance, participant engagement, and project submissions with real-time MongoDB data integration.
          </p>
          
          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            {lastUpdated && (
              <span className="text-sm text-slate-500">
                Last updated: {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Main Analytics Grid */
        }
        <div className="space-y-8">
          {/* Primary Stats Dashboard */}
          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <InteractiveStatsDashboard />
            </CardContent>
          </Card>

          {/* Role-Aware Analytics */}
          <RoleAwareAnalytics loadingRole={loadingRole} role={role} roleError={roleError} />

          {/* Secondary Analytics Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Advanced Analytics */}
            <Card className="lg:col-span-2 glass-card border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-6 h-6 text-purple-600" />
                  Advanced Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AdvancedAnalytics />
              </CardContent>
            </Card>

            {/* Quick Stats Sidebar */}
            <Card className="lg:col-span-1 glass-card border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900 mb-1">Real-time</div>
                    <div className="text-sm text-blue-600">Data Updates</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900 mb-1">Verified Data</div>
                    <div className="text-sm text-green-600">Event-Scoped Metrics</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900 mb-1">24/7</div>
                    <div className="text-sm text-purple-600">Monitoring</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// --------- Role-aware analytics section ---------

function RoleAwareAnalytics({ loadingRole, role, roleError }: { loadingRole: boolean; role: string | null; roleError: string | null }) {
  if (loadingRole) {
    return (
      <Card className="glass-card border-0 shadow-xl">
        <CardHeader className="pb-2"><CardTitle>Loading personalized analytics…</CardTitle></CardHeader>
        <CardContent>
          <div className="h-24 bg-slate-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }
  if (roleError) {
    return (
      <Card className="glass-card border-0 shadow-xl">
        <CardHeader className="pb-2"><CardTitle>Personalized Analytics</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">{roleError}</div>
        </CardContent>
      </Card>
    )
  }
  if (role === "participant") return <ParticipantAnalyticsView />
  if (role === "judge" || role === "organizer" || role === "admin") return <JudgeAnalyticsView />
  // Unauthenticated or other roles: show nothing extra
  return null
}

// Participant view: limited to their events, with real-time polling
function ParticipantAnalyticsView() {
  const [events, setEvents] = useState<Array<{ _id: string; title: string }>>([])
  const [selected, setSelected] = useState<string>("")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>("")
  const [includeAll, setIncludeAll] = useState(false) // false => only ongoing

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  const loadMyEvents = async () => {
    try {
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) { setEvents([]); setSelected(""); return }
      const res = await fetch(`${base}/api/analytics/my-events`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || "Failed to load your events")
      const list = Array.isArray(json?.data) ? json.data : (json?.events || [])
      const filtered = includeAll ? list : list.filter((ev: any) => isLiveEvent(ev))
      const simplified = filtered.map((ev: any) => ({ _id: ev?._id || ev?.eventId || ev?.event?._id, title: ev?.title || ev?.event?.title || "Event" })).filter((e: any) => e._id)
      setEvents(simplified)
      if (!selected && simplified.length) setSelected(simplified[0]._id)
    } catch (e: any) {
      setError(e?.message || "Unable to fetch your events")
    }
  }

  const loadEventAnalytics = async (eventId: string) => {
    if (!eventId) return
    try {
      setLoading(true)
      const res = await fetch(`${base}/api/analytics/events/${eventId}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || "Failed to load analytics")
      setData(json?.data || json)
      setUpdatedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e?.message || "Unable to load analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMyEvents() }, [includeAll])
  useEffect(() => {
    if (!selected) return
    loadEventAnalytics(selected)
    const id = setInterval(() => loadEventAnalytics(selected), 15000)
    return () => clearInterval(id)
  }, [selected])

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="w-5 h-5 text-cyan-600" />
          My Event Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder={events.length ? "Select one of your events" : (includeAll ? "No events" : "No ongoing events") } />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e._id} value={e._id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {updatedAt && (
            <div className="text-sm text-slate-500 self-center">Updated: {updatedAt}</div>
          )}
        </div>
        {events.length === 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded p-3">
            <span>{includeAll ? "No events available." : "No ongoing events right now."}</span>
            <Button size="sm" variant="outline" onClick={() => setIncludeAll((v) => !v)}>
              {includeAll ? "Show ongoing only" : "Show all events"}
            </Button>
          </div>
        )}

        {/* Event-scoped metrics & charts */}
        {loading ? (
          <div className="h-24 bg-slate-100 rounded animate-pulse" />
        ) : data ? (
          <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <MetricBox label="Registrations" value={safeNum(data.totalRegistrations ?? data.registrations)} />
              <MetricBox label="Submissions" value={safeNum(data.totalSubmissions ?? data.submissions)} />
              <MetricBox label="Conversion" value={safeNum(data.conversionRate ?? data.conversion)} suffix="%" />
              <MetricBox label="Active 24h" value={safeNum(data.activity24h ?? data.activeLast24h ?? data.recentActivityCount)} />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Submissions Over Time */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Submissions Over Time</CardTitle></CardHeader>
                <CardContent className="h-56">
                  {computeTimeSeries(data).length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={computeTimeSeries(data)}>
                        <defs>
                          <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSub)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full bg-slate-50 rounded flex items-center justify-center text-sm text-slate-500">No time-series</div>
                  )}
                </CardContent>
              </Card>

              {/* Submission Status */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Submission Status</CardTitle></CardHeader>
                <CardContent className="h-56">
                  {computeStatusPie(data).length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={computeStatusPie(data)} dataKey="value" nameKey="name" outerRadius={80}>
                          {computeStatusPie(data).map((_, i) => (
                            <Cell key={i} fill={["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"][i % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full bg-slate-50 rounded flex items-center justify-center text-sm text-slate-500">No status data</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Raw payload for debugging */}
            <details className="md:col-span-3">
              <summary className="cursor-pointer text-sm text-slate-600">Raw data</summary>
              <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-64">{JSON.stringify(data, null, 2)}</pre>
            </details>
          </div>
        ) : (
          <div className="text-sm text-slate-600">No analytics available.</div>
        )}
      </CardContent>
    </Card>
  )
}

// Judge/Organizer view: select event and see leaderboard
function JudgeAnalyticsView() {
  const [events, setEvents] = useState<Array<{ _id: string; title: string }>>([])
  const [selected, setSelected] = useState<string>("")
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>("")
  const [includeAll, setIncludeAll] = useState(false)

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  const loadEvents = async () => {
    try {
      setError(null)
      // Prefer only ongoing events
      let res = await fetch(`${base}/api/analytics/events-overview?status=ongoing`)
      let json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || "Failed to load events overview")
      let list = Array.isArray(json?.data?.events) ? json.data.events : (Array.isArray(json?.events) ? json.events : (Array.isArray(json?.data) ? json.data : []))
      if (!Array.isArray(list) || list.length === 0) {
        // Fallback to all events and then filter
        res = await fetch(`${base}/api/analytics/events`)
        json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.message || "Failed to load events")
        list = Array.isArray(json?.events) ? json.events : (json?.data || [])
      }
      const filtered = includeAll ? list : list.filter((ev: any) => isLiveEvent(ev))
      const simplified = filtered.map((ev: any) => ({ _id: ev?._id || ev?.eventId || ev?.event?._id, title: ev?.title || ev?.event?.title || "Event" })).filter((e: any) => e._id)
      setEvents(simplified)
      if (!selected && simplified.length) setSelected(simplified[0]._id)
    } catch (e: any) {
      setError(e?.message || "Unable to fetch events")
    }
  }

  const loadLeaderboard = async (eventId: string) => {
    if (!eventId) return
    try {
      setLoading(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/analytics/judge/leaderboard?eventId=${encodeURIComponent(eventId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || "Failed to load leaderboard")
      const rows = Array.isArray(json?.data) ? json.data : (json?.leaderboard || [])
      setLeaderboard(rows)
      setUpdatedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e?.message || "Unable to load leaderboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEvents() }, [includeAll])
  useEffect(() => {
    if (!selected) return
    loadLeaderboard(selected)
    const id = setInterval(() => loadLeaderboard(selected), 15000)
    return () => clearInterval(id)
  }, [selected])

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrophyIcon />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder={events.length ? "Select event" : (includeAll ? "No events" : "No ongoing events") } />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e._id} value={e._id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {updatedAt && (
            <div className="text-sm text-slate-500 self-center">Updated: {updatedAt}</div>
          )}
        </div>
        {events.length === 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded p-3">
            <span>{includeAll ? "No events available." : "No ongoing events right now."}</span>
            <Button size="sm" variant="outline" onClick={() => setIncludeAll((v) => !v)}>
              {includeAll ? "Show ongoing only" : "Show all events"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="h-24 bg-slate-100 rounded animate-pulse" />
        ) : leaderboard && leaderboard.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Team/Participant</th>
                  <th className="py-2 pr-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 pr-4">{row.rank ?? idx + 1}</td>
                    <td className="py-2 pr-4">{row.teamName || row.participantName || row.name || `Entry ${idx + 1}`}</td>
                    <td className="py-2 pr-4 font-semibold">{row.score ?? row.totalScore ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-slate-600">No leaderboard data yet.</div>
        )}

        {/* Score distribution chart (if scores available) */}
        {leaderboard && leaderboard.length ? (
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Score Distribution</CardTitle></CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RBarChart data={bucketScores(leaderboard)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </RBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Top 5</CardTitle></CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  {leaderboard.slice(0, 5).map((row: any, idx: number) => (
                    <li key={idx} className="flex justify-between"><span>{row.teamName || row.participantName || row.name || `Entry ${idx + 1}`}</span><span className="font-semibold">{row.score ?? row.totalScore ?? '-'}</span></li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function MetricBox({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-cyan-50">
      <div className="text-xs text-slate-600">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}{suffix ? suffix : ''}</div>
    </div>
  )
}

function safeNum(v: any): number | string {
  const n = Number(v)
  return Number.isFinite(n) ? n : '-'
}

function isLiveEvent(ev: any): boolean {
  // Prefer explicit status if present
  const status = ev?.status || ev?.event?.status
  if (typeof status === 'string') return status.toLowerCase() === 'ongoing'
  // Fallback to dates
  const start = new Date(ev?.startDate || ev?.event?.startDate || 0)
  const end = new Date(ev?.endDate || ev?.event?.endDate || 0)
  const now = new Date()
  return start instanceof Date && end instanceof Date && !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= now && now <= end
}

// --- Helpers to compute chart data safely ---
function computeTimeSeries(data: any): Array<{ name: string; value: number }> {
  const series = data?.timeSeries || data?.submissionsOverTime || data?.activityOverTime || []
  if (Array.isArray(series)) {
    return series.map((p: any, idx: number) => ({
      name: String(p.name ?? p.date ?? p.label ?? idx + 1),
      value: Number(p.value ?? p.count ?? p.total ?? 0) || 0,
    }))
  }
  return []
}

function computeStatusPie(data: any): Array<{ name: string; value: number }> {
  const ok = Number(data?.submissionsAccepted ?? data?.accepted ?? 0)
  const pending = Number(data?.submissionsPending ?? data?.pending ?? 0)
  const rejected = Number(data?.submissionsRejected ?? data?.rejected ?? 0)
  const reviewed = Number(data?.reviewed ?? 0)
  const pie = [
    { name: "Accepted", value: ok },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
  ]
  // include reviewed if distinct
  if (reviewed && reviewed > 0) pie.push({ name: "Reviewed", value: reviewed })
  return pie.filter((p) => Number(p.value) > 0)
}

function bucketScores(rows: any[]): Array<{ bucket: string; count: number }> {
  // Buckets: 0-20,20-40,40-60,60-80,80-100
  const buckets = [0, 20, 40, 60, 80, 100]
  const counts = [0, 0, 0, 0, 0]
  for (const r of rows) {
    const s = Number(r?.score ?? r?.totalScore)
    if (!Number.isFinite(s)) continue
    if (s < 20) counts[0]++
    else if (s < 40) counts[1]++
    else if (s < 60) counts[2]++
    else if (s < 80) counts[3]++
    else counts[4]++
  }
  return [
    { bucket: "0-20", count: counts[0] },
    { bucket: "20-40", count: counts[1] },
    { bucket: "40-60", count: counts[2] },
    { bucket: "60-80", count: counts[3] },
    { bucket: "80-100", count: counts[4] },
  ]
}

function TrophyIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" className="text-purple-600" fill="currentColor" aria-hidden>
    <path d="M6 2a1 1 0 0 0-1 1v2H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h1.09A5.001 5.001 0 0 0 11 14.9V17H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.1A5.001 5.001 0 0 0 15.91 11H17a4 4 0 0 0 4-4V6a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1H6zm1 3V4h10v1a1 1 0 0 0 1 1h1v1a2 2 0 0 1-2 2h-2.18a3 3 0 0 0-5.64 0H7A2 2 0 0 1 5 7V6h1a1 1 0 0 0 1-1z" />
  </svg>
}

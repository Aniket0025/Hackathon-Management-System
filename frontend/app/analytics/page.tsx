"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Activity, RefreshCw, Download, Trophy } from "lucide-react"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, AreaChart, Area, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"

// Dynamically import heavy components for better TTI
const InteractiveStatsDashboard = dynamic(
  () => import("@/components/interactive-stats-dashboard").then(m => m.InteractiveStatsDashboard),
  { ssr: false, loading: () => <div className="h-40 bg-slate-100 rounded animate-pulse" /> }
)
const AdvancedAnalytics = dynamic(
  () => import("@/components/advanced-analytics-dashboard"),
  { ssr: false, loading: () => <div className="h-56 bg-slate-100 rounded animate-pulse" /> }
)

export default function AnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [role, setRole] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [exportingExcel, setExportingExcel] = useState(false)
  // If organizer has no hosted events, avoid showing global Advanced Insights that imply data
  const [organizerHasEvents, setOrganizerHasEvents] = useState<boolean | null>(null)

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

  // Export analytics as Excel using live backend data
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true)
      // Dynamic import of xlsx as a namespace object. Using `{ default: XLSX }`
      // would yield the default export, which doesn't contain `utils` in some builds
      // and causes "Cannot read properties of undefined (reading 'utils')".
      const XLSX = await import('xlsx')

      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      // Helper to fetch JSON safely
      const jget = async (url: string, auth = false) => {
        const res = await fetch(url, auth && token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.message || `Failed: ${url}`)
        return json
      }

      // Workbook and sheets
      const wb = XLSX.utils.book_new()

      // 1) Platform Overview (dashboard)
      try {
        const dash = await jget(`${base}/api/analytics/dashboard`)
        const flat = [dash?.data || dash]
        const ws1 = XLSX.utils.json_to_sheet(flat)
        XLSX.utils.book_append_sheet(wb, ws1, 'Platform Overview')
      } catch {}

      // 2) Global/role-aware trends
      try {
        const trends = await jget(`${base}/api/analytics/trends?timeframe=30d`)
        const series = Array.isArray(trends?.data?.trends)
          ? trends.data.trends
          : (Array.isArray(trends?.trends) ? trends.trends : (Array.isArray(trends) ? trends : []))
        if (series.length) {
          const ws2 = XLSX.utils.json_to_sheet(series)
          XLSX.utils.book_append_sheet(wb, ws2, 'Trends')
        }
      } catch {}

      // 3) Organizer hosted events + selected event details (if organizer)
      if (role === 'organizer') {
        try {
          // Fetch organizer overview
          const overview = await jget(`${base}/api/analytics/organizer/events-overview`, true)
          const rawList = Array.isArray(overview?.data) ? overview.data : (Array.isArray(overview?.events) ? overview.events : [])

          if (rawList.length) {
            // Map to the exact columns visible in the UI table
            const toDate = (v: any) => v ? new Date(v) : null
            const fmt = (d: Date | null) => d ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : ''
            const items: {
              Event: string
              Status: string
              Start: string
              End: string
              Registrations: number
              Submissions: number
              Conversion: string
              'Active 24h': number
            }[] = rawList.map((r: any) => {
              const title = r?.title || r?.event?.title || r?.name || 'Event'
              const status = (r?.status || r?.event?.status || '').toString()
              const start = fmt(toDate(r?.startDate || r?.event?.startDate || r?.start))
              const end = fmt(toDate(r?.endDate || r?.event?.endDate || r?.end))
              const registrations = Number(r?.metrics?.registrations ?? r?.totalRegistrations ?? r?.registrations ?? r?.countRegistrations ?? 0)
              const submissions = Number(r?.metrics?.submissions ?? r?.totalSubmissions ?? r?.submissions ?? r?.countSubmissions ?? 0)
              const conversionNum = Number.isFinite(r?.metrics?.conversion)
                ? Number(r.metrics.conversion)
                : ((registrations > 0) ? (submissions / registrations) * 100 : (Number(r?.conversionRate ?? r?.conversion ?? 0)))
              const active24h = Number(r?.metrics?.activity24h ?? r?.activity24h ?? r?.activeLast24h ?? r?.recentActivityCount ?? 0)
              return {
                Event: title,
                Status: status.charAt(0).toUpperCase() + status.slice(1),
                Start: start,
                End: end,
                Registrations: registrations,
                Submissions: submissions,
                Conversion: `${Math.round(conversionNum)}%`,
                'Active 24h': active24h,
              }
            })

            // Summary totals like the header cards (Total Hosted Events, Total Registrations, Total Submissions)
            const totalsInit = { totalEvents: 0, totalRegistrations: 0, totalSubmissions: 0, totalActive24h: 0 }
            const totals = items.reduce((acc: typeof totalsInit, it) => {
              acc.totalEvents += 1
              acc.totalRegistrations += Number(it.Registrations || 0)
              acc.totalSubmissions += Number(it.Submissions || 0)
              acc.totalActive24h += Number(it['Active 24h'] || 0)
              return acc
            }, totalsInit)

            const summaryRows = [
              { Metric: 'Total Hosted Events', Value: totals.totalEvents },
              { Metric: 'Total Registrations', Value: totals.totalRegistrations },
              { Metric: 'Total Submissions', Value: totals.totalSubmissions },
              { Metric: 'Active 24h (sum)', Value: totals.totalActive24h },
            ]

            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Organizer Summary')
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items), 'Organizer Events')
          }

          // Selected organizer event from localStorage (maintained by OrganizerAnalyticsView)
          const selectedId = typeof window !== 'undefined' ? localStorage.getItem('organizer_selected_event') : null
          if (selectedId) {
            try {
              const ev = await jget(`${base}/api/analytics/events/${encodeURIComponent(selectedId)}`)
              const data = ev?.data || ev
              // KPI sheet
              const kpi = [{
                registrations: Number(data?.totalRegistrations ?? data?.registrations ?? 0),
                submissions: Number(data?.totalSubmissions ?? data?.submissions ?? 0),
                conversion: Number(data?.conversionRate ?? data?.conversion ?? 0),
                activity24h: Number(data?.activity24h ?? data?.activeLast24h ?? data?.recentActivityCount ?? 0),
              }]
              XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpi), 'Selected Event KPIs')
              // Time series
              const ts = Array.isArray(data?.timeSeries) ? data.timeSeries : (Array.isArray(data?.submissionsOverTime) ? data.submissionsOverTime : [])
              if (ts.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ts), 'Selected Event Timeseries')
              // Status breakdown
              const statusRows = [
                { status: 'Accepted', value: Number(data?.submissionsAccepted ?? data?.accepted ?? 0) },
                { status: 'Pending', value: Number(data?.submissionsPending ?? data?.pending ?? 0) },
                { status: 'Rejected', value: Number(data?.submissionsRejected ?? data?.rejected ?? 0) },
              ].filter(r => r.value > 0)
              if (statusRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusRows), 'Selected Event Status')
            } catch {}
          }
        } catch {}
      }

      // 4) Participant-scoped events overview (if participant)
      if (role === 'participant') {
        try {
          const my = await jget(`${base}/api/analytics/my-events`, true)
          const list = Array.isArray(my?.data) ? my.data : (Array.isArray(my?.events) ? my.events : [])
          if (Array.isArray(list) && list.length) {
            const toDate = (v: any) => v ? new Date(v) : null
            const fmt = (d: Date | null) => d ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : ''
            const rows = list.map((r: any) => ({
              Event: r?.title || r?.event?.title || 'Event',
              Status: (r?.status || '').toString(),
              Start: fmt(toDate(r?.startDate)),
              End: fmt(toDate(r?.endDate)),
              Registrations: Number(r?.metrics?.registrations ?? 0),
              Submissions: Number(r?.metrics?.submissions ?? 0),
              Conversion: `${Math.round(Number(r?.metrics?.conversion ?? 0))}%`,
              'Active 24h': Number(r?.metrics?.activity24h ?? 0),
            }))
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'My Events')
          }
        } catch {}
      }

      // 4) Judge leaderboard (if judge)
      if (role === 'judge') {
        try {
          const assigned = await jget(`${base}/api/judges/my-events`, true)
          const events = Array.isArray(assigned?.events) ? assigned.events : []
          if (events.length) {
            const firstId = events[0]?._id || events[0]?.eventId || events[0]?.event?._id
            if (firstId) {
              const lb = await jget(`${base}/api/analytics/judge/leaderboard?eventId=${encodeURIComponent(firstId)}`, !!token)
              const rows = Array.isArray(lb?.data) ? lb.data : (Array.isArray(lb?.leaderboard) ? lb.leaderboard : [])
              if (rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Leaderboard')
            }
          }
        } catch {}
      }

      // Meta sheet
      const meta = [{ generatedAt: new Date().toLocaleString(), role: role || 'guest' }]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(meta), 'Meta')

      XLSX.writeFile(wb, `HackHost-Analytics-${Date.now()}.xlsx`)
    } catch (e) {
      console.error(e)
      alert((e as any)?.message || 'Failed to export Excel')
    } finally {
      setExportingExcel(false)
    }
  }

  // Removed Export Report (PDF) feature as requested

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
        // If organizer, probe whether they have hosted events to gate Advanced Insights
        if ((me?.user?.role || null) === 'organizer') {
          try {
            const params = new URLSearchParams({ status: 'all' })
            const ovRes = await fetch(`${base}/api/analytics/organizer/events-overview?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
            const ov = await ovRes.json().catch(() => ({}))
            if (ovRes.ok) {
              const list = Array.isArray(ov?.data) ? ov.data : (Array.isArray(ov?.events) ? ov.events : (Array.isArray(ov?.data?.events) ? ov.data.events : []))
              setOrganizerHasEvents(Array.isArray(list) && list.length > 0)
            } else {
              setOrganizerHasEvents(null) // unknown => don't hide
            }
          } catch {
            setOrganizerHasEvents(null)
          }
        } else {
          setOrganizerHasEvents(null)
        }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50" id="analytics-report-root">
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
              variant="cta"
              size="lg"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="transform-gpu transition-all duration-300 will-change-transform shadow-2xl shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 border border-emerald-400/50 ring-1 ring-emerald-300/30 hover:ring-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 [transform:perspective(900px)_rotateX(0deg)_rotateY(0deg)] hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(-3deg)_translateY(-2px)]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            {/* Export Excel visible only to organizer and judge */}
            {(role === 'organizer' || role === 'judge') && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleExportExcel}
                disabled={exportingExcel}
                className="bg-white/95 text-slate-800 border-2 border-slate-300 hover:bg-white hover:border-slate-400 transform-gpu transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 [transform:perspective(900px)_rotateX(0deg)_rotateY(0deg)] hover:[transform:perspective(900px)_rotateX(3deg)_rotateY(3deg)_translateY(-2px)]"
              >
                <Download className="w-4 h-4 mr-2" />
                {exportingExcel ? 'Preparing…' : 'Export Excel'}
              </Button>
            )}
            {lastUpdated && (
              <span className="text-sm text-slate-700 font-medium">
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
                {/* If organizer with zero hosted events, avoid showing platform-wide metrics */}
                {role === 'organizer' && organizerHasEvents === false ? (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600">No hosted events found for your account. Create an event to see Advanced Insights.</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <AdvancedAnalytics />
                )}
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

          {/* Global Leaderboard (visible for all roles) */}
          <GlobalLeaderboardSection />
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
  if (!role) return null
  if (role === 'organizer') return <OrganizerAnalyticsView />
  // For judges, suppress the judge-specific leaderboard view; rely on the global leaderboard below
  if (role === 'judge') return null
  return <ParticipantAnalyticsView />
}

// Global leaderboard for everyone (optionally filter by event)
function GlobalLeaderboardSection() {
  const [leaders, setLeaders] = useState<Array<{ _id: string; name?: string; score?: number; eventName?: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Array<{ _id: string; title: string }>>([])
  const [eventId, setEventId] = useState<string>("all")

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch(`${base}/api/events`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load events')
        const list = Array.isArray(data?.events) ? data.events : []
        setEvents(list.map((e: any) => ({ _id: e?._id, title: e?.title || 'Event' })).filter((e: any) => e._id))
      } catch {
        // non-fatal
      }
    }
    loadEvents()
  }, [])

  const loadLeaders = async () => {
    try {
      setError(null)
      setLoading(true)
      const params = new URLSearchParams({ sort: 'score_desc', limit: '9' })
      if (eventId && eventId !== 'all') params.set('eventId', eventId)
      const res = await fetch(`${base}/api/teams?${params.toString()}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to load leaderboard')
      setLeaders(Array.isArray(data?.teams) ? data.teams : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLeaders() }, [eventId])
  useEffect(() => {
    const id = setInterval(loadLeaders, 15000)
    return () => clearInterval(id)
  }, [eventId])

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-6 h-6 text-amber-600" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-slate-600">
            Showing {leaders.length} team{leaders.length === 1 ? '' : 's'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Filter by event</span>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose event (optional)" />
              </SelectTrigger>
              <SelectContent className="w-56">
                <SelectItem value="all">All Events</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev._id} value={ev._id}>{ev.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Loading…</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-slate-300 mb-2">0</div>
                  <div className="bg-slate-200 h-5 w-24 rounded" />
                </CardContent>
              </Card>
            ))
          ) : leaders.length === 0 ? (
            <div className="col-span-full text-center text-slate-600 py-10">No teams found for the selected filter.</div>
          ) : (
            leaders.map((l, i) => (
              <Card key={l._id || i} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">{i + 1}</span>
                    {l.name || `Team ${i + 1}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{typeof l.score === 'number' ? l.score : '—'}</div>
                  {l.eventName && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">{l.eventName}</Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
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
  const [me, setMe] = useState<{ id?: string; email?: string; name?: string } | null>(null)
  const [team, setTeam] = useState<any | null>(null)

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  // Load current user to match team membership
  const loadMe = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) { setMe(null); return }
      const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Failed to load user')
      setMe({ id: json?.user?._id || json?.user?.id, email: json?.user?.email, name: json?.user?.name })
    } catch {
      setMe(null)
    }
  }

  const loadMyEvents = async () => {
    try {
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) { setEvents([]); setSelected(""); return }
      // Primary: my-events (auth)
      const res = await fetch(`${base}/api/analytics/my-events`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json().catch(() => ({}))
      let list: any[] = []
      if (res.ok) list = Array.isArray(json?.data) ? json.data : (json?.events || [])

      // Fallbacks if nothing returned
      if (!Array.isArray(list) || list.length === 0) {
        try {
          const statusParam = includeAll ? 'all' : 'ongoing'
          let r2 = await fetch(`${base}/api/analytics/events-overview?status=${statusParam}`)
          let j2 = await r2.json().catch(() => ({}))
          if (r2.ok) list = Array.isArray(j2?.data?.events) ? j2.data.events : (Array.isArray(j2?.events) ? j2.events : (Array.isArray(j2?.data) ? j2.data : []))
          if (!Array.isArray(list) || list.length === 0) {
            r2 = await fetch(`${base}/api/analytics/events`)
            j2 = await r2.json().catch(() => ({}))
            if (r2.ok) list = Array.isArray(j2?.events) ? j2.events : (j2?.data || [])
          }
        } catch { /* ignore */ }
      }

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

  // Load the participant's team for the selected event, synchronized to user
  const loadMyTeamForEvent = async (eventId: string) => {
    if (!eventId || !me?.email) { setTeam(null); return }
    try {
      const res = await fetch(`${base}/api/teams?eventId=${encodeURIComponent(eventId)}`)
      const json = await res.json().catch(() => ({}))
      const teams = Array.isArray(json?.teams) ? json.teams : (Array.isArray(json) ? json : [])
      // Find team where current user is a member by email
      const mine = teams.find((t: any) =>
        Array.isArray(t?.members) && t.members.some((m: any) => (m?.email || m?.user?.email) && String(m.email || m?.user?.email).toLowerCase() === String(me.email).toLowerCase())
      )
      setTeam(mine || null)
    } catch {
      setTeam(null)
    }
  }

  useEffect(() => { loadMe(); }, [])
  useEffect(() => { loadMyEvents() }, [includeAll])
  useEffect(() => {
    if (!selected) return
    loadEventAnalytics(selected)
    const id = setInterval(() => loadEventAnalytics(selected), 30000)
    return () => clearInterval(id)
  }, [selected])
  useEffect(() => {
    if (!selected) return
    loadMyTeamForEvent(selected)
  }, [selected, me?.email])

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
            {/* Team sync card */}
            {team ? (
              <Card className="border border-slate-200">
                <CardHeader className="pb-2"><CardTitle className="text-base">Your Team</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-700"><span className="font-semibold">Team:</span> {team?.name || team?._id || 'N/A'}</div>
                  <div className="mt-2 grid md:grid-cols-2 gap-2">
                    {(Array.isArray(team?.members) ? team.members : []).map((m: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-600">{m?.name || m?.user?.name || m?.email || m?.user?.email}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-xs text-slate-500">No team found for this event. If you're in a team, ensure it's registered.</div>
            )}
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

// Organizer view: only events hosted by the organizer
function OrganizerAnalyticsView() {
  const [rows, setRows] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>("")
  const [status, setStatus] = useState<string>("all") // ongoing | upcoming | completed | all
  const [sortBy, setSortBy] = useState<string>("startDate")
  const [order, setOrder] = useState<string>("desc")
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [eventData, setEventData] = useState<any | null>(null)
  const [eventLoading, setEventLoading] = useState(false)
  const [eventError, setEventError] = useState<string | null>(null)
  // Current organizer identity to filter owned events as a fallback
  const [me, setMe] = useState<{ id?: string; email?: string } | null>(null)

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) throw new Error("Not authenticated")
      const params = new URLSearchParams()
      // Always pass status including 'all' so backend doesn't default-filter
      if (status) params.set('status', status)
      if (sortBy) params.set('sortBy', sortBy)
      if (order) params.set('order', order)
      const res = await fetch(`${base}/api/analytics/organizer/events-overview?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || "Failed to load organizer analytics")
      // Accept multiple shapes from backend {data: [...] } or {events: [...] } or {data: {events: [...]}}
      let list: any[] = []
      if (Array.isArray(json?.data)) list = json.data
      else if (Array.isArray(json?.events)) list = json.events
      else if (Array.isArray(json?.data?.events)) list = json.data.events
      else if (Array.isArray(json)) list = json

      // Fallbacks if status=all returns nothing
      if ((!Array.isArray(list) || list.length === 0) && status === 'all') {
        try {
          // Retry without status param
          const p2 = new URLSearchParams()
          if (sortBy) p2.set('sortBy', sortBy)
          if (order) p2.set('order', order)
          const r2 = await fetch(`${base}/api/analytics/organizer/events-overview?${p2.toString()}`,
            { headers: { Authorization: `Bearer ${token}` } })
          const j2 = await r2.json().catch(() => ({}))
          if (r2.ok) {
            let l2: any[] = []
            if (Array.isArray(j2?.data)) l2 = j2.data
            else if (Array.isArray(j2?.events)) l2 = j2.events
            else if (Array.isArray(j2?.data?.events)) l2 = j2.data.events
            else if (Array.isArray(j2)) l2 = j2
            list = l2
          }
        } catch {}
      }
      if ((!Array.isArray(list) || list.length === 0) && status === 'all') {
        try {
          // Retry with status=ongoing as a last resort
          const p3 = new URLSearchParams()
          p3.set('status', 'ongoing')
          if (sortBy) p3.set('sortBy', sortBy)
          if (order) p3.set('order', order)
          const r3 = await fetch(`${base}/api/analytics/organizer/events-overview?${p3.toString()}`,
            { headers: { Authorization: `Bearer ${token}` } })
          const j3 = await r3.json().catch(() => ({}))
          if (r3.ok) {
            let l3: any[] = []
            if (Array.isArray(j3?.data)) l3 = j3.data
            else if (Array.isArray(j3?.events)) l3 = j3.events
            else if (Array.isArray(j3?.data?.events)) l3 = j3.data.events
            else if (Array.isArray(j3)) l3 = j3
            list = l3
          }
        } catch {}
      }
      // Always attempt to merge owned events from /api/events to ensure parity with Organizer Events page
      if (me) {
        try {
          const evRes = await fetch(`${base}/api/events`,
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
          const evJson = await evRes.json().catch(() => ({}))
          if (evRes.ok) {
            const evs = Array.isArray(evJson?.events) ? evJson.events : (Array.isArray(evJson) ? evJson : [])
            const mine = evs.filter((e: any) => {
              const ownerId = e?.organizerId || e?.organizer?._id || e?.createdBy || e?.ownerId || e?.userId || e?.creatorId || e?.authorId
              const ownerEmail = e?.organizerEmail || e?.organizer?.email || e?.createdByEmail || e?.ownerEmail || e?.creatorEmail
              return (
                (ownerId && String(ownerId) === String(me.id)) ||
                (ownerEmail && me.email && String(ownerEmail).toLowerCase() === String(me.email).toLowerCase())
              )
            })
            // Adapt to organizer overview row shape with safe defaults
            const adapted = mine.map((e: any) => {
              const start = e?.startDate || e?.start || e?.startsAt
              const end = e?.endDate || e?.end || e?.endsAt
              const now = Date.now()
              let st = 'upcoming'
              const sTs = start ? new Date(start).getTime() : undefined
              const eTs = end ? new Date(end).getTime() : undefined
              if (sTs && eTs) st = now < sTs ? 'upcoming' : (now > eTs ? 'completed' : 'ongoing')
              else if (sTs) st = now < sTs ? 'upcoming' : 'ongoing'
              else if (eTs) st = now > eTs ? 'completed' : 'ongoing'
              const eid = e?._id || e?.id || e?.eventId || e?.event?._id || e?.slug
              return {
                id: eid,
                _id: eid,
                title: e?.title || e?.name || e?.event?.title || 'Event',
                status: st,
                startDate: start || null,
                endDate: end || null,
                metrics: {
                  registrations: Number(e?.registrationsCount || e?.metrics?.registrations || 0),
                  submissions: Number(e?.submissionsCount || e?.metrics?.submissions || 0),
                  conversion: Number(e?.metrics?.conversion || 0),
                  activity24h: Number(e?.metrics?.activity24h || 0),
                }
              }
            })
            // Merge without duplicates by id/_id/eventId
            const seen = new Set(
              (Array.isArray(list) ? list : []).map((r: any) => String(r?.id || r?._id || r?.eventId || r?.slug))
            )
            const merged = [
              ...(Array.isArray(list) ? list : []),
              ...adapted.filter((r: any) => {
                const rid = String(r?.id || r?._id || r?.eventId || r?.slug)
                if (!rid) return false
                if (seen.has(rid)) return false
                seen.add(rid)
                return true
              })
            ]
            list = merged
          }
        } catch { /* ignore */ }
      }

      setRows(list)
      // Clear selection if current selected event is not in the new list
      if (!list || list.length === 0) {
        setSelectedEventId("")
      } else if (selectedEventId && !list.some((r: any) => String(r?.id || r?._id || r?.eventId) === String(selectedEventId))) {
        setSelectedEventId("")
      }
      setUpdatedAt(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e?.message || "Unable to load organizer analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status, sortBy, order])
  // When organizer identity arrives, try reload if current list is empty
  useEffect(() => {
    if (me && (!rows || rows.length === 0)) {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me])
  useEffect(() => {
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [status, sortBy, order])

  // When organizer rows change, set a default selected event if not chosen
  useEffect(() => {
    if (!selectedEventId && rows.length) {
      const first = rows[0]
      const id = first?.id || first?._id || first?.eventId
      if (id) setSelectedEventId(String(id))
    }
  }, [rows, selectedEventId])

  // Load per-event analytics for selected organizer event
  useEffect(() => {
    // Persist selection for exports
    if (typeof window !== 'undefined') {
      if (selectedEventId) localStorage.setItem('organizer_selected_event', selectedEventId)
      else localStorage.removeItem('organizer_selected_event')
    }

    const run = async () => {
      if (!selectedEventId) { setEventData(null); return }
      try {
        setEventLoading(true)
        setEventError(null)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${base}/api/analytics/events/${encodeURIComponent(selectedEventId)}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.message || 'Failed to load event analytics')
        setEventData(json?.data || json)
      } catch (e: any) {
        setEventError(e?.message || 'Unable to load event analytics')
        setEventData(null)
      } finally {
        setEventLoading(false)
      }
    }
    run()
    const id = selectedEventId
    const timer = setInterval(run, 30000)
    return () => clearInterval(timer)
  }, [selectedEventId])

  const totals = rows.reduce((acc: any, r: any) => {
    acc.reg += Number(r?.metrics?.registrations || 0)
    acc.sub += Number(r?.metrics?.submissions || 0)
    return acc
  }, { reg: 0, sub: 0 })

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="w-5 h-5 text-cyan-600" />
          Organizer Analytics (My Events)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder={rows.length ? 'Select hosted event' : 'No events'} />
              </SelectTrigger>
              <SelectContent>
                {rows.map((r: any, idx: number) => {
                  const id = r?.id || r?._id || r?.eventId
                  if (!id) return null
                  return <SelectItem key={String(id)} value={String(id)}>{r?.title || `Event ${idx + 1}`}</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startDate">Start date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="registrations">Registrations</SelectItem>
                <SelectItem value="submissions">Submissions</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="activity24h">Activity 24h</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Select value={order} onValueChange={setOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {updatedAt && (
            <div className="text-sm text-slate-500 self-center md:text-right">Updated: {updatedAt}</div>
          )}
        </div>

        {/* Selected Event KPIs */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2"><CardTitle className="text-base">Selected Event Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {eventError && <div className="text-sm text-red-600">{eventError}</div>}
            {eventLoading ? (
              <div className="h-20 bg-slate-100 rounded animate-pulse" />
            ) : eventData ? (
              <>
                <div className="grid md:grid-cols-4 gap-4">
                  <MetricBox label="Registrations" value={safeNum(eventData.totalRegistrations ?? eventData.registrations)} />
                  <MetricBox label="Submissions" value={safeNum(eventData.totalSubmissions ?? eventData.submissions)} />
                  <MetricBox label="Conversion" value={safeNum(eventData.conversionRate ?? eventData.conversion)} suffix="%" />
                  <MetricBox label="Active 24h" value={safeNum(eventData.activity24h ?? eventData.activeLast24h ?? eventData.recentActivityCount)} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Submissions Over Time</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      {computeTimeSeries(eventData).length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={computeTimeSeries(eventData)}>
                            <defs>
                              <linearGradient id="colorOrgSub" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorOrgSub)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full bg-slate-50 rounded flex items-center justify-center text-sm text-slate-500">No time-series</div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Submission Status</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      {computeStatusPie(eventData).length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={computeStatusPie(eventData)} dataKey="value" nameKey="name" outerRadius={80}>
                              {computeStatusPie(eventData).map((_, i) => (
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
              </>
            ) : (
              <div className="text-sm text-slate-600">Select an event to view details.</div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <div className="grid md:grid-cols-3 gap-4">
          <MetricBox label="Total Hosted Events" value={rows.length} />
          <MetricBox label="Total Registrations" value={totals.reg} />
          <MetricBox label="Total Submissions" value={totals.sub} />
        </div>

        {/* Events table */}
        {loading ? (
          <div className="h-24 bg-slate-100 rounded animate-pulse" />
        ) : rows.length === 0 ? (
          <div className="text-sm text-slate-600">No events found for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Start</th>
                  <th className="py-2 pr-4">End</th>
                  <th className="py-2 pr-4">Registrations</th>
                  <th className="py-2 pr-4">Submissions</th>
                  <th className="py-2 pr-4">Conversion</th>
                  <th className="py-2 pr-4">Active 24h</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, idx: number) => (
                  <tr key={String(r?.id || idx)} className="border-t">
                    <td className="py-2 pr-4 font-medium">{r?.title || 'Event'}</td>
                    <td className="py-2 pr-4 capitalize">{r?.status || '-'}</td>
                    <td className="py-2 pr-4">{r?.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
                    <td className="py-2 pr-4">{r?.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}</td>
                    <td className="py-2 pr-4">{safeNum(r?.metrics?.registrations)}</td>
                    <td className="py-2 pr-4">{safeNum(r?.metrics?.submissions)}</td>
                    <td className="py-2 pr-4">{safeNum(r?.metrics?.conversion)}%</td>
                    <td className="py-2 pr-4">{safeNum(r?.metrics?.activity24h)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      // Try assigned events endpoint (auth)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      let list: any[] = []
      // 1) Assigned events preferred
      if (token) {
        try {
          const resAssigned = await fetch(`${base}/api/judges/my-events`, { headers: { Authorization: `Bearer ${token}` } })
          const jsonAssigned = await resAssigned.json().catch(() => ({}))
          if (resAssigned.ok) {
            if (Array.isArray(jsonAssigned?.events)) list = jsonAssigned.events
            else if (Array.isArray(jsonAssigned?.data)) list = jsonAssigned.data
            else if (Array.isArray(jsonAssigned?.assignedEvents)) list = jsonAssigned.assignedEvents
            else if (Array.isArray(jsonAssigned)) list = jsonAssigned
          }
        } catch { /* ignore and fallback */ }
      }
      // 2) If no assigned, fallback to overview (include auth if available)
      if (!Array.isArray(list) || list.length === 0) {
        const statusParam = includeAll ? 'all' : 'ongoing'
        let res = await fetch(`${base}/api/analytics/events-overview?status=${statusParam}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        let json = await res.json().catch(() => ({}))
        if (res.ok) {
          list = Array.isArray(json?.data?.events) ? json.data.events : (Array.isArray(json?.events) ? json.events : (Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : [])))
        }
        // 3) Last resort: basic list
        if (!Array.isArray(list) || list.length === 0) {
          res = await fetch(`${base}/api/analytics/events`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
          json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(json?.message || "Failed to load events")
          list = Array.isArray(json?.events) ? json.events : (json?.data || (Array.isArray(json) ? json : []))
        }
      }
      // Filter by live if needed
      const filtered = includeAll ? list : list.filter((ev: any) => isLiveEvent(ev))
      // Normalize id/title mapping
      const simplified = filtered
        .map((ev: any) => {
          const eid = ev?._id || ev?.id || ev?.eventId || ev?.event?._id || ev?.slug
          const title = ev?.title || ev?.name || ev?.event?.title || 'Event'
          return eid ? { _id: String(eid), title } : null
        })
        .filter(Boolean) as Array<{ _id: string; title: string }>
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
    const id = setInterval(() => loadLeaderboard(selected), 30000)
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

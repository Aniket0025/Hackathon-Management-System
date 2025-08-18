"use client"

import { useMemo, useState } from "react"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Eye, Download, CheckCircle2, Clock, XCircle } from "lucide-react"

const mockSubmissions = [
  { id: "S-1024", team: "Alpha Coders", event: "AI Innovation Challenge", status: "under_review", score: null, submittedAt: "2025-08-17 20:15" },
  { id: "S-1023", team: "EcoBuilders", event: "Sustainable Tech Hackathon", status: "approved", score: 92, submittedAt: "2025-08-17 18:50" },
  { id: "S-1022", team: "FinWiz", event: "FinTech Innovation Sprint", status: "rejected", score: 61, submittedAt: "2025-08-17 17:05" },
  { id: "S-1021", team: "VisionX", event: "AI Innovation Challenge", status: "approved", score: 88, submittedAt: "2025-08-17 16:10" },
]

function StatusBadge({ status }: { status: "approved" | "under_review" | "rejected" }) {
  if (status === "approved") return (
    <Badge className="bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"><CheckCircle2 className="w-3.5 h-3.5 mr-1"/>Approved</Badge>
  )
  if (status === "rejected") return (
    <Badge className="bg-rose-500/20 text-rose-700 border border-rose-500/30"><XCircle className="w-3.5 h-3.5 mr-1"/>Rejected</Badge>
  )
  return (
    <Badge className="bg-amber-500/20 text-amber-700 border border-amber-500/30"><Clock className="w-3.5 h-3.5 mr-1"/>Under Review</Badge>
  )
}

export default function SubmissionsPage() {
  const [tab, setTab] = useState<"all" | "approved" | "under_review" | "rejected">("all")

  const filtered = useMemo(() => {
    if (tab === "all") return mockSubmissions
    return mockSubmissions.filter((s) => s.status === tab)
  }, [tab])

  return (
    <EnhancedDashboardLayout userRole="organizer">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Submissions</h1>
            <p className="text-slate-600 mt-2">Review and manage all project submissions across your events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline"><Filter className="w-4 h-4 mr-2"/>Filters</Button>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"><Download className="w-4 h-4 mr-2"/>Export CSV</Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
          <TabsList className="glass-card rounded-xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest incoming and updated entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s) => (
                        <TableRow key={s.id} className="hover:bg-white/40">
                          <TableCell className="font-medium">{s.id}</TableCell>
                          <TableCell>{s.team}</TableCell>
                          <TableCell>{s.event}</TableCell>
                          <TableCell><StatusBadge status={s.status as any}/></TableCell>
                          <TableCell>{s.score ?? "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{s.submittedAt}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-2"/>View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs use the same content via filtered state */}
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

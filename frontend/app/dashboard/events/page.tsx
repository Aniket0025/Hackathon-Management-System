"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Trophy,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Copy,
  Archive,
} from "lucide-react"
import Link from "next/link"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

const mockEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    status: "active",
    participants: 156,
    submissions: 42,
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    type: "online",
    category: "AI/ML",
    prize: "$25,000",
    registrationDeadline: "2024-03-14",
    submissionDeadline: "2024-03-16",
    description: "Build innovative AI solutions that solve real-world problems",
    tracks: ["Machine Learning", "Computer Vision", "NLP"],
    judges: 8,
    mentors: 12,
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    status: "upcoming",
    participants: 89,
    submissions: 0,
    startDate: "2024-04-20",
    endDate: "2024-04-22",
    type: "hybrid",
    category: "Sustainability",
    prize: "$15,000",
    registrationDeadline: "2024-04-18",
    submissionDeadline: "2024-04-21",
    description: "Create technology solutions for environmental challenges",
    tracks: ["Green Tech", "IoT", "Sustainability"],
    judges: 6,
    mentors: 8,
  },
  {
    id: 3,
    name: "FinTech Innovation Sprint",
    status: "completed",
    participants: 234,
    submissions: 67,
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    type: "offline",
    category: "FinTech",
    prize: "$30,000",
    registrationDeadline: "2024-02-08",
    submissionDeadline: "2024-02-11",
    description: "Revolutionary financial technology solutions",
    tracks: ["Blockchain", "DeFi", "Payment Systems"],
    judges: 10,
    mentors: 15,
  },
]

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || event.status === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <EnhancedDashboardLayout userRole="organizer">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Events Management
            </h1>
            <p className="text-slate-600 mt-2">Create, manage, and monitor your hackathons and innovation events</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" asChild>
            <Link href="/dashboard/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card rounded-xl">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="glass-card hover:shadow-2xl transition-all duration-200">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <Badge className={getStatusColor(event.status)} variant="outline">
                            {event.status}
                          </Badge>
                          <Badge variant="secondary">{event.type}</Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {event.prize}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">{event.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.startDate).toLocaleDateString()} -{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.participants} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {event.submissions} submissions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/events/${event.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/events/${event.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/events/${event.id}/analytics`}>
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Event Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 glass-panel rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{event.participants}</div>
                        <div className="text-sm text-blue-600">Participants</div>
                      </div>
                      <div className="text-center p-3 glass-panel rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{event.submissions}</div>
                        <div className="text-sm text-green-600">Submissions</div>
                      </div>
                      <div className="text-center p-3 glass-panel rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{event.judges}</div>
                        <div className="text-sm text-purple-600">Judges</div>
                      </div>
                      <div className="text-center p-3 glass-panel rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{event.mentors}</div>
                        <div className="text-sm text-amber-600">Mentors</div>
                      </div>
                    </div>

                    {/* Tracks */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Tracks</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tracks.map((track) => (
                          <Badge key={track} variant="outline" className="text-xs">
                            {track}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Archive className="w-4 h-4 mr-1" />
                        Archive
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/events/${event.id}/settings`}>
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

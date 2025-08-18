"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Trophy, Search, Filter, Star } from "lucide-react"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

export default function ParticipantEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const events = [
    {
      id: 1,
      name: "AI Innovation Challenge 2024",
      description: "Build the next generation of AI-powered applications",
      status: "active",
      startDate: "2024-03-15",
      endDate: "2024-03-17",
      location: "San Francisco, CA",
      participants: 156,
      prize: "$50,000",
      category: "AI/ML",
      team: "Team Alpha",
      role: "Team Lead",
      progress: 75,
    },
    {
      id: 2,
      name: "Sustainable Tech Hackathon",
      description: "Create solutions for environmental challenges",
      status: "upcoming",
      startDate: "2024-04-20",
      endDate: "2024-04-22",
      location: "Online",
      participants: 89,
      prize: "$25,000",
      category: "Sustainability",
      team: "EcoInnovators",
      role: "Developer",
      progress: 0,
    },
    {
      id: 3,
      name: "FinTech Revolution",
      description: "Revolutionize financial services with technology",
      status: "completed",
      startDate: "2024-02-10",
      endDate: "2024-02-12",
      location: "New York, NY",
      participants: 234,
      prize: "$75,000",
      category: "FinTech",
      team: "MoneyMakers",
      role: "Designer",
      progress: 100,
      rank: 3,
    },
  ]

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <EnhancedDashboardLayout userRole="participant">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              My Events
            </h1>
            <p className="text-slate-600 mt-1">Track your hackathon participation and progress</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
            Browse New Events
          </Button>
        </div>

        {/* Search and Filter */}
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
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        </div>
                        <CardDescription>{event.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.startDate} - {event.endDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.participants} participants
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Trophy className="h-4 w-4" />
                          {event.prize}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">Team: {event.team}</span>
                          <Badge variant="outline">{event.role}</Badge>
                        </div>
                        {event.status === "active" && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{event.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${event.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {event.rank && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">Ranked #{event.rank}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {event.status === "active" && (
                          <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600">
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tab contents would filter the events array */}
          <TabsContent value="active">
            <div className="grid gap-6">
              {filteredEvents
                .filter((e) => e.status === "active")
                .map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    {/* Same card structure as above */}
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

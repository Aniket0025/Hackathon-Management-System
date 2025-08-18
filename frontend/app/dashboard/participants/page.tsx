"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Users, Mail, MessageSquare, Calendar, Code, Palette, Database } from "lucide-react"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

const mockParticipants = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    avatar: "/diverse-professional-team.png",
    role: "Full-Stack Developer",
    skills: ["React", "Node.js", "Python", "AI/ML"],
    events: ["AI Innovation Challenge 2024", "FinTech Innovation Sprint"],
    submissions: 3,
    wins: 1,
    joinDate: "2024-01-15",
    lastActive: "2024-03-15T10:30:00",
    status: "active",
    teamName: "AI Innovators",
    location: "San Francisco, CA",
    experience: "Senior",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    avatar: "/ai-team.png",
    role: "UI/UX Designer",
    skills: ["Figma", "Prototyping", "User Research", "Design Systems"],
    events: ["AI Innovation Challenge 2024", "Sustainable Tech Hackathon"],
    submissions: 2,
    wins: 0,
    joinDate: "2024-02-01",
    lastActive: "2024-03-15T09:15:00",
    status: "active",
    teamName: "AI Innovators",
    location: "New York, NY",
    experience: "Mid-level",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    email: "elena.r@email.com",
    avatar: "/web-team-collaboration.png",
    role: "Data Scientist",
    skills: ["Python", "TensorFlow", "Analytics", "Machine Learning"],
    events: ["AI Innovation Challenge 2024"],
    submissions: 1,
    wins: 1,
    joinDate: "2024-01-20",
    lastActive: "2024-03-15T11:45:00",
    status: "active",
    teamName: "AI Innovators",
    location: "Austin, TX",
    experience: "Senior",
  },
]

const skillIcons = {
  React: Code,
  "Node.js": Database,
  Python: Code,
  "AI/ML": Code,
  Figma: Palette,
  Prototyping: Palette,
  "User Research": Users,
  "Design Systems": Palette,
  TensorFlow: Code,
  Analytics: Database,
  "Machine Learning": Code,
}

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "banned":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case "Senior":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Mid-level":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Junior":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredParticipants = mockParticipants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || participant.status === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <EnhancedDashboardLayout userRole="organizer">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Participants Management
            </h1>
            <p className="text-slate-600 mt-2">Manage and engage with your hackathon participants</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Announcement
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockParticipants.length}</div>
              <p className="text-xs text-slate-600">Across all events</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockParticipants.filter((p) => p.status === "active").length}
              </div>
              <p className="text-xs text-slate-600">Currently participating</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockParticipants.reduce((sum, p) => sum + p.submissions, 0)}
              </div>
              <p className="text-xs text-slate-600">Projects submitted</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Winners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {mockParticipants.filter((p) => p.wins > 0).length}
              </div>
              <p className="text-xs text-slate-600">Award winners</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search participants..."
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Participants</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid gap-6">
              {filteredParticipants.map((participant) => (
                <Card key={participant.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 ring-2 ring-cyan-100">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{participant.name}</h3>
                            <Badge className={getStatusColor(participant.status)} variant="outline">
                              {participant.status}
                            </Badge>
                            <Badge className={getExperienceColor(participant.experience)} variant="outline">
                              {participant.experience}
                            </Badge>
                          </div>
                          <p className="text-slate-600">{participant.role}</p>
                          <p className="text-sm text-slate-500">{participant.email}</p>
                          <p className="text-sm text-slate-500">{participant.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{participant.events.length}</div>
                        <div className="text-sm text-blue-600">Events</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{participant.submissions}</div>
                        <div className="text-sm text-green-600">Submissions</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{participant.wins}</div>
                        <div className="text-sm text-purple-600">Wins</div>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-lg font-bold text-amber-600">
                          {Math.floor(
                            (new Date().getTime() - new Date(participant.joinDate).getTime()) / (1000 * 60 * 60 * 24),
                          )}
                        </div>
                        <div className="text-sm text-amber-600">Days Active</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {participant.skills.map((skill) => {
                          const IconComponent = skillIcons[skill] || Code
                          return (
                            <Badge key={skill} variant="outline" className="text-xs flex items-center gap-1">
                              <IconComponent className="w-3 h-3" />
                              {skill}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {/* Events */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Participating Events</h4>
                      <div className="flex flex-wrap gap-2">
                        {participant.events.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Team Info */}
                    {participant.teamName && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4" />
                        <span>Team: {participant.teamName}</span>
                      </div>
                    )}

                    {/* Last Active */}
                    <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t">
                      <span>Joined: {new Date(participant.joinDate).toLocaleDateString()}</span>
                      <span>Last active: {new Date(participant.lastActive).toLocaleString()}</span>
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

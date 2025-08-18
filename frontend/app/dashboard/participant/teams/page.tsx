"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Plus, MessageCircle, Settings, Crown } from "lucide-react"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

export default function ParticipantTeamsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const teams = [
    {
      id: 1,
      name: "Team Alpha",
      event: "AI Innovation Challenge 2024",
      role: "Team Lead",
      members: [
        { name: "John Doe", role: "Team Lead", avatar: "/abstract-geometric-shapes.png", skills: ["React", "Node.js"] },
        { name: "Sarah Chen", role: "Designer", avatar: "/ai-team.png", skills: ["UI/UX", "Figma"] },
        {
          name: "Mike Johnson",
          role: "Developer",
          avatar: "/diverse-professional-team.png",
          skills: ["Python", "AI/ML"],
        },
        {
          name: "Lisa Wang",
          role: "Developer",
          avatar: "/web-team-collaboration.png",
          skills: ["Flutter", "Firebase"],
        },
      ],
      status: "active",
      progress: 75,
      lastActivity: "2 hours ago",
    },
    {
      id: 2,
      name: "EcoInnovators",
      event: "Sustainable Tech Hackathon",
      role: "Developer",
      members: [
        { name: "Alex Rivera", role: "Team Lead", avatar: "/interconnected-system.png", skills: ["Vue.js", "IoT"] },
        { name: "John Doe", role: "Developer", avatar: "/abstract-geometric-shapes.png", skills: ["React", "Node.js"] },
        { name: "Emma Davis", role: "Data Scientist", avatar: "/desk-organizer.png", skills: ["Python", "ML"] },
      ],
      status: "forming",
      progress: 25,
      lastActivity: "1 day ago",
    },
  ]

  const invitations = [
    {
      id: 1,
      teamName: "CodeCrafters",
      event: "Web3 Hackathon",
      invitedBy: "David Kim",
      role: "Frontend Developer",
      skills: ["React", "Web3", "Solidity"],
      receivedAt: "2 hours ago",
    },
  ]

  return (
    <EnhancedDashboardLayout userRole="participant">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              My Teams
            </h1>
            <p className="text-slate-600 mt-1">Manage your team collaborations and invitations</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Teams Tabs */}
        <Tabs defaultValue="my-teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-teams">My Teams ({teams.length})</TabsTrigger>
            <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
            <TabsTrigger value="find-teams">Find Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="my-teams" className="space-y-4">
            <div className="grid gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{team.name}</CardTitle>
                          <Badge
                            className={
                              team.status === "active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }
                          >
                            {team.status}
                          </Badge>
                          {team.role === "Team Lead" && <Crown className="h-4 w-4 text-amber-500" />}
                        </div>
                        <CardDescription>{team.event}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {team.members.length} members
                          </div>
                          <span>Role: {team.role}</span>
                          <span>Last activity: {team.lastActivity}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Team Progress</span>
                          <span>{team.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${team.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900">Team Members</h4>
                        <div className="grid gap-3">
                          {team.members.map((member, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{member.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {member.role}
                                  </Badge>
                                  {member.role === "Team Lead" && <Crown className="h-3 w-3 text-amber-500" />}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {member.skills.map((skill, skillIndex) => (
                                    <Badge key={skillIndex} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <div className="grid gap-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{invitation.teamName}</h3>
                          <Badge className="bg-blue-100 text-blue-800">Invitation</Badge>
                        </div>
                        <p className="text-slate-600">{invitation.event}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>Invited by: {invitation.invitedBy}</span>
                          <span>Role: {invitation.role}</span>
                          <span>{invitation.receivedAt}</span>
                        </div>
                        <div className="flex gap-1">
                          {invitation.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">Decline</Button>
                        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600">Accept</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="find-teams" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Find Your Perfect Team</h3>
                <p className="text-slate-600 mb-4">Discover teams looking for members with your skills</p>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600">Browse Available Teams</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

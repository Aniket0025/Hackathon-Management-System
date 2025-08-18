"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Users,
  Plus,
  UserPlus,
  Settings,
  Trophy,
  TrendingUp,
  Award,
  Code,
  Zap,
  Star,
  Activity,
  Timer,
} from "lucide-react"
import Link from "next/link"
import EnhancedDashboardLayout from "@/components/enhanced-dashboard-layout"

const mockParticipant = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  avatar: "/abstract-geometric-shapes.png",
  bio: "Full-stack developer passionate about AI and machine learning",
  skills: ["React", "Python", "Machine Learning", "UI/UX", "Node.js", "TypeScript"],
  experience: "intermediate",
  joinedDate: "2023-06-15",
  completedEvents: 8,
  totalSubmissions: 12,
  averageRating: 4.2,
  achievements: ["First Place Winner", "Best Innovation", "People's Choice"],
  currentStreak: 3,
  totalPoints: 2450,
}

const mockRegisteredEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    status: "upcoming",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    progress: 25,
    daysLeft: 12,
    team: {
      id: 1,
      name: "AI Pioneers",
      members: [
        { id: 1, name: "John Doe", role: "Team Lead", avatar: "/abstract-geometric-shapes.png", status: "online" },
        { id: 2, name: "Jane Smith", role: "Developer", avatar: "/abstract-geometric-shapes.png", status: "online" },
        { id: 3, name: "Mike Johnson", role: "Designer", avatar: "/abstract-geometric-shapes.png", status: "offline" },
      ],
      projectProgress: 35,
      lastActivity: "2 hours ago",
    },
    submissions: 1,
    maxSubmissions: 3,
    prize: "$10,000",
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    status: "active",
    startDate: "2024-02-20",
    endDate: "2024-02-22",
    progress: 75,
    daysLeft: 2,
    team: null,
    submissions: 2,
    maxSubmissions: 2,
    prize: "$5,000",
  },
]

const mockTeamInvites = [
  {
    id: 1,
    teamName: "Green Innovators",
    eventName: "Sustainable Tech Hackathon",
    invitedBy: "Sarah Wilson",
    inviterAvatar: "/abstract-geometric-shapes.png",
    message: "We'd love to have you join our team! Your ML expertise would be perfect for our project.",
    invitedAt: "2024-02-15",
    teamSize: 3,
    maxTeamSize: 5,
    skills: ["Python", "Machine Learning", "Data Science"],
  },
]

const mockAvailableEvents = [
  {
    id: 3,
    name: "FinTech Innovation Sprint",
    description: "Build the future of financial technology",
    startDate: "2024-04-20",
    registrationDeadline: "2024-04-15",
    participants: 89,
    maxParticipants: 200,
    prize: "$15,000",
    difficulty: "Advanced",
    duration: "48 hours",
    tags: ["FinTech", "Blockchain", "AI"],
  },
]

const mockRecentActivity = [
  {
    id: 1,
    type: "submission",
    message: "Submitted project for AI Innovation Challenge",
    time: "2 hours ago",
    icon: Code,
  },
  { id: 2, type: "team", message: "Joined team 'AI Pioneers'", time: "1 day ago", icon: Users },
  { id: 3, type: "achievement", message: "Earned 'Innovation Master' badge", time: "3 days ago", icon: Award },
  { id: 4, type: "event", message: "Registered for FinTech Innovation Sprint", time: "1 week ago", icon: Calendar },
]

export default function ParticipantDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const handleAcceptInvite = (inviteId: number) => {
    console.log("[v0] Accepting team invite:", inviteId)
  }

  const handleDeclineInvite = (inviteId: number) => {
    console.log("[v0] Declining team invite:", inviteId)
  }

  return (
    <EnhancedDashboardLayout userRole="participant">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Welcome back, {mockParticipant.name.split(" ")[0]}!
            </h1>
            <p className="text-slate-600 mt-2">Track your progress and discover new opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/participant/profile">
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              asChild
            >
              <Link href="/events">
                <Plus className="w-4 h-4 mr-2" />
                Find Events
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="invites">
              Invites
              {mockTeamInvites.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {mockTeamInvites.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{mockRegisteredEvents.length}</div>
                  <p className="text-xs text-slate-600">+1 this month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Star className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {mockParticipant.totalPoints.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-600">Rank #47 globally</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Streak</CardTitle>
                  <Trophy className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{mockParticipant.currentStreak}</div>
                  <p className="text-xs text-slate-600">events in a row</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{mockParticipant.averageRating}/5.0</div>
                  <p className="text-xs text-slate-600">across {mockParticipant.totalSubmissions} projects</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-600" />
                    Active Events Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRegisteredEvents.map((event) => (
                    <div key={event.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">{event.name}</h4>
                        <Badge variant={event.status === "active" ? "default" : "secondary"}>{event.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium">{event.progress}%</span>
                        </div>
                        <Progress value={event.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {event.daysLeft} days left
                          </span>
                          <span>
                            {event.submissions}/{event.maxSubmissions} submissions
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <activity.icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900">{activity.message}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Your Profile & Achievements</CardTitle>
                <CardDescription>Your participant information and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20 ring-4 ring-cyan-100">
                    <AvatarImage src={mockParticipant.avatar || "/placeholder.svg"} alt={mockParticipant.name} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{mockParticipant.name}</h3>
                      <p className="text-slate-600">{mockParticipant.email}</p>
                      <p className="text-sm text-slate-600 mt-1">{mockParticipant.bio}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {mockParticipant.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Achievements</h4>
                        <div className="space-y-1">
                          {mockParticipant.achievements.slice(0, 3).map((achievement) => (
                            <div key={achievement} className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-amber-500" />
                              <span className="text-xs text-slate-600">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Stats</h4>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div>Events Completed: {mockParticipant.completedEvents}</div>
                          <div>Total Submissions: {mockParticipant.totalSubmissions}</div>
                          <div>Member Since: {new Date(mockParticipant.joinedDate).getFullYear()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/participant/profile">
                      <Settings className="w-4 h-4 mr-1" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Available Events</CardTitle>
                <CardDescription className="font-serif">Discover new hackathons and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAvailableEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium font-sans">{event.name}</h4>
                        <p className="text-sm text-muted-foreground font-serif">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-serif">
                          <span>Starts: {new Date(event.startDate).toLocaleDateString()}</span>
                          <span>
                            {event.participants}/{event.maxParticipants} registered
                          </span>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/events/${event.id}/register`}>Register</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-6">
              {mockRegisteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-sans">{event.name}</CardTitle>
                        <CardDescription className="font-serif">
                          {new Date(event.startDate).toLocaleDateString()} -{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={event.status === "active" ? "default" : "secondary"}>{event.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.team ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium font-sans">Team: {event.team.name}</h4>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/teams/${event.team.id}`}>Manage Team</Link>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.team.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-serif">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-serif">Individual participation</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/events/${event.id}/teams`}>Find Team</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid gap-6">
              {mockRegisteredEvents
                .filter((event) => event.team)
                .map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-sans">{event.team!.name}</CardTitle>
                          <CardDescription className="font-serif">For {event.name}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/teams/${event.team!.id}`}>
                            <Settings className="w-4 h-4 mr-1" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium font-sans mb-2">Team Members</h4>
                          <div className="space-y-2">
                            {event.team!.members.map((member) => (
                              <div key={member.id} className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium font-sans">{member.name}</p>
                                  <p className="text-sm text-muted-foreground font-serif">{member.role}</p>
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

          <TabsContent value="invites" className="space-y-6">
            {mockTeamInvites.length > 0 ? (
              <div className="grid gap-6">
                {mockTeamInvites.map((invite) => (
                  <Card key={invite.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-sans">Team Invitation</CardTitle>
                          <CardDescription className="font-serif">
                            {invite.invitedBy} invited you to join "{invite.teamName}"
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-serif">
                            <strong>Event:</strong> {invite.eventName}
                          </p>
                          <p className="text-sm font-serif">
                            <strong>Invited:</strong> {new Date(invite.invitedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {invite.message && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-serif italic">"{invite.message}"</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAcceptInvite(invite.id)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(invite.id)}>
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-sans mb-2">No Team Invites</h3>
                  <p className="text-muted-foreground font-serif">You don't have any pending team invitations.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your hackathon performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Success Rate</span>
                      <span className="font-semibold">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Team Collaboration</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Innovation Score</span>
                      <span className="font-semibold">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                  <CardDescription>Track your skill growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["React", "Python", "Machine Learning", "UI/UX"].map((skill, index) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{skill}</span>
                          <span className="font-semibold">{85 - index * 5}%</span>
                        </div>
                        <Progress value={85 - index * 5} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  )
}

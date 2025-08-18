"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  MessageSquare,
  Users,
  Megaphone,
  Search,
  Filter,
  Send,
  Pin,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CommunicationsHub() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "announcement",
      title: "Hackathon Kickoff in 2 Hours!",
      message: "Get ready for an amazing 48-hour coding journey. Check your team assignments and project requirements.",
      timestamp: "2 hours ago",
      priority: "high",
      read: false,
      author: "Event Organizer",
      avatar: "/desk-organizer.png",
    },
    {
      id: 2,
      type: "team",
      title: "New Team Member Joined",
      message: 'Sarah Chen has joined your team "AI Innovators". Welcome her to the group!',
      timestamp: "4 hours ago",
      priority: "medium",
      read: false,
      author: "Team System",
      avatar: "/diverse-professional-team.png",
    },
    {
      id: 3,
      type: "submission",
      title: "Submission Deadline Reminder",
      message:
        "Don't forget to submit your project by tomorrow 11:59 PM. Upload your final presentation and demo video.",
      timestamp: "6 hours ago",
      priority: "high",
      read: true,
      author: "System",
      avatar: "/interconnected-system.png",
    },
  ])

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome to TechHack 2024!",
      content: "We're excited to have 500+ participants from around the world. Let's build something amazing together!",
      author: "John Smith",
      role: "Lead Organizer",
      timestamp: "1 hour ago",
      pinned: true,
      reactions: { likes: 45, hearts: 23, fire: 12 },
      comments: 8,
    },
    {
      id: 2,
      title: "Mentor Office Hours Schedule",
      content: "Our expert mentors will be available for 1-on-1 sessions. Book your slots in the mentorship section.",
      author: "Sarah Johnson",
      role: "Mentor Coordinator",
      timestamp: "3 hours ago",
      pinned: false,
      reactions: { likes: 28, hearts: 15, fire: 7 },
      comments: 12,
    },
  ])

  const [teamChats, setTeamChats] = useState([
    {
      id: 1,
      teamName: "AI Innovators",
      lastMessage: "Let's finalize the ML model architecture",
      timestamp: "5 min ago",
      unread: 3,
      members: 4,
      avatar: "/ai-team.png",
    },
    {
      id: 2,
      teamName: "Web Wizards",
      lastMessage: "Frontend is looking great! 🚀",
      timestamp: "12 min ago",
      unread: 0,
      members: 3,
      avatar: "/web-team-collaboration.png",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="h-4 w-4" />
      case "team":
        return <Users className="h-4 w-4" />
      case "submission":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-amber-500 bg-amber-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Communication Hub
              </h1>
              <p className="text-slate-600 mt-2">Stay connected with your team and event updates</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input placeholder="Search messages..." className="pl-10 w-64" />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              <Badge variant="destructive" className="ml-1">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="team-chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Team Chat
              <Badge variant="secondary" className="ml-1">
                2
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Activity
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Notifications</h2>
              <Button variant="outline" size="sm">
                Mark All Read
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all duration-200 hover:shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? "ring-2 ring-cyan-100" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{notification.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                          <Badge
                            variant={notification.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.timestamp}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              Reply
                            </Button>
                            <Button variant="ghost" size="sm">
                              Archive
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Event Announcements</h2>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                <Megaphone className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="transition-all duration-200 hover:shadow-lg border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/desk-organizer.png" />
                        <AvatarFallback>{announcement.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-slate-900">{announcement.title}</h3>
                          {announcement.pinned && <Pin className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-medium text-slate-700">{announcement.author}</span>
                          <Badge variant="outline">{announcement.role}</Badge>
                          <span className="text-slate-500">•</span>
                          <span className="text-sm text-slate-500">{announcement.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mb-4 leading-relaxed">{announcement.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-red-500">
                              ❤️ {announcement.reactions.hearts}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-500">
                              👍 {announcement.reactions.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-orange-500">
                              🔥 {announcement.reactions.fire}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {announcement.comments} Comments
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Team Chat Tab */}
          <TabsContent value="team-chat" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team List */}
              <div className="lg:col-span-1">
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Your Teams
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teamChats.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={team.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{team.teamName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-900 truncate">{team.teamName}</h4>
                            {team.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {team.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{team.lastMessage}</p>
                          <span className="text-xs text-slate-400">{team.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/ai-team.png" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>AI Innovators</CardTitle>
                        <CardDescription>4 members • 2 online</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Sample messages */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/abstract-geometric-shapes.png" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">John Doe</span>
                            <span className="text-xs text-slate-500">2:30 PM</span>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-3 max-w-md">
                            <p className="text-sm">
                              Hey team! I've finished the data preprocessing pipeline. Ready to move on to model
                              training?
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 justify-end">
                        <div className="flex-1 flex justify-end">
                          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg p-3 max-w-md">
                            <p className="text-sm">
                              Awesome work! Let's use the transformer architecture we discussed. I'll set up the
                              training environment.
                            </p>
                          </div>
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/abstract-geometric-shapes.png" />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Live Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Live Activity Feed</h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  user: "Alex Chen",
                  action: 'submitted project "Smart City Dashboard"',
                  time: "2 min ago",
                  type: "submission",
                },
                { user: "Team Rocket", action: "updated their project repository", time: "5 min ago", type: "update" },
                { user: "Sarah Kim", action: 'joined team "Web Wizards"', time: "8 min ago", type: "team" },
                {
                  user: "Mike Johnson",
                  action: "started a new discussion in General",
                  time: "12 min ago",
                  type: "discussion",
                },
                {
                  user: "Emma Davis",
                  action: "completed mentor session with Dr. Smith",
                  time: "15 min ago",
                  type: "mentor",
                },
              ].map((activity, index) => (
                <Card key={index} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          activity.type === "submission"
                            ? "bg-green-500"
                            : activity.type === "update"
                              ? "bg-blue-500"
                              : activity.type === "team"
                                ? "bg-purple-500"
                                : activity.type === "discussion"
                                  ? "bg-amber-500"
                                  : "bg-cyan-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium text-slate-900">{activity.user}</span>
                          <span className="text-slate-600"> {activity.action}</span>
                        </p>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

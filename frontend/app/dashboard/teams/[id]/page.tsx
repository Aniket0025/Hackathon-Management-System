"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, UserPlus, Mail, Settings, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock team data
const mockTeam = {
  id: 1,
  name: "AI Pioneers",
  description: "Building the next generation of AI-powered applications for social good",
  eventId: 1,
  eventName: "AI Innovation Challenge 2024",
  createdAt: "2024-02-10",
  members: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Team Lead",
      avatar: "/placeholder.svg?height=40&width=40",
      skills: ["React", "Python", "Machine Learning"],
      joinedAt: "2024-02-10",
      isLeader: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Full Stack Developer",
      avatar: "/placeholder.svg?height=40&width=40",
      skills: ["Node.js", "React", "PostgreSQL"],
      joinedAt: "2024-02-12",
      isLeader: false,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "UI/UX Designer",
      avatar: "/placeholder.svg?height=40&width=40",
      skills: ["Figma", "UI/UX", "Prototyping"],
      joinedAt: "2024-02-13",
      isLeader: false,
    },
  ],
  invites: [
    {
      id: 1,
      email: "sarah@example.com",
      name: "Sarah Wilson",
      message: "We'd love to have you join our AI team!",
      sentAt: "2024-02-15",
      status: "pending",
    },
  ],
}

export default function TeamManagementPage({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState(mockTeam)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const handleSendInvite = () => {
    if (!inviteEmail) return

    const newInvite = {
      id: Date.now(),
      email: inviteEmail,
      name: inviteEmail.split("@")[0],
      message: inviteMessage,
      sentAt: new Date().toISOString().split("T")[0],
      status: "pending" as const,
    }

    setTeam((prev) => ({
      ...prev,
      invites: [...prev.invites, newInvite],
    }))

    console.log("[v0] Sending team invite:", newInvite)
    setInviteEmail("")
    setInviteMessage("")
    setIsInviteDialogOpen(false)
  }

  const handleRemoveMember = (memberId: number) => {
    setTeam((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== memberId),
    }))
    console.log("[v0] Removing team member:", memberId)
  }

  const handleUpdateTeam = (field: string, value: string) => {
    setTeam((prev) => ({ ...prev, [field]: value }))
    console.log("[v0] Updating team:", { field, value })
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/participant">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">{team.name}</h1>
            <p className="text-muted-foreground font-serif">For {team.eventName}</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Team Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-sans">{team.name}</CardTitle>
                    <CardDescription className="font-serif">
                      Created on {new Date(team.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{team.members.length} members</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-serif">{team.description}</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-serif">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">{team.members.length}</div>
                  <p className="text-xs text-muted-foreground font-serif">Active members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-serif">Pending Invites</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">{team.invites.length}</div>
                  <p className="text-xs text-muted-foreground font-serif">Awaiting response</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-serif">Days Active</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {Math.floor((Date.now() - new Date(team.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <p className="text-xs text-muted-foreground font-serif">Since creation</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Recent Activity</CardTitle>
                <CardDescription className="font-serif">Latest team updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="font-serif">Mike Johnson joined the team</span>
                    <span className="text-muted-foreground font-serif">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="font-serif">Team description updated</span>
                    <span className="text-muted-foreground font-serif">3 days ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <span className="font-serif">Team created</span>
                    <span className="text-muted-foreground font-serif">5 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Invite Member */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="font-sans">Team Members</CardTitle>
                    <CardDescription className="font-serif">Manage your team composition</CardDescription>
                  </div>
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-sans">Invite Team Member</DialogTitle>
                        <DialogDescription className="font-serif">
                          Send an invitation to join your team
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail" className="font-serif">
                            Email Address
                          </Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="font-serif"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inviteMessage" className="font-serif">
                            Personal Message (Optional)
                          </Label>
                          <Textarea
                            id="inviteMessage"
                            placeholder="Add a personal message to your invitation..."
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            className="font-serif"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSendInvite} disabled={!inviteEmail}>
                            Send Invite
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium font-sans">{member.name}</h4>
                            {member.isLeader && <Crown className="w-4 h-4 text-amber-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground font-serif">{member.email}</p>
                          <p className="text-sm font-serif">{member.role}</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-serif">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                        {!member.isLeader && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Invites */}
            {team.invites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Pending Invites</CardTitle>
                  <CardDescription className="font-serif">Invitations waiting for response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.invites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium font-sans">{invite.email}</p>
                          <p className="text-sm text-muted-foreground font-serif">
                            Invited on {new Date(invite.sentAt).toLocaleDateString()}
                          </p>
                          {invite.message && <p className="text-sm font-serif italic mt-1">"{invite.message}"</p>}
                        </div>
                        <Badge variant="secondary">{invite.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Team Settings</CardTitle>
                <CardDescription className="font-serif">Update your team information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="font-serif">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    value={team.name}
                    onChange={(e) => handleUpdateTeam("name", e.target.value)}
                    className="font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamDescription" className="font-serif">
                    Team Description
                  </Label>
                  <Textarea
                    id="teamDescription"
                    value={team.description}
                    onChange={(e) => handleUpdateTeam("description", e.target.value)}
                    className="min-h-[100px] font-serif"
                  />
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive font-sans">Danger Zone</CardTitle>
                <CardDescription className="font-serif">Irreversible actions for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium font-sans">Leave Team</h4>
                      <p className="text-sm text-muted-foreground font-serif">
                        Remove yourself from this team permanently
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Leave Team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useEffect } from "react"
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
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  useEffect(() => {
    router.replace("/")
  }, [router])
  return null
}

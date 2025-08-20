"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, Video, FileText, Plus, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useRouter } from "next/navigation"

// Mock submissions data
const mockSubmissions = [
  {
    id: 1,
    eventId: 1,
    eventName: "AI Innovation Challenge 2024",
    projectName: "EcoAI Assistant",
    description: "An AI-powered assistant that helps users make environmentally conscious decisions",
    status: "submitted",
    submittedAt: "2024-03-14T15:30:00",
    lastUpdated: "2024-03-14T15:30:00",
    round: "final",
    teamName: "AI Pioneers",
    githubUrl: "https://github.com/ai-pioneers/ecoai-assistant",
    demoUrl: "https://ecoai-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=demo123",
    files: [
      { name: "project-documentation.pdf", size: "2.4 MB", type: "application/pdf" },
      { name: "demo-video.mp4", size: "45.2 MB", type: "video/mp4" },
      { name: "presentation.pptx", size: "8.1 MB", type: "application/vnd.ms-powerpoint" },
    ],
    judgeScore: 8.5,
    feedback: "Excellent implementation with strong environmental impact potential.",
  },
  {
    id: 2,
    eventId: 2,
    eventName: "Sustainable Tech Hackathon",
    projectName: "GreenTracker",
    description: "Mobile app for tracking personal carbon footprint",
    status: "draft",
    submittedAt: null,
    lastUpdated: "2024-02-20T10:15:00",
    round: "preliminary",
    teamName: null, // Individual submission
    githubUrl: "https://github.com/johndoe/greentracker",
    demoUrl: "",
    videoUrl: "",
    files: [{ name: "wireframes.pdf", size: "1.2 MB", type: "application/pdf" }],
    judgeScore: null,
    feedback: null,
  },
]

const mockEvents = [
  {
    id: 1,
    name: "AI Innovation Challenge 2024",
    submissionDeadline: "2024-03-15T23:59:00",
    status: "active",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary", "final"],
    currentRound: "final",
  },
  {
    id: 2,
    name: "Sustainable Tech Hackathon",
    submissionDeadline: "2024-02-22T23:59:00",
    status: "active",
    allowedFileTypes: [".pdf", ".doc", ".docx", ".mp4", ".mov", ".zip"],
    maxFileSize: "50MB",
    rounds: ["preliminary"],
    currentRound: "preliminary",
  },
]

export default function SubmissionsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/")
  }, [router])
  return null
}

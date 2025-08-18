"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Users,
  Trophy,
  Zap,
  Shield,
  Globe,
  Brain,
  Rocket,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  Sparkles,
  Bot,
  Network,
  BarChart3,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { RealTimeActivityFeed } from "@/components/real-time-activity-feed"
import { InteractiveStatsDashboard } from "@/components/interactive-stats-dashboard"
import { AdvancedNavigation } from "@/components/advanced-navigation"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [startHref, setStartHref] = useState<string>("/auth/register")
  const [stats, setStats] = useState({
    events: 0,
    participants: 0,
    projects: 0,
    success: 0,
  })

  useEffect(() => {
    setIsVisible(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Compute target for Start CTA based on auth/role
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            const role = data?.user?.role
            if (role === "organizer") setStartHref("/events/create")
            else if (role) setStartHref("/events")
          })
          .catch(() => {})
      }
    } catch {}

    // Animate counters
    const targets = { events: 2500, participants: 150000, projects: 45000, success: 98 }
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        events: Math.floor(targets.events * progress),
        participants: Math.floor(targets.participants * progress),
        projects: Math.floor(targets.projects * progress),
        success: Math.floor(targets.success * progress),
      })

      if (currentStep >= steps) clearInterval(timer)
    }, stepTime)

    // Cycle through features
    const featureTimer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(featureTimer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const advancedFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Team Matching",
      description: "Smart algorithms match participants based on skills, interests, and project goals",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Bot,
      title: "Automated Plagiarism Detection",
      description: "Advanced AI scans submissions for originality and provides detailed reports",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Network,
      title: "Real-Time Collaboration Hub",
      description: "Live coding environments, video calls, and instant messaging integrated",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics Dashboard",
      description: "Deep insights into participant behavior, engagement, and success metrics",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Award,
      title: "Dynamic Certificate Generation",
      description: "AI-generated certificates with blockchain verification and NFT integration",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Sparkles,
      title: "Intelligent Project Recommendations",
      description: "ML-powered suggestions for project ideas, resources, and mentorship",
      gradient: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 md:-top-40 -right-20 md:-right-40 w-40 md:w-80 h-40 md:h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl md:blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 md:-bottom-40 -left-20 md:-left-40 w-40 md:w-80 h-40 md:h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl md:blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 md:w-96 h-48 md:h-96 bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-full blur-2xl md:blur-3xl animate-spin-slow"></div>
      </div>

      <AdvancedNavigation currentPath="/" />

      <section className="relative py-16 md:py-24 px-4 sm:px-6">
        <div
          className={`container mx-auto text-center max-w-6xl transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="flex justify-center mb-4 md:mb-6">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium"
            >
              <Sparkles className="w-3 md:w-4 h-3 md:h-4 mr-1.5 md:mr-2" />
              Next-Generation Event Platform
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight px-2">
            Host Hackathons That
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
              Transform Ideas Into Reality
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            The world's most advanced platform for organizing innovation events. Powered by AI, built for scale,
            designed for success. Join the future of hackathon hosting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 px-4">
            <Button
              size={isMobile ? "default" : "lg"}
              asChild
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg min-h-[48px] touch-manipulation"
            >
              <Link href={startHref} className="flex items-center justify-center gap-2">
                <Rocket className="w-4 md:w-5 h-4 md:h-5" />
                Start Your Event
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
              </Link>
            </Button>
            <Button
              size={isMobile ? "default" : "lg"}
              variant="outline"
              asChild
              className="border-2 border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg transition-all duration-300 bg-transparent min-h-[48px] touch-manipulation"
            >
              <Link href="/demo" className="flex items-center justify-center gap-2">
                <Play className="w-4 md:w-5 h-4 md:h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {stats.events.toLocaleString()}+
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Events Hosted</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.participants.toLocaleString()}+
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Participants</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats.projects.toLocaleString()}+
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Projects Created</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats.success}%
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="ai-features"
        className="relative py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-r from-slate-50 to-cyan-50"
      >
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-4 px-3 py-1.5 text-sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Intelligence
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6 px-2">
              Advanced Features That
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
                Think Ahead
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
              Harness the power of artificial intelligence to create smarter, more engaging hackathon experiences
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              {advancedFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 touch-manipulation ${
                    activeFeature === index
                      ? "ring-2 ring-cyan-500 shadow-xl bg-gradient-to-r from-white to-cyan-50"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardHeader className="pb-3 p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <feature.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg font-bold text-slate-900 leading-tight">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm md:text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="w-full h-64 md:h-96 bg-gradient-to-br from-slate-100 to-cyan-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"></div>
                <div className="relative h-full flex items-center justify-center">
                  <div
                    className={`w-24 md:w-32 h-24 md:h-32 rounded-full bg-gradient-to-r ${advancedFeatures[activeFeature].gradient} flex items-center justify-center shadow-2xl animate-pulse`}
                  >
                    {React.createElement(advancedFeatures[activeFeature].icon, {
                      className: "w-12 md:w-16 h-12 md:h-16 text-white",
                    })}
                  </div>
                </div>
                <div className="absolute top-2 md:top-4 right-2 md:right-4 w-12 md:w-16 h-12 md:h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-6 md:w-8 h-6 md:h-8 text-amber-500" />
                </div>
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 w-10 md:w-12 h-10 md:h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-500">
                  <CheckCircle className="w-5 md:w-6 h-5 md:h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add new section after AI features */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 mb-4">
              <Activity className="w-4 h-4 mr-2" />
              Live Platform Insights
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Real-Time Platform
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block">
                Activity & Analytics
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Watch your hackathon come alive with real-time participant activity and comprehensive analytics
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Real-time Activity Feed */}
            <div className="lg:col-span-1">
              <RealTimeActivityFeed />
            </div>

            {/* Interactive Stats Dashboard */}
            <div className="lg:col-span-2">
              <InteractiveStatsDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6 px-2">
              Everything You Need to
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent block mt-2">
                Run Successful Events
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
              From registration to judging, we've revolutionized every aspect of hackathon management
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Calendar,
                title: "Smart Event Management",
                description: "AI-assisted event configuration with automated scheduling and resource optimization",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Users,
                title: "Intelligent Team Formation",
                description: "ML-powered matching system that creates balanced teams based on skills and goals",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Trophy,
                title: "Advanced Judging System",
                description: "Multi-round evaluation with bias detection and automated scoring algorithms",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level security with blockchain verification and encrypted communications",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Globe,
                title: "Real-Time Collaboration",
                description: "Integrated development environments with live coding and instant feedback",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                icon: TrendingUp,
                title: "Predictive Analytics",
                description: "AI-driven insights that predict success patterns and optimize event outcomes",
                gradient: "from-rose-500 to-pink-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-0 bg-gradient-to-br from-white to-slate-50 touch-manipulation"
              >
                <CardHeader className="pb-4 md:pb-6 p-4 md:p-6">
                  <div
                    className={`w-12 md:w-16 h-12 md:h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 md:w-8 h-6 md:h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Newsletter Signup */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Stay Ahead of Innovation</h3>
          <p className="text-cyan-100 mb-6 md:mb-8 max-w-2xl mx-auto text-base md:text-lg">
            Get exclusive insights, feature updates, and success stories from the world's leading hackathon platform
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-cyan-100 focus:bg-white/20 min-h-[48px] touch-manipulation"
            />
            <Button className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold min-h-[48px] px-6 touch-manipulation">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-slate-50 to-cyan-50 shadow-2xl">
            <CardHeader className="pb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ready to Transform Your Next
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent block">
                  Innovation Event?
                </span>
              </CardTitle>
              <CardDescription className="text-xl text-slate-600 max-w-2xl mx-auto">
                Join thousands of organizers who trust HackHost to power their most ambitious events
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xl px-8 py-4 text-lg"
                >
                  <Link href="/auth/register" className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-slate-300 hover:border-cyan-500 px-8 py-4 text-lg bg-transparent"
                >
                  <Link href="/demo">Schedule Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">HackHost</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                The world's most advanced platform for hosting innovation events and hackathons.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Features
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  AI Tools
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Analytics
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Security
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Documentation
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  API Reference
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Best Practices
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Case Studies
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  About Us
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Careers
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Contact
                </Link>
                <Link href="#" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">© 2024 HackHost. Built for the innovation community.</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

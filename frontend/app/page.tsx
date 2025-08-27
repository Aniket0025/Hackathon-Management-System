"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Zap,
  Rocket,
  Star,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import Image from "next/image"
import AnimatedMarquee from "@/components/animated-marquee"
import TestimonialCarousel from "@/components/testimonial-carousel"

const RealTimeActivityFeed = dynamic(
  () => import("@/components/real-time-activity-feed").then(m => ({ default: m.RealTimeActivityFeed })),
  { ssr: false, loading: () => <div className="h-64 rounded-xl border border-slate-200 animate-pulse" /> }
)

const InteractiveStatsDashboard = dynamic(
  () => import("@/components/interactive-stats-dashboard").then(m => ({ default: m.InteractiveStatsDashboard })),
  { ssr: false, loading: () => <div className="h-80 rounded-xl border border-slate-200 animate-pulse" /> }
)

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [startHref, setStartHref] = useState<string>("/auth/register")
  const feedRef = useRef<HTMLDivElement | null>(null)
  const [feedVisible, setFeedVisible] = useState(true)
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

    // Fetch real-time stats from backend and poll periodically
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
    let pollId: number | undefined

    async function fetchRealtimeStats() {
      try {
        const [dashRes, eventsRes] = await Promise.all([
          fetch(`${base}/api/analytics/dashboard`).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`${base}/api/analytics/events`).then(r => r.ok ? r.json() : Promise.reject(r)),
        ])

        const eventsCount = Array.isArray(eventsRes?.data) ? eventsRes.data.length : 0
        const totalParticipants = dashRes?.data?.totalParticipants ?? 0
        const projectsSubmitted = dashRes?.data?.projectsSubmitted ?? 0
        const successRate = Math.round((dashRes?.data?.successRate ?? 0))

        setStats({
          events: eventsCount,
          participants: totalParticipants,
          projects: projectsSubmitted,
          success: successRate,
        })
      } catch (e) {
        // keep previous stats on error
      }
    }

    fetchRealtimeStats()
    pollId = window.setInterval(fetchRealtimeStats, 30000) // refresh every 30s

    return () => {
      window.removeEventListener("resize", checkMobile)
      if (pollId) window.clearInterval(pollId)
    }
  }, [])

  // Observe real-time feed visibility to pause/resume updates while scrolling
  useEffect(() => {
    if (!feedRef.current || typeof window === "undefined") return
    const el = feedRef.current
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setFeedVisible(entry.isIntersecting)
      },
      { root: null, threshold: 0.1 }
    )
    io.observe(el)
    return () => io.unobserve(el)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      <section className="relative py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
        {/* Animated hero background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-emerald-400/40 via-cyan-400/40 to-blue-400/40 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-24 w-72 h-72 md:w-[24rem] md:h-[24rem] rounded-full bg-gradient-to-br from-fuchsia-400/30 via-pink-400/30 to-rose-400/30 blur-3xl animate-[floatAlt_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 left-1/3 w-[60rem] h-[60rem] -translate-x-1/2 translate-y-1/2 bg-[radial-gradient(closest-side,rgba(56,189,248,0.18),transparent_60%)]" />
        </div>
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

          {/* Feature pills under hero */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-10 md:mb-14 px-4">
            {[
              { label: 'Efficient Team Matching', icon: Sparkles },
              { label: 'Live Analytics', icon: Activity },
              { label: 'Top Rated by Organizers', icon: Star },
              { label: 'Vibrant Community Hub', icon: Users },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative inline-flex items-center gap-2 rounded-full border-2 border-emerald-300/50 bg-white/80 backdrop-blur px-3.5 md:px-4 py-2 text-sm font-medium text-slate-800 shadow-[0_8px_30px_rgb(16_185_129_/0.15)] ring-1 ring-emerald-200/60 hover:ring-emerald-300/80 transition-all transform-gpu hover:-translate-y-0.5 hover:shadow-emerald-500/30"
              >
                <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-400/0 via-cyan-400/0 to-blue-400/0 blur opacity-0 group-hover:opacity-100 group-hover:from-emerald-400/20 group-hover:via-cyan-400/20 group-hover:to-blue-400/20 transition-opacity" />
                <item.icon className="w-4 h-4 text-emerald-600" />
                {item.label}
              </div>
            ))}
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
              size={isMobile ? "default" : "xl"}
              variant="cta"
              asChild
              className="px-7 md:px-9 py-4 md:py-5 text-base md:text-lg min-h-[52px] shadow-2xl shadow-emerald-600/30 ring-2 ring-emerald-300/60 hover:ring-emerald-400/80 transform-gpu transition-all hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0"
            >
              <Link href={startHref} className="flex items-center justify-center gap-2">
                <Rocket className="w-4 md:w-5 h-4 md:h-5" />
                Start Your Event
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
            <div className="text-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {stats.events.toLocaleString()}+
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Events Hosted</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.participants.toLocaleString()}+
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Participants</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats.projects.toLocaleString()}+
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Projects Created</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats.success}%
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">Success Rate</div>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px -z-10">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-[80px] md:h-[120px]">
            <path fill="url(#hero-gradient)" d="M0,64 C240,144 480,0 720,64 C960,128 1200,96 1440,48 L1440,160 L0,160 Z" opacity="0.25" />
            <path fill="url(#hero-gradient)" d="M0,96 C240,32 480,160 720,96 C960,32 1200,80 1440,112 L1440,160 L0,160 Z" opacity="0.4" />
            <defs>
              <linearGradient id="hero-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Moving brand marquee */}
      <section className="px-4 sm:px-6">
        <div className="container mx-auto">
          <AnimatedMarquee />
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
            <div className="lg:col-span-1" ref={feedRef}>
              <RealTimeActivityFeed active={feedVisible} />
            </div>

            {/* Interactive Stats Dashboard */}
            <div className="lg:col-span-2">
              <InteractiveStatsDashboard />
            </div>
          </div>
        </div>
      </section>

      

      {/* Testimonials Carousel */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 mb-4">
              Trusted by Innovators
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
              What the Community Says
            </h2>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Enhanced Newsletter Signup */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-cyan-600">
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
            <Button variant="glass" className="font-semibold min-h-[48px] px-6 touch-manipulation">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-4xl mx-auto border border-slate-200 bg-white shadow-md transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-2xl">
            <CardHeader className="pb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ready to Transform Your Next
                <span className="text-slate-900 block">
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
                  size="xl"
                  variant="cta"
                  asChild
                  className="px-8 py-5 text-lg shadow-2xl shadow-emerald-600/30 ring-2 ring-emerald-300/60 hover:ring-emerald-400/80 transform-gpu transition-all hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0"
                >
                  <Link href="/auth/register" className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start Free Trial
                  </Link>
                </Button>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-slate-900 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/hackhost-logo.png"
                  alt="HackHost"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  priority
                />
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
            <p className="text-slate-400 text-sm mb-4 md:mb-0"> 2025 HackHost. Built for the innovation community.</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </footer>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) }
          50% { transform: translateY(-16px) translateX(8px) }
        }
        @keyframes floatAlt {
          0%, 100% { transform: translateY(0) translateX(0) }
          50% { transform: translateY(14px) translateX(-10px) }
        }
      `}</style>
      
    </div>
  )
}

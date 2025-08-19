"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Trophy,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Zap,
  TrendingUp,
  ChevronDown,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "organizer" | "participant" | "judge"
}

export default function EnhancedDashboardLayout({ children, userRole = "participant" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()

  const navigation = {
    organizer: [
      { name: "Judges", href: "/dashboard/organizer/judges", icon: Users },
      { name: "Evaluations", href: "/dashboard/organizer/evaluations", icon: Trophy },
    ],
    participant: [
      { name: "Dashboard", href: "/dashboard/participant", icon: Home },
      { name: "My Events", href: "/dashboard/participant/events", icon: Calendar },
      { name: "Teams", href: "/dashboard/participant/teams", icon: Users },
      { name: "Submissions", href: "/dashboard/participant/submissions", icon: FileText },
      { name: "Communications", href: "/dashboard/communications", icon: MessageSquare },
      { name: "Profile", href: "/dashboard/participant/profile", icon: Settings },
    ],
    judge: [
      { name: "Dashboard", href: "/dashboard/judge", icon: Home },
      { name: "Evaluations", href: "/dashboard/judge/evaluations", icon: Trophy },
      { name: "Events", href: "/dashboard/judge/events", icon: Calendar },
      { name: "Analytics", href: "/dashboard/judge/analytics", icon: TrendingUp },
      { name: "Communications", href: "/dashboard/communications", icon: MessageSquare },
      { name: "Profile", href: "/dashboard/judge/profile", icon: Settings },
    ],
  }

  const currentNav = navigation[userRole]

  const quickStats = {
    organizer: [
      { label: "Active Events", value: "12", trend: "+2", color: "text-green-600" },
      { label: "Total Participants", value: "1,247", trend: "+156", color: "text-blue-600" },
      { label: "Submissions", value: "89", trend: "+23", color: "text-purple-600" },
    ],
    participant: [
      { label: "Events Joined", value: "3", trend: "+1", color: "text-green-600" },
      { label: "Team Members", value: "4", trend: "0", color: "text-blue-600" },
      { label: "Submissions", value: "2", trend: "+1", color: "text-purple-600" },
    ],
    judge: [
      { label: "Projects to Review", value: "15", trend: "-3", color: "text-amber-600" },
      { label: "Completed Reviews", value: "28", trend: "+5", color: "text-green-600" },
      { label: "Average Score", value: "8.2", trend: "+0.3", color: "text-blue-600" },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <img src="/hackhost-logo.png" alt="HackHost" className="h-8 w-auto rounded" />
              <span className="text-xl font-bold text-slate-900">HackHost</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-cyan-100">
                <AvatarImage src="/abstract-geometric-shapes.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">John Doe</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {userRole}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-500">Online</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Stats</h4>
            <div className="space-y-3">
              {quickStats[userRole].map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{stat.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-900">{stat.value}</span>
                    <span className={cn("text-xs", stat.color)}>{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {currentNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                    {item.name === "Communications" && notifications > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200">
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900">
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-50 h-16 glass-header flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 w-80 rounded-lg border border-white/20 bg-white/40 text-slate-800 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{notifications}</span>
                </div>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600 hidden sm:block">
                {userRole === "organizer"
                  ? "Managing Events"
                  : userRole === "judge"
                    ? "Reviewing Projects"
                    : "Participating"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

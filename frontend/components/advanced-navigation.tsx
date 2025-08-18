"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Settings,
  User,
  Menu,
  X,
  Home,
  Calendar,
  Users,
  Trophy,
  MessageSquare,
  BarChart3,
  Zap,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"

interface NavigationProps {
  currentPath?: string
}

export function AdvancedNavigation({ currentPath = "/" }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // simple demo notifications; replace with API later
  const [notifItems, setNotifItems] = useState<{ id: string; title: string; time: string; read?: boolean }[]>([
    { id: "1", title: "Your team was invited to Event X", time: "2m ago" },
    { id: "2", title: "New comment on your community post", time: "15m ago" },
    { id: "3", title: "Submission approved by judge", time: "1h ago" },
  ])
  const notifications = notifItems.filter((n) => !n.read).length
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check auth state from stored token
  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      setIsAuthed(!!token)
    } catch {
      setIsAuthed(false)
    }
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
    } catch {}
    setIsAuthed(false)
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
  }

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/my-apply", label: "My Apply", icon: Users },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/community", label: "Community", icon: MessageSquare },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ]

  const markAllRead = () => {
    setNotifItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }
  const clearAll = () => setNotifItems([])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-xl shadow-lg border-b" : "bg-white/80 backdrop-blur-xl"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Zap className="w-4 md:w-6 h-4 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              HackHost
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPath === item.href
                    ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 font-medium"
                    : "text-slate-600 hover:text-cyan-600 hover:bg-cyan-50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative min-h-[40px] min-w-[40px] touch-manipulation">
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 md:w-5 h-4 md:h-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {notifItems.length > 0 ? (
                    <button className="text-xs text-cyan-700 hover:underline" onClick={markAllRead}>
                      Mark all read
                    </button>
                  ) : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifItems.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-slate-500 text-center">You're all caught up!</div>
                ) : (
                  <div className="max-h-80 overflow-auto">
                    {notifItems.map((n) => (
                      <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5">
                        <span className={`text-sm ${n.read ? "text-slate-500" : "text-slate-900 font-medium"}`}>{n.title}</span>
                        <span className="text-xs text-slate-500">{n.time}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                {notifItems.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-red-600" onClick={clearAll}>
                      Clear all
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthed ? (
                <>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="min-h-[40px] px-4">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Button>
                  </Link>
                  <Button size="sm" className="min-h-[40px] px-4" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="min-h-[40px] px-4">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="min-h-[40px] px-4">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden min-h-[44px] min-w-[44px] touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 min-h-[48px] touch-manipulation ${
                    currentPath === item.href
                      ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 font-medium"
                      : "text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Auth Actions (Mobile) */}
              <div className="px-4 pt-2 flex gap-2">
                {isAuthed ? (
                  <>
                    <Link href="/profile" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[44px]">
                        <User className="w-4 h-4 mr-2" /> Profile
                      </Button>
                    </Link>
                    <Button className="flex-1 min-h-[44px]" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[44px]">Sign in</Button>
                    </Link>
                    <Link href="/auth/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full min-h-[44px]">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 rounded-lg transition-all duration-200 min-h-[48px] touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 rounded-lg transition-all duration-200 min-h-[48px] touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Settings</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

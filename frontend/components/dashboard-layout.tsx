"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Users,
  Trophy,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  Zap,
  LogOut,
  User,
  Bell,
} from "lucide-react"
import Link from "next/link"

const BASE_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Participants", href: "/dashboard/participants", icon: Users },
  { name: "Submissions", href: "/dashboard/submissions", icon: Trophy },
  { name: "Communications", href: "/dashboard/communications", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  hideSidebar?: boolean
}

export function DashboardLayout({ children, hideSidebar = false }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const pathname = usePathname()
  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/")
    return pathname === href || pathname.startsWith(href + "/")
  }

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      setIsAuthed(!!token)
    } catch {
      setIsAuthed(false)
    }
  }, [])

  useEffect(() => {
    const loadRole = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { setRole(null); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) { setRole(null); return }
        const me = await res.json()
        const r = me?.user?.role ?? null
        setRole(r)
      } catch {
        setRole(null)
      }
    }
    loadRole()
  }, [isAuthed])

  const navigation = useMemo(() => {
    const items = [...BASE_NAV]
    // Insert Evaluations after Dashboard for organizer or judge roles
    if (role === 'organizer' || role === 'judge') {
      const exists = items.some((i) => i.href === '/dashboard/judge/evaluations')
      if (!exists) {
        items.splice(1, 0, { name: 'Evaluations', href: '/dashboard/judge/evaluations', icon: Trophy })
      }
    }
    return items
  }, [role])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      {!hideSidebar && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-2 px-6 border-b">
                <img src="/hackhost-logo.png" alt="HackHost" className="h-8 w-auto rounded" />
                <span className="text-xl font-bold text-foreground font-sans">HackHost</span>
              </div>
              <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                  const active = isActive(item.href)
                  const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors font-serif"
                  const cls = active
                    ? `${base} bg-accent text-accent-foreground`
                    : `${base} text-muted-foreground hover:bg-accent hover:text-accent-foreground`
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cls}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar */}
      {!hideSidebar && (
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <img src="/hackhost-logo.png" alt="HackHost" className="h-8 w-auto rounded" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href)
                    const base = "flex items-center gap-x-3 rounded-md p-2 text-sm font-medium transition-colors font-serif"
                    const cls = active
                      ? `${base} bg-accent text-accent-foreground`
                      : `${base} text-muted-foreground hover:bg-accent hover:text-accent-foreground`
                    return (
                      <li key={item.name}>
                        <Link href={item.href} className={cls}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      )}

      {/* Main content */}
      <div className={hideSidebar ? undefined : "lg:pl-64"}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {!hideSidebar && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          )}

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
                <span className="sr-only">View notifications</span>
              </Button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none font-sans">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground font-serif">john@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="font-serif">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="font-serif">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-serif">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

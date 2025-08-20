"use client"

import { useState, useEffect, useMemo, useRef, memo, useContext } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SocketContext } from "@/components/realtime/socket-provider"

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
  MessageSquare,
  BarChart3,
  ChevronDown,
  Upload,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

interface NavigationProps {
  currentPath?: string
}

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

// Static nav items to avoid re-creation on every render
const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/my-apply", label: "My Apply", icon: Users },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

const AdvancedNavigationComponent = ({ currentPath }: NavigationProps) => {
  const pathname = usePathname()
  const activePath = currentPath ?? pathname ?? "/"
  const isActive = (href: string) => {
    if (href === "/") return activePath === "/"
    return activePath === href || activePath.startsWith(href + "/")
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Notifications loaded from API
  type Notif = { id: string; title: string; message?: string; type?: string; link?: string; createdAt?: string; read?: boolean }
  const [notifItems, setNotifItems] = useState<Notif[]>([])
  const notifications = notifItems.filter((n) => !n.read).length
  const [notifOpen, setNotifOpen] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState<Notif | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollRaf = useRef<number | null>(null)
  const lastScrolled = useRef<boolean>(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const { socket } = useContext(SocketContext)

  useEffect(() => {
    const onScroll = () => {
      if (scrollRaf.current) return
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = null
        const next = window.scrollY > 10
        if (next !== lastScrolled.current) {
          lastScrolled.current = next
          setIsScrolled(next)
        }
      })
    }
    // Initialize once
    lastScrolled.current = typeof window !== "undefined" ? window.scrollY > 10 : false
    setIsScrolled(lastScrolled.current)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
      window.removeEventListener("scroll", onScroll)
    }
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

  // Load role to conditionally show/hide nav items
  useEffect(() => {
    const loadRole = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { setRole(null); setFirstName(null); setAvatarUrl(null); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) { setRole(null); setFirstName(null); setAvatarUrl(null); return }
        const me = await res.json()
        const r = me?.user?.role ?? null
        const fullName = me?.user?.firstName ?? me?.user?.name ?? null
        const fName = typeof fullName === 'string' ? (fullName.split(" ")[0] || fullName) : null
        const avatar = me?.user?.avatarUrl ?? me?.user?.avatar?.url ?? null
        setRole(r)
        setFirstName(fName)
        setAvatarUrl(typeof avatar === 'string' && avatar.length > 0 ? avatar : null)
      } catch {
        setRole(null)
        setFirstName(null)
        setAvatarUrl(null)
      }
    }
    loadRole()
  }, [isAuthed])

  // Load notifications from backend and subscribe to realtime
  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) { setNotifItems([]); return }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/notifications?status=all&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { setNotifItems([]); return }
        const items = Array.isArray(data.notifications) ? data.notifications : []
        setNotifItems(
          items.map((n: any) => ({
            id: n._id || n.id,
            title: n.title || "Notification",
            message: n.message || "",
            type: n.type || "info",
            link: n.link || "",
            createdAt: n.createdAt,
            read: Array.isArray(n.readBy) ? n.readBy.includes?.(n.userId) || false : !!n.read,
          }))
        )
      } catch {
        setNotifItems([])
      }
    }
    load()
  }, [isAuthed])

  useEffect(() => {
    if (!socket) return
    const onNew = (n: any) => {
      setNotifItems((prev) => [{
        id: n._id || n.id || crypto.randomUUID(),
        title: n.title || "Notification",
        message: n.message || "",
        type: n.type || "info",
        link: n.link || "",
        createdAt: n.createdAt,
        read: false,
      }, ...prev])
    }
    socket.on("notification:new", onNew)
    return () => {
      socket.off("notification:new", onNew)
    }
  }, [socket])

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

  const navigationItems = useMemo(() => NAV_ITEMS, [])

  const markAllRead = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        await fetch(`${base}/api/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      }
    } finally {
      setNotifItems((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }
  const clearRead = () => setNotifItems((prev) => prev.filter((n) => !n.read))

  const openNotification = async (n: Notif) => {
    setSelectedNotif(n)
    setNotifOpen(true)
    // Mark read optimistically and call API
    setNotifItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token && n.id) {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        await fetch(`${base}/api/notifications/${n.id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      }
    } catch {}
  }

  // Hide specific items for unauthenticated users; move '/my-apply' into profile dropdown
  const baseVisibleItems = navigationItems.filter((item) => {
    if (item.href === '/my-apply') return false
    if (!isAuthed && item.href === '/analytics') return false
    return true
  })

  // Inject Judges section for organizers
  const visibleItems = useMemo(() => {
    const items = [...baseVisibleItems]
    if (role === 'organizer') {
      const already = items.some((i) => i.href === '/dashboard/organizer/judges')
      if (!already) {
        items.push({ href: '/dashboard/organizer/judges', label: 'Judges', icon: Users })
      }
    }
    // Participant-only: Submissions shortcut
    if (role === 'participant') {
      const already = items.some((i) => i.href === '/dashboard/participant/submissions')
      if (!already) {
        items.push({ href: '/dashboard/participant/submissions', label: 'Submissions', icon: Upload })
      }
    }
    return items
  }, [baseVisibleItems, role])

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-xl shadow-lg border-b" : "bg-white/80 backdrop-blur-xl"
      }`}
    >
      {/* Top gradient accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <Image
              src="/hackhost-logo.png"
              alt="HackHost"
              width={160}
              height={40}
              priority
              className="h-8 md:h-10 w-auto rounded-md shadow-lg group-hover:scale-105 transition-transform"
            />
            <span className="text-xl md:text-2xl font-bold text-slate-900">HackHost</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
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
            {/* Notifications (only for authenticated users) */}
            {isAuthed && (
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
                        <DropdownMenuItem
                          key={n.id}
                          className="flex flex-col items-start gap-0.5 cursor-pointer"
                          onClick={() => openNotification(n)}
                        >
                          <span className={`text-sm ${n.read ? "text-slate-500" : "text-slate-900 font-medium"}`}>{n.title}</span>
                          <span className="text-xs text-slate-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                  {notifItems.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="justify-center text-red-600" onClick={clearRead}>
                        Clear read
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Auth Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[40px] min-w-[40px] rounded-full pl-1 pr-2"
                      aria-label="User menu"
                    >
                      <div className="flex items-center">
                        <Avatar className="size-8">
                          <AvatarImage src={avatarUrl ?? ""} alt={firstName ?? "User"} />
                          <AvatarFallback>{(firstName?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-2 hidden xl:flex flex-col items-start leading-tight">
                          <span className="text-sm font-medium text-slate-900">{firstName ?? "User"}</span>
                          {role && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                              {role}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 ml-2 text-slate-500" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {role === 'participant' && (
                      <DropdownMenuItem asChild>
                        <Link href="/invites" className="flex items-center">
                          <Bell className="w-4 h-4 mr-2" />
                          Invites
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {role === 'participant' && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-apply" className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          My Apply
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[40px] px-4 border-2 border-slate-300 hover:border-slate-400 transform-gpu transition-all hover:-translate-y-0.5"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      variant="cta"
                      className="min-h-[40px] px-4 shadow-emerald-600/40 ring-2 ring-emerald-300/60 hover:ring-emerald-400/80 transform-gpu transition-all hover:-translate-y-0.5"
                    >
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

        {isMenuOpen && (
          <div className="lg:hidden px-4 sm:px-6 pb-4">
            <nav className="grid gap-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 min-h-[48px] touch-manipulation ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 font-medium"
                      : "text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="border-t pt-4 mt-4">
              {isAuthed ? (
                <div className="flex flex-col gap-3">
                  <Link href="/profile" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full min-h-[44px]">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Button>
                  </Link>
                  {role === 'participant' && (
                    <Link href="/invites" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[44px]">
                        <Bell className="w-4 h-4 mr-2" /> Invites
                      </Button>
                    </Link>
                  )}
                  {role === 'participant' && (
                    <Link href="/my-apply" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[44px]">
                        <Users className="w-4 h-4 mr-2" /> My Apply
                      </Button>
                    </Link>
                  )}
                  <Button
                    className="flex-1 min-h-[44px]"
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full min-h-[44px]">Sign in</Button>
                  </Link>
                  <Link href="/auth/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full min-h-[44px]">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Notification Details Dialog */}
    <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedNotif?.title ?? 'Notification'}</DialogTitle>
          {selectedNotif && selectedNotif.createdAt ? (
            <DialogDescription>{new Date(selectedNotif.createdAt as string).toLocaleString()}</DialogDescription>
          ) : null}
        </DialogHeader>
        {selectedNotif && selectedNotif.message ? (
          <div className="whitespace-pre-wrap text-slate-700">{selectedNotif.message}</div>
        ) : null}
        {selectedNotif && selectedNotif.link ? (
          <div className="mt-3 text-sm">
            <a className="text-cyan-700 underline" href={selectedNotif.link} target="_blank" rel="noreferrer">Open link</a>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setNotifOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

export const AdvancedNavigation = memo(AdvancedNavigationComponent)

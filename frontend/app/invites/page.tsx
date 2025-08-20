"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, Mail } from "lucide-react"

type Invite = {
  _id: string
  token: string
  status: "pending" | "accepted" | "declined" | "cancelled"
  event?: { _id: string; title: string; startDate?: string; endDate?: string }
  sender?: { name?: string; email?: string }
  recipientEmail: string
  createdAt: string
}

export default function InvitesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const router = useRouter()
  const sp = useSearchParams()

  const tokenFromLink = useMemo(() => sp?.get("token") || "", [sp])

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  const fetchInvites = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        setInvites([])
        setError("Please log in to view invites")
        return
      }
      const res = await fetch(`${base}/api/invites/my`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to load invites")
      setInvites(data?.invites || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load invites")
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async (inviteToken: string) => {
    try {
      setLoading(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) throw new Error("Please log in to accept invites")
      const res = await fetch(`${base}/api/invites/accept/${encodeURIComponent(inviteToken)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to accept invite")
      const eventId = data?.eventId
      if (eventId) {
        router.push(`/events/${eventId}/register`)
      } else {
        await fetchInvites()
      }
    } catch (e: any) {
      setError(e?.message || "Failed to accept invite")
    } finally {
      setLoading(false)
    }
  }

  // Auto-accept if token present in URL (from email link)
  useEffect(() => {
    if (tokenFromLink) {
      acceptInvite(tokenFromLink)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromLink])

  useEffect(() => {
    if (!tokenFromLink) fetchInvites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invites
            {invites.length > 0 && (
              <Badge variant="secondary">{invites.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {!loading && !error && invites.length === 0 && (
            <div className="text-sm text-muted-foreground">No pending invites.</div>
          )}
          <div className="space-y-3">
            {invites.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between rounded border p-3">
                <div className="space-y-1">
                  <div className="font-medium">{inv.event?.title || "Event"}</div>
                  <div className="text-xs text-muted-foreground">
                    From {inv.sender?.name || inv.sender?.email || "Unknown"} to {inv.recipientEmail}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{inv.status}</Badge>
                  <Button size="sm" onClick={() => acceptInvite(inv.token)}>
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

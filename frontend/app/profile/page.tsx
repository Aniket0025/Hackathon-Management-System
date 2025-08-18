"use client"

import { useEffect, useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

type Me = {
  _id: string
  name: string
  email: string
  role: string
  organization?: string
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) {
          window.location.href = "/auth/login"
          return
        }
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/auth/login"
            return
          }
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || `Failed to load profile (${res.status})`)
        }
        const data = await res.json()
        setMe(data?.user || data)
      } catch (e: any) {
        setError(e?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/profile" />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">Beta</Badge>
        </div>

        {loading ? (
          <div className="text-center text-slate-600">Loading your profile…</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  Overview
                </CardTitle>
                <CardDescription>Basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Name</span><span>{me?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Email</span><span>{me?.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Role</span><span>{me?.role}</span></div>
                {me?.organization && (
                  <div className="flex justify-between"><span className="text-slate-600">Organization</span><span>{me.organization}</span></div>
                )}
                <div className="pt-2"><Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 w-full">Edit Profile</Button></div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-card">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Recent account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Logged in"].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg glass-panel flex items-center justify-between">
                    <span>{item}</span>
                    <span className="text-sm text-slate-500">Just now</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

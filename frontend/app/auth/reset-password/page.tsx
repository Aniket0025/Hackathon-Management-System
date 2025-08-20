"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const t = params.get("token")
    if (t) setToken(t)
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setErr(null)

    if (!token) {
      setErr("Reset token missing. Use the link from your email.")
      return
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      setErr("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to reset password")
      setMsg("Password updated. You can now sign in.")
      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 1200)
    } catch (e: any) {
      setErr(e?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/hackhost-logo.png" alt="HackHost" width={160} height={40} priority className="h-10 w-auto rounded" />
            <span className="text-2xl font-bold text-foreground font-sans">HackHost</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-sans">Reset Password</h1>
          <p className="text-muted-foreground font-serif">Enter your new password</p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-sans">Choose a new password</CardTitle>
            <CardDescription className="font-serif">Token is auto-filled from your email link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {err && <div className="text-red-600 text-sm font-medium" role="alert">{err}</div>}
            {msg && <div className="text-green-700 text-sm font-medium" role="status">{msg}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="font-serif">Token</Label>
                <Input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} className="font-serif" placeholder="Paste the token from your email link" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-serif">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 font-serif" placeholder="Enter a new password" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="font-serif">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-10 font-serif" placeholder="Re-enter your new password" required />
                </div>
              </div>
              <Button
                type="submit"
                variant="cta"
                className="w-full font-serif ring-2 ring-emerald-300/60 hover:ring-emerald-400/80 shadow-emerald-600/40 transform-gpu transition-all hover:-translate-y-0.5 disabled:opacity-90 disabled:hover:translate-y-0"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
              <div className="text-center text-sm font-serif"><Link href="/auth/login" className="text-primary hover:text-primary/80">Back to sign in</Link></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

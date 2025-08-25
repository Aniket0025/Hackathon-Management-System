"use client"

import type React from "react"
import Image from "next/image"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Zap, Mail, Lock } from "lucide-react"
import { app } from "@/lib/firebase"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const fbUser = result.user
      const idToken = await fbUser.getIdToken()

      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Google sign-in failed")

      if (data?.token) {
        try { localStorage.setItem("token", data.token) } catch {}
      }
      window.location.href = "/"
    } catch (e: any) {
      setError(e?.message || "Google sign-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Invalid email or password")
      }

      if (data?.token) {
        try {
          localStorage.setItem("token", data.token)
        } catch {}
      }

      // Redirect to Home after successful signin
      window.location.href = "/"
    } catch (err: any) {
      setError(err?.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/hackhost-logo.png" alt="HackHost" width={160} height={40} priority className="h-10 w-auto rounded" />
            <span className="text-2xl font-bold text-foreground font-sans">HackHost</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-sans">Welcome Back</h1>
          <p className="text-muted-foreground font-serif">Sign in to your account to continue</p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-sans">Sign In</CardTitle>
            <CardDescription className="font-serif">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-600 text-sm font-medium" role="alert">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-serif">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-serif">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 font-serif">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="cta"
                className="w-full font-serif ring-2 ring-emerald-300/60 hover:ring-emerald-400/80 shadow-emerald-600/40 transform-gpu transition-all hover:-translate-y-0.5 disabled:opacity-100 disabled:brightness-95 disabled:saturate-75 disabled:hover:translate-y-0"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-serif">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full font-serif bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 shadow-sm"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {/* Google "G" logo (monochrome) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="mr-2 h-4 w-4" aria-hidden>
                <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.5-37.4-4.7-55.6H272v105.2h146.9c-6.3 34-25 62.7-53.4 81.9v68.1h86.3c50.6-46.6 81.7-115.4 81.7-199.6z"/>
                <path fill="#34A853" d="M272 544.3c72.9 0 134.2-24.1 178.9-65.3l-86.3-68.1c-24 16.1-54.8 25.5-92.6 25.5-71 0-131.2-47.9-152.7-112.2H30.7v70.5C76 492.6 168.4 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M119.3 324.2c-10.2-30.5-10.2-63.5 0-94.1V159.6H30.7c-41.1 81.9-41.1 179.2 0 261.1l88.6-66.5z"/>
                <path fill="#EA4335" d="M272 106.2c39.6-.6 77.8 14 106.7 41.1l79.6-79.6C403.9-9 317.5-22.1 239.3 6.8 161.1 35.6 103.1 97.1 79.3 176.1l90 70c21.2-64 81.5-109.3 152.7-110z"/>
              </svg>
              {isLoading ? "Please wait..." : "Continue with Google"}
            </Button>

            <div className="text-center text-sm font-serif">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

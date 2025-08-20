"use client"

import type React from "react"
import Image from "next/image"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, User, Github, Trophy, Calendar as CalendarIcon, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const termsRef = useRef<HTMLDivElement | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "participant", // default selection
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  // OTP state
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)

  // API base
  const baseApi = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

  // Send OTP
  const handleSendOtp = async () => {
    setError(null)
    setSuccess(null)
    if (!formData.email) {
      setError("Enter your email first")
      return
    }
    try {
      setOtpLoading(true)
      const res = await fetch(`${baseApi}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to send OTP")
      setOtpSent(true)
      setSuccess("OTP sent to your email")
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError(null)
    setSuccess(null)
    if (!formData.email || !otp) {
      setError("Enter your email and OTP")
      return
    }
    try {
      setOtpLoading(true)
      const res = await fetch(`${baseApi}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to verify OTP")
      setVerificationToken(data?.verificationToken || null)
      setSuccess("Email verified. You can now create your account.")
    } catch (e: any) {
      setVerificationToken(null)
      setError(e?.message || "Failed to verify OTP")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Privacy Policy.")
      // Bring the checkbox into view to help the user act
      termsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!formData.role) {
      setError("Please select your role.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          verificationToken: verificationToken,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Registration failed")
      }

      // Save token for authenticated requests
      if (data?.token) {
        try {
          localStorage.setItem("token", data.token)
        } catch {}
      }

      setSuccess("Account created successfully. Redirecting…")
      // Redirect to Home after successful signup
      window.location.href = "/"
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
          <h1 className="text-2xl font-bold text-foreground font-sans">Create Account</h1>
          <p className="text-muted-foreground font-serif">Join the innovation community</p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-sans">Sign Up</CardTitle>
            <CardDescription className="font-serif">
              Create your account to start hosting or joining events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="text-red-600 text-sm font-medium cursor-pointer"
                  role="alert"
                  onClick={() => {
                    // If the error is about terms, auto-agree on click for convenience
                    if (error.toLowerCase().includes("terms")) {
                      setFormData((prev) => ({ ...prev, agreeToTerms: true }))
                    }
                    termsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }}
                  title="Click to jump to the Terms checkbox"
                >
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 text-sm font-medium" role="status">
                  {success}
                </div>
              )}

              {/* Role selection at top */}
              <div className="space-y-3">
                <Label className="font-serif">Choose Role</Label>
                <Tabs value={formData.role} onValueChange={(v) => updateFormData("role", v)}>
                  <TabsList className="w-full grid grid-cols-3 h-10 rounded-2xl">
                    <TabsTrigger value="participant" className="rounded-xl">Participant</TabsTrigger>
                    <TabsTrigger value="organizer" className="rounded-xl">Organizer</TabsTrigger>
                    <TabsTrigger value="judge" className="rounded-xl">Judge</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="rounded-xl border bg-cyan-50/60 p-5">
                  {formData.role === "participant" && (
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">Join as Participant</h3>
                      <p className="text-sm text-muted-foreground">Showcase your skills and collaborate with innovators</p>
                      <div className="flex justify-center pt-1">
                        <Button variant="secondary" className="bg-violet-600 hover:bg-violet-700 text-white">
                          <UsersIcon className="mr-2 h-4 w-4" /> Individual & Teams
                        </Button>
                      </div>
                    </div>
                  )}
                  {formData.role === "organizer" && (
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">Join as Organizer</h3>
                      <p className="text-sm text-muted-foreground">Create and manage amazing innovation events</p>
                      <div className="flex justify-center pt-1">
                        <Button variant="secondary" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                          <CalendarIcon className="mr-2 h-4 w-4" /> Event Management
                        </Button>
                      </div>
                    </div>
                  )}
                  {formData.role === "judge" && (
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">Join as Judge</h3>
                      <p className="text-sm text-muted-foreground">Evaluate projects and provide valuable feedback</p>
                      <div className="flex justify-center pt-1">
                        <Button variant="secondary" className="bg-slate-800 hover:bg-slate-900 text-white">
                          <Trophy className="mr-2 h-4 w-4" /> Expert Evaluation
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="font-serif">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

              {/* OTP Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={handleSendOtp} disabled={otpLoading || !formData.email || !!verificationToken}>
                    {otpLoading ? "Sending..." : (otpSent ? "Resend OTP" : "Send OTP")}
                  </Button>
                  {verificationToken && (
                    <span className="text-xs text-green-700">Verified</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="font-serif"
                  />
                  <Button type="button" onClick={handleVerifyOtp} disabled={otpLoading || !otp || !!verificationToken}>
                    {otpLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
                {!verificationToken && (
                  <p className="text-xs text-muted-foreground">Verify your email with the OTP before creating an account.</p>
                )}
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="password" className="font-serif">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-serif">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    className="pl-10 font-serif"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2" ref={termsRef}>
                <Checkbox
                  id="terms"
                  checked={!!formData.agreeToTerms}
                  onCheckedChange={(checked) => updateFormData("agreeToTerms", checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-serif">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full font-serif" disabled={isLoading || !verificationToken}>
                {isLoading ? "Creating account..." : (verificationToken ? "Create Account" : "Verify Email to Continue")}
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

            <Button variant="outline" className="w-full font-serif bg-transparent">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>

            <div className="text-center text-sm font-serif">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

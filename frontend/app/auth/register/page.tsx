"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, Mail, Lock, User, Github } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const termsRef = useRef<HTMLDivElement | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    organization: "",
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      setError("Please select your primary role.")
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
          organization: formData.organization || undefined,
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
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
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

              <div className="space-y-2">
                <Label htmlFor="role" className="font-serif">
                  Primary Role
                </Label>
                <Select onValueChange={(value) => updateFormData("role", value)}>
                  <SelectTrigger className="font-serif">
                    <SelectValue placeholder="Select your primary role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizer">Event Organizer</SelectItem>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="judge">Judge/Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="font-serif">
                  Organization (Optional)
                </Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Your company, university, or organization"
                  value={formData.organization}
                  onChange={(e) => updateFormData("organization", e.target.value)}
                  className="font-serif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-serif">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
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
                  <Input
                    id="confirmPassword"
                    type="password"
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

              <Button type="submit" className="w-full font-serif" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
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

"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Rocket } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/demo" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <div className="mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 mb-3">
            <Play className="w-4 h-4 mr-2" />
            Product Demo
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Experience HackHost in Action</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Watch a short walkthrough of the organizer and participant experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto aspect-video rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 shadow-2xl flex items-center justify-center">
          <Play className="w-14 h-14 text-slate-500" />
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Button asChild className="bg-gradient-to-r from-cyan-600 to-blue-600">
            <Link href="/auth/register"><Rocket className="w-4 h-4 mr-2" />Start Your Event</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

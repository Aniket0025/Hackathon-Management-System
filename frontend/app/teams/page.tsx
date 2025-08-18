"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import AITeamMatching from "@/components/ai-team-matching"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/teams" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 mb-3">
            <Users className="w-4 h-4 mr-2" />
            AI Teams
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Form High-Impact Teams</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Use our AI-powered matching to build balanced teams that win.
          </p>
        </div>

        <AITeamMatching />
      </main>
    </div>
  )
}

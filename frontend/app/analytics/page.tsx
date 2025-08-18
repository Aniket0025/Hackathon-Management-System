"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { InteractiveStatsDashboard } from "@/components/interactive-stats-dashboard"
import AdvancedAnalytics from "@/components/advanced-analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/analytics" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 mb-3">
            <BarChart3 className="w-4 h-4 mr-2" />
            Deep Analytics
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Insights that Drive Outcomes</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Track participation, engagement, sentiment, and performance in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-card">
            <CardContent className="p-4 md:p-6">
              <InteractiveStatsDashboard />
            </CardContent>
          </Card>
          <Card className="lg:col-span-1 glass-card">
            <CardContent className="p-4 md:p-6">
              <AdvancedAnalytics />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

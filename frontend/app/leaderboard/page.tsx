"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Award } from "lucide-react"

export default function LeaderboardPage() {
  const leaders = [
    { team: "AI Innovators", score: 98.6, awards: ["Best AI", "Grand Prize"] },
    { team: "Code Warriors", score: 95.2, awards: ["Best UX"] },
    { team: "HealthTech Heroes", score: 93.7, awards: ["Impact Award"] },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/leaderboard" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 mb-3">
            <Trophy className="w-4 h-4 mr-2" />
            Live Leaderboard
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Top Performing Teams</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Real-time rankings based on judging, public votes, and impact.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {leaders.map((l) => (
            <Card key={l.team} className="hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> {l.team}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 mb-2">{l.score}</div>
                <div className="flex gap-2 flex-wrap">
                  {l.awards.map((a) => (
                    <Badge key={a} variant="secondary" className="bg-amber-100 text-amber-700">
                      <Award className="w-3 h-3 mr-1" /> {a}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

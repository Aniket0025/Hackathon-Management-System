"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Plus, MapPin, Users, Clock } from "lucide-react"

export default function EventsPage() {
  const upcoming = [
    { id: "global-ai-2025", name: "Global AI Hack 2025", date: "Sep 20-22, 2025", location: "Remote-First", teams: 320 },
    { id: "fintech-summit", name: "FinTech Summit Hack", date: "Oct 4-6, 2025", location: "Mumbai, IN", teams: 180 },
    { id: "healthtech-x", name: "HealthTech X Challenge", date: "Nov 8-10, 2025", location: "Bengaluru, IN", teams: 140 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/events" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            Discover Events
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            Curated Hackathons for Builders
          </h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Explore upcoming events, join teams, and kickstart your next breakthrough.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild className="bg-gradient-to-r from-cyan-600 to-blue-600">
              <Link href="/dashboard/events/create"><Plus className="w-4 h-4 mr-2" />Create Event</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {upcoming.map((ev) => (
            <Card key={ev.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="text-xl">{ev.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{ev.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{ev.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{ev.teams} teams</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button asChild size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600">
                  <Link href={`/events/${ev.id}/register`}>Register</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/events`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

"use client"

import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/settings" />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-600 mt-2">Update application preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-600" />
                Appearance
              </CardTitle>
              <CardDescription>Theme and layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg glass-panel flex items-center justify-between">
                <span>Theme</span>
                <Button variant="outline">Light</Button>
              </div>
              <div className="p-3 rounded-lg glass-panel flex items-center justify-between">
                <span>Density</span>
                <Button variant="outline">Comfortable</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control email and in-app notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Mentions", "Replies", "Event updates"].map((i) => (
                <div key={i} className="p-3 rounded-lg glass-panel flex items-center justify-between">
                  <span>{i}</span>
                  <Button variant="outline">Enabled</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

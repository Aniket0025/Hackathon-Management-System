"use client"

import { useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, ThumbsUp } from "lucide-react"

export default function CommunityPage() {
  const [posts, setPosts] = useState([
    { id: 1, title: "How we won last year", author: "Sarah", likes: 124 },
    { id: 2, title: "Best datasets for HealthTech", author: "Alex", likes: 98 },
    { id: 3, title: "UI kits that accelerate dev", author: "Maya", likes: 76 },
  ])

  const likePost = (id: number) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <AdvancedNavigation currentPath="/community" />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 mb-3">
            <Users className="w-4 h-4 mr-2" />
            Community Hub
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">Share, Learn, Collaborate</h1>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Tips, resources, and stories from the builder community.
          </p>
          <div className="mt-6 flex justify-center">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600"><MessageSquare className="w-4 h-4 mr-2" />New Post</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Card
              key={p.id}
              className="hover:shadow-2xl transition-all backdrop-blur-xl bg-white/50 border border-white/20"
            >
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>by {p.author}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-white/40 border border-white/20 text-slate-700 inline-flex items-center"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" /> {p.likes} likes
                </Badge>
                <Button size="sm" variant="outline" onClick={() => likePost(p.id)}>
                  <ThumbsUp className="w-4 h-4 mr-2" /> Like
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

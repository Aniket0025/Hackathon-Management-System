"use client"

import { useEffect, useMemo, useState } from "react"
import { AdvancedNavigation } from "@/components/advanced-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, ThumbsUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Post = { id: string | number; title: string; author: string; likes: number; body?: string }

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [body, setBody] = useState("")
  const canSubmit = useMemo(() => title.trim().length > 2 && author.trim().length > 1, [title, author])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/community/posts`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        const list: Post[] = Array.isArray(data?.posts) ? data.posts : []
        setPosts(list)
      } catch (_) {
        // Fallback demo posts if API is not available yet
        setPosts([
          { id: 1, title: "How we won last year", author: "Sarah", likes: 124 },
          { id: 2, title: "Best datasets for HealthTech", author: "Alex", likes: 98 },
          { id: 3, title: "UI kits that accelerate dev", author: "Maya", likes: 76 },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const likePost = (id: string | number) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p)))

  const submitPost = async () => {
    if (!canSubmit) return
    const newPost: Post = {
      id: Date.now(),
      title: title.trim(),
      author: author.trim(),
      likes: 0,
      body: body.trim(),
    }
    setPosts((prev) => [newPost, ...prev])
    setOpen(false)
    setTitle(""); setAuthor(""); setBody("")
    // Try to persist to backend if available
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      await fetch(`${base}/api/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newPost.title, author: newPost.author, body: newPost.body }),
      })
    } catch (_) {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600"><MessageSquare className="w-4 h-4 mr-2" />New Post</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new post</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
                  <Textarea placeholder="Write something helpful for the community... (optional)" value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button onClick={submitPost} disabled={!canSubmit} className="bg-gradient-to-r from-cyan-600 to-blue-600">Publish</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-600 mb-4 text-sm">{error}</p>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="h-5 w-48 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-slate-200 rounded" />
                  <div className="h-9 w-16 bg-slate-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-slate-600 py-10">No posts yet. Be the first to share!</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {posts.map((p) => (
              <Card
                key={p.id}
                className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{p.title}</CardTitle>
                  <CardDescription>by {p.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 border border-slate-200 text-slate-700 inline-flex items-center"
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
        )}
      </main>
    </div>
  )
}

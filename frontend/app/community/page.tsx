"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, ThumbsUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Post = { id: string; title: string; author: string; likes: number; body?: string }

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [body, setBody] = useState("")
  const canSubmit = useMemo(() => title.trim().length > 2 && author.trim().length > 1, [title, author])

  // UI utilities
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<"newest" | "likes">("newest")
  const [onlyWithBody, setOnlyWithBody] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/community/posts`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        const list: Post[] = Array.isArray(data?.posts)
          ? data.posts.map((p: any) => ({ id: String(p._id || p.id), title: p.title, author: p.author, likes: p.likes || 0, body: p.body || "" }))
          : []
        setPosts(list)
      } catch (_) {
        // Fallback demo posts if API is not available yet
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totals = useMemo(() => {
    const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0)
    return { totalPosts: posts.length, totalLikes }
  }, [posts])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = posts.filter((p) =>
      (!onlyWithBody || (p.body && p.body.trim().length > 0)) &&
      (term.length === 0 ||
        p.title.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        (p.body || "").toLowerCase().includes(term))
    )
    if (sort === "likes") list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    else list.sort((a, b) => String(b.id).localeCompare(String(a.id))) // newest first (ids are time-ish)
    return list
  }, [posts, q, sort, onlyWithBody])

  const preview = (text?: string) => {
    const t = (text || "").trim()
    if (!t) return ""
    return t.length > 140 ? t.slice(0, 140) + "…" : t
  }

  const likePost = async (id: string) => {
    // optimistic update
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p)))
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      await fetch(`${base}/api/community/posts/${id}/like`, { method: "POST" })
    } catch (_) {
      // revert on error
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: Math.max(0, (p.likes || 1) - 1) } : p)))
    }
  }

  const submitPost = async () => {
    if (!canSubmit) return
    const draft: Post = { id: `tmp-${Date.now()}`, title: title.trim(), author: author.trim(), likes: 0, body: body.trim() }
    // optimistic insert
    setPosts((prev) => [draft, ...prev])
    setOpen(false)
    setTitle(""); setAuthor(""); setBody("")
    // persist to backend
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.title, author: draft.author, body: draft.body }),
      })
      if (res.ok) {
        const data = await res.json()
        const saved = data?.post
        if (saved && (saved._id || saved.id)) {
          setPosts((prev) => prev.map((p) => (p.id === draft.id ? { id: String(saved._id || saved.id), title: saved.title, author: saved.author, likes: saved.likes || 0, body: saved.body || "" } : p)))
        }
      } else {
        // remove draft on failure
        setPosts((prev) => prev.filter((p) => p.id !== draft.id))
      }
    } catch (_) {
      // remove draft on failure
      setPosts((prev) => prev.filter((p) => p.id !== draft.id))
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
                <Button className="bg-cyan-600 hover:bg-cyan-700 transition-colors"><MessageSquare className="w-4 h-4 mr-2" />New Post</Button>
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
                  <Button onClick={submitPost} disabled={!canSubmit} className="bg-cyan-600 hover:bg-cyan-700 transition-colors">Publish</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-600 mb-4 text-sm">{error}</p>
        )}

        {/* Toolbar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input placeholder="Search posts (title, body, author)" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <label className="text-sm text-slate-700 flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" checked={onlyWithBody} onChange={(e) => setOnlyWithBody(e.target.checked)} />
              Only posts with body
            </label>
            <select
              className="border border-slate-300 rounded-md text-sm px-2 py-2 bg-white"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              aria-label="Sort posts"
            >
              <option value="newest">Newest</option>
              <option value="likes">Top liked</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Posts list */}
          <div className="md:col-span-3">
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
            ) : filtered.length === 0 ? (
              <div className="text-center text-slate-600 py-10">No posts match your filters.</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <Card
                    key={p.id}
                    className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle>{p.title}</CardTitle>
                      <CardDescription>by {p.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {p.body && (
                        <p className="text-sm text-slate-700 mb-4">{preview(p.body)}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 border border-slate-200 text-slate-700 inline-flex items-center"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" /> {p.likes} likes
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => likePost(p.id)}>
                          <ThumbsUp className="w-4 h-4 mr-2" /> Like
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Community stats</CardTitle>
                <CardDescription>Activity overview</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xl font-semibold">{totals.totalPosts}</div>
                  <div className="text-slate-500">Posts</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{totals.totalLikes}</div>
                  <div className="text-slate-500">Likes</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

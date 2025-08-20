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
type Announcement = { id: string; title: string; body: string; author?: string; createdAt?: string; pinned?: boolean; bannerUrl?: string }
type Answer = { id?: string; body: string; author: any; createdAt?: string; upvotes?: number }
type Question = { id: string; title: string; body: string; author: string; createdAt?: string; tags?: string[]; upvotes?: number; solved?: boolean; answers?: Answer[] }

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [annLoading, setAnnLoading] = useState(false)
  const [annOpen, setAnnOpen] = useState(false)
  const [annTitle, setAnnTitle] = useState("")
  const [annBody, setAnnBody] = useState("")
  const [annBanner, setAnnBanner] = useState<File | null>(null)

  const [open, setOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [body, setBody] = useState("")
  const canSubmit = useMemo(() => title.trim().length > 2 && author.trim().length > 1, [title, author])
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  // Q&A state
  const [questions, setQuestions] = useState<Question[]>([])
  const [qaLoading, setQaLoading] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [qTitle, setQTitle] = useState("")
  const [qBody, setQBody] = useState("")
  const [qTags, setQTags] = useState("")
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({})

  // Prefer human name/email if author is an object; otherwise fallback to string
  const displayAuthorName = (val: any): string => {
    if (!val) return 'Unknown'
    if (typeof val === 'string') return val
    // try common fields
    return String(val.name || val.fullName || val.username || val.email || val._id || val.id || 'Unknown')
  }

  // UI utilities
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<"newest" | "likes">("newest")
  const [onlyWithBody, setOnlyWithBody] = useState(false)
  // Section switcher (tabs)
  const [activeSection, setActiveSection] = useState<'announcements' | 'qa' | 'posts'>('announcements')

  useEffect(() => {
    // Determine auth and role once on mount
    (async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        setIsAuthed(!!token)
        // hydrate liked posts
        const raw = typeof window !== "undefined" ? localStorage.getItem("liked_posts") : null
        if (raw) {
          try {
            const arr = JSON.parse(raw)
            if (Array.isArray(arr)) setLikedPosts(new Set(arr.map(String)))
          } catch { /* ignore */ }
        }
        if (token) {
          const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
          const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const data = await res.json()
            const r = data?.user?.role || null
            if (r) setRole(String(r))
          }
        }
      } catch {
        setIsAuthed(false)
        setRole(null)
      }
    })()
  }, [])

  // Load Q&A questions
  useEffect(() => {
    const load = async () => {
      try {
        setQaLoading(true)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/community/questions`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        const list: Question[] = Array.isArray(data?.questions)
          ? data.questions.map((q: any) => ({
              id: String(q._id || q.id),
              title: q.title,
              body: q.body,
              author: q.author,
              createdAt: q.createdAt,
              tags: q.tags || [],
              upvotes: q.upvotes || 0,
              solved: !!q.solved,
              answers: Array.isArray(q.answers)
                ? q.answers.map((a: any) => ({ id: String(a._id || a.id || ''), body: a.body, author: a.author, createdAt: a.createdAt, upvotes: a.upvotes || 0 }))
                : [],
            }))
          : []
        setQuestions(list)
      } catch {
        setQuestions([])
      } finally {
        setQaLoading(false)
      }
    }
    load()
  }, [])

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

  // Load announcements
  useEffect(() => {
    const load = async () => {
      try {
        setAnnLoading(true)
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        const res = await fetch(`${base}/api/community/announcements`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        const list: Announcement[] = Array.isArray(data?.announcements)
          ? data.announcements.map((a: any) => ({ id: String(a._id || a.id), title: a.title, body: a.body, author: a.author, createdAt: a.createdAt, pinned: !!a.pinned, bannerUrl: a.bannerUrl }))
          : []
        setAnnouncements(list)
      } catch {
        setAnnouncements([])
      } finally {
        setAnnLoading(false)
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
    // require auth
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        window.location.href = "/auth/login?next=" + encodeURIComponent("/community")
        return
      }
    } catch {
      window.location.href = "/auth/login?next=" + encodeURIComponent("/community")
      return
    }

    // prevent multiple likes per user (client-side)
    if (likedPosts.has(id)) return

    // optimistic update
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p)))
    setLikedPosts((prev) => {
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem("liked_posts", JSON.stringify(Array.from(next)))
      } catch { /* ignore */ }
      return next
    })

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      await fetch(`${base}/api/community/posts/${id}/like`, { method: "POST" })
    } catch (_) {
      // revert on error
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: Math.max(0, (p.likes || 1) - 1) } : p)))
      setLikedPosts((prev) => {
        const next = new Set(prev)
        next.delete(id)
        try { localStorage.setItem("liked_posts", JSON.stringify(Array.from(next))) } catch { /* ignore */ }
        return next
      })
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

  // Announcements: create
  const submitAnnouncement = async () => {
    if (annTitle.trim().length < 2 || annBody.trim().length < 2) return
    // Require auth
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        window.location.href = "/auth/login?next=" + encodeURIComponent("/community")
        return
      }
      // role gate
      if (!(role === 'organizer' || role === 'admin')) {
        alert('Only organizers or admins can post announcements.')
        return
      }
    } catch {
      window.location.href = "/auth/login?next=" + encodeURIComponent("/community")
      return
    }
    const draft: Announcement = { id: `tmp-${Date.now()}`, title: annTitle.trim(), body: annBody.trim(), author: "You" }
    setAnnouncements((prev) => [{ ...draft }, ...prev])
    setAnnOpen(false); setAnnTitle(""); setAnnBody("");
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(`${base}/api/community/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title: draft.title, body: draft.body, author: draft.author }),
      })
      if (res.ok) {
        const data = await res.json()
        const saved = data?.announcement
        if (saved && (saved._id || saved.id)) {
          let updated: Announcement = { id: String(saved._id || saved.id), title: saved.title, body: saved.body, author: saved.author, createdAt: saved.createdAt, pinned: !!saved.pinned, bannerUrl: saved.bannerUrl }
          // If banner selected, upload it
          if (annBanner) {
            try {
              const fd = new FormData()
              fd.append('banner', annBanner)
              const up = await fetch(`${base}/api/community/announcements/${updated.id}/banner`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd,
              })
              if (up.ok) {
                const upData = await up.json()
                if (upData?.bannerUrl) updated.bannerUrl = upData.bannerUrl
              }
            } catch { /* ignore banner upload failure */ }
          }
          setAnnouncements((prev) => prev.map((a) => a.id === draft.id ? updated : a))
        }
      } else {
        // remove draft
        setAnnouncements((prev) => prev.filter((a) => a.id !== draft.id))
      }
    } catch {
      setAnnouncements((prev) => prev.filter((a) => a.id !== draft.id))
    }
    setAnnBanner(null)
  }

  // Q&A: create question (component scope)
  const submitQuestion = async () => {
    if (qTitle.trim().length < 5 || qBody.trim().length < 5) return
    // auth required
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) { window.location.href = "/auth/login?next=" + encodeURIComponent("/community"); return }
    const draft: Question = {
      id: `tmp-${Date.now()}`,
      title: qTitle.trim(),
      body: qBody.trim(),
      author: (author || "You").trim(),
      tags: qTags.split(',').map(t => t.trim()).filter(Boolean),
      upvotes: 0,
      solved: false,
    }
    setQuestions(prev => [draft, ...prev])
    setAskOpen(false); setQTitle(""); setQBody(""); setQTags("")
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
      const res = await fetch(`${base}/api/community/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: draft.title, body: draft.body, author: draft.author, tags: draft.tags })
      })
      if (res.ok) {
        const data = await res.json()
        const saved = data?.question
        if (saved && (saved._id || saved.id)) {
          setQuestions(prev => prev.map(q => q.id === draft.id ? {
            id: String(saved._id || saved.id),
            title: saved.title,
            body: saved.body,
            author: saved.author,
            createdAt: saved.createdAt,
            tags: saved.tags || [],
            upvotes: saved.upvotes || 0,
            solved: !!saved.solved,
          } : q))
        }
      } else {
        setQuestions(prev => prev.filter(q => q.id !== draft.id))
      }
    } catch {
      setQuestions(prev => prev.filter(q => q.id !== draft.id))
    }
  }

  // Q&A: submit answer for a specific question id (component scope)
  const submitAnswer = async (qid: string) => {
    const text = (answerInputs[qid] || '').trim()
    if (text.length < 2) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) { window.location.href = '/auth/login?next=' + encodeURIComponent('/community'); return }

    // optimistic update
    const optimistic: Answer = { id: `tmp-${Date.now()}`, body: text, author: (author || 'You').trim() }
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, answers: [...(q.answers || []), optimistic] } : q))
    setAnswerInputs(prev => ({ ...prev, [qid]: '' }))
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
      const res = await fetch(`${base}/api/community/questions/${qid}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: text })
      })
      if (res.ok) {
        const data = await res.json()
        const saved = data?.answer
        if (saved) {
          setQuestions(prev => prev.map(q => q.id === qid ? {
            ...q,
            answers: (q.answers || []).map(a => a.id === optimistic.id ? { id: String(saved._id || saved.id), body: saved.body, author: saved.author, createdAt: saved.createdAt, upvotes: saved.upvotes || 0 } : a)
          } : q))
        }
      } else {
        // rollback
        setQuestions(prev => prev.map(q => q.id === qid ? { ...q, answers: (q.answers || []).filter(a => a.id !== optimistic.id) } : q))
      }
    } catch {
      setQuestions(prev => prev.map(q => q.id === qid ? { ...q, answers: (q.answers || []).filter(a => a.id !== optimistic.id) } : q))
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
          {/* Post creation dialog (opened by the Posts section button) */}
          <Dialog open={open} onOpenChange={setOpen}>
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

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {([
            { key: 'announcements', label: 'Announcements' },
            { key: 'qa', label: 'Q&A' },
            { key: 'posts', label: 'Posts' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ` +
                (activeSection === tab.key
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Announcements section */}
        {activeSection === 'announcements' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-slate-900">📢 Announcements</h2>
            {(role === 'organizer' || role === 'admin') ? (
              <Dialog open={annOpen} onOpenChange={setAnnOpen}>
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                      if (!token) { window.location.href = "/auth/login?next=" + encodeURIComponent("/community"); return }
                      setAnnOpen(true)
                    } catch { window.location.href = "/auth/login?next=" + encodeURIComponent("/community") }
                  }}
                >New Announcement</Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post an announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
                    <Textarea placeholder="What's new?" value={annBody} onChange={(e) => setAnnBody(e.target.value)} />
                    <div className="text-sm text-slate-700">
                      <label className="block mb-1">Banner image (optional)</label>
                      <input type="file" accept="image/*" onChange={(e) => setAnnBanner(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={submitAnnouncement} disabled={annTitle.trim().length < 2 || annBody.trim().length < 2} className="bg-cyan-600 hover:bg-cyan-700">Publish</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
          </div>
          {annLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border border-slate-200 shadow-sm"><CardHeader><div className="h-5 w-48 bg-slate-200 rounded mb-2" /><div className="h-4 w-24 bg-slate-200 rounded" /></CardHeader></Card>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-slate-600 text-sm">No announcements yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {announcements.map((a) => (
                <Card key={a.id} className="border border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">{a.pinned ? '📌' : null}{a.title}</CardTitle>
                    <CardDescription>{a.author || 'Admin'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {a.bannerUrl ? (
                      <div className="mb-3 rounded overflow-hidden">
                        <Image src={a.bannerUrl} alt={a.title} width={800} height={400} className="w-full h-auto rounded" />
                      </div>
                    ) : null}
                    <p className="text-sm text-slate-700">{a.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        )}

        {error && (
          <p className="text-center text-red-600 mb-4 text-sm">{error}</p>
        )}

        {/* Q&A section */}
        {activeSection === 'qa' && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-slate-900">❓ Q&A</h2>
            <Dialog open={askOpen} onOpenChange={setAskOpen}>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                    if (!token) { window.location.href = '/auth/login?next=' + encodeURIComponent('/community'); return }
                    setAskOpen(true)
                  } catch { window.location.href = '/auth/login?next=' + encodeURIComponent('/community') }
                }}
              >Ask Question</Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ask a question</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Title (be specific)" value={qTitle} onChange={(e) => setQTitle(e.target.value)} />
                  <Textarea placeholder="Describe your problem, what you've tried, and context" value={qBody} onChange={(e) => setQBody(e.target.value)} />
                  <Input placeholder="Tags (comma separated)" value={qTags} onChange={(e) => setQTags(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button onClick={submitQuestion} disabled={qTitle.trim().length < 5 || qBody.trim().length < 5} className="bg-cyan-600 hover:bg-cyan-700">Post Question</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {qaLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border border-slate-200 shadow-sm"><CardHeader><div className="h-5 w-64 bg-slate-200 rounded mb-2" /><div className="h-4 w-32 bg-slate-200 rounded" /></CardHeader></Card>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <p className="text-slate-600 text-sm">No questions yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {questions.map((q) => (
                <Card key={q.id} className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">{q.solved ? '✅' : '❔'} {q.title}</CardTitle>
                    <CardDescription>by {q.author}{q.tags && q.tags.length ? ` • ${q.tags.slice(0,3).join(', ')}` : ''}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 mb-3">{preview(q.body)}</p>
                    {q.answers && q.answers.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {(q.answers).map((a, idx) => (
                          <div key={(a.id || '') + idx} className="text-sm text-slate-700 border border-slate-200 rounded p-2 bg-white/60">
                            <div className="text-slate-500 text-xs mb-1">Answer by {displayAuthorName(a.author)}</div>
                            <div>{a.body}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write an answer..."
                        value={answerInputs[q.id] || ''}
                        onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => submitAnswer(q.id)}
                          disabled={(answerInputs[q.id] || '').trim().length < 2}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >Post Answer</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Posts section */}
        {activeSection === 'posts' && (
        <>
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
              <div className="flex justify-end mb-4">
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700 transition-colors"
                  onClick={() => {
                    try {
                      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                      if (!token) {
                        window.location.href = "/auth/login?next=" + encodeURIComponent("/community")
                        return
                      }
                      setOpen(true)
                    } catch {
                      window.location.href = "/auth/login?next=" + encodeURIComponent("/community")
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />New Post
                </Button>
              </div>
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
                      className="border border-slate-200 shadow-sm bg-white/90 backdrop-blur-sm"
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
                            className="bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs hover:bg-emerald-100/70 transition-colors inline-flex items-center"
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" /> {p.likes} likes
                          </Badge>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => likePost(p.id)}
                            className="shadow-xs hover:shadow-sm"
                            disabled={likedPosts.has(p.id)}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" /> {likedPosts.has(p.id) ? "Liked" : "Like"}
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
        </>
        )}
      </main>
    </div>
  )
}

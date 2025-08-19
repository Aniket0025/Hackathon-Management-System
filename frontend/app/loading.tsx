export default function Loading() {
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white/60 backdrop-blur-sm p-4 space-y-3">
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-24 w-full bg-slate-100 rounded-md" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

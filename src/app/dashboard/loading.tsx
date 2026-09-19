export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <span className="sr-only">กำลังโหลด / Loading…</span>
      <div aria-hidden="true" className="h-32 rounded-2xl bg-slate-200 motion-safe:animate-pulse" />
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map(item => (
          <div key={item} className="h-28 rounded-2xl bg-slate-200 motion-safe:animate-pulse" />
        ))}
      </div>
      <div aria-hidden="true" className="h-64 rounded-2xl bg-slate-200 motion-safe:animate-pulse" />
    </div>
  )
}

export default function JobDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <div className="skeleton h-4 w-24 rounded mb-6" />

      {/* Header card */}
      <div className="rounded-2xl p-6 sm:p-8 mb-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton h-5 w-20 rounded" />
            </div>
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-6 w-28 rounded mt-1" />
          </div>
          <div className="flex flex-col gap-2 sm:w-40">
            <div className="skeleton h-11 rounded-xl" />
            <div className="skeleton h-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="rounded-2xl p-6 sm:p-8 mb-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="skeleton h-3 w-20 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-5 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="skeleton h-3 w-28 rounded mb-5" />
        <div className="space-y-2.5">
          {[90, 75, 85, 60, 80, 70, 90, 65, 80, 75].map((w, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />
          ))}
          <div className="h-4" />
          {[85, 70, 80, 60].map((w, i) => (
            <div key={i} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

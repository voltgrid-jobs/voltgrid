export default function JobsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar skeleton */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="rounded-xl p-5 space-y-5" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-16 rounded" />
            </div>
            {[48, 64, 48, 56, 48].map((w, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-3 w-20 rounded" />
                <div className={`skeleton h-9 rounded-lg`} style={{ width: `${w * 1.5}px` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Job cards skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="mb-6">
            <div className="skeleton h-8 w-32 rounded mb-2" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>

          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-3">
                <div className="skeleton w-8 h-8 rounded flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="flex gap-2 mt-2">
                    <div className="skeleton h-5 w-16 rounded-full" />
                    <div className="skeleton h-5 w-20 rounded-full" />
                    <div className="skeleton h-5 w-14 rounded-full" />
                  </div>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

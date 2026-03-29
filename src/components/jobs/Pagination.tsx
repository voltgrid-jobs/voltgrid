interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

function pageUrl(basePath: string, page: number): string {
  if (page <= 1) return basePath || '/jobs'
  const sep = basePath.includes('?') ? '&' : '?'
  return `${basePath || '/jobs'}${sep}page=${page}`
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  // Always show first page
  pages.push(1)

  // Left ellipsis
  if (current > 4) pages.push('...')

  // Pages around current
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Right ellipsis
  if (current < total - 3) pages.push('...')

  // Always show last page
  pages.push(total)

  return pages
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageList(currentPage, totalPages)
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-col items-center gap-3"
    >
      {/* Mobile: simple prev/page/next */}
      <div className="flex sm:hidden items-center gap-4">
        {hasPrev ? (
          <a
            href={pageUrl(basePath, currentPage - 1)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--yellow)', border: '1px solid var(--yellow-border)', background: 'var(--bg-raised)' }}
          >
            ← Prev
          </a>
        ) : (
          <span
            className="px-4 py-2 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
            style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            ← Prev
          </span>
        )}

        <span className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
          Page {currentPage} of {totalPages}
        </span>

        {hasNext ? (
          <a
            href={pageUrl(basePath, currentPage + 1)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--yellow)', border: '1px solid var(--yellow-border)', background: 'var(--bg-raised)' }}
          >
            Next →
          </a>
        ) : (
          <span
            className="px-4 py-2 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
            style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            Next →
          </span>
        )}
      </div>

      {/* Desktop: full page number list */}
      <div className="hidden sm:flex items-center gap-1 flex-wrap justify-center">
        {/* Prev */}
        {hasPrev ? (
          <a
            href={pageUrl(basePath, currentPage - 1)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--yellow)', border: '1px solid var(--yellow-border)', background: 'var(--bg-raised)' }}
          >
            ←
          </a>
        ) : (
          <span
            className="px-3 py-2 rounded-lg text-sm opacity-40 cursor-not-allowed"
            style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            ←
          </span>
        )}

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-2 text-sm"
              style={{ color: 'var(--fg-muted)' }}
            >
              …
            </span>
          ) : p === currentPage ? (
            <span
              key={p}
              className="px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--yellow)', color: '#0a0a0a' }}
              aria-current="page"
            >
              {p}
            </span>
          ) : (
            <a
              key={p}
              href={pageUrl(basePath, p)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--fg)', border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
            >
              {p}
            </a>
          )
        )}

        {/* Next */}
        {hasNext ? (
          <a
            href={pageUrl(basePath, currentPage + 1)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--yellow)', border: '1px solid var(--yellow-border)', background: 'var(--bg-raised)' }}
          >
            →
          </a>
        ) : (
          <span
            className="px-3 py-2 rounded-lg text-sm opacity-40 cursor-not-allowed"
            style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            →
          </span>
        )}
      </div>

      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
        Page {currentPage} of {totalPages}
      </p>
    </nav>
  )
}

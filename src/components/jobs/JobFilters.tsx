'use client'
import { useRouter } from 'next/navigation'
import { CATEGORY_LABELS, JOB_TYPE_LABELS } from '@/types'

interface Props {
  currentParams: {
    category?: string
    location?: string
    q?: string
    type?: string
  }
}

export function JobFilters({ currentParams }: Props) {
  const router = useRouter()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    const merged = { ...currentParams, [key]: value }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    if (key === value || !value) params.delete(key)
    router.push(`/jobs?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/jobs')
  }

  const hasFilters = Object.values(currentParams).some(Boolean)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-yellow-400 hover:text-yellow-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          Search
        </label>
        <input
          type="text"
          defaultValue={currentParams.q}
          placeholder="Job title, company..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilter('q', (e.target as HTMLInputElement).value)
            }
          }}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          Trade
        </label>
        <div className="space-y-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateFilter('category', currentParams.category === key ? '' : key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentParams.category === key
                  ? 'bg-yellow-400/20 text-yellow-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          Job Type
        </label>
        <div className="space-y-1">
          {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => updateFilter('type', currentParams.type === key ? '' : key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentParams.type === key
                  ? 'bg-yellow-400/20 text-yellow-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          Location
        </label>
        <input
          type="text"
          defaultValue={currentParams.location}
          placeholder="City, state..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilter('location', (e.target as HTMLInputElement).value)
            }
          }}
        />
      </div>
    </div>
  )
}

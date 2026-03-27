'use client'
import { useState } from 'react'
import { CATEGORY_LABELS, JOB_TYPE_LABELS } from '@/types'

const PLANS = [
  { id: 'single_post', name: 'Single Post', price: '$149', description: '1 listing · 30 days' },
  { id: 'five_pack', name: '5-Pack', price: '$499', description: '5 listings · best value' },
  { id: 'pro_monthly', name: 'Pro Monthly', price: '$799/mo', description: 'Unlimited listings' },
]

export function PostJobForm() {
  const [plan, setPlan] = useState('single_post')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      plan,
      company_name: (form.elements.namedItem('company_name') as HTMLInputElement).value,
      company_email: (form.elements.namedItem('company_email') as HTMLInputElement).value,
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      job_type: (form.elements.namedItem('job_type') as HTMLSelectElement).value,
      location: (form.elements.namedItem('location') as HTMLInputElement).value,
      remote: (form.elements.namedItem('remote') as HTMLInputElement).checked,
      salary_min: (form.elements.namedItem('salary_min') as HTMLInputElement).value,
      salary_max: (form.elements.namedItem('salary_max') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      apply_url: (form.elements.namedItem('apply_url') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setError(json.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Plan</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              className={`border rounded-xl p-4 text-left transition-colors ${
                plan === p.id
                  ? 'border-yellow-400 bg-yellow-400/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-white">{p.name}</div>
              <div className="text-yellow-400 font-bold mt-1">{p.price}</div>
              <div className="text-gray-500 text-xs mt-1">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Company info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Company Name *</label>
          <input
            name="company_name"
            required
            type="text"
            placeholder="Acme Construction"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email *</label>
          <input
            name="company_email"
            required
            type="email"
            placeholder="hr@company.com"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
      </div>

      {/* Job info */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Job Title *</label>
        <input
          name="title"
          required
          type="text"
          placeholder="Journeyman Electrician — Data Center"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Trade *</label>
          <select
            name="category"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-yellow-400 text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Job Type *</label>
          <select
            name="job_type"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-yellow-400 text-sm"
          >
            {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Location *</label>
          <input
            name="location"
            required
            type="text"
            placeholder="Phoenix, AZ"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="remote"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-400 focus:ring-yellow-400"
            />
            <span className="text-sm text-gray-300">Remote / travel OK</span>
          </label>
        </div>
      </div>

      {/* Salary */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Salary Min (USD)</label>
          <input
            name="salary_min"
            type="number"
            placeholder="70000"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Salary Max (USD)</label>
          <input
            name="salary_max"
            type="number"
            placeholder="120000"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Job Description *</label>
        <textarea
          name="description"
          required
          rows={8}
          placeholder="Describe the role, responsibilities, qualifications, and what makes this opportunity exciting..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm resize-none"
        />
      </div>

      {/* Apply URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Apply URL or Email *</label>
        <input
          name="apply_url"
          required
          type="text"
          placeholder="https://your-ats.com/apply/123 or hiring@company.com"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
        />
        <p className="text-gray-600 text-xs mt-1">Job seekers will be sent here to apply.</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-gray-950 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to checkout...' : 'Continue to Payment →'}
      </button>

      <p className="text-gray-600 text-xs text-center">
        Secure payment via Stripe. Your job goes live immediately after payment.
      </p>
    </form>
  )
}

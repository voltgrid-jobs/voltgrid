'use client'
import { useState } from 'react'

interface Employer {
  id?: string
  company_name?: string
  company_slug?: string
  website?: string
  description?: string
  location?: string
}

export function EmployerProfileForm({ employer, userId }: { employer: Employer | null; userId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    company_name: employer?.company_name || '',
    website: employer?.website || '',
    description: employer?.description || '',
    location: employer?.location || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const res = await fetch('/api/dashboard/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, employer_id: employer?.id, user_id: userId }),
    })
    const data = await res.json()
    if (data.error) setError(data.error)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Company Name *</label>
        <input
          name="company_name" required value={form.company_name} onChange={handleChange}
          placeholder="Acme Data Center Corp"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
        <input
          name="website" type="url" value={form.website} onChange={handleChange}
          placeholder="https://yourcompany.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Headquarters Location</label>
        <input
          name="location" value={form.location} onChange={handleChange}
          placeholder="Phoenix, AZ"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Company Description</label>
        <textarea
          name="description" value={form.description} onChange={handleChange} rows={4}
          placeholder="Tell job seekers about your company, the type of projects you work on, and why people love working there..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-sm resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">✓ Profile saved!</p>}

      <button
        type="submit" disabled={loading}
        className="w-full bg-yellow-400 text-gray-950 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerProfileForm } from '@/components/dashboard/EmployerProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Company Profile — VoltGrid Jobs' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard/profile')

  const { data: employer } = await supabase
    .from('employers').select('*').eq('user_id', user.id).single()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Company Profile</h1>
        <p className="text-gray-500 text-sm">Shown on your job listings and employer page.</p>
      </div>
      <EmployerProfileForm employer={employer} userId={user.id} />
    </div>
  )
}

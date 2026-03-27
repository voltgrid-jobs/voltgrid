import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { company_name, website, description, location, employer_id } = body

  if (!company_name?.trim()) return NextResponse.json({ error: 'Company name required' }, { status: 400 })

  const admin = createAdminClient()
  const slug = company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  if (employer_id) {
    // Update existing
    const { error } = await admin
      .from('employers')
      .update({ company_name, company_slug: slug, website: website || null, description: description || null, location: location || null })
      .eq('id', employer_id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // Create new
    const { error } = await admin
      .from('employers')
      .insert({ company_name, company_slug: slug, website: website || null, description: description || null, location: location || null, user_id: user.id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

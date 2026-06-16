import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { parseSalary, validateOpportunity, type OpportunityInput } from '@/lib/validation'
import { WORK_MODES, type Opportunity, type WorkMode } from '@/lib/constants'
import { sendOpportunityEmail } from '@/lib/email'

export const runtime = 'nodejs'

function backendUnavailable() {
  return NextResponse.json(
    { error: 'The backend is not configured yet. See SUPABASE_SETUP.md.' },
    { status: 503 }
  )
}

/** Company creates a new opportunity. */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) return backendUnavailable()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_name')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'company') {
    return NextResponse.json({ error: 'Only company accounts can post opportunities.' }, { status: 403 })
  }

  let body: Partial<OpportunityInput>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const input: OpportunityInput = {
    role: String(body.role ?? ''),
    description: String(body.description ?? ''),
    location: String(body.location ?? ''),
    workMode: String(body.workMode ?? ''),
    salaryMin: body.salaryMin ?? '',
    salaryMax: body.salaryMax ?? '',
    sector: String(body.sector ?? ''),
    duration: String(body.duration ?? ''),
    deadline: body.deadline ? String(body.deadline) : '',
    companyValues: String(body.companyValues ?? ''),
    requirements: body.requirements ? String(body.requirements) : '',
  }

  const errors = validateOpportunity(input)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const insertRow = {
    company_id: user.id,
    company_name: profile.company_name?.trim() || user.email?.split('@')[1] || 'Company',
    company_email: user.email ?? '',
    role: input.role.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    work_mode: input.workMode as WorkMode,
    salary_min: parseSalary(input.salaryMin),
    salary_max: parseSalary(input.salaryMax),
    currency: 'GBP',
    sector: input.sector.trim(),
    duration: input.duration.trim(),
    deadline: input.deadline?.trim() || null,
    company_values: input.companyValues.trim(),
    requirements: input.requirements?.trim() || null,
  }

  // Defensive: validateOpportunity already checks work_mode, but never insert an invalid enum.
  if (!WORK_MODES.includes(insertRow.work_mode)) {
    return NextResponse.json({ errors: { workMode: 'Choose remote, hybrid, or office' } }, { status: 400 })
  }

  const { data: created, error } = await supabase
    .from('opportunities')
    .insert(insertRow)
    .select()
    .single()

  if (error || !created) {
    return NextResponse.json({ error: 'Could not save the opportunity. Please try again.' }, { status: 500 })
  }

  const { emailed } = await sendOpportunityEmail(created as Opportunity)

  return NextResponse.json({ opportunity: created, emailed }, { status: 201 })
}

/** Company lists its own opportunities (used for client-side refresh/polling). */
export async function GET() {
  if (!isSupabaseConfigured) return backendUnavailable()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Could not load opportunities.' }, { status: 500 })
  }

  return NextResponse.json({ opportunities: data ?? [] })
}

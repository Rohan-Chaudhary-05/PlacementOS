import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { OPPORTUNITY_STATUSES, type OpportunityStatus } from '@/lib/constants'

export const runtime = 'nodejs'

/** Staff updates an opportunity's review status (and optional note). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'The backend is not configured yet. See SUPABASE_SETUP.md.' },
      { status: 503 }
    )
  }

  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'staff') {
    return NextResponse.json({ error: 'Staff access required.' }, { status: 403 })
  }

  let body: { status?: unknown; reviewNote?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const status = body.status as OpportunityStatus
  if (!OPPORTUNITY_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const reviewNote =
    typeof body.reviewNote === 'string' && body.reviewNote.trim().length > 0
      ? body.reviewNote.trim()
      : null

  const { data, error } = await supabase
    .from('opportunities')
    .update({ status, review_note: reviewNote, reviewed_by: user.id })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Could not update the status.' }, { status: 500 })
  }

  return NextResponse.json({ opportunity: data })
}

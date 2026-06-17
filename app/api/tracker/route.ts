import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getDemoOpportunity, getPublicOpportunity } from '@/lib/opportunities'
import { isTrackState, snapshotFromView } from '@/lib/tracker'

export const runtime = 'nodejs'

function backendUnavailable() {
  return NextResponse.json(
    { error: 'The backend is not configured yet. See SUPABASE_SETUP.md.' },
    { status: 503 }
  )
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>

/** Resolve the signed-in student, or a NextResponse error to return. */
async function requireStudent(supabase: SupabaseServer) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Please sign in.' }, { status: 401 }) }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'student') {
    return { error: NextResponse.json({ error: 'Student accounts only.' }, { status: 403 }) }
  }
  return { user }
}

/** List the student's tracked opportunities. */
export async function GET() {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('tracked_opportunities')
    .select('id, opportunity_ref, state, snapshot, created_at, updated_at')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: 'Could not load your tracker.' }, { status: 500 })
  }
  return NextResponse.json({ items: data ?? [] })
}

/** Save / mark-applied for an opportunity (upsert). */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  let body: { opportunityRef?: unknown; state?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const ref = String(body.opportunityRef ?? '').trim()
  const state = body.state
  if (!ref || ref.length > 100) {
    return NextResponse.json({ error: 'Invalid opportunity.' }, { status: 400 })
  }
  if (!isTrackState(state)) {
    return NextResponse.json({ error: 'Invalid state.' }, { status: 400 })
  }

  // Snapshot is derived from OUR data — never trusted from the client — so a
  // student can't store arbitrary content or spoof a different listing.
  const view = ref.startsWith('demo-') ? getDemoOpportunity(ref) : await getPublicOpportunity(ref)
  if (!view) {
    return NextResponse.json({ error: 'That opportunity is no longer available.' }, { status: 404 })
  }

  const { data, error: dbError } = await supabase
    .from('tracked_opportunities')
    .upsert(
      { student_id: user.id, opportunity_ref: ref, state, snapshot: snapshotFromView(view) },
      { onConflict: 'student_id,opportunity_ref' }
    )
    .select('id, opportunity_ref, state, snapshot, created_at, updated_at')
    .single()

  if (dbError || !data) {
    console.error('Tracker upsert failed:', dbError?.code, dbError?.message)
    if (dbError?.code === '42P01' || dbError?.code === 'PGRST205') {
      return NextResponse.json(
        { error: 'The tracker table is missing. Run supabase/migrations/0003_tracker.sql, then try again.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ item: data }, { status: 200 })
}

/** Remove an opportunity from the tracker. */
export async function DELETE(request: Request) {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  let body: { opportunityRef?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const ref = String(body.opportunityRef ?? '').trim()
  if (!ref || ref.length > 100) return NextResponse.json({ error: 'Invalid opportunity.' }, { status: 400 })

  const { error: dbError } = await supabase
    .from('tracked_opportunities')
    .delete()
    .eq('student_id', user.id)
    .eq('opportunity_ref', ref)

  if (dbError) {
    return NextResponse.json({ error: 'Could not update your tracker.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

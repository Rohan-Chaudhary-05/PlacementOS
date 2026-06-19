import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { MANUAL_TASK_KEYS } from '@/lib/placement-timeline'

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

function missingTable(code: string | undefined): boolean {
  return code === '42P01' || code === 'PGRST205'
}

/** List the student's manual checklist ticks. */
export async function GET() {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('student_checklist')
    .select('item_key, completed, completed_at')
    .eq('student_id', user.id)

  if (dbError) {
    if (missingTable(dbError.code)) {
      return NextResponse.json(
        { error: 'The checklist table is missing. Run supabase/migrations/0005_checklist.sql, then try again.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Could not load your checklist.' }, { status: 500 })
  }
  return NextResponse.json({ items: data ?? [] })
}

/** Set the completed state of a single manual checklist item (upsert). */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  let body: { itemKey?: unknown; completed?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const itemKey = String(body.itemKey ?? '')
  // Only known MANUAL task keys may be written — never trust an arbitrary key.
  if (!MANUAL_TASK_KEYS.includes(itemKey)) {
    return NextResponse.json({ error: 'Unknown checklist item.' }, { status: 400 })
  }
  if (typeof body.completed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid state.' }, { status: 400 })
  }
  const completed = body.completed

  const { data, error: dbError } = await supabase
    .from('student_checklist')
    .upsert(
      {
        student_id: user.id,
        item_key: itemKey,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'student_id,item_key' }
    )
    .select('item_key, completed, completed_at')
    .single()

  if (dbError || !data) {
    if (missingTable(dbError?.code)) {
      return NextResponse.json(
        { error: 'The checklist table is missing. Run supabase/migrations/0005_checklist.sql, then try again.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ item: data }, { status: 200 })
}

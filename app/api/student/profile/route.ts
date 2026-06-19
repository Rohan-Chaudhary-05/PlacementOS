import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { validateStudentProfile } from '@/lib/validation'

export const runtime = 'nodejs'

const COLUMNS = 'discipline, study_year, skills, target_sectors, work_modes, preferred_locations, min_salary'

function backendUnavailable() {
  return NextResponse.json(
    { error: 'The backend is not configured yet. See SUPABASE_SETUP.md.' },
    { status: 503 }
  )
}

function migrationNeeded() {
  return NextResponse.json(
    { error: 'The profile table is missing. Run supabase/migrations/0006_student_profiles.sql, then try again.' },
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

/** Load the signed-in student's match profile (null if they haven't made one). */
export async function GET() {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('student_profiles')
    .select(COLUMNS)
    .eq('student_id', user.id)
    .maybeSingle()

  if (dbError) {
    if (missingTable(dbError.code)) return migrationNeeded()
    return NextResponse.json({ error: 'Could not load your profile.' }, { status: 500 })
  }
  return NextResponse.json({ profile: data ?? null })
}

/** Create or replace the student's match profile (validated server-side). */
export async function PUT(request: Request) {
  if (!isSupabaseConfigured) return backendUnavailable()
  const supabase = await createClient()
  const { user, error } = await requireStudent(supabase)
  if (error) return error

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { errors, clean } = validateStudentProfile((body ?? {}) as Record<string, unknown>)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Please check the form.', fieldErrors: errors }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('student_profiles')
    .upsert({ student_id: user.id, ...clean }, { onConflict: 'student_id' })
    .select(COLUMNS)
    .single()

  if (dbError || !data) {
    if (missingTable(dbError?.code)) return migrationNeeded()
    console.error('Profile upsert failed:', dbError?.code, dbError?.message)
    return NextResponse.json({ error: 'Could not save your profile.' }, { status: 500 })
  }
  return NextResponse.json({ profile: data })
}

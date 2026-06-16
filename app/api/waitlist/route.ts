import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { isAcademicEmail, isValidName } from '@/lib/validation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'The backend is not configured yet. See SUPABASE_SETUP.md.' },
      { status: 503 }
    )
  }

  let body: { firstName?: unknown; email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const firstName = String(body.firstName ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()

  if (!isValidName(firstName)) {
    return NextResponse.json({ error: 'Please enter your first name.' }, { status: 400 })
  }
  if (!isAcademicEmail(email)) {
    return NextResponse.json(
      { error: 'Please use your university email (e.g. ending in .ac.uk or .edu).' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Don't clobber an already-confirmed signup.
  const { data: existing } = await admin
    .from('waitlist_signups')
    .select('confirmed')
    .eq('email', email)
    .maybeSingle()

  if (existing?.confirmed) {
    return NextResponse.json({ ok: true, alreadyConfirmed: true })
  }

  const { error: upsertError } = await admin
    .from('waitlist_signups')
    .upsert({ first_name: firstName, email, confirmed: false }, { onConflict: 'email' })

  if (upsertError) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  // Send the confirmation magic link (also creates the auth user with role=student).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
  const supabase = await createClient()
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { role: 'student', first_name: firstName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (otpError) {
    return NextResponse.json(
      { error: 'Could not send the confirmation email. Please try again shortly.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}

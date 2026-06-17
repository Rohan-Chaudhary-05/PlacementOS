import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dashboardPathFor } from '@/lib/auth'
import type { UserRole } from '@/lib/constants'

export const runtime = 'nodejs'

/**
 * Handles the link in Supabase confirmation / magic-link emails. Supports both
 * the PKCE `code` flow and the `token_hash` flow, exchanges it for a session,
 * then routes the user by role. For students, flips their waitlist row to confirmed.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  // Our own routing hint, preserved through the PKCE (code) flow where `type`
  // isn't present. Set by the student sign-up and forgot-password redirects.
  const flow = searchParams.get('flow')
  const errorDescription = searchParams.get('error_description')

  const loginWithError = (message: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)

  if (errorDescription) return loginWithError(errorDescription)

  const supabase = await createClient()

  let exchangeError = null
  if (code) {
    exchangeError = (await supabase.auth.exchangeCodeForSession(code)).error
  } else if (tokenHash && type) {
    exchangeError = (await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error
  } else {
    return loginWithError('Invalid confirmation link.')
  }

  if (exchangeError) {
    return loginWithError(
      'We could not confirm this link. Please open the most recent email on the same device you signed up from, or request a new link.'
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return loginWithError('Could not complete sign in. Please try again.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const role = (profile?.role as UserRole) ?? 'student'

  if (role === 'student' && user.email) {
    try {
      const admin = createAdminClient()
      await admin
        .from('waitlist_signups')
        .update({ confirmed: true })
        .eq('email', user.email.toLowerCase())
    } catch {
      // best-effort: the auth user is confirmed regardless
    }
  }

  const isRecovery = type === 'recovery' || flow === 'recovery'
  const isSignup = type === 'signup' || flow === 'signup'

  let destination: string
  if (isRecovery) {
    // Password reset: send them to the set-new-password page with their recovery session.
    destination = '/auth/reset'
  } else if (role === 'student') {
    // A fresh student account confirmation → the tracker; a waitlist magic link → confirmed page.
    destination = isSignup ? '/student/dashboard' : '/waitlist/confirmed'
  } else {
    destination = dashboardPathFor(role)
  }

  return NextResponse.redirect(`${origin}${destination}`)
}

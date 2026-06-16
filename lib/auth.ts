import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/env'
import { dashboardPathFor, type UserRole } from './constants'

export { dashboardPathFor }

export type SessionUser = {
  id: string
  email: string | null
  role: UserRole
  companyName: string | null
}

/**
 * Returns the signed-in user with their role, or null. Uses `getUser()` (which
 * verifies the JWT with the auth server) — never trust `getSession()` server-side.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_name')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as UserRole) ?? 'student'

  return {
    id: user.id,
    email: user.email ?? null,
    role,
    companyName: profile?.company_name ?? null,
  }
}

/** Guard a server component: redirect to /login if unauthenticated, or to the
 *  user's own dashboard if they have the wrong role. */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (user.role !== role) redirect(dashboardPathFor(user.role))
  return user
}

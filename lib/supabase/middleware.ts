import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './env'

/**
 * Refreshes the Supabase auth session cookie on each request. Edge-safe — uses
 * only @supabase/ssr (no Node crypto, no service-role key, no role logic).
 * Role-based access control happens in server components via requireRole().
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: nothing between createServerClient and getUser() — it refreshes the token.
  await supabase.auth.getUser()

  return response
}

import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabase/env'

/**
 * Confirmed waitlist count for the homepage. Called from a server component that
 * sets `revalidate` (ISR), so the database is queried at most once per
 * revalidation window — no per-visitor load. Returns null when unavailable.
 */
export async function getWaitlistCount(): Promise<number | null> {
  if (!isSupabaseConfigured) return null
  try {
    // Cookie-less anon client; the count comes from a SECURITY DEFINER aggregate.
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await supabase.rpc('waitlist_count')
    return error || typeof data !== 'number' ? null : data
  } catch {
    return null
  }
}

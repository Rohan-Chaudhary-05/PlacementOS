import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './supabase/env'

/**
 * Display baseline for the homepage waitlist count. The figure shown is this
 * baseline PLUS the real confirmed signups, so the counter starts at 1,254 and
 * only ever grows from there. Change this one constant to adjust the floor.
 */
export const WAITLIST_BASELINE = 1254

/**
 * Waitlist count for the homepage: WAITLIST_BASELINE + confirmed signups.
 * Called from a server component that sets `revalidate` (ISR), so the database
 * is queried at most once per revalidation window — no per-visitor load. Falls
 * back to just the baseline if the count is unavailable, so the figure always shows.
 */
export async function getWaitlistCount(): Promise<number> {
  if (!isSupabaseConfigured) return WAITLIST_BASELINE
  try {
    // Cookie-less anon client; the count comes from a SECURITY DEFINER aggregate.
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await supabase.rpc('waitlist_count')
    const confirmed = error || typeof data !== 'number' ? 0 : data
    return WAITLIST_BASELINE + confirmed
  } catch {
    return WAITLIST_BASELINE
  }
}

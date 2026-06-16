// Public Supabase config (safe in the browser — anon key is designed to be public).
// The service-role key lives only in lib/supabase/admin.ts behind `server-only`.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True once the project URL + anon key are present. UI uses this to degrade gracefully. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

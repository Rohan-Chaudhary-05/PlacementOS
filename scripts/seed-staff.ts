/**
 * Seeds the staff (admin) account used to review opportunities.
 *
 *   npm run db:seed
 *
 * Reads STAFF_EMAIL / STAFF_PASSWORD and the Supabase service-role key from
 * .env.local. Idempotent: re-running ensures the account exists, is confirmed,
 * and has role = 'staff' (the trigger can only ever set 'student'/'company',
 * so staff is granted here, via the service role, on purpose).
 */
import { createClient } from '@supabase/supabase-js'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`✗ Missing ${name}. Set it in .env.local (see SUPABASE_SETUP.md).`)
    process.exit(1)
  }
  return value
}

async function main() {
  const url = required('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = required('SUPABASE_SERVICE_ROLE_KEY')
  const email = required('STAFF_EMAIL').trim().toLowerCase()
  const password = required('STAFF_PASSWORD')

  if (password.length < 8) {
    console.error('✗ STAFF_PASSWORD must be at least 8 characters.')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Find an existing user with this email (paginate defensively).
  let userId: string | undefined
  for (let page = 1; page <= 20 && !userId; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) {
      console.error('✗ Could not list users:', error.message)
      process.exit(1)
    }
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id
    if (data.users.length < 200) break
  }

  if (userId) {
    // Ensure confirmed + password current.
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { role: 'staff' },
    })
    if (error) {
      console.error('✗ Could not update existing staff user:', error.message)
      process.exit(1)
    }
    console.log(`• Staff user already existed — refreshed password & confirmation (${email}).`)
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'staff' },
    })
    if (error || !data.user) {
      console.error('✗ Could not create staff user:', error?.message)
      process.exit(1)
    }
    userId = data.user.id
    console.log(`• Created staff user ${email}.`)
  }

  // Grant the staff role at the profile level (service role bypasses RLS).
  // upsert in case the profile row does not exist yet for some reason.
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: userId, role: 'staff' }, { onConflict: 'id' })
  if (profileError) {
    console.error('✗ Could not set profile role to staff:', profileError.message)
    process.exit(1)
  }

  console.log(`✓ Staff account ready: ${email}`)
  console.log('  Sign in at /login with STAFF_EMAIL / STAFF_PASSWORD.')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err)
  process.exit(1)
})

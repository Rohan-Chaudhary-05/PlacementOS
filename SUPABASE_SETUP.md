# Supabase setup (one-time, ~5 minutes)

PlacementOS uses Supabase for the database, authentication, and email verification.
The app **runs without it** (pages render, but sign-up / login / posting will show a
"backend not configured" message) until you complete these steps.

## 1. Create a project
1. Go to <https://supabase.com>, sign in, and create a **new project** (the free tier is fine).
2. Pick a strong database password and a region near you. Wait ~2 minutes for it to provision.

## 2. Create the database schema
1. In the project, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and click **Run**.
3. You should see "Success. No rows returned." This creates the `profiles`, `opportunities`,
   and `waitlist_signups` tables, the row-level-security policies, and the auth triggers.
4. Open a **New query**, paste [`supabase/migrations/0002_apply_url_and_public_read.sql`](supabase/migrations/0002_apply_url_and_public_read.sql),
   and **Run** it. This adds the `apply_url` / `company_website` columns and the
   `public_opportunities()` read functions that power the public opportunity detail pages.
   (If you set up before this migration existed, just run this one file now — it is additive and safe.)
5. Open a **New query**, paste [`supabase/migrations/0003_tracker.sql`](supabase/migrations/0003_tracker.sql),
   and **Run** it. This adds the `tracked_opportunities` table (with row-level security) that powers
   the student Application Tracker. Additive and safe to run on an existing database.
6. Open a **New query**, paste [`supabase/migrations/0004_pipeline_states.sql`](supabase/migrations/0004_pipeline_states.sql),
   and **Run** it. This widens the tracker's `state` to the full application pipeline
   (Saved → Applied → Interview → Offer → Rejected). Existing rows are unaffected; safe to re-run.
7. *(Optional — legacy.)* [`supabase/migrations/0005_checklist.sql`](supabase/migrations/0005_checklist.sql)
   created the `student_checklist` table for the old Placement Guide readiness checklist. **That feature has
   been removed**, so the table is no longer used by the app — you can **skip this step** on a fresh setup.
   If you already ran it, the unused table is harmless and can be dropped with `drop table public.student_checklist;`.
8. Open a **New query**, paste [`supabase/migrations/0006_student_profiles.sql`](supabase/migrations/0006_student_profiles.sql),
   and **Run** it. This adds the `student_profiles` table (with row-level security) that stores each
   student's match profile (discipline, skills, target sectors, etc.) powering the personalised AI match
   scores. Additive and safe to run on an existing database.

## 3. Copy your keys into `.env.local`
Open **Project Settings → API** and copy three values into `.env.local`:

| `.env.local` variable              | Where to find it                              |
| ---------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`         | Project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Project API keys → `anon` `public`            |
| `SUPABASE_SERVICE_ROLE_KEY`        | Project API keys → `service_role` `secret` ⚠️ |

⚠️ The `service_role` key bypasses all security. It is only ever read on the server.
Never commit it and never prefix it with `NEXT_PUBLIC_`.

Also set, in `.env.local`:
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev (your deployed URL in production).
- `STAFF_PASSWORD` — any strong password (8+ chars); this becomes your staff login.
- `WEB3FORMS_ACCESS_KEY` — optional now (see step 6).

## 4. Configure Auth redirect URLs
In **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: add `http://localhost:3000/auth/callback`

Keep **Authentication → Providers → Email → "Confirm email"** enabled (it is by default).
This is what makes every user verify ownership of their address.

**Recommended — make confirmation links work across devices.** By default Supabase sends
PKCE `?code=` links, which only verify on the *same device/browser* that started sign-up
(students often open email on their phone). To make links device-independent, switch the
email templates to the `token_hash` format (the app's `/auth/callback` already handles it):

In **Authentication → Emails**, edit these templates' link to point at your callback:
- **Confirm signup**: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
- **Magic Link**: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`

> Free-tier email is rate-limited (a few messages per hour) — fine for testing. For
> production, configure your own SMTP under **Authentication → Emails → SMTP Settings**.

## 5. Seed the staff account
With the keys in place:

```bash
npm run db:seed
```

This creates a confirmed staff user from `STAFF_EMAIL` / `STAFF_PASSWORD` and grants it the
`staff` role. Sign in at **/login** to reach the staff review dashboard.

## 6. Resend (real email of new opportunities)
To have each submitted opportunity emailed to `NOTIFY_EMAIL`:
1. Create a free account at <https://resend.com> — **sign up with `Rohan.sc.33@gmail.com`**.
   That lets the default sender `onboarding@resend.dev` deliver to it without verifying a domain.
2. **API Keys → Create API Key**, and put it in `.env.local` as `RESEND_API_KEY`.

`NOTIFY_EMAIL` (the recipient) and `RESEND_FROM` (the sender) are already set in `.env.local`.
To send from your own domain later, verify it in Resend and change `RESEND_FROM`.

If you skip this, opportunities still save and appear in the staff dashboard — only the
email notification is skipped.

## 7. Run
```bash
npm run dev
```

## Deploying later
SQLite-style local files aren't involved — Supabase is already cloud Postgres, so deploying
to Vercel just needs the same env vars set in the Vercel project, and your production URL added
to the Auth redirect list. No code changes.

# PlacementOS

**The AI-powered placement platform built by and for UK STEM students.**
_Find your placement. Land the role._

PlacementOS helps UK STEM undergraduates find, apply for, and win year-long industrial placements and
internships. Unlike a generic job board, it **ranks every opportunity by personal fit**, gives students
**AI-assisted tools to produce strong applications**, and provides a **pipeline tracker** so no deadline is
missed. It is a three-sided product — students, companies, and a staff moderation team — currently in a
**pre-launch (waitlist)** phase.

## Features

### For students
- **AI Match** — a deterministic, explainable fit score (0–100) for every opportunity, weighted across
  skills (35%), sector/discipline (30%), work mode (15%), location (10%) and salary (10%), renormalised over
  only the fields a student fills in. Each score carries a band and plain-English reasons, and drives a
  best-match default sort.
- **Match profile** — discipline, study year, skills, target sectors, work modes, preferred locations and
  minimum salary, with a live "profile strength" meter. Can be **autofilled from an uploaded CV**, parsed
  entirely in the browser (the file is never uploaded or stored).
- **Application tracker** — a 5-stage pipeline (Saved → Applied → Interview → Offer → Rejected) with per-stage
  counts, closing-soon deadline warnings, and one-click `.ics` calendar export.

### AI career tools (deterministic — no API keys)
- **CV Tailor** — structured CV builder with skill canonicalisation and PDF export; supports CV upload +
  in-browser extraction with a manual-tagging fallback.
- **Cover Letter Generator** — role-tailored letters with correct UK conventions and PDF export.
- **Interview Prep** — a STEM question bank across 12 industries with STAR scaffolding; answers saved locally.

### For companies & staff
- **Companies** register with a corporate email, post placement/internship roles through a structured,
  validated form, and track each listing's moderation status.
- **Staff** review every submission in a moderation queue and approve/reject with a note — only approved roles
  are ever shown to students.

## Tech stack
- **Next.js 16** (App Router, React 18, TypeScript, Turbopack) with ISR-cached public pages
- **Supabase** — Postgres, Auth, and Row-Level Security; a service-role admin client kept strictly server-side
- **Resend** for transactional email
- **Tailwind CSS** design system

## Architecture & philosophy
- **Deterministic "AI".** Matching, CV parsing, cover-letter drafting and interview scaffolding are pure,
  template/heuristic functions behind swappable service seams — **no LLM and no API keys**. This means zero
  marginal cost, fully explainable output, and **privacy by design** (CVs are parsed in the browser and never
  uploaded). A real model can be dropped behind any seam later without touching the UI.
- **Security enforced by the database.** A user's role (student / company / staff) is set only by database
  triggers and seed scripts — never client-writable, so privilege escalation is impossible. Every student
  table is isolated by RLS to `auth.uid()`, and public listings are served through `SECURITY DEFINER`
  functions that expose only approved, non-internal fields.

## Getting started
```bash
npm install
npm run dev
```
Configure the backend by copying your Supabase + Resend keys into `.env.local` and running the SQL migrations
in the Supabase SQL editor — see **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for the full walkthrough
(migrations `0001`–`0006`). Without a configured backend the app still runs and degrades gracefully.

## Project structure
```
app/          App Router routes — public, auth, student, company, staff, ai-tools, api
components/   UI primitives + feature components (tracker, match, cv-tailor, cover-letter, interview-prep)
lib/          Deterministic engines (match, cv-tailor, cover-letter, calendar) + Supabase clients + validation
supabase/     SQL migrations — schema, RLS policies, auth triggers
```

## Status
Pre-launch (waitlist). The product is functional end-to-end; distribution and lifecycle features (deadline
and new-match email alerts, blog content, SEO) are on the roadmap.

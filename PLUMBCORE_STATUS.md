# PlumbCore AI — Complete Status Reference
*Last updated: July 7, 2026*
*Project root: /root/plumbcore-ai/*
*Vercel: plumbcore-ai.vercel.app (latest prod: 5h ago, Ready)*

---

## 📋 WHAT'S BUILT (Web App — apps/web)

### Landing & Public Pages
| Page | Route | Status |
|------|-------|--------|
| Landing/Marketing | `/ (page.tsx)` | ✅ Live — full SaaS landing with features, pricing, CTA |
| Login | `/login` | ✅ Live — branded split-screen |
| Signup | `/signup` | ✅ Live — 6-field form with validation |
| Reset Password | `/reset-password` | ⚠️ Broken — in-memory token store, won't work on serverless |
| Quote Portal (public) | `/quote/[company-slug]` | ✅ Built — photo upload + AI analysis |
| Quote Status | `/q/[token]` | ✅ Built — magic link status |
| Submit Quote | `/submit-quote/[companySlug]` | ✅ Built |
| Billing | `/billing` | ✅ Built |
| Onboarding | `/onboarding` | ✅ Built |

### Dashboard Pages (all `'use client'`)
**Main section:**
- `/dashboard` — 808 lines, stat cards, activity feed, mock data
- `/jobs` — 951 lines, list + calendar views, sort/filter
- `/jobs/[id]` — 654 lines, job detail with timeline, photos
- `/clients` — 533 lines, sortable table, search, pagination
- `/clients/[id]` — 515 lines, full detail with edit/notes/properties
- `/schedule` — 686 lines, day/week/month calendar
- `/route-map` — 544 lines, CSS-based map with tech pins
- `/leads` — 522 lines, hardcoded inline MOCK_LEADS array

**AI Tools section:**
- `/ai-chat` — 477 lines, calls `/api/ai/chat` real endpoint
- `/ai-voice-notes` — 386 lines, calls `/api/ai/note-to-invoice` (best real integration)
- `/emergency-triage` — 313 lines, hardcoded MOCK_CALLS
- `/voice-receptionist` — 278 lines, hardcoded MOCK_CALL_HISTORY
- `/phone-calls` — 479 lines, hardcoded mockCallLog
- `/sms` — 475 lines, hardcoded mockConversations

**Finance section:**
- `/pricebook` — 1028 lines, full CRUD, 200+ parts, 38 repairs
- `/price-increases` — 479 lines, partial AI + mock fallback
- `/invoicing` — 586 lines, list + create modal
- `/invoicing/[id]` — 491 lines, status flow + payment modal
- `/invoicing/[id]/print` — 271 lines, printable template
- `/inventory` — 858 lines, sort/filter/bulk/CSV export
- `/inventory/suppliers` — 338 lines, supplier CRUD
- `/inventory/insights` — 403 lines, partial AI analysis
- `/purchase-orders` — 629 lines, list + detail + status timeline

**Admin section:**
- `/team` — 458 lines, "Invite Member" button has NO handler
- `/notifications` — 347 lines, hardcoded 20 entries
- `/audit-log` — 328 lines, hardcoded 25 entries
- `/settings` — 1005 lines, 4 tabs, all hardcoded (can't save)

### API Routes (19 total)
- `/api/auth/login` ✅ — rate limited, good error handling
- `/api/auth/signup` ✅ — uses custom auth (not Supabase Auth)
- `/api/auth/logout` ✅ — clean
- `/api/auth/me` ✅ — token verification
- `/api/auth/reset-password` ⚠️ — in-memory token store (broken on serverless)
- `/api/auth/google` + `/api/auth/google/config` ✅ — Google OAuth
- `/api/ai/analyze-photo` ⚠️ — no auth guard, no cache writes, dead code
- `/api/ai/chat` ⚠️ — no auth guard
- `/api/ai/note-to-invoice` ⚠️ — no auth guard
- `/api/ai/inventory-analysis` ⚠️ — no auth guard
- `/api/ai/detect-price-changes` ⚠️ — no auth guard
- `/api/create-checkout-session` ⚠️ — no auth guard
- `/api/create-portal-session` 🔴 — no auth + arbitrary customerId
- `/api/find-stripe-customer` ⚠️ — no auth, email enumeration
- `/api/webhooks/stripe` ✅ — proper signature verification
- `/api/translations` ⚠️ — 468 lines of hardcoded translation data
- `/api/onboarding` ⚠️ — raw fetch to Supabase REST
- `/api/seed` 🔴 — exposes service role key via NEXT_PUBLIC_

### API Integration Status
| Module | Status |
|--------|--------|
| Supabase client | ✅ Set up, anon key valid |
| Custom Auth | ✅ Bypasses broken Supabase Auth, stores via service_role |
| Stripe | ⚠️ Price IDs hardcoded, API version cast as `any` |
| AI (OpenRouter) | ⚠️ No auth guards = anyone can drain budget |
| Email | ⚠️ Set up but limited (welcome email only) |
| i18n | ⚠️ Wired but pages don't use `t()` — hardcoded English |

---

## 🔴 WHAT'S MISSING / BROKEN (Critical)

### 1. ✅ NO NATIVE MOBILE APP
Monorepo has `apps/web` only. No:
- `apps/mobile` (React Native / Expo)
- Capacitor setup for web-to-mobile
- PWA manifest / service worker
Shared packages exist (types, API client, UI) but no mobile consumer.

### 2. 🔴 Supabase Profiles RLS Infinite Recursion (NEVER FIXED)
The original Supabase Auth signups fail with "Database error saving new user" because profiles table has a broken RLS policy causing infinite recursion. A custom auth system was built as a workaround (bypasses RLS via service_role key), but:
- The original RLS problem was NEVER fixed
- Custom auth stores users in `auth_users` table via service_role key
- The SQL fix was provided months ago but never applied to Supabase dashboard

### 3. 🔴 Password Reset Broken in Production
Uses in-memory `Map<string, { email, expiresAt }>` for reset tokens. On Vercel serverless:
- Cold starts lose all tokens
- Multi-instance: POST (set token) lands on different instance than PUT (use token)
- PUT handler mutates in-memory user object that's discarded in production

### 4. 🔴 All 28 Dashboard Pages Use Mock Data
Every page imports from `@/lib/mock-data` which starts with empty arrays. The `loadDataFromSupabase()` function is NEVER called by any page. Data is:
- Inline hardcoded arrays (8 pages: leads, triage, receptionist, calls, sms, notifications, audit-log, settings)
- Shared mock data (20 pages from `@/lib/mock-data`)
- NONE use real Supabase queries on the frontend (though hooks like `useClients`, `useJobs` exist)

### 5. 🔴 No Logo Image File
No `plumbcore-logo.png` exists in `/public/`. All pages use a gradient "P" initial instead of the real logo. User reported this missing on login page specifically.

### 6. 🔴 No Auth Guards on Costly AI Endpoints
All 5 AI endpoints can be called by anyone → OpenRouter budget drain risk.

### 7. 🔴 Settings & Profile Can't Save
- `useUpdateCompany` is a mock (200ms timeout, returns `{success: true}`)
- `useUpdateProfile` updates Zustand store only (lost on refresh)

### 8. 🔴 Team "Invite Member" Button Does Nothing
Renders on page, click handler is empty/missing.

### 9. 🔴 Service Role Key Leaked via NEXT_PUBLIC_
`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` in seed route → compiled into client bundle.

---

## 🟡 MINOR ISSUES

- Stripe Price IDs hardcoded (should be env vars)
- Hardcoded production URLs (plumbcore-ai.vercel.app) in 3 places
- Invoice lineItems always empty (no join to line_items table)
- `getItemTransactions` is a stub returning `[]`
- Pricebook has duplicate "tube" in unit type options
- `callAlert()` and `alert("coming soon")` in 3 places (PDF export, Send Reminder)
- Custom Tailwind classes (bg-whiteer, text-steel, text-electric) not in config
- i18n translations exist (14 sections, 4 languages) but NO page uses `t()` — all hardcoded English

---

## 🟢 WHAT WORKS (Reliably)

- Supabase connection (anon key valid, DB reachable)
- Custom auth: login/signup/logout via API routes (bypasses broken Supabase Auth)
- Landing page (marketing, SEO meta tags)
- All 28 dashboard pages BUILD clean (no import errors)
- React Query hooks for Clients, Jobs, Invoices (real Supabase CRUD exists, just not used by UI)
- Google OAuth flow
- Stripe webhook signature verification
- Multi-language framework (translations API, LanguageSwitcher component)

---

## 📊 SUPABASE PROJECT INFO
- Project URL: https://zwlwmehlewcyyljskpfv.supabase.co
- Tables: companies, profiles, auth_users, clients, jobs, invoices, line_items, inventory_items, pricebook_items — all exist
- Data seeded: 1 company, 6 profiles, 22 clients, 5 jobs, 5 invoices (via seed script)
- **RLS issue persists on profiles table** — infinite recursion not fixed

---

## 🔧 KEY FILES REFERENCE
| File | Purpose |
|------|---------|
| `apps/web/src/lib/custom-auth.ts` | Custom auth (workaround for broken Supabase Auth) |
| `apps/web/src/lib/supabase.ts` | Supabase client + DB types |
| `apps/web/src/lib/mock-data.ts` | All mock data + loadDataFromSupabase() |
| `apps/web/src/lib/data-service.ts` | Supabase query functions |
| `apps/web/src/lib/store.ts` | Zustand auth store |
| `apps/web/src/app/api/auth/signup/route.ts` | Signup API |
| `apps/web/src/app/api/auth/login/route.ts` | Login API |
| `apps/web/src/app/(dashboard)/dashboard/page.tsx` | Main dashboard |
| `apps/web/src/components/Sidebar.tsx` | Navigation sidebar |
| `/root/.vercel/token` | Vercel deploy token |

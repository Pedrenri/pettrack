# PetTrack Roadmap

Engineering roadmap for: **a global Log tab**, **feeder (insect/prey) stock tracking**, **complete medical logs with file attachments**, **lineage tracking**, and **a native app with working push notifications**.

Stack reference: Next.js 16 (App Router) + React 19, Supabase (Postgres + RLS + Auth), Capacitor 8 (Android), Tailwind 4. Logs are stored in a unified `animal_log` table (`type IN ('feeding','weight','medical','shed','handling','custom')`) with a parallel detailed `animal_feeding_log` and recurring `animal_schedules`. Push is scaffolded: `utils/pushNotifications.ts` registers FCM tokens into `device_tokens`, and `app/dashboard/PushNotificationProvider.tsx` mounts it — but there is no server-side send path yet.

---

## Phase 0 — Foundations (shared prerequisites)

Do these once; everything below leans on them.

- Add a `db/migrations/` convention and a tracking table (`schema_migrations`) so the loose `supabase_migration_*.sql` files run in a known order. Today they live in the repo root with no ordering guarantee.
- Generate TypeScript types from the live schema (`supabase gen types typescript`) into `utils/supabase/types.ts`, and type the client. This makes every schema change below compile-checked.
- Standardize log writes behind a small helper (`utils/log.ts`) so `feeding`, `medical`, etc. entries are created consistently and mirror into `animal_log` where the UnifiedLog reads from.

**Exit criteria:** migrations run in order in a fresh project; `npm run build` is green with generated types.

---

## Phase 0.5 — Log tab (quick win)

**Goal:** a global "Log" tab in the dashboard nav showing recent activity across all the owner's animals. Easiest item — `animal_log` already has everything; no schema changes.

- Add `{ label: "Log", href: "/dashboard/log" }` to `DashboardNav.tsx` tabs.
- New `app/dashboard/log/page.tsx`: query `animal_log` joined to `animals` (owner-scoped), newest first, paginated.
- Reuse `LogEntryCard.tsx`; add filters by animal and by log type.

**Exit criteria:** Log tab lists all recent entries across animals with type/animal filters.

---

## Phase 1 — Feeder tracking

**Goal:** track feeder insects/prey as stock the keeper owns (crickets, dubia, mice, etc.), and link feeders into feeding logs and schedules so logging a feed draws from stock.

### Schema
- New `feeders` table: `id`, `user_id`, `name` (e.g. "Dubia colony"), `type TEXT` (cricket, dubia, superworm, mouse, rat, fish, other), `size TEXT` (pinhead/small/medium/large or weight), `quantity INTEGER`, `unit TEXT DEFAULT 'count'`, `cost NUMERIC`, `acquired_at DATE`, `notes`, `active BOOLEAN DEFAULT true`. Owner-only RLS.
- On `animal_feeding_log`: add `feeder_id UUID REFERENCES feeders(id) ON DELETE SET NULL` and `quantity INTEGER DEFAULT 1`. Keep an optional `status TEXT CHECK (status IN ('offered','eaten','refused','regurgitated'))` for outcomes.
- On `animal_schedules`: add `feeder_id` so a feeding schedule knows which feeder it draws from.

### Backend / logic
- `utils/feeding.ts`: `recordFeeding()` writes the detail row, mirrors a summary into `animal_log` (`type='feeding'`), decrements `feeders.quantity` by `quantity`, and advances the linked schedule.
- Restock = simple quantity update on the feeder (log restocks later if needed).
- Low-stock detection (e.g. quantity below N or below what's needed for the next week of schedules) for the dashboard and Phase 4 notifications.

### Frontend
- **Feeders tab** in `DashboardNav.tsx` → `app/dashboard/feeders/page.tsx`: stock list with quantities, add/edit/restock, low-stock badges.
- `FeedingLog.tsx`: feeder picker (from the owner's active feeders) + quantity when logging a feed; show the feeder used in past entries.
- `ScheduleManager.tsx`: optional feeder selector on feeding schedules.
- Low-stock warning section on `app/dashboard/page.tsx`.

**Exit criteria:** keeper manages feeder stock in a Feeders tab, logging a feed picks a feeder and decrements stock, schedules reference feeders, low stock is visible.

---

## Phase 2 — Complete medical logs

**Goal:** medical entries today are a single `animal_log` row with `type='medical'` and free-text notes. Make them structured, and let the user attach files (medical records, pictures, reports) to a visit.

### Schema
- New `animal_medical_log` table (detail rows; mirror a summary into `animal_log` like feeding does):
  - `id`, `animal_id`, `occurred_at DATE`, `category TEXT CHECK (category IN ('checkup','vaccination','medication','treatment','injury','illness','surgery','parasite','other'))`, `title`, `description`, `vet_name`, `cost NUMERIC`.
- New `medical_attachments` table — multiple files per visit: `id`, `medical_log_id REFERENCES animal_medical_log(id) ON DELETE CASCADE`, `storage_path`, `file_name`, `mime_type`, `size_bytes`, `uploaded_at`.
- Supabase Storage bucket `medical-attachments` with RLS keyed to owner (path convention `user_id/animal_id/medical_log_id/...`).
- New `animal_medications` table for ongoing meds: `name`, `dosage`, `route`, `frequency_days`, `start_date`, `end_date`, `active BOOLEAN`. Recurring meds reuse `animal_schedules` with a new `type='medication'` (extend the CHECK) so the existing due-engine and notifications cover them.

### Frontend
- New `MedicalLog.tsx` on the animal page: timeline filtered by category, add/edit modal.
- **File upload in the add/edit modal**: multi-file (images, PDFs), thumbnails for images, list with download for documents; delete removes from Storage too.
- Attachments visible on each visit's entry (gallery/list).
- Active medications panel with next-dose due state; cost rollup ("vet spend this year").

### Reporting
- Exportable medical history (PDF/CSV) per animal, attachments linked — valuable for vet handoffs and sales.

**Exit criteria:** structured medical entries by category, files attachable to any visit and viewable/downloadable, ongoing medications with due tracking.

---

## Phase 3 — Lineage tracking

**Goal:** add parentage directly on `animals` via `mother_id`/`father_id`, make it easy to add offspring from an existing animal, and render the family tree in Lineage tabs (per-animal **and** a global dashboard tab).

### Schema
- On `animals`, add: `mother_id BIGINT REFERENCES animals(id) ON DELETE SET NULL`, `father_id BIGINT REFERENCES animals(id) ON DELETE SET NULL`, plus `sex TEXT` and `birth_date DATE` if missing.
- Index `mother_id`, `father_id` for tree queries.
- **Guardrails:** no self-reference, no cycles (an animal can't be its own ancestor) — recursive-CTE check in a trigger plus API-side validation. Parents must belong to the same owner; unknown parent = NULL.

### Backend
- Recursive CTE / RPC `get_ancestors(animal_id, depth)` and `get_descendants(animal_id, depth)` for tree rendering without N+1 queries.

### Frontend
- Mother/father pickers in `AnimalEditForm.tsx` and the new-animal form (search the owner's animals).
- **"Add offspring" action** on `AnimalView.tsx`: opens the new-animal form with this animal prefilled as mother or father (by sex).
- `LineageTree.tsx`: multi-generation pedigree (ancestors up, offspring down); reuse `motion` for expand/collapse.
- **Lineage tab on the animal page** rendering that animal's tree.
- **Lineage tab in `DashboardNav.tsx`** → `app/dashboard/lineage/page.tsx`: pick any animal and browse its tree.
- Show parentage on the public animal page (`AnimalPublic.tsx`) — strong selling point for breeders.

**Exit criteria:** assign mother/father, add offspring from an animal, view the pedigree on both the animal page and the global Lineage tab, no cyclic data.

---

## Phase 4 — Native app with working push notifications

**Goal:** close the loop on push. Client registration and `device_tokens` exist; what's missing is a **server-side send pipeline** and the **scheduled triggers** that decide when to notify (feeding due, medication due, vet appointment, low feeder stock).

### Server-side send (the missing half)
- Stand up FCM sending. Recommended: a **Supabase Edge Function** (`functions/send-push`) holding the FCM server credentials (service account → FCM HTTP v1), looking up `device_tokens` by `user_id`, and posting the message. Keep the key server-side only — never ship it to the client.
- Add a `notifications` table to log what was sent (idempotency + history): `user_id`, `animal_id`, `kind`, `sent_at`, `payload`, `dedupe_key UNIQUE`.

### Triggering
- A scheduled job (Supabase `pg_cron` calling the Edge Function, or an external cron hitting `app/api/cron/notify/route.ts` protected by a secret) that runs daily/hourly and:
  - queries feeding-due, medication-due, upcoming vet appointments, and low feeder stock;
  - dedupes against `notifications.dedupe_key`;
  - invokes `send-push` per affected user.
- This is where Phases 1–2 pay off — the due-views are the notification source.

### Client / app hardening
- Finish `pushNotificationReceived` and add `pushNotificationActionPerformed` listeners in `utils/pushNotifications.ts` to deep-link a tapped notification to the relevant animal.
- Token lifecycle: clear `device_tokens` on logout, refresh on token rotation, handle reinstall duplicates (already `upsert onConflict:token`).
- Verify the Android build end-to-end: `google-services.json` present, FCM enabled in Firebase, Capacitor `server`/`androidScheme` config correct, run on a real device.
- In-app notification settings (per-category toggles: feeding, medical, schedules, stock) stored per user.
- **iOS later:** the Capacitor structure supports it; APNs setup + an Apple dev account is a separate follow-on.

**Exit criteria:** a feeding/medication/vet reminder fires from the server on schedule, lands on an Android device, and tapping it opens the right animal.

---

## Suggested sequencing

1. **Phase 0** (foundations) — unblocks everything.
2. **Phase 0.5 (Log tab)** — easiest; ship it immediately.
3. **Phase 1 (feeders)** and **Phase 2 (medical)** in parallel — independent schemas; both mirror into `animal_log`.
4. **Phase 3 (lineage)** — independent; pairs naturally with the `animals` additions (`sex`, `birth_date`).
5. **Phase 4 (push)** — last; consumes the due/low-stock views from Phases 1–2.

## Risks / watch-items
- **RLS on every new table** (`feeders`, `animal_medical_log`, `medical_attachments`, `animal_medications`) — owner policy mirroring the existing ones; public-read only where intended.
- **Storage RLS** for `medical-attachments` — files must be owner-only; signed URLs for viewing.
- **Stock decrements** — guard against negative quantities; deleting/editing a feeding log should consider restoring stock (or explicitly not — decide and document).
- **FCM credentials** must stay server-side (Edge Function), never in the Capacitor bundle.
- **Migration ordering** — adopt Phase 0 before piling on more `supabase_migration_*.sql` files.
- **Notification spam / dedupe** — `dedupe_key` is essential; test that a still-overdue feed doesn't re-notify every cron tick.

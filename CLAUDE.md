# Project State — Statman

Sport-agnostic, mobile-first public athlete profile platform. Basketball demo
scope: one league, two teams, twenty players. See
`statman_project_docs/statman_docs_bundle/00_README.md` for the full kickoff
doc bundle (PRD, site map, API docs, data schema, live game capture spec,
OpenAPI generator architecture, etc.) — read `01_PRD.md`,
`05_SITE_ARCHITECTURE_MAP.md`, and `12_API_DOCUMENTATION.md` first if picking
this up cold. For the frontend specifically, read `docs/frontend-architecture.md`
before touching `apps/mobile` — it's the IA/composition decision record, not
just a folder listing.

## Stack

- Monorepo: pnpm workspaces
- API server: `apps/server` — Fastify + TypeScript + `fastify-openapi-glue`
- Database: `packages/db` — Prisma + **MySQL/MariaDB** (`statman_dev` for dev, `statman_test` for tests — see Deviations)
- API contract: `packages/api-spec` — **split OpenAPI 3.1 source** bundled to one generated file (see Deviations)
- SDK: `packages/sdk` — `openapi-fetch` + React Query hooks, portable to any React app (web or Expo)
- Mobile client: `apps/mobile` — **Expo + Expo Router + NativeWind v4** (React Native, mobile-first per user direction)
- Testing: Vitest (server, spec-driven, real DB). No Playwright/E2E yet — mobile has no automated test runner configured (`test` script is a placeholder).

## Phase Completed

Backend Phases 1–2 equivalent (Foundation + full domain API): done, 5 iterations, all tested and passing (tag `backend-mvp-v0`). Frontend Phase 3 equivalent (IA + component composition + route skeleton for all 13 product surfaces): done this session. Screens are wired to real SDK data where straightforward (Home, Explore, Player/Team/Game profiles, Live Capture, Spectator View) — see `docs/frontend-architecture.md` "Known simplifications" for what's stubbed vs. fully wired.

## Modules Built

### Backend

- [x] Auth (session cookie + Bearer fallback for native) — register/login/logout/me. Register/login also return the raw token in the JSON body (not just Set-Cookie) — added specifically so native clients without a cookie jar can store it (see Deviation 9).
- [x] User + Profile (account identity) — separate from AthleteProfile (public sports identity)
- [x] Sports / Leagues / Schools / Seasons (reference data)
- [x] Teams + Roster (RosterMembership, season-scoped)
- [x] Players (AthleteProfile + Player split, search/filter/paginate, owner-or-admin update)
- [x] Games + live event capture (GameEvent → GameConsensusGroup → GameStatLine pipeline)
  - Join as reporter, start-live, submit/undo event, live snapshot (poll-based), finalize/reconcile
  - Consensus: matching events from ≥2 reporters within an 8s window auto-confirm; single-reporter games auto-accept; unresolved conflicts become `Dispute` rows against the `GameStatLine` and flip its `sourceStatus` to `IN_DISPUTE`
  - `PlayerSeasonStat` / `TeamSeasonStat` incremented at finalize time
- [x] Media (YouTube-only, polymorphic target via `EntityType`)
- [x] Follow / Reaction (polymorphic, one reaction per user per target — upsert/toggle semantics)
- [x] Feed (cursor-paginated, populated by `finalizeGame` and `attachYouTubeMedia` side effects)
- [x] Sources (`SourceReference`), Disputes (public list + admin resolve), Claims (request/review, admin-only), `verifyPlayer` (admin sets `sourceStatus`)
- [ ] Admin panel (no dedicated admin UI beyond the two screens in the mobile app — claims queue only)
- [ ] Imports (source-tracking model exists; no import pipeline)
- [ ] WebSocket realtime rooms (see Deviations — deferred, REST snapshot polling used instead)

### Frontend (`apps/mobile`)

- [x] Expo Router + NativeWind v4 scaffold, design tokens sourced from `19_DESIGN_TOKEN_SHEET.json`, light/dark via CSS variables
- [x] `components/ui` — Text, Button, Card, Avatar, Badge, Input, Textarea, Skeleton, Spinner, EmptyState, Sheet (`@gorhom/bottom-sheet`), StatChip
- [x] `components/entity` — EntityHero, IdentityOverlay, StatChipRail, EntityTabs, SourceBadge, DisputeFootnote, RelatedEntities, EntityProfileShell (the shared Player/Team profile layout)
- [x] `components/domain` — PlayerCard, TeamCard, GameScoreboard, GameStatusBadge, RosterList, FeedItemCard, FollowButton, ReactionBar, LiveEventPad, BoxScoreTable, MediaAttachForm
- [x] SDK wiring — `lib/sdk.ts` (SecureStore-backed token, native `getToken` override), `lib/queryClient.ts`, `AuthGuard`
- [x] All 13 product surfaces routed (see `docs/frontend-architecture.md` route map) — auth (login/register), Home/feed, Explore/search, Player Profile, Team Profile, Game Page, Live Capture, Spectator View, Enter, Disputes submission, Claims (request + admin queue), Me/Dashboard, Media attach (embedded component)
- [ ] Offline event queueing for Live Capture (spec calls for it; not implemented — events submit directly over the network)
- [ ] Public/anonymous browsing (whole `(tabs)` group currently requires auth)
- [ ] Team/Game Sources & Disputes tabs (only stubbed on Player profile)
- [ ] Rankings/leaderboards on Explore (no backend ranking endpoint yet)
- [ ] No automated tests on the mobile app yet (no Playwright/Detox equivalent configured)

## Deviations from Defaults

1. **Split OpenAPI spec, not a single file.** The project's own docs
   (`27_OPENAPI_GENERATOR_ARCHITECTURE.md`) explicitly warn against giant
   monolithic spec files, and the user asked to "keep the yaml file lengths
   under control from the beginning." So: hand-authored source lives in
   `packages/api-spec/src/{root.yaml, components/**, paths/**}` (every file
   well under 150 lines), and `pnpm spec:bundle` (Redocly CLI) compiles it
   into the flat `packages/api-spec/openapi.yaml` that every downstream tool
   (fastify-openapi-glue, openapi-typescript, test/docs generators) consumes.
   The generated bundle is gitignored. `pnpm sdk:generate` runs the bundle
   step first automatically. **Always edit `src/`, never the generated
   `openapi.yaml`.**

2. **Two databases for local dev.** `apps/server/src/__tests__/helpers/setup.ts`
   truncates every table in `afterEach` — the factory's default assumes this
   is safe because the default stack has no separate dev-seed workflow this
   early. Statman's MVP is seed-data-driven (20 demo players), so running
   `pnpm test` against the dev DB would destroy it every time. Fix: `.env`
   points at `statman_dev`, `.env.test` points at a separate `statman_test`
   database, and `apps/server/vitest.config.ts` loads `.env.test` into
   `process.env` before tests run (see `loadTestEnv()` in that file). Push
   the schema to both databases — `pnpm db:push` only does the dev one.
   Vitest also runs test files sequentially (`fileParallelism: false`)
   since both share one real, non-isolated database.

3. **No websocket realtime yet.** `12_API_DOCUMENTATION.md` specifies a
   separate realtime event contract (`liveGame.join`, `liveGame.submitEvent`,
   etc.) for live game rooms. For MVP testability within this session, live
   game actions are plain REST endpoints instead
   (`POST /games/{id}/events`, `DELETE /games/{id}/events/{eventId}`,
   `GET /games/{id}/snapshot`), and the SDK's `useGameSnapshot` hook polls
   every 4s as a realtime-lite substitute. Swapping in actual WebSocket rooms
   later doesn't require changing the REST contract — it's additive.

4. **`AthleteProfile` vs `Profile` vs `User`.** Three-way split, not the
   factory default two-way `User`/`Profile` split:
   - `User` — auth/login identity (email, password, role)
   - `Profile` — account-level public identity (username, displayName, bio) — created automatically at registration, same as the factory default
   - `AthleteProfile` — the sport-agnostic public athlete identity (name, bio,
     hometown, `sourceStatus`) that a `User` may *claim* later via the
     `Claim` review flow. **Not** auto-created at registration — it's
     independently seeded/imported/self-created via `POST /players`, matching
     the docs' "public seeded profiles + claim" model.

5. **No separate `VerificationStatus` table.** The docs list verification as
   its own concept, but the source-status ladder (`SELF_REPORTED` →
   `TEAM_ENTERED` → `MANAGER_APPROVED` → `VERIFIED`, plus `IN_DISPUTE`) is
   modeled as a `SourceStatus` enum field directly on `AthleteProfile` and
   `GameStatLine`, not a separate joined table. Simpler for MVP; revisit if a
   field ever needs multiple simultaneous verification states.

6. **Shared `EntityType` enum for all polymorphic targets.** Rather than a
   bespoke enum per model, `MediaAsset.targetType`, `Follow.targetType`,
   `Reaction.targetType`, `Dispute.targetType`, `FeedItem.targetType`, and
   `SourceReference.targetType` all reuse one `EntityType` enum (mirrored in
   both `schema.prisma` and `components/schemas/common.yaml`). Not every
   value is valid for every model (e.g. `Follow` only makes sense for
   `PLAYER`/`TEAM`) — validity is enforced at the service layer, not the type
   system.

7. **Team is not season-scoped.** Docs say "Team belongs to Sport, League,
   School, Season" — implemented instead as a persistent `Team` (Sport +
   League + optional School) with season-scoping handled entirely by
   `RosterMembership.seasonId`. Avoids duplicating a team row per season.

8. **Every list-style GET operation has a `default:` error response** even
   when no error case is obvious yet. Discovered empirically: `openapi-fetch`
   + `openapi-typescript` collapse a hook's `error` branch type to `never`
   when the spec declares zero non-2xx responses for that operation, which
   breaks `if (error) throw new ApiError(response.status, ...)` at typecheck
   time. Cheap fix, applied everywhere from iteration 2 onward — keep doing
   it for every new operation.

9. **Auth responses include the raw token in the body, not just Set-Cookie.**
   Discovered while wiring the Expo app: React Native has no reliable cookie
   jar for the SDK's default httpOnly-cookie flow, and the SDK's native
   `getToken` override needs *something* to read from storage. `register`/
   `login` now return `{ data: user, token }` — web clients ignore `token`
   (they rely on the cookie as before), native clients store it via
   SecureStore. See `AuthResponse` in `components/schemas/auth.yaml`.

10. **OpenAPI schema `required` arrays must list every field the service
    layer always populates**, not just the "conceptually required" ones.
    Discovered while typechecking the mobile app: fields left out of
    `required` (even ones that are always present, like `GameStatLine.points`
    or `Player.athleteProfile`) generate as `T | undefined` in
    `packages/sdk/src/generated/types.ts`, forcing defensive `?.`/`!`
    scattered through frontend code for values that can never actually be
    missing. Fix at the schema, not in consuming code — see `games.yaml`'s
    `GameStatLine`/`PlayerSeasonStat`/`Game` for the corrected pattern.

## Known Gaps / Parking Lot (explicitly deferred, not forgotten)

- WebSocket live-game rooms (REST polling stands in for now — see Deviation 3).
- Offline event queueing on the Live Capture screen (spec calls for it, not built).
- `/games/{gameId}/disputes` convenience route (docs mention it; generic
  `GET /disputes?targetType=&targetId=` covers the same data today).
- School/Season dedicated detail pages/routes (`/schools/:slug`, `/seasons/:slug`)
  — models exist and are seeded, but no routes yet; not needed for the 2-team demo.
- Imports pipeline (source-tracking model exists; no scraping/import job).
- `pnpm lint` is a placeholder (`echo`) in every package — no ESLint config
  was set up yet; not blocking for correctness but should happen before this
  grows much further.
- Cursor pagination on `/teams`, `/leagues`, `/games` list endpoints — currently
  plain lists, fine at demo scale (2 teams, 1 league), will need it once real
  data volume shows up.
- Public/anonymous browsing on mobile (whole tab group requires auth today).
- Rankings/leaderboards on Explore (no backend ranking endpoint).
- Mobile app has no automated tests (no Detox/Maestro/RNTL setup).

## Verified Working (as of last session)

- `pnpm bootstrap` — clean run end to end
- `pnpm spec:bundle && pnpm spec:lint` — 0 errors, 0 warnings
- `pnpm sdk:generate && pnpm sdk:check` — no drift
- `pnpm typecheck` — clean across **all** packages, including `apps/mobile`
- `pnpm --filter server test` — **85/85 passing**, 15 test files, one per OpenAPI tag
- `pnpm db:seed` — 1 admin user, basketball sport, 1 league, 2 teams, 20 players, all with roster memberships
- Manual smoke test (backend): register → login → me → logout; full game
  lifecycle (create game → join as reporter ×2 → submit events →
  corroboration → finalize → box score + season stats + team score) via curl
- Mobile app: `npx expo-doctor` 17/18 (one harmless patch-version note),
  `npx expo start --web` bundles clean (3351 modules, no Metro errors).
  **Not** visually verified in a browser/simulator — this sandbox has no
  headless browser or device/simulator available. Next session should open
  it in an actual browser or Expo Go and click through the golden path
  (login → Home → Explore → Player Profile → Live Capture) before trusting
  the UI beyond "it compiles."

## Last Session Summary

Backend session tagged `backend-mvp-v0`, then this session built the entire
frontend IA/composition layer: Expo Router + NativeWind scaffold, design
tokens from the docs bundle's token sheet, the full `ui`/`entity`/`domain`
component libraries, SDK wiring for native (including a real backend fix —
auth responses now carry the token in-body for SecureStore), and routed
stubs for all 13 product surfaces with real data wired in wherever the
screen is a straightforward read (Home, Explore, Player/Team/Game profiles,
Live Capture, Spectator View). Two schema-level bugs were found and fixed
by trying to actually typecheck against generated SDK types (Deviations 9
and 10) rather than by inspection — that's the reason to always run
`pnpm typecheck` after frontend changes, not just after backend ones.

Next priorities, in rough order: (1) actually open the app in a browser/Expo
Go and fix whatever the compile-only check couldn't catch, (2) wire the
Team/Game Sources & Disputes tabs the same way Player's is stubbed, (3)
decide whether to keep the whole tab group behind auth or build a public
stack, (4) offline event queueing on Live Capture if the live-demo scenario
needs to survive a dropped connection.

# Project State — Statman

Sport-agnostic, mobile-first public athlete profile platform. Basketball demo
scope: one league, two teams, twenty players. See
`statman_project_docs/statman_docs_bundle/00_README.md` for the full kickoff
doc bundle (PRD, site map, API docs, data schema, live game capture spec,
OpenAPI generator architecture, etc.) — read `01_PRD.md`,
`05_SITE_ARCHITECTURE_MAP.md`, and `12_API_DOCUMENTATION.md` first if picking
this up cold.

## Stack

- Monorepo: pnpm workspaces
- API server: `apps/server` — Fastify + TypeScript + `fastify-openapi-glue`
- Database: `packages/db` — Prisma + **MySQL/MariaDB** (`statman_dev` for dev, `statman_test` for tests — see Deviations)
- API contract: `packages/api-spec` — **split OpenAPI 3.1 source** bundled to one generated file (see Deviations)
- SDK: `packages/sdk` — `openapi-fetch` + React Query hooks, portable to any React app (web or Expo)
- Testing: Vitest (server, spec-driven, real DB), no Playwright yet (no frontend)
- Frontend: **not started** — planned as React Native (Expo), mobile-first, per user direction

## Phase Completed

Backend Phases 1–2 equivalent (Foundation + full domain API), done in 5 iterations, all tested and passing. Frontend (Expo) has not been started — explicitly deferred per user instruction ("backend should go in first").

## Modules Built (backend)

- [x] Auth (session cookie + Bearer fallback for native) — register/login/logout/me
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
- [ ] Admin panel (no dedicated UI/routes beyond `adminAuth`-gated endpoints above — no admin frontend, obviously, since there's no frontend yet)
- [ ] Imports (source-tracking model exists; no import pipeline)
- [ ] WebSocket realtime rooms (see Deviations — deferred, REST snapshot polling used instead)

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

## Known Gaps / Parking Lot (explicitly deferred, not forgotten)

- Admin frontend / any frontend at all (Expo next, per user).
- WebSocket live-game rooms (REST polling stands in for now — see Deviation 3).
- `/games/{gameId}/disputes` convenience route (docs mention it; generic
  `GET /disputes?targetType=&targetId=` covers the same data today).
- School/Season dedicated detail pages/routes (`/schools/:slug`, `/seasons/:slug`)
  — models exist and are seeded, but no routes yet; not needed for the 2-team demo.
- Imports pipeline (source-tracking model exists; no scraping/import job).
- `pnpm lint` is a placeholder (`echo`) in every package — no ESLint config
  was set up yet; not blocking for backend correctness but should happen
  before this grows much further.
- Cursor pagination on `/teams`, `/leagues`, `/games` list endpoints — currently
  plain lists, fine at demo scale (2 teams, 1 league), will need it once real
  data volume shows up.

## Verified Working (as of last session)

- `pnpm bootstrap` — clean run end to end
- `pnpm spec:bundle && pnpm spec:lint` — 0 errors, 0 warnings
- `pnpm sdk:generate && pnpm sdk:check` — no drift
- `pnpm typecheck` — clean across all packages
- `pnpm test` — **85/85 passing**, 15 test files, one per OpenAPI tag
- `pnpm db:seed` — 1 admin user, basketball sport, 1 league, 2 teams, 20 players, all with roster memberships
- Manual smoke test: register → login → me → logout; full game lifecycle
  (create game → join as reporter ×2 → submit events → corroboration →
  finalize → box score + season stats + team score) via curl

## Last Session Summary

Built the entire backend from scratch across 8 tracked tasks: monorepo
scaffold, full Prisma schema, then 5 feature iterations (Auth; Sports/Leagues/
Teams/Players/Roster; Games/live capture/stat derivation; Media/Follow/
Reaction/Feed; Sources/Verification/Disputes/Claims), finishing with
bootstrap verification and this doc. Provisioned local MySQL databases
(`statman_dev`, `statman_test`) since none existed. No frontend work done —
next session should start Phase 3 (Expo app scaffold) per the user's explicit
"backend first" instruction, installing `@statman/sdk` into a new
`apps/mobile` Expo project and building auth + player list/profile screens
first as the golden path.

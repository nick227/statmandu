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
- Testing: Vitest (server, spec-driven, real DB), Jest + `jest-expo` + React Native Testing Library (mobile, unit/component-level — see `apps/mobile/jest.config.js`). No Playwright/E2E or Detox/Maestro yet.

## Phase Completed

Backend Phases 1–2 equivalent (Foundation + full domain API): done, 5 iterations, all tested and passing (tag `backend-mvp-v0`). Frontend Phase 3 equivalent (IA + component composition + route skeleton for all 13 product surfaces): done, then hardened — navigation/back-button gaps fixed, seed data went from inert (20 players, empty everything else) to fully populated, and the source tree was restructured twice (`components/*` → `features/*` → today's flat `modules/*` + `shared/*`, with a lint script enforcing the boundaries). See `docs/frontend-architecture.md` "Known gaps" for what's stubbed vs. fully wired, and `apps/mobile/src/README.md` for the folder/naming rules.

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
- [x] **Live Game Authority** — `PermissionPolicy.ts` (`apps/server/src/services/`) centralizes every action check (`createGame`, `manageRoster`, `submitLiveEvent`, `resolveConflict`, `finalizeGame`, etc.) instead of scattering role checks through services. Manager-assigned reporters via `POST /games/{id}/reporters/invite` (direct assignment today — see Deviation 11), `PATCH`/`DELETE /games/{id}/reporters/{reporterId}` to change role or remove. Multi-reporter disagreements surface as `GameConsensusGroup.status = CONFLICTING` rows, listable/resolvable by a game manager (`ADMIN_OWNER`/`OFFICIAL_SCORER`) via `GET /games/{id}/conflicts`, `POST .../resolve` (pick the correct event), `POST .../mark-disputed` (formally dispute instead of picking one — both events go to `GameEventStatus.DISPUTED`). Finalize still produces `IN_DISPUTE` stat lines for anything left unresolved or explicitly disputed.
  - **Known gap**: no `GET /games/{id}/reporters` (list) endpoint and no user-search endpoint exist yet — `GameSnapshot` only exposes a `reporterCount`, not the actual reporters. This blocks a real "reporter panel" UI (see Frontend below) until one or both are added.
- [x] Media (YouTube-only, polymorphic target via `EntityType`)
- [x] Follow / Reaction (polymorphic, one reaction per user per target — upsert/toggle semantics)
- [x] Feed (cursor-paginated, populated by `finalizeGame` and `attachYouTubeMedia` side effects)
- [x] Sources (`SourceReference`), Disputes (public list + admin resolve), Claims (request/review, admin-only), `verifyPlayer` (admin sets `sourceStatus`)
- [x] **Image uploads** (`ImageAsset` model, separate from the YouTube-only `MediaAsset`) — `POST /images/upload` (base64 body, 5MB default cap via `IMAGE_UPLOAD_MAX_BYTES`), `GET /images?targetType=&targetId=&usage=`. `usage` is one of `AVATAR/LOGO/HERO/EVIDENCE/GALLERY`; uploading an `AVATAR` for a `PLAYER` or a `LOGO` for a `TEAM` also updates that entity's `avatarUrl`/`logoUrl` as a side effect. `ImageService.requireUploadPermission` gates who can upload: avatar uploads require the claiming user (`AthleteProfile.claimedByUserId`), team logos are admin-only for now (no durable team-management role exists yet — revisit once team-role claims land). Storage is provider-abstracted (`apps/server/src/lib/imageStorage.ts`): local disk by default (`IMAGE_STORAGE_DIR`), Cloudflare R2 if `R2_BUCKET`/`R2_ENDPOINT`/credentials are set (falls back to local/volume storage on any R2 failure, not a hard error), or a Railway volume path (`RAILWAY_VOLUME_MOUNT_PATH`) when no R2 config is present. `GET /uploads/images/*` (registered directly in `apps/server/src/index.ts`, not through the OpenAPI-glue router) serves local/volume-backed files.
- [x] **`GET /auth/me/capabilities`** (`AuthService.capabilities`) — the backend half of the "neutral account hub" model (see PRD): returns the current user's claimed athlete profiles (name, avatar, sport, current team), their reporter assignments across games (role, team, whether that role can manage the game per `PermissionPolicy`'s manager-role set), and `canReviewClaims` (`role === 'ADMIN'`). Frontend-agnostic — just unlocked-capability data, no UI decisions baked in.
- [x] **`GameReaction`** — ephemeral, unauthenticated spectator reactions on a live game (`LIKE`/`FIRE`/`CLAP`, keyed by a client-generated `deviceId`, no user account or moderation — spamming is expected and fine for this use case). `POST /games/{id}/reactions` creates one; `GameSnapshot` gained `recentReactions` (last 20) alongside the pre-existing `recentEvents`, plus `recentImageAssets`/`recentMediaAssets` (both `GAME`-targeted and per-`GAME_EVENT`-targeted assets, so a photo/video attached to a specific play surfaces in the same feed) — all three are populated in `GameService.getSnapshot`'s parallel-fetch block alongside the existing event/reporter-count queries.
- [x] **Discipline tracking** (`packages/sports/src/core/discipline.ts`) — sport-agnostic `computeDisciplineStatus(sport, events, teamIds)`, driven by an optional `SportDefinition.discipline` config (`foulEventTypes`, `bonusThreshold`, `foulOutThreshold`). Returns `null` for any sport with no config declared (no guessed rules). Basketball's config models NFHS-style thresholds (bonus at 7 team fouls, foul-out at 5) as a single running-game bucket, not reset-per-half, since `GameEvent` still has no period column. Pure/stateless — computed client-side from the full event log, no backend endpoint of its own.
- [ ] Admin panel (no dedicated admin UI beyond the two screens in the mobile app — claims queue only)
- [ ] Imports (source-tracking model exists; no import pipeline)
- [ ] WebSocket realtime rooms (see Deviations — deferred, REST snapshot polling used instead)

### Frontend (`apps/mobile`)

- [x] Expo Router + NativeWind v4 scaffold, design tokens sourced from `19_DESIGN_TOKEN_SHEET.json`, light/dark via CSS variables
- [x] Source tree: `src/modules/{account,auth,disputes,feed,games,live-scoring,media,moderation,players,social,teams}/` (flat — screens/hooks/components colocated, distinguished by name: `*Screen`, `use*`, `Connected*`) + `src/shared/{ui,layout,media}/` (generic, no module/SDK knowledge) + `src/lib/`. Full rules in `apps/mobile/src/README.md`.
- [x] `pnpm --filter mobile lint` runs `scripts/check-boundaries.mjs` — enforces the import rules above mechanically (no ESLint config needed for this specific check)
- [x] Navigation: every drill-down screen has a header + back button (native `Stack.Screen` header for non-hero screens, a floating `BackButton` overlay on `EntityHero` for Player/Team so it doesn't duplicate the identity overlay's title)
- [x] Shared `Screen` layout primitive (consistent safe-area padding/title — replaced 5 screens' independently-drifting `insets.top` handling); `LoadingState` wired into 7 screens
- [x] Seed data is fully populated, not inert: 2 finalized games with real box scores (one disputed), a live in-progress game with real events and pre-joined reporter personas, an upcoming scheduled game, 7 YouTube media attachments, follows, reactions, a pending profile claim, an already-claimed profile — every screen has real content. See `docs/seeding.md` for demo accounts.
- [x] SDK wiring — `lib/sdk.ts` (SecureStore on native, `undefined` getToken on web so it falls back to httpOnly cookies — expo-secure-store has no web implementation and throws if called there), `lib/queryClient.ts`, `ConnectedAuthGuard`
- [x] All 13 product surfaces routed (see `docs/frontend-architecture.md` route map) — auth (login/register), Home/feed, Explore/search, Player Profile, Team Profile, Game Page, Live Capture, Spectator View, Enter, Disputes submission, Claims (request + admin queue), Me/Dashboard, Media attach (embedded component)
- [x] `shared/media/YouTubeEmbed.tsx` + `SmartImage.tsx` are wired into Player, Team, and Game Media tabs (Game's Media tab didn't exist before — added alongside Box Score/Top Performers).
- [x] `shared/ui/ErrorState.tsx` wired everywhere `LoadingState` is (Player, Team, Game, Spectate, Live Capture, Account, and — found in a later full-app walkthrough — the 5 list screens that had been missed the first pass: Home, Explore, Teams, Live Capture's game list, Claims queue). Each domain hook now exposes `isError` from its primary query, so a network failure or bad id shows a real message instead of spinning forever. Player/Team's loading and error states also gained a `BackButton` they were previously missing entirely (only the loaded state had one, via `EntityHero`). Claims queue also gained a loading skeleton it never had (used to render nothing while loading).
- [x] Style/consistency audit done — spacing and typography token adherence were already clean everywhere (zero raw Tailwind spacing values, only 2 stray `text-2xl` overrides on a `Text` variant). The real finding: 8 places hardcoded a literal RGB/hex color for native props that can't take a `className` (icons, `ActivityIndicator`, `TextInput` placeholders, `@gorhom/bottom-sheet` style props) — none tracked dark mode, and NativeWind follows the OS scheme automatically with no in-app toggle needed, so this was live, not theoretical. Worst case: `Sheet.tsx` hardcoded a pure white sheet background regardless of scheme (the primary content surface on Player/Team/Game). Fixed with one new `useNativeColor()` hook in `lib/theme.ts` mirroring `global.css`'s exact light/dark RGB values — every call site now reads from it instead of guessing its own literal. Also fixed two undersized touch targets (`EntityProfileTabs`, `ConnectedReactionBar`).
- [x] Sources & Disputes wired on Player, Team, and Game via one shared `ConnectedSourcesPanel` (`modules/disputes/`) — calls `useSources`/`useDisputes` directly with the entity's `targetType`/`targetId` (`ATHLETE_PROFILE`/`TEAM`/`GAME`, the same shared `EntityType` enum used everywhere else). Player's Sources tab used to just print the raw `sourceStatus` string; Team and Game had no Sources tab at all. Stat-line-level disputes (e.g. the seeded disputed assist count) were already surfaced inline in the Box Score tab via `DisputeFootnote` — this panel is the complementary entity-level view, not a duplicate of that.
- [x] **Live Game Authority frontend pass** (backend sprint: `PermissionPolicy.ts` + reporter/conflict routes, see Backend above):
  - `packages/sdk/src/hooks/useLiveGames.ts` gained `useGameConflicts`/`useResolveGameConflict`/`useMarkGameConflictDisputed` (the spec + types existed; no hooks wrapped them yet)
  - `modules/live-scoring/ConnectedConflictQueue.tsx` (new) — manager-only conflict list with per-event "Accept" buttons and a "Mark Disputed" fallback, wired into `LiveScoringSessionScreen` behind `isManager` (mirrors the server's `PermissionPolicy` `GAME_MANAGER_ROLES` — keep the two in sync by hand)
  - Finalize now warns before proceeding if `openConflictCount > 0` (native `Alert.alert`, "Finalize Anyway" vs "Cancel") instead of silently finalizing over unresolved conflicts
  - `GameSpectateScreen`'s timeline shows a read-only "Disputed" badge on any event with `status: CONFLICTING | DISPUTED` — no separate endpoint needed, `GameEventStatus` already carries this per-event, and it's just as well: `listGameConflicts` is manager-gated (`resolveConflict` permission), so a regular spectator calling it would 403
  - `LIVE_SCORING_ROLES` fixed to match the real 7-value `GameReporterRole` enum (was stale at 4 values, missing `CONTRIBUTOR`, and never included `ADMIN_OWNER`/`VIEWER` on purpose — assigned/spectate-only roles, not self-joinable)
  - **Not built — genuinely blocked, not skipped**: reporter panel UI (list/add/edit/remove reporters). No `GET /games/{id}/reporters` list endpoint and no user-search endpoint exist, so there's no way to fetch who's currently reporting or look up a user to assign. Needs a backend addition first.
- [x] **Offline event queueing for Live Capture** — `useLiveScoringSession.ts` now queues each event locally (optimistic — the event pad never waits on the network) and syncs in the background. A distinct terminal state per failure mode: `'failed'` (network/5xx, transient) auto-retries every 5s and via a manual "Retry Now"; `'rejected'` (4xx — the server actively refused it) does *not* auto-retry and needs a manual dismiss, so a bad submission doesn't silently vanish or loop forever. New `SyncStatusBar.tsx` (props-only) shows "Synced" / "Syncing N" / "N pending sync" per the spec's "Offline/sync status always visible." Doesn't persist across an app restart — only across network blips within one session; true restart-survival would need AsyncStorage/SecureStore persistence, not built (reasonable scope line for an MVP demo, not a production live-scoring product).
- [x] **Public/anonymous browsing.** Checked the spec first — every read the browsing surfaces need (`listGames`, `getGame`, `listPlayers`, `getPlayer`, `listTeams`, `getTeam`, `getTeamRoster`, `getFeed`, `listMedia`, `listSources`, `listDisputes`, stats endpoints) already has `security: []`; this was a pure frontend gate, not a backend gap. `ConnectedAuthGuard` no longer wraps the whole `(tabs)` group (deleted — it's now unused everywhere) — Home/Explore/Teams and every Player/Team/Game detail route are public. Enter and Me are the two tabs whose entire purpose requires an account; each shows a new `SignInPrompt` (`shared/ui/`) inline instead of a hard redirect, so tapping between tabs while logged out never causes a surprise nav jump. Same treatment on the screens that are pure write actions reachable from public pages: Live Capture's join screen, the profile Claim form, Disputes submission, and the admin Claims queue (checks `isAdmin`, not just logged-in). The three write *widgets* embedded in otherwise-public screens — `ConnectedFollowButton`, `ConnectedReactionBar`, `YouTubeMediaAttachForm` — each degrade individually: Follow/Attach swap to a compact `SignInPrompt`, reactions stay visible (read counts are public) but tapping one while logged out routes to `/login` instead of firing a mutation that would 401. New `modules/auth/useAuthGate.ts` wraps `useCurrentUser` so the 5 screens needing an auth check don't import the SDK directly (they aren't `use*`/`Connected*` files, so a raw SDK import there trips `check-boundaries.mjs`).
- [x] Team Stats tab wired (`currentSeasonStats` + `SportStatStrip`) — the `/teams/{teamId}/stats`-equivalent backend gap noted in an earlier session has since been closed.
- [ ] Rankings/leaderboards on Explore (no backend ranking endpoint yet)
- [x] **Mobile test harness stood up** — `jest-expo` preset + `@testing-library/react-native`, `pnpm --filter mobile test` now runs real tests instead of the old `echo` placeholder. Two real config snags worth remembering if this ever needs rebuilding: (1) RNTL v14 needs a peer package literally named `test-renderer` (not the legacy `react-test-renderer`, which is still installed transitively but isn't what RNTL wants) — without it, `render()` silently returns a dead object with no `toJSON`/query methods instead of erroring clearly. (2) `render()` in this RNTL version returns a `Promise` — every test must `await render(...)`, and separately `apps/mobile/tsconfig.json` needed an explicit `"types": ["jest"]` since `@types/jest` wasn't being auto-discovered under `moduleResolution: "bundler"` + `moduleDetection: "force"`. Coverage so far is deliberately narrow but real: `lib/utils.ts` (`cn` merge behavior), `lib/theme.ts` (status→color mapping for every real enum value), `modules/sports/sportStats.ts` (derived-stat computation — sum and per-game aggregation, division-by-zero guard, the `stats` JSON-bag fallback), and one `Badge` render smoke test proving the full pipeline works. **Not done**: no test yet for `useLiveScoringSession`'s offline queue itself (pending/syncing/failed/rejected transitions — the single most complex, most bug-prone piece of custom logic in the app) — still needs mocking ~8 `@statman/sdk` hooks. The Live Capture redesign session (see Frontend module list) sidestepped this same problem for its *new* logic by extracting the team-flip/player-clear decision into a pure, hook-independent function (`resolvePredictedSelection`) instead of testing the hook directly — the queue logic itself remains a good next addition, using the same pure-extraction trick or finally taking on the SDK mocking.
- [x] **Per-sport theming architecture.** Reviewed design references in `/art` at the user's request — the throughline (dark-first surfaces, full-bleed photography as hero, stats as a branding moment, one confident accent color) was already visible in the independent, in-progress redesign of `EntityHero`/`MediaSurface`/the new `GlassPanel`/`FloatingActionRail` primitives. The specific ask beyond that was to commit to *theming* as first-class, since Statman is explicitly multi-sport (`@statman/sports` already models basketball/soccer/football/tennis as structured data, but had zero visual/theme fields). Added `SportDefinition.theme.accent` (light/dark RGB pair per sport — basketball orange, soccer teal, football rust, tennis lime, chosen to not collide with the existing functional colors verified/dispute/live/imported) and a `sport-accent` Tailwind color reading a new `--color-sport-accent` CSS variable (mirrors exactly how light/dark already works, just one more scoped variable). `useSportTheme(sportSlug)` in `lib/theme.ts` returns a NativeWind `vars()` style object a screen spreads onto its root View — `EntityProfileShell` gained a `style` prop for this, wired into Player/Team profiles and `GameDetailScreen`'s `MediaSurface`. Falls back to brand blue by default (unscoped), so every existing `bg-brand`-based decorative element in `EntityHero`/`MediaSurface` was safely repointed at `bg-sport-accent` — same look until a screen opts in. Also finally wired the four `motion` constants that had sat declared-but-unused in the token sheet since the very first frontend session: `cardPressMs` is now a real Reanimated scale-down on every `Button` press (was a static `active:opacity-70`), `sheetSnapMs` configures `@gorhom/bottom-sheet`'s actual animation timing (was using the library's own default, not ours), and `liveEventFeedbackMs` drives a scale-pulse on `GameScoreboardCard`'s score whenever it actually changes value — the one live-feel cue in the whole app tied to a real design token instead of a made-up number.
- [x] **Athlete profile deep-dive** — cross-referenced `08_LOW_FIDELITY_WIREFRAMES.md`'s "Entity profile screen" wireframe and the PRD's athlete-profile bullet list against the current build; two real, doc-backed gaps closed:
  - **Media carousel** (`shared/media/MediaCarousel.tsx`) — the hero now shows *all* attached media as a swipeable, paged, dot-indicator carousel instead of a single static video. `EntityHero` gained a `mediaItems` prop that switches it in when 1+ items exist, falling back to the original single-video/decorative-panel behavior otherwise — same component, additive, not a rewrite.
  - **Share action** — `EntityHero` gained an `onShare` prop rendering a share button in the hero chrome; Player wires it to a real `Share.share()` call composed from the player's actual name/team/headline stats, closing the PRD's "Follow, react, share, claim" action set (Share was the one completely missing).
  - **Highlights strip** (`modules/players/PlayerHighlights.tsx`) — a new always-visible section between the hero and the tabs (not tab-gated, matching "hide complexity until asked" — the deep-dive tabs are still there for more): "Last Game" (real opponent + date, fetched via one extra `useGame()` call on the most recent `GameStatLine`'s `gameId`, since `listPlayerGames` returns bare stat lines with no game join) and "Season High" (the actual max points across the player's games — computed client-side, not fabricated).
  - Added a staggered fade-in to `StatChipRail` (shared — every entity profile gets it) and a per-tab content cross-fade on Player's tab switches.
  - **Explicitly deferred, not built**: "Ranking" and "Related players" from the wireframe — both need backend endpoints that don't exist (same gap as Explore's rankings); not faking them with placeholder data.
- [x] **Polish pass on the above** — a careful re-read turned up one real structural bug and a few consistency/hierarchy gaps, not busywork:
  - **Layout bug (high severity)**: in `EntityHero`'s new carousel branch, `MediaCarousel` was rendering as a normal block child taking the full 420px height instead of a background layer, which pushed `IdentityOverlay`/`StatChipRail` (also normal-flow, coming after it in JSX) below the visible viewport — `overflow-hidden` would have clipped them entirely. Fixed by wrapping the carousel in `absolute inset-0` and restoring `justify-end` on the container, matching the other two hero branches. This was the *default* path for any player with attached media, so it would've hit immediately.
  - **Overlap bug**: `StatChipRail` was `absolute inset-x-0 bottom-0` inside the hero at the same time `IdentityOverlay` was pushed to the same bottom edge by the hero's `justify-end` — both racing for the same position instead of stacking in sequence. Fixed by letting `StatChipRail` flow normally after `IdentityOverlay`.
  - **Hierarchy bug**: `SportStatStrip`'s season-totals numbers rendered as `font-semibold` body text (~16px) with no size variant — nowhere near the "large stat numbers as the credibility layer" the brand guide calls for, and inconsistent with `StatChip`'s already-correct `statValue`/`statLabel` treatment for what's conceptually the same kind of content. Fixed to match.
  - **Consistency bug**: `PlayerHighlights` hardcoded two more native icon colors (`rgb(107 114 128)`, `rgb(245 158 11)`) instead of using `useNativeColor` — the exact class of dark-mode bug fixed earlier this session, reintroduced by new code. Added a `dispute` entry to `NATIVE_COLOR` and fixed both.
  - **Special treatment**: `Badge` gained an optional `icon` prop (native-color-aware via a new `useStatusNativeColor()`, covering all 6 status tones) — used sparingly, only for `VERIFIED_TEAM_ACCOUNT` (checkmark) and `IN_DISPUTE` (alert) on `PlayerSourceBadge`, leaving the other statuses icon-free per the brand guide's explicit "visually minimal, not a warning banner."
  - Gave the "Claim this profile" CTA actual context (a one-line "Is this you?" explanation in a bordered card) instead of a bare, unexplained button.
- [x] **Three-tier media system + identity hierarchy + expandable stats** — a substantial interaction pass, in order:
  - **Backend**: `AthleteProfile` gained `claimedByUsername`/`claimedByDisplayName` (flattened from the claiming User's account `Profile`, null until claimed) — needed for the new `@username` identity line, and genuinely small (one Prisma include + one schema field), not a new endpoint. Making the two fields `required` (matching Deviation 10's convention) surfaced that **4 separate services independently duplicate player/athleteProfile serialization** (`PlayerService`, `TeamService`'s roster methods, `StatsService`, `VerificationService.verifyPlayer`) — exactly the kind of drift that causes bugs like this one. Extracted a shared `apps/server/src/lib/athleteProfile.ts` (`CLAIMED_BY_USER_INCLUDE` + `withClaimFields()`) and fixed all four rather than patching the field into just the one path that broke.
  - **Identity hierarchy**: `IdentityOverlay`'s single `subtitle` string became an ordered `metaLines` array, each line stepping down in visual weight — Player now reads Name → `@username` (claimed profiles only) → hometown → position/team, matching the explicit priority order requested. Team's old subtitle became `[league, city]` in the same shape.
  - **Three media tiers**: (1) **Grid** — `modules/media/MediaGrid.tsx`, a flex-wrap thumbnail grid (deliberately not a `FlatList`, since it renders inside a ScrollView already and a nested VirtualizedList would misbehave) replacing the old vertical stack of embeds in every Media tab (Player, Team, Game). (2) **Half-screen hero** — `MediaCarousel`, unchanged; Team's hero was upgraded from a single static video to the same carousel Player uses. (3) **Full-screen immersive** — new `shared/media/FullScreenMediaViewer.tsx`: a `Modal` with a paged `FlatList`, tap-anywhere toggles chrome opacity, and a real `react-native-gesture-handler` pan gesture drags the whole stage down with live scale/opacity interpolation, releasing past a threshold (or a fast flick) to dismiss — "reducing view size transition" as an actual gesture, not a close button. `MediaCarousel`/`EntityHero` gained an `onItemPress`/`onMediaPress` override (defaulting to the old direct-to-YouTube tap when not provided) so the hero and grid both open this same viewer — wired on **all three** entity screens now. Game's hero itself (`MediaSurface`, a bespoke scoreboard-over-media composition, not `EntityProfileShell`) was deliberately left as a single static image rather than converted to a carousel — its layout has GlassPanel/FloatingActionRail pinned at fixed bottom percentages, and changing what backs it was a larger, separately-riskable change than wiring its Media tab into the viewer.
  - **Expandable stats**: the Stats tab's `SportStatStrip` now toggles between the sport's `profileHeadline` view (4 stats) and its full `boxScore` view (6+) via a "Show all stats" affordance with an animated chevron and a Reanimated `Layout` transition on the height change. `SportStatStrip` itself learned to wrap into a fixed-width grid instead of squeezing an increasing stat count into one ever-tighter row.
  - Verified at each stage rather than all at once given the size: full typecheck, boundary lint, and a bundle check confirming the new gesture code actually compiles and loads, after every major piece (backend fix, identity, media tiers, stats expand).
- [x] **Canonical-entity linking audit** — drilled into every piece of displayed content on the athlete page (and its immediate outbound references — games, other teams) asking "does this point at a real page, and is it tappable." Found one genuine content bug in the process, not just missing links: Game's Box Score tab was rendering **raw player UUIDs**, not names (`playerNameById={{}}` was passed empty at the call site, and `SportStatTable`'s fallback was `row.playerId`) — Top Performers had the same root cause, papered over with a hardcoded "Player line" label. Root cause: `GameStatLine` (returned bare by both `getBoxScore` and `listPlayerGames`) carried `playerId`/`gameId` but no name, opponent, or date, so nothing built on it could ever be self-identifying or linkable.
  - **Backend**: `GameStatLine` gained `playerName`, `gameOpponentName`, `gameScheduledAt` (all required, matching Deviation 10). New shared `apps/server/src/lib/gameStatLine.ts` (`withGameStatLineContext()`) batches the game/player lookups once regardless of which direction the query came from (one game/many players for `getBoxScore`, one player/many games for `listPlayerGames`) — no N+1.
  - **`SportStatTable`** gained a `mode` prop (`byPlayer` default for Game's box score, `byGame` for Player's game log) — every row is now a real `Link` to the canonical page, and the old `playerNameById` workaround prop is gone entirely, not just patched.
  - **Established rule**: every reference to a canonical entity (player, team, game) renders as a tap target to that entity's existing route — `/players/[id]`, `/teams/[id]`, `/games/[id]` all already existed, no new routes needed. `IdentityOverlay`'s `metaLines` gained a `{ text, onPress }` variant so a specific line (Player's team) can be tappable while the component still owns the weight-by-index styling, rather than pushing styling onto callers. Wired: Player's team meta-line → team page, `PlayerHighlights`' "Last Game" card → that game, Team's Games tab rows → each game (now also showing the actual opponent, which wasn't displayed at all before), Game's Top Performers → each player.
  - **Deliberately not linkable**: `hometown` (a plain string field, no City/School entity backing it) and `@username` (account identity — no public route exists for it in the site map). Both stay plain text rather than faking a destination.
- [x] **Game page: Play by Play tab** — the raw material for a real recap already existed (`GameEvent` rows are never deleted after finalize) but was never exposed as one; the only endpoint touching events, `getGameSnapshot`, is scoped to live polling (last 20, PENDING included, refetches every 4s forever).
  - **Backend**: new `GET /games/{gameId}/events` (`listGameEvents`, public, no auth gate) returns the full event log ascending by `clientTimestamp` for *any* game status — not a live-only concern. Excludes `REJECTED` (a reporter's own undone mistakes) but keeps `CONFLICTING`/`DISPUTED` visible rather than hiding disagreements. `GameService.listEvents` + 2 new tests (public access, undone-event exclusion + ordering) — 115/115 passing.
  - **Frontend**: `modules/games/GamePlayByPlay.tsx` — one row per event, reusing the sport definition's own `events[type].label` (e.g. "Two made", not the raw `FG2_MADE` enum) rather than inventing new copy; scoring plays get a heavier weight. Player/team names are resolved from data the page already fetches (`stats[].playerName`, `game.gameTeams`) instead of a further backend join. Disputed events get the same `Badge tone="dispute"` treatment `GameSpectateScreen`'s live timeline already established — one visual language for "this is contested," not two.
  - Placed as the **first** tab, ahead of Box Score — a recap is the primary "what happened" view; the box score is the numbers behind it.
  - New `useGameEvents` SDK hook (no polling — unlike `useGameSnapshot`, a finalized recap is static, so refetching every 4s would be pure waste).
- [x] **Live Capture redesign — predictive entry, AAA visuals, presence, broadcast mode.** The live-scoring screen was the last one still built purely for completeness, not speed: every possession change cost 3 taps (team → player → event) because nothing carried state forward, and the event grid was a flat, undifferentiated list. Planned via `EnterPlanMode` before touching code (see plan doc if needed — `partitioned-imagining-thacker.md`). Two scope-defining facts found during planning: `EventDefinition` (`packages/sports`) already declared `quickAdjust`/`confirmationMode`/`requiresSecondaryPlayer` fields that **no UI ever read** — this pass is the first thing to wire them up, not new API surface. And `GameService.submitEvent` hard-rejects (409) unless `game.status === 'LIVE'`, with no unfinalize path — so "bulk/backfill entry" can only mean fast catch-up on an already-live game, not reopening a `FINAL` game to log historical stats (that needs a real backend change, not attempted here).
  - **Predictive sequencing**: new `EventDefinition.flow` field (`suggestsEvents`/`flipsPossession`/`keepsPlayer`) — basketball's data now encodes real game flow (made shot → suggest ASSIST, flip possession; miss → suggest both rebounds, clear sticky player since the rebounder is someone else; foul → suggest FT_MADE/FT_MISS, flip possession, clear player). Sport-agnostic `predictNext(sport, lastEventType)` (`packages/sports/src/core/predictNext.ts`) reads it — a sport with no `flow` data degrades to "no suggestion," never throws. 8 unit tests in `apps/mobile/src/modules/sports/__tests__/predictNext.test.ts` (sports package itself still has no test runner — matches existing convention of testing `@statman/sports` logic from mobile's Jest harness, e.g. `sportStats.test.ts`).
  - **`useLiveScoringSession`**: after each synced event, `applyPrediction` flips `selectedTeamId` and/or clears `selectedPlayerId` per the prediction, and sets `suggestedEventTypes` for the pad to highlight. The team-flip/player-clear decision is a pure function, `resolvePredictedSelection` (exported from the hook file), specifically so it's unit-testable without rendering the hook or mocking `@statman/sdk`'s ~8 query/mutation hooks (previously flagged in this doc as a real gap) — 7 tests in `live-scoring/__tests__/resolvePredictedSelection.test.ts`. Also gained: `reporterCount` surfaced from `GameSnapshot` (the field already existed, was already being fetched, just never read into anything), a `mode: 'live' | 'catchUp'` toggle (catch-up spaces synthetic `clientTimestamp`s 4s apart from the game's `scheduledAt` so play-by-play order survives a scorer pausing mid-batch — same endpoint, same `LIVE`-only constraint, just different timestamp sourcing), and `expo-haptics` (new dependency — light impact on every submit, success notification on finalize, warning on a rejected sync; guarded with the same `Platform.OS === 'web'` no-op pattern already used for `expo-secure-store`, since haptics has no native web implementation either).
  - **`SportEventPad`** (evolved in place, not forked): tiles are now grouped by each event's `group` field into a small fixed color palette (Scoring/Misses/Possession/Playmaking/Defense/Discipline), `quickAdjust` events (the 3 highest-frequency scoring taps) get a taller "hero" row, and any tile in `suggestedEventTypes` gets a subtle Reanimated pulse (`motion.liveEventFeedbackMs`) — every tile stays tappable regardless of the suggestion, it's a nudge, not a lock.
  - **Screen redesign** (`LiveScoringSessionScreen.tsx`): replaced the linear `ScrollView` stack with a fixed, non-scrolling composition — compact scoreboard + `ReporterPresencePill` + sync strip, a compact team-select row, an active-player chip (avatar + name, tap to switch) replacing the always-visible horizontal roster strip, then the event pad as the dominant element, then a compact Undo/Cast/Finalize row. The roster picker (`PlayerSwitchSheet`) and the conflict queue both moved into one shared `Sheet` instance, opened on demand via ref (`sheetRef.current?.snapToIndex(0)`) rather than being permanently on-screen — first screen in the app to control `Sheet` imperatively rather than rendering it always-open at index 0.
  - **`confirmationMode: 'detail'` + `requiresSecondaryPlayer`** (the two other previously-dead fields) now drive `SubstitutionPicker` — a real two-step "who's coming out" → "who's coming in" swap, submitted as two ordinary `SUBSTITUTION_OUT`/`SUBSTITUTION_IN` events via a new `submitEvent(type, overridePlayerId?)` parameter. No backend change: `requiresSecondaryPlayer` drives the UI step, it isn't a second field on the request body.
  - **Broadcast/large-display mode**: new public route `/games/[gameId]/broadcast` → `BroadcastDisplayScreen.tsx`, meant for a second, larger device (venue TV, propped-up tablet) a manager/broadcaster points at the same game via a new "Cast to Display" button. Reuses `useGameSnapshot` exactly as-is (already polls every 4s, already returns score/recentEvents/reporterCount) — zero backend change. Forces NativeWind's `dark` class on its root View so every token-based color (including inside reused components like `GamePlayByPlay`/`Badge`) resolves its dark-mode CSS variable regardless of the viewing device's OS scheme — a jumbotron-style display shouldn't flip to a light background just because someone's phone/tablet happens to be in light mode; same variable-scoping mechanism `useSportTheme()` already relies on.
  - **Explicitly deferred** (flagged during planning, not silently dropped): true post-hoc historical entry against a `FINAL` game (blocked by the `LIVE`-only gate + one-way finalize — would need a real backend change); a full reporter *identity* list beyond the count (still blocked by the known missing `GET /games/{id}/reporters` endpoint); period/game-clock tracking (`SportDefinition.periods` is sport metadata only, `GameEvent` has no period column); multi-level undo (hook still tracks only `lastEventId`).
  - Verified: `pnpm --filter mobile typecheck`/`lint` clean, workspace `pnpm typecheck` clean across all 7 packages, `pnpm --filter mobile test` 34/34 passing (up from 19 — added `predictNext` and `resolvePredictedSelection` suites), live Metro web bundle fetched and grepped for every new symbol (`BroadcastDisplayScreen`, `SubstitutionPicker`, `PlayerSwitchSheet`, `ReporterPresencePill`, `resolvePredictedSelection`, `predictNext`, `useBroadcastDisplay` — all present, HTTP 200, no bundler errors).
- [x] **Live Capture scorer's-table review pass** — asked for an expert design critique against real broadcaster/scorekeeping tools (GameChanger, Hudl, scorer's-table software) plus the specific ask of unifying single-player and full-game tracking into one system that reflects their different complexity. Findings and fixes, in the order built:
  - **Job-based join screen**: the old join step listed all 5 raw `GameReporterRole` values as buttons (`OFFICIAL_SCORER`, `TEAM_SCORER`, ...) — a permission enum wearing a UI costume. Replaced with 4 task-oriented choices — **Score the Game** (→ `TEAM_SCORER`, with "I'm the assigned Official Scorer" as a deliberate secondary link to `OFFICIAL_SCORER` rather than the default, since that role carries real manager authority), **Track a Player** (→ `CONTRIBUTOR`), **Broadcast** (→ `BROADCASTER`), **Watch** (not a reporter role at all — navigates straight to the existing public `/games/[gameId]/spectate` route). `SPECTATOR_REPORTER` has no dedicated button; it has no functional difference from `CONTRIBUTOR` in `PermissionPolicy`, so preserving it as a 6th choice would have reintroduced the exact enum-leakage this pass removed.
  - **Jersey-number-first player UI**: every real scorekeeping tool leads with the number on a player's back, not their name, because that's the only thing visible during live action. New shared `PlayerPickRow.tsx` (jersey number in a bold badge, name secondary, no avatar photo — recognition speed, not decoration) replaces the old name-first rows in `PlayerSwitchSheet` and `SubstitutionPicker`; the active-player chip on the main screen gained the same badge (previously showed no jersey number at all, just an avatar + name).
  - **Live foul/bonus tracking**: `FOUL` events were being captured and thrown away — no team-foul/bonus/foul-out concept existed anywhere, despite that being *why* a scorer's table exists, not a nice-to-have stat. New optional `SportDefinition.discipline` config (`foulEventTypes`, `bonusThreshold`, `foulOutThreshold`) + sport-agnostic `computeDisciplineStatus()` (`packages/sports/src/core/discipline.ts`, 7 unit tests) — returns `null` for any sport with no config declared rather than guessing at an unresearched rule. Basketball gets NFHS-style thresholds (bonus at 7 team fouls, foul-out at 5), explicitly documented as a single running-game bucket rather than reset-per-half, since `GameEvent` still has no period column. Derived client-side from `useGameEvents` (new `{ poll: true }` option added to that hook for this live use, distinct from its original non-polling Play-by-Play use) — no backend change. Surfaced as a fouls-count + "Bonus" badge under each team in the team-select card, and a flagged-not-blocked "OUT" badge on `PlayerPickRow` (a scorer occasionally needs to correct a mistaken foul entry, so fouled-out players stay selectable).
  - **Collapsed capture header**: four stacked bands (presence row, scoreboard, sync bar, team row, player chip) became two — one combined presence+sync row above the scoreboard, and the team-select + player-chip merged into a single bordered card with an internal divider — freeing more vertical space for the pad itself, which is the actual job.
  - **Recent-plays correction strip** (`RecentPlaysStrip.tsx`): a scorer's real mistake pattern is noticing an error a couple of plays later, not just on the last tap — a single "Undo Last" button can't fix that. Shows the last 3 plays with per-row undo, backed by a new `undoEventById()` (the backend has no "most-recent-only" restriction on undo — confirmed by reading `GameService.undoEvent`, any of the reporter's own non-`FINALIZED`/`CORRECTED` events can be undone by id). Deliberately withholds the undo affordance (shows the row, just no undo button) on `CONFLICTING`/`DISPUTED` events: reading `GameService` surfaced that undoing an event already inside a `GameConsensusGroup` doesn't clean up the sibling event/group state, and `resolveConflict`/`markConflictDisputed` both run unguarded `updateMany` calls that could resurrect an already-rejected event — a real backend gap, not something this frontend pass should paper over or accidentally make easier to trigger.
  - **Track-a-Player mode**: the core "unify but reflect complexity" ask. Joining via **Track a Player** doesn't get a different screen — once a team+player is picked (reusing the exact same team-select card and `PlayerSwitchSheet`), the chrome collapses: the team-card is replaced by a single "Tracking #N Name · Change" line, and a live single-player stat strip appears using `reconcileEvents()` (the same reconciliation engine `finalize()` runs server-side, run client-side here against the in-progress event log) fed into the existing `SportStatStrip` component — the identical stat-chip display already used on Player profile pages, now showing a live in-game line instead of a season total. The event pad, prediction engine, undo, and recent-plays strip are all *exactly* the same component instances as full-game mode, just scoped — same system, visibly less chrome, because the job genuinely has less to track. Both `roster` queries (home + away) are now fetched unconditionally instead of just the selected team's, so `RecentPlaysStrip`/name resolution work correctly regardless of which team's event happened most recently (a beneficial side effect: switching the selected team no longer triggers a fresh roster fetch either).
  - **Explicitly deferred**: true post-hoc historical entry and the consensus-group undo cleanup gap above are backend work, not attempted here per explicit instruction to stay frontend-only this pass. A full undo *stack* (multi-step, reorderable) is still not built — the 3-play strip is a bounded visibility window with per-row undo, a real improvement over single-step, but not a general-purpose undo history.
  - Verified: workspace `pnpm typecheck` clean across all packages, `pnpm --filter mobile lint` clean, `pnpm --filter mobile test` 41/41 passing (up from 34 — added `computeDisciplineStatus` suite), live Metro web bundle fetched and grepped for every new symbol (`JobOption`, `PlayerPickRow`, `RecentPlaysStrip`, `computeDisciplineStatus`, `trackedPlayerStats`, `isTrackMode` — all present, HTTP 200).

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
   truncates every table in `beforeEach` — the factory's default assumes this
   is safe because the default stack has no separate dev-seed workflow this
   early. Statman's MVP is seed-data-driven (20 demo players), so running
   `pnpm test` against the dev DB would destroy it every time. Fix: `.env`
   points at `statman_dev`, `.env.test` points at a separate `statman_test`
   database, and `apps/server/vitest.config.ts` loads `.env.test` into
   `process.env` before tests run (see `loadTestEnv()` in that file). Push
   the schema to both databases — `pnpm db:push` only does the dev one, and
   `pnpm db:test:push` pushes `.env.test` with a guard that refuses anything
   except `statman_test`. Server test setup also refuses to run unless
   `DATABASE_URL` points at `statman_test`, and resets the test DB before
   every test. Vitest runs test files sequentially (`fileParallelism: false`)
   since they share one real, non-isolated database.

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

11. **"Invite a reporter" currently means direct assignment, not an
    invite/accept flow.** `POST /games/{id}/reporters/invite` immediately
    creates the `GameReporter` row — there's no pending-invite table or
    notification step. Acceptable for MVP (a manager is assigning someone
    they already coordinated with off-app), but the user-facing copy must
    say "Add reporter" / "Assign reporter", never "Invite" — "invite"
    implies the other person gets a choice, which isn't true yet. Revisit
    if/when a real accept-or-decline step gets built.

## Known Gaps / Parking Lot (explicitly deferred, not forgotten)

- WebSocket live-game rooms (REST polling stands in for now — see Deviation 3).
- Offline event queueing on the Live Capture screen (spec calls for it, not built).
- `/games/{gameId}/disputes` convenience route (docs mention it; generic
  `GET /disputes?targetType=&targetId=` covers the same data today).
- School/Season dedicated detail pages/routes (`/schools/:slug`, `/seasons/:slug`)
  — models exist and are seeded, but no routes yet; not needed for the 2-team demo.
- Imports pipeline (source-tracking model exists; no scraping/import job).
- `pnpm lint` is a placeholder (`echo`) in every package **except mobile**,
  which has a real one (`scripts/check-boundaries.mjs`, a hand-written
  fitness function, not ESLint). Backend/db/sdk/shared still have no real
  lint config — not blocking for correctness but should happen before this
  grows much further.
- Cursor pagination on `/teams`, `/leagues`, `/games` list endpoints — currently
  plain lists, fine at demo scale (2 teams, 1 league), will need it once real
  data volume shows up.
- Rankings/leaderboards on Explore (no backend ranking endpoint).
- Mobile app has only unit/component-level tests (Jest + RNTL) — no Detox/Maestro/E2E setup, and no test yet for the offline event queue specifically (see Frontend module list).

## Verified Working (as of last session)

- `pnpm bootstrap` — clean run end to end
- `pnpm spec:bundle && pnpm spec:lint` — 0 errors, 0 warnings
- `pnpm sdk:generate && pnpm sdk:check` — no drift
- `pnpm typecheck` — clean across **all** packages, including `apps/mobile`
- `pnpm --filter server test` — **123/123 passing**, 15 test files, one per OpenAPI tag (`+10` from the images upload/list/permission tests and the `createGameReaction` snapshot test added this session)
- `pnpm --filter mobile test` — **41/41 passing**, 7 test files (Jest + `jest-expo` + RNTL, harness stood up in an earlier session — see Frontend module list; `predictNext`/`resolvePredictedSelection`/`computeDisciplineStatus` suites added during the Live Capture redesign and its scorer's-table review pass)
- **A prior session's work was picked up mid-interruption and found genuinely broken at `HEAD`**: `AccountScreen.tsx`/`useAccountSession.ts` and `RecentPlaysStrip.tsx`/`useLiveScoringSession.ts` had already been committed importing `useMeCapabilities` and `computeDisciplineStatus`, but the backend/SDK/`packages/sports` code those symbols come from was still sitting uncommitted — a fresh clone of `HEAD` would have failed `pnpm typecheck`. Also found: the OpenAPI spec had grown `GameSnapshot.recentImageAssets`/`recentMediaAssets` and a `MeCapabilities`/image-upload schema, but `pnpm sdk:generate` was never re-run, so the generated SDK types were stale; and `MediaAsset` was missing `createdAt` in the schema despite always having it on the Prisma model (silently stripped from API responses). All fixed and reordered into commits that build cleanly at each step — see recent git log rather than trusting an uncommitted CLAUDE.md diff as a proxy for what's actually landed. **Lesson**: when resuming an interrupted session, verify `pnpm typecheck`/`pnpm sdk:check` against what's actually committed, not just the working tree — a clean working tree can mask a broken commit history.
- `pnpm db:seed` — seeded demo users/personas, basketball sport, 1 league, 2 teams, 20 players, roster memberships, games, media, follows, reactions, claims, disputes, and source references. See `docs/seeding.md`.
- Both `SourceStatus` and `ReferenceSourceType` enums were renamed (e.g. `SELF_REPORTED` → `PLAYER_REPORTED`) — the schema and seed script were updated together, but the generated Prisma client wasn't regenerated yet when this was picked up, so `pnpm typecheck` briefly failed against the stale client. Fixed by `prisma db push --force-reset` against **both** `statman_dev` and `statman_test` (a plain rename push failed with "Data truncated" — the old and new enum value sets don't overlap, so MySQL can't cast between them; both DBs are fully seed-reproducible so a reset + reseed was the right call, not a migration) and `pnpm db:seed`. If you rename an enum again: expect the same "Data truncated" error, and reset both databases, not just dev.
- Manual smoke test (backend): register → login → me → logout; full game
  lifecycle (create game → join as reporter ×2 → submit events →
  corroboration → finalize → box score + season stats + team score) via curl
- Mobile app: `npx expo-doctor` 17/18 (one harmless patch-version note),
  `npx expo start --web` bundles clean (3350+ modules, no Metro errors),
  `pnpm --filter mobile typecheck` and `pnpm --filter mobile lint` both
  clean after the `modules/*` restructure. Registration/login **has** been
  manually verified working end-to-end on Expo web by the user (this caught
  two real bugs: CORS hardcoded to Vite's port instead of Expo's, and
  `expo-secure-store` being called on web where it has no implementation —
  both fixed). Still not verified on iOS/Android/Expo Go specifically.

## Last Session Summary

Backend session tagged `backend-mvp-v0`. The frontend session that followed
went through several rounds:

1. **Initial build**: Expo Router + NativeWind scaffold, design tokens from
   the docs bundle's token sheet, component libraries, SDK wiring for native
   (including a real backend fix — auth responses now carry the token
   in-body for SecureStore), routed stubs for all 13 product surfaces.
2. **User-reported UI problems** ("nav mysteriously disappears," inconsistent
   spacing, app feels dead) turned out to have concrete causes, not vibes:
   every drill-down screen was missing a header/back-button (fixed with
   native headers + a floating `BackButton` on hero screens), 5 tab screens
   each hand-rolled slightly-different safe-area padding (fixed with a
   shared `Screen` primitive), and the seed data was almost entirely empty
   (fixed — see Frontend module list above). Also found: CORS blocked Expo
   web entirely (hardcoded to Vite's port), and two bugs in the new seed
   script itself (a season-stat corruption bug, non-idempotent game
   creation) caught only because `packages/db/tsconfig.json` was silently
   excluding `prisma/seed.ts` from typecheck the whole time — fixed.
3. **User restructured the source tree twice**, independently, in response
   to the same feedback: `components/{ui,entity,domain,layout}` →
   `features/*/{screens,hooks,components}` → today's flat `modules/*` +
   `shared/*`, and added `scripts/check-boundaries.mjs` (wired as
   `pnpm lint`) to mechanically enforce the resulting import rules. Each
   round was independently re-verified here (typecheck, boundary lint, no
   stray old-path imports, Metro bundle) rather than trusting the user's
   own summary at face value — all checked out both times.
4. **A live bug hunt during manual testing**: registration failing on Expo
   web turned out to be `expo-secure-store` (native-only, no web
   implementation) being called unconditionally — fixed to skip SecureStore
   entirely on `Platform.OS === 'web'` and fall back to the SDK's default
   cookie auth.

Docs (`docs/frontend-architecture.md`, this file) were rewritten to match
the current `modules/*` structure and point to `apps/mobile/src/README.md`
(colocated with the code) as the source of truth for folder/naming rules,
rather than re-describing them in a doc that's proven to go stale across
restructures.

Next priorities, in rough order: (1) wire `YouTubeEmbed`/`SmartImage` into
the Media tab (built, unused), (2) wire `ErrorState` the same way
`LoadingState` already is, (3) wire the Team/Game Sources & Disputes tabs
the same way Player's is stubbed, (4) decide whether to keep the whole tab
group behind auth or build a public stack, (5) actually click through the
app on iOS/Android/Expo Go, not just Expo web.

# Frontend Architecture — Expo Mobile App (`apps/mobile`)

This is the information-architecture and component-composition **decision**
record for the Expo client — the *why*, not the *where*. For folder
boundaries, naming rules, and import rules, **`apps/mobile/src/README.md` is
the source of truth** — read that first; it's colocated with the code so it
can't drift the way a doc in a different package can. This file only covers
decisions that README doesn't: product/IA reasoning, composition tradeoffs,
and the route map.

The mobile source tree has been restructured twice already (`components/*`
→ `features/*/{screens,hooks,components}` → today's flat `modules/*`). If
you're about to restructure it again, update `src/README.md` in the same
commit — a stale structure doc is worse than no doc.

## Stack

- **Expo Router** (file-based routing) — the `app/` folder *is* the route
  tree, and it maps almost 1:1 onto `05_SITE_ARCHITECTURE_MAP.md`'s "Mobile
  app navigation." Route files are thin glue (5–7 lines): read params, render
  a module screen. No logic lives in `app/`.
- **NativeWind v4** (Tailwind for React Native) — `className` props on core
  RN components, compiled by the same Tailwind engine as a web app would use.
- **`@statman/sdk`** — the same portable SDK package the backend project
  built for exactly this purpose (see `docs/sdk.md`). No raw `fetch` calls,
  no bespoke API client.
- **`pnpm --filter mobile lint`** runs `scripts/check-boundaries.mjs`, a
  lightweight fitness function (not ESLint) that enforces the import rules
  in `src/README.md` in CI/locally — e.g. `shared/*` can't import `modules/*`
  or the SDK, `app/*` can't import `shared/ui`/`shared/layout` directly, and
  SDK calls can only live in `use*.ts` hooks or `Connected*.tsx` components.
  Run it after any restructure — it catches stale-path regressions the
  typechecker won't (a valid-but-wrong relative import still typechecks).

## Design tokens

Single source of truth: `statman_project_docs/statman_docs_bundle/19_DESIGN_TOKEN_SHEET.json`.

- `global.css` defines every color as an RGB-triplet CSS variable (`--color-brand`, etc.), split into `:root` (light) and `.dark` blocks — swapping the `dark` class swaps every color at once. Dark-mode values aren't in the token sheet; they're a reasonable inversion documented inline in `global.css`, not a separate source of truth.
- `tailwind.config.js` maps those variables into `theme.extend.colors`, and copies `spacing`/`radius`/`fontSize` straight from the token sheet's `spacing`/`radius`/`typography` blocks — the numbers in `tailwind.config.js` should always match the sheet exactly.
- `motion` timings (from the token sheet) aren't Tailwind-expressible on native — they live as plain constants in `lib/theme.ts` for use with Reanimated/Animated configs: `cardPressMs` (Button's press scale), `sheetSnapMs` (the bottom sheet's `animationConfigs`), `liveEventFeedbackMs` (the scoreboard's score-change pulse). `pageTransitionMs` is declared but still unused — no screen transition currently reads it.
- Status colors (`verified`, `dispute`, `live`, `imported`) are mapped from backend enum values (`SourceStatus`, `GameStatus`) to token names in `lib/theme.ts`'s `sourceStatusColor()`/`gameStatusColor()` — this is the *only* place that mapping exists, so a status never renders a different color on two screens.
- **Per-sport accent theming.** `@statman/sports`'s `SportDefinition.theme.accent` gives each sport a light/dark RGB pair (basketball orange, soccer teal, football rust, tennis lime — picked to not collide with the functional status colors above). `useSportTheme(sportSlug)` in `lib/theme.ts` returns a NativeWind `vars()` object that scopes a new `--color-sport-accent` CSS variable to whatever a screen's root View spreads it onto (`EntityProfileShell` and `MediaSurface` both take a `style` prop for exactly this) — the same scoping mechanism `.dark` already uses for light/dark, just one more variable. `bg-sport-accent`/`text-sport-accent`/`border-sport-accent` fall back to brand blue by default outside any sport context, so a component can adopt the token (`EntityHero`, `MediaSurface`, `EntityProfileTabs` already have) without needing every caller to opt in first.

## Composition decisions

### `EntityProfileShell` — for single-subject entities only

`shared/layout/entity-profile/EntityProfileShell.tsx` (with its
`EntityHero`, `IdentityOverlay`, `StatChipRail`, `EntityProfileTabs`
siblings) is the reusable shell described in `01_PRD.md`: media-first hero →
identity overlay → stat chip rail → sliding sheet (collapsed/half/expanded,
sticky mini-header once expanded) → tabs. `modules/players/PlayerProfileScreen.tsx`
and `modules/teams/TeamProfileScreen.tsx` both build on it directly.

**Game does not use it.** A game is a two-team matchup, not a single named
identity — forcing it through a component whose props are `identity: {
name, subtitle, avatarUri }` would mean inventing a fake "identity" for a
game. Instead, `modules/games/GameDetailScreen.tsx` composes the same
*lower-level* primitives directly (`Sheet`, `EntityProfileTabs`) alongside
`GameScoreboardCard`. This is the intended pattern: `EntityProfileShell` for
one-subject entities, hand-composed layouts from the same primitives for
anything shaped differently. Don't stretch the shell to fit — compose from
its parts instead.

This is also *why* `entity-profile/` stays a grouped subfolder inside
`shared/layout/` instead of being flattened like `modules/*` — it's a
cohesive system (five files that only make sense together), not a
business-domain module. That's a different kind of grouping on purpose, not
a leftover inconsistency.

### SDK access: two legitimate shapes, not one

The default rule is: screens/components receive props, hooks own data. Two
shapes both satisfy this and both show up in the codebase — pick whichever
fits:

1. **Extract a `use*.ts` hook that wraps the SDK call**, and keep the
   component itself SDK-free (e.g. `modules/media/useYouTubeMediaAttach.ts`
   wraps `useAttachYouTubeMedia`; `YouTubeMediaAttachForm.tsx` only calls the
   custom hook). Prefer this when the component has non-trivial local state
   alongside the mutation (form fields, etc.) — it keeps the component
   testable without the SDK involved at all.
2. **Call an `@statman/sdk` hook directly inside a `Connected*.tsx`
   component** (e.g. `ConnectedFollowButton`, `ConnectedReactionBar`,
   `ConnectedClaimReviewCard`, `ConnectedAuthGuard`). Prefer this when the
   component is small and the SDK call *is* essentially the whole thing —
   extracting a one-line hook would just be indirection.

Either way, the component gets dropped unchanged onto multiple screens
(`ConnectedFollowButton` on both Player and Team; `ConnectedReactionBar` on
Player, Team, and Game) — the point is these widgets own their own
follow/reaction/claim state so no parent screen re-implements the same SDK
wiring three times. Everything *without* a `use*`/`Connected*` name
(`PlayerCardLink`, `TeamRosterList`, `SportStatTable`, `FeedItemCard`)
stays props-only, and `scripts/check-boundaries.mjs` enforces the naming
side of this mechanically.

### Loading/error is a three-way branch, not two

Every domain hook (`usePlayerProfile`, `useTeamProfile`, `useGameDetail`,
`useGameSpectate`, `useLiveScoringSession`, `useAccountSession`) returns
both `isLoading` and `isError` from its primary query, and every screen
branches on both explicitly, in this order: `isError` → `<ErrorState />`,
then `isLoading || !data` → `<LoadingState />`, then the real content. Do
this for any new screen with a query — collapsing `isError` into the same
`isLoading || !data` check (an easy mistake, since `!data` is also true
after an error) means a failed request spins forever instead of ever
resolving to a message, since `isLoading` goes `false` but `data` never
arrives. `ConnectedAuthGuard` is the one exception: it already checks
`isError` itself and redirects to `/login` instead of rendering an
`ErrorState`, which is the correct behavior for that specific case, not a
gap.

### Consolidations worth knowing about

- **Home (surface 1) and the social feed (surface 13) are the same screen.**
  Both are "fresh activity, newest first" — `modules/feed/HomeFeedScreen.tsx`
  renders `useHomeFeed()` and that's the whole feature. There was never a
  reason to build two separate feeds.
- **Media Upload/Attach (surface 9) is not a route.** It's
  `modules/media/YouTubeMediaAttachForm.tsx`, embedded in a profile's Media
  tab. Attaching media is always "attach to the thing I'm currently looking
  at," never a standalone destination.
- **Claims & Verification (surface 10) is two routes, not one:** the
  athlete-facing request (`modules/players/PlayerClaimScreen.tsx`, at route
  `app/players/[playerId]/claim.tsx`) and the admin review queue
  (`modules/moderation/ClaimsQueueScreen.tsx`, at `app/claims/index.tsx`) are
  different audiences with different permissions — splitting them matches
  the backend's `claimPlayer` (auth) vs `listClaims`/`reviewClaim`
  (`adminAuth`) split exactly.

## Route map

| Surface | Route | Screen |
|---|---|---|
| 1. Home / 13. Social feed | `app/(tabs)/index.tsx` | `modules/feed/HomeFeedScreen.tsx` |
| 2. Explore | `app/(tabs)/explore.tsx` | `modules/players/PlayerExploreScreen.tsx` |
| 3. Player Profile | `app/players/[playerId]/index.tsx` | `modules/players/PlayerProfileScreen.tsx` |
| 4. Team Profile | `app/teams/[teamId]/index.tsx` | `modules/teams/TeamProfileScreen.tsx` |
| 5. Game Page | `app/games/[gameId]/index.tsx` | `modules/games/GameDetailScreen.tsx` |
| 6. Live Game Capture | `app/games/[gameId]/live.tsx` | `modules/live-scoring/LiveScoringSessionScreen.tsx` |
| 7. Spectator Game View | `app/games/[gameId]/spectate.tsx` | `modules/games/GameSpectateScreen.tsx` |
| 8. Enter Stats | `app/(tabs)/enter.tsx` | `modules/live-scoring/LiveScoringIndexScreen.tsx` |
| 9. Media Upload/Attach | *(embedded, not a route)* | `modules/media/YouTubeMediaAttachForm.tsx` |
| 10. Claims & Verification | `app/players/[playerId]/claim.tsx` + `app/claims/index.tsx` | `PlayerClaimScreen.tsx` (request) + `ClaimsQueueScreen.tsx` (admin) |
| 11. Disputes & Corrections | `app/disputes/index.tsx` | `modules/disputes/DisputesScreen.tsx` |
| 12. Me/Dashboard | `app/(tabs)/me.tsx` | `modules/account/AccountScreen.tsx` |

## Known gaps (parking lot, not forgotten)

- **Team/Game Sources & Disputes tabs aren't wired.** `useSources` and
  `useDisputes` exist in the SDK; only Player's Sources tab calls one of
  them (and even that just prints the raw enum value rather than real
  `SourceReference` rows).
- **The whole `(tabs)` group requires auth.** Public/anonymous browsing of
  profiles (per the site map's separate "Public navigation" list) would mean
  a parallel public route stack — deferred until there's a reason to build it.
- **Teams tab lists all teams**, not "my teams" — there's no team-manager
  relation on `User` yet in the backend.
- **Disputes screen is submission-only.** There's no `GET /disputes` without
  a specific `targetType`/`targetId`, so there's no natural "all disputes"
  feed to show.
- **Offline event queueing isn't implemented.** `26_LIVE_GAME_STAT_CAPTURE_SPEC.md`
  calls for local-first queueing with visible sync status; the live capture
  screen currently submits events directly over the network. The consensus
  engine and REST contract are already shaped to support a local queue later
  — see `CLAUDE.md` Deviation 3.
- **Live snapshot polls every 4s** in place of a websocket room, matching
  the backend's own REST-first deviation.
- **Ranking screens aren't built yet.** The backend and SDK now expose
  sport-configured player/team leaderboard endpoints, but mobile does not yet
  have a dedicated rankings surface.
- **Motion tokens are declared, not used.** `lib/theme.ts`'s `sheetSnapMs`/
  `cardPressMs`/etc. exist for exactly this purpose — use them rather than
  inventing new timings when wiring real transitions.
- **No automated tests on the mobile app.** `pnpm --filter mobile test` is a
  placeholder; `check-boundaries.mjs` catches structural drift but nothing
  catches behavioral regressions.

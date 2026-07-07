# Frontend Architecture — Expo Mobile App (`apps/mobile`)

This is the information-architecture and component-composition decision
record for the Expo client. Read this before adding a new screen or
component — it explains *why* things live where they do, not just where.

## Stack

- **Expo Router** (file-based routing) — the `app/` folder *is* the route
  tree, and it maps almost 1:1 onto `05_SITE_ARCHITECTURE_MAP.md`'s "Mobile
  app navigation."
- **NativeWind v4** (Tailwind for React Native) — `className` props on core
  RN components, compiled by the same Tailwind engine as a web app would use.
- **`@statman/sdk`** — the same portable SDK package the backend project
  built for exactly this purpose (see `docs/sdk.md`). No raw `fetch` calls,
  no bespoke API client.

## Folder structure

```
apps/mobile/
  app/                        ← ROUTES. Named for DX/URL clarity, not genericism.
    _layout.tsx                 Root providers: QueryClient, SDK init, Stack
    (tabs)/                     Home / Explore / Enter / Teams / Me
    players/[playerId]/         Player Profile, Claim flow
    teams/[teamId]/             Team Profile
    games/[gameId]/             Game Page, Live Capture, Spectator View
    disputes/, claims/          Corrections + admin review queue
    login.tsx, register.tsx

  src/
    components/
      ui/          ← Generic primitives. Zero domain knowledge. Named after
                     what they ARE (Button, Card, Badge), never what they're
                     FOR. A ui/ component must work in a totally different
                     app with no changes.
      entity/      ← The "entity profile shell" composition layer — the one
                     shared pattern from 01_PRD.md ("Public entity profiles")
                     that Player/Team/League pages all build on. Knows about
                     hero/identity/stats/tabs/sheet shape, not about players
                     or teams specifically.
      domain/      ← Statman-specific, but still reusable across screens
                     (PlayerCard, GameScoreboard, LiveEventPad). This is
                     where SDK hooks are allowed to live inside a component
                     instead of a page — see "The self-contained widget
                     exception" below.
      layout/      ← App chrome: AuthGuard, TabBarIcon.
    lib/           ← theme.ts, utils.ts (cn), sdk.ts (client init + token
                     storage), queryClient.ts, media.ts (YouTube helpers).
    hooks/         ← Reserved for non-data utility hooks only (useDebounce,
                     etc.) if any are ever needed. Data-fetching hooks live in
                     @statman/sdk, never here — same rule as the web factory
                     default, just ported to RN.
```

**Naming rule:** `components/ui`, `components/entity`, `components/domain`,
and `lib/` use strict, generic, predictable names — anyone should be able to
guess a file's name from its purpose. `app/` (routes) optimizes for
developer experience and matches the product's own vocabulary instead
(`live.tsx`, `spectate.tsx`, `claim.tsx`) because that's what a developer
scans for when jumping to a screen, and it's what shows up in the router's
mental model / URL.

## Design tokens

Single source of truth: `statman_project_docs/statman_docs_bundle/19_DESIGN_TOKEN_SHEET.json`.

- `global.css` defines every color as an RGB-triplet CSS variable (`--color-brand`, etc.), split into `:root` (light) and `.dark` blocks — swapping the `dark` class swaps every color at once. Dark-mode values aren't in the token sheet; they're a reasonable inversion documented inline in `global.css`, not a separate source of truth.
- `tailwind.config.js` maps those variables into `theme.extend.colors`, and copies `spacing`/`radius`/`fontSize` straight from the token sheet's `spacing`/`radius`/`typography` blocks — the numbers in `tailwind.config.js` should always match the sheet exactly.
- `motion` timings (from the token sheet) aren't Tailwind-expressible on native — they live as plain constants in `lib/theme.ts` for use with Reanimated/Animated configs.
- Status colors (`verified`, `dispute`, `live`, `imported`) are mapped from backend enum values (`SourceStatus`, `GameStatus`) to token names in `lib/theme.ts`'s `sourceStatusColor()`/`gameStatusColor()` — this is the *only* place that mapping exists, so a status never renders a different color on two screens.

## Composition decisions

### `EntityProfileShell` — for single-subject entities only

`components/entity/EntityProfileShell.tsx` is the reusable shell described in
`01_PRD.md`: media-first hero → identity overlay → stat chip rail → sliding
sheet (collapsed/half/expanded, sticky mini-header once expanded) → tabs.
Player and Team profile pages both use it directly.

**Game Page does not use it.** A game is a two-team matchup, not a single
named identity — forcing it through a component whose props are `identity: {
name, subtitle, avatarUri }` would mean inventing a fake "identity" for a
game. Instead, `app/games/[gameId]/index.tsx` composes the same *lower-level*
primitives directly (`Sheet`, `EntityTabs`) alongside `GameScoreboard`. This
is the intended pattern: `EntityProfileShell` for one-subject entities,
hand-composed layouts from the same primitives for anything shaped
differently. Don't stretch the shell to fit — compose from its parts instead.

### The self-contained widget exception

The default rule (ported from the web factory skill) is: components receive
props only, pages own data-fetching. `FollowButton`, `ReactionBar`, and
`MediaAttachForm` are the deliberate exception — they call `@statman/sdk`
hooks directly instead of receiving follow/reaction state as props.

Why: these three widgets are dropped, unchanged, onto Player pages, Team
pages, and (for reactions) Game pages. Making every parent page lift
follow-state and reaction-counts up would mean re-implementing the same
`useFollows`/`useCreateFollow` wiring three times instead of once. They're
"self-contained" in the same sense a `<video>` element is — you don't feed a
video element its own playback state from outside. Everything else
(`PlayerCard`, `TeamCard`, `RosterList`, `BoxScoreTable`, `FeedItemCard`)
stays props-only.

### Consolidations worth knowing about

- **Home (surface 1) and the social feed (surface 13) are the same screen.**
  Both are "fresh activity, newest first" — `app/(tabs)/index.tsx` renders
  `useFeed()` and that's the whole feature. There was never a reason to build
  two separate feeds.
- **Media Upload/Attach (surface 9) is not a route.** It's
  `components/domain/MediaAttachForm.tsx`, embedded in a profile's Media tab.
  Attaching media is always "attach to the thing I'm currently looking at,"
  never a standalone destination.
- **Claims & Verification (surface 10) is two routes, not one:** the
  athlete-facing request (`app/players/[playerId]/claim.tsx`) and the
  admin review queue (`app/claims/index.tsx`) are different audiences with
  different permissions — splitting them matches the backend's
  `claimPlayer` (auth) vs `listClaims`/`reviewClaim` (`adminAuth`) split
  exactly.

## Route map

| Surface | Route(s) |
|---|---|
| 1. Home / 13. Social feed | `app/(tabs)/index.tsx` |
| 2. Explore | `app/(tabs)/explore.tsx` |
| 3. Player Profile | `app/players/[playerId]/index.tsx` |
| 4. Team Profile | `app/teams/[teamId]/index.tsx` |
| 5. Game Page | `app/games/[gameId]/index.tsx` |
| 6. Live Game Capture | `app/games/[gameId]/live.tsx` |
| 7. Spectator Game View | `app/games/[gameId]/spectate.tsx` |
| 8. Enter Stats | `app/(tabs)/enter.tsx` |
| 9. Media Upload/Attach | `components/domain/MediaAttachForm.tsx` (embedded, not a route) |
| 10. Claims & Verification | `app/players/[playerId]/claim.tsx` (request) + `app/claims/index.tsx` (admin review) |
| 11. Disputes & Corrections | `app/disputes/index.tsx` |
| 12. Me/Dashboard | `app/(tabs)/me.tsx` |

## Known simplifications (parking lot, not forgotten)

- **The whole `(tabs)` group requires auth.** Public/anonymous browsing of
  profiles (per the site map's separate "Public navigation" list) would mean
  a parallel public route stack — deferred until there's a reason to build it.
- **Teams tab lists all teams**, not "my teams" — there's no team-manager
  relation on `User` yet in the backend.
- **Disputes screen is submission-only.** There's no `GET /disputes` without
  a specific `targetType`/`targetId`, so there's no natural "all disputes"
  feed to show. Per-entity dispute history belongs on that entity's own
  Sources/Disputes tab (not yet wired on Team/Game — only stubbed on Player).
- **Offline event queueing isn't implemented.** `26_LIVE_GAME_STAT_CAPTURE_SPEC.md`
  calls for local-first queueing with visible sync status; `live.tsx`
  currently submits events directly over the network. The consensus engine
  and REST contract are already shaped to support a local queue later — see
  `CLAUDE.md` Deviation 3.
- **Live snapshot polls every 4s** (`useGameSnapshot`) in place of a
  websocket room, matching the backend's own REST-first deviation.
- **Rankings/leaderboards (part of surface 2) aren't built.** There's no
  ranking endpoint on the backend yet.

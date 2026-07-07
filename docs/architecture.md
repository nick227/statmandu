# Architecture

## The Pipeline

Every feature flows from the OpenAPI spec — but the spec itself is authored as
small, per-domain YAML files and bundled into one generated file (this project's
explicit deviation from the factory default of a single hand-written
`openapi.yaml` — see "Deviations" in `CLAUDE.md`):

```
packages/api-spec/src/root.yaml         ← hand-authored index: refs into components/ and paths/
packages/api-spec/src/components/**     ← hand-authored schemas, parameters, responses, security (small files, one domain each)
packages/api-spec/src/paths/**          ← hand-authored path definitions (small files, one domain each)
        │
        ▼ (redocly bundle — pnpm spec:bundle)
packages/api-spec/openapi.yaml          ← GENERATED, single source of truth consumed by everything below. Not committed.
        │
        ├── openapi-typescript          → packages/sdk/src/generated/types.ts
        ├── openapi-fetch               → packages/sdk/src/client.ts (typed, zero hand-written methods)
        ├── fastify-openapi-glue        → apps/server routes, validation, and auth wired automatically
        ├── generate-tests.ts           → apps/server/src/__tests__/ (one stub per operationId)
        └── generate-docs.ts            → docs/api-reference.md
```

Run `pnpm sdk:generate` after any spec change — it bundles first, then
generates types. Never edit `packages/api-spec/openapi.yaml` directly; it's
regenerated from `src/`.

## Packages

| Package | Purpose |
|---|---|
| `packages/db` | Prisma schema and client — only place DB structure is defined |
| `packages/api-spec` | Split OpenAPI 3.1 source (`src/`) + generated bundle (`openapi.yaml`) |
| `packages/sdk` | Typed fetch client + React Query hooks — portable across any React app (web, Expo, etc.) |
| `packages/shared` | Shared TS types not derived from the spec — kept minimal |
| `apps/server` | Fastify API server — implements what the spec declares |

`apps/mobile` (Expo) and/or `apps/web` do not exist yet — see `CLAUDE.md` for
what's next.

## Domain model

Raw event log, consensus, and derived stats are kept as separate layers and
never collapsed into each other:

```
GameEvent            ← what a reporter actually entered (PENDING/ACCEPTED/REJECTED/...)
GameConsensusGroup    ← how independently-submitted events were matched/compared
GameStatLine          ← resolved, display-ready box score line for one player in one game
PlayerSeasonStat /
TeamSeasonStat        ← season aggregates, incremented at finalize time
Dispute               ← unresolved conflicts and public corrections, with a footnote
```

`AthleteProfile` (public, claimable identity) is separate from `Player`
(sport-specific attachment — position, jersey, class year). A `User` can claim
one `AthleteProfile` through the `Claim` review flow; profiles are not
auto-created at registration the way `Profile` (account identity: username,
displayName) is.

## Rules

- A route exists only if it is in `packages/api-spec/src/paths/*.yaml`.
- The SDK never imports from `apps/server`.
- Frontend pages (once built) never call `fetch` directly — all data comes
  from `@statman/sdk` hooks.
- Generated files (`openapi.yaml`, `types.ts`, test stubs, API reference) are
  never edited by hand.
- Every polymorphic `targetType` (on `MediaAsset`, `Follow`, `Reaction`,
  `Dispute`, `FeedItem`, `SourceReference`) uses the one shared `EntityType`
  enum — never a per-model bespoke enum.

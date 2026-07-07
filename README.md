# Statman

Sport-agnostic, mobile-first public athlete profile platform. Basketball demo:
one league, two teams, twenty players — media-first profiles, event-sourced
live game stat capture, follow/react social layer, and source/verification/
dispute tracking.

## Setup

1. Copy env: `cp .env.example .env` and fill in `DATABASE_URL` (MySQL/MariaDB)
2. Create a second database for tests and set its URL in `.env.test` (see below)
3. Run bootstrap: `pnpm bootstrap` — installs deps, pushes schema, bundles the
   spec + generates SDK types, generates test stubs, seeds demo data

### Two databases, on purpose

`pnpm test` truncates every table between tests (`apps/server/src/__tests__/helpers/setup.ts`).
Running it against your dev database would wipe out `pnpm db:seed` data. So:

- `.env` → `DATABASE_URL` — the dev database (`statman_dev`)
- `.env.test` → `DATABASE_URL` — a separate test database (`statman_test`), loaded
  automatically by `apps/server/vitest.config.ts`

Push the schema to both:

```bash
pnpm db:push                                             # dev db, from .env
DATABASE_URL=<test-db-url> pnpm --filter @statman/db exec prisma db push   # test db
```

## Dev

```bash
pnpm dev
```

API: http://localhost:3001
Docs (Swagger UI): http://localhost:3001/docs

The React Native / Expo client and web PWA are not built yet — see `CLAUDE.md`
for what's done and what's next.

## Commands

| Command | Description |
|---|---|
| `pnpm bootstrap` | First-run: install, push schema, generate everything, seed |
| `pnpm dev` | Run all apps in dev mode |
| `pnpm spec:bundle` | Bundle `packages/api-spec/src/**` into `openapi.yaml` |
| `pnpm spec:lint` | Lint the bundled spec with Redocly |
| `pnpm sdk:generate` | Bundle spec + regenerate SDK types |
| `pnpm sdk:check` | Fail if committed types.ts has drifted from spec |
| `pnpm test:generate` | Generate test stubs for new operationIds |
| `pnpm docs:generate` | Regenerate docs from spec/schema/env |
| `pnpm typecheck` | TypeScript check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests (against the test DB) |
| `pnpm db:push` | Push Prisma schema to the dev DB |
| `pnpm db:seed` | Seed dev DB with demo data (1 league, 2 teams, 20 players) |
| `pnpm db:studio` | Open Prisma Studio |

## Architecture

See `docs/architecture.md`, `docs/api-reference.md`, `docs/database.md`, and
`packages/api-spec/src/` for the hand-authored (small, per-domain) OpenAPI
source files that get bundled into the single generated `openapi.yaml`.

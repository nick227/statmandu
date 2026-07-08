# Developer Setup

## Prerequisites

- Node.js 20+
- pnpm 10+
- MySQL / MariaDB 8+ compatible server

## First-time setup

```bash
pnpm install
cp .env.example .env        # fill in DATABASE_URL (dev database)
```

Also create a **separate test database** and point `.env.test` at it — see
"Two databases, on purpose" in the root `README.md`. `pnpm test` truncates
every table between tests; running it against the dev DB would destroy seed
data.

Push the schema to the test database explicitly:

```bash
pnpm db:test:push
```

```bash
pnpm bootstrap   # install, push schema, bundle spec + generate SDK, generate tests, seed
```

To refresh demo data later:

```bash
pnpm db:seed
```

See `docs/seeding.md` for the seeded accounts, demo personas, media fixtures,
and rerun/idempotency notes.

See `docs/sport-definitions.md` for the portable sport definition layer used
to support basketball, football, soccer, tennis, and future sports.

## Running

```bash
pnpm dev
```

API: http://localhost:3001
API Docs: http://localhost:3001/docs ← live Swagger UI

## Code generators

| Command | What it does |
|---|---|
| `pnpm spec:bundle` | Bundle `packages/api-spec/src/**` into `openapi.yaml` |
| `pnpm sdk:generate` | Bundle spec + regenerate `packages/sdk/src/generated/types.ts` |
| `pnpm test:generate` | Append test stubs for new routes |
| `pnpm docs:generate` | Regenerate `docs/api-reference.md`, `env-vars.md`, `database.md` |

## Adding a new route

1. Add/extend a schema file in `packages/api-spec/src/components/schemas/`
2. Add the operation to the relevant file in `packages/api-spec/src/paths/`
3. Wire the path into `packages/api-spec/src/root.yaml`
4. `pnpm sdk:generate` — bundles the spec and updates `types.ts`
5. Add a named export to `apps/server/src/handlers/` matching the `operationId`
6. Add the service method to `apps/server/src/services/`
7. `pnpm test:generate` — appends a test stub, then fill in seed data + assertions
8. Add a hook in `packages/sdk/src/hooks/` and export it from `hooks/index.ts`
9. `pnpm docs:generate` — updates the API reference

If a new operation has no natural error case, still add a `default:` response
(see any `paths/*.yaml` file) referencing `ErrorResponse` — `openapi-fetch`'s
generated types otherwise collapse the error branch of a hook's response to
`never`, which fails typecheck the moment a hook calls `if (error) throw ...`.

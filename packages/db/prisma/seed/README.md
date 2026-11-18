# Statman development seed

This deterministic, idempotent fixture system supports local development, CI, screenshots, demos, and product review. Normal seeding only upserts known fixtures; it does not reset tables or remove local records.

## Safety

Every command parses `DATABASE_URL` and prints only its host and database name before mutation. It refuses `NODE_ENV=production` and any target that is not recognizably local, development, CI, or test. `ALLOW_UNSAFE_SEED=true` is the explicit administrative override; use it only after verifying the printed target. Passwords, hashes, URL credentials, and tokens are never logged.

Seed cleanup is separate and removes only reserved `seed-` IDs plus relationships identified by the manifest. It requires `CONFIRM_SEED_RESET=seed-owned-data`. Demo accounts and shared competition definitions are deliberately preserved so cleanup cannot erase local activity attached to those identities.

## Commands

From the workspace root:

```sh
pnpm db:seed              # default: full
pnpm db:seed:minimal      # sport, league, season, two users, two teams
pnpm db:seed:demo         # main public surfaces
pnpm db:seed:full         # demo + cards/jobs + extended schedule + admin workflows
pnpm db:seed:cards        # demo foundation + card discovery/generation fixtures
pnpm db:seed:live         # demo foundation + live conflict/correction fixtures
pnpm db:seed:verification # demo foundation + claims, disputes, sources, import review
pnpm db:seed:validate     # validate an existing full seed without mutation
CONFIRM_SEED_RESET=seed-owned-data pnpm db:seed:reset
```

Set `SEED_REFERENCE_DATE=2026-07-01` (or an ISO timestamp) to move the deterministic clock. Date-only values resolve to noon UTC, avoiding local-timezone drift. The default is `2026-07-01T12:00:00.000Z`; fixture ordering never uses the wall clock.

## Demo accounts

All accounts use development-only password `password123`, hashed with bcrypt before storage.

| Role | Email |
| --- | --- |
| Administrator | `admin@statman.dev` |
| Official scorer / verifier | `scorer@statman.dev` |
| Team manager | `teamscorer@statman.dev` |
| Reporter / broadcaster | `broadcaster@statman.dev` |
| Claimed athlete | `athlete@statman.dev` |
| Fan / collector | `fan1@statman.dev` |
| Moderator-style reviewer | `fan2@statman.dev` |

Useful fixtures include `/players/jayden-rios`, `/teams/eastside-ballers`, game `seed-live-game`, and card `seed-card-01`.

## Ownership and extension

[`ids.ts`](./ids.ts) is the central manifest for stable IDs, emails, slugs, and reserved prefixes. Some preserved legacy fixtures use deterministic unique slugs/emails instead of fixed primary keys; both are ownership keys. New records should prefer a `seed-` primary key and an upsert on a database unique constraint.

Add a team or athlete by extending the explicit arrays in its domain module and the manifest. Add games with fixed offsets from `SeedClock`; never call `Date.now()` or use uncontrolled randomness. Add cards/jobs with stable numbered IDs and ensure an athlete has no more than one queued/processing batch. Add a scenario to `SEED_SCENARIOS`, then compose only the domain seeders it needs in [`index.ts`](./index.ts).

The validator runs after every scenario and fails on broken sport/roster relationships, inconsistent final scores, duplicate active roster memberships, invalid claims, missing discovery data, incomplete trust states, or overlapping active generation batches. `full` additionally asserts card collections and generation lifecycle fixtures.

Never run this system against production. The override exists for narrowly controlled administrative recovery, not routine deployment. Production migrations use `pnpm db:migrate:deploy`; seeding never depends on `prisma db push` or a running server/mobile app.

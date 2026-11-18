# Production migration procedure

The migration history starts from the schema committed before the July 2026
release-candidate work (`20260712000000_baseline`). The next migration is the
incremental, data-preserving release-candidate change.

## Existing database created before migration history

Take a database backup and compare its schema with the baseline SQL. If it
matches the known pre-release schema, mark only the baseline as applied, then
deploy the incremental migration:

```sh
pnpm --filter @statman/db exec prisma migrate resolve --applied 20260712000000_baseline
pnpm db:migrate:deploy
```

Do not mark the release-candidate migration as applied. If the production
schema differs from the baseline, stop and generate a migration from an actual
schema dump; the repository cannot safely infer undocumented drift.

## New database

Run `pnpm db:migrate:deploy`; Prisma applies the baseline and every later
migration in order. Seeding remains a separate, optional operation.

## Reviewed release-candidate SQL risks

- Existing tables receive only nullable columns or columns with defaults.
- No table, column, or existing index is dropped.
- New foreign keys reference existing primary keys and apply only to new,
  initially empty tables.
- Indexes on `ImageAsset.objectKey` and
  `CardTemplate(athleteProfileId, batchRequestId)` may briefly lock large
  MySQL tables. Schedule the deploy in a low-traffic window if those tables
  are large and confirm online-DDL behavior for the production MySQL version.
- The `CardGenerationJob.provider` enum expands from `STUB` to
  `STUB | GEMINI`; existing values remain valid.

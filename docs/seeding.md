# Seeding

The development seed is a deterministic demo dataset for `statman_dev`.
It is safe to run repeatedly.

## Run

```bash
pnpm db:seed
```

`pnpm bootstrap` also runs the seed after installing dependencies, pushing
the schema, bundling the API spec, generating the SDK, and generating test
stubs.

## What Gets Seeded

- Basketball sport, one demo league, one active season, two schools, and two teams.
- 20 players, split evenly across Eastside Ballers and Westview Hawks.
- Roster memberships for every player.
- Two finalized games with box scores and season/team aggregate stats.
- One disputed stat line with an open dispute.
- One live game with accepted events and pre-joined reporters.
- One upcoming scheduled game.
- Seven YouTube media assets across players, teams, and games.
- Nine source/provenance examples across player profiles, players, games, and a disputed stat line.
- Matching `MEDIA_ADDED` feed items with stable ids.
- Follows and reactions across demo users.
- One pending profile claim and one already-claimed athlete profile.

The seed uses stable ids for games, media assets, media feed items, and the
seed dispute. Derived player/team season stats are recomputed from persisted
seeded box scores on every run, instead of relying only on in-memory values
from a first-time create path.

## Provenance Examples

The seed intentionally exercises the trust ladder used by source badges:

- `VERIFIED_TEAM_ACCOUNT` — highest-trust team-owned roster/stat evidence.
- `OFFICIAL_SCORER_RECORDED` — official scorer game entry.
- `TEAM_MANAGER_ENTERED` — coach/team manager roster or stat note.
- `MULTI_SPECTATOR_CONFIRMED` — multiple spectators agreed on an event.
- `PLAYER_REPORTED` and `SPECTATOR_REPORTED` — useful evidence, lower canonical trust.
- `ONLINE_SOURCE_IMPORTED` and `PUBLIC_SOURCE_SCRAPED` — online evidence imported from third-party sources.
- `IN_DISPUTE` — visible unresolved conflict/footnote state.

Seeded `SourceReference.sourceType` rows include `VERIFIED_TEAM_ACCOUNT`,
`TEAM_MANAGER`, `PLAYER_REPORT`, `MULTI_SPECTATOR_REPORT`, `MAXPREPS`,
`HUDL`, `LEAGUE_WEBSITE`, `NEWS_ARTICLE`, and `SCOREBOOK_PHOTO`.

## Demo Accounts

All seeded accounts use password `password123`.

| Email | App role | Demo persona |
|---|---|---|
| `admin@statman.dev` | `ADMIN` | Admin reviewer; can see the claims queue. |
| `scorer@statman.dev` | `USER` | Official scorer; already joined the live game as `OFFICIAL_SCORER`. |
| `teamscorer@statman.dev` | `USER` | Eastside team scorer; already joined the live game as `TEAM_SCORER`. |
| `broadcaster@statman.dev` | `USER` | Broadcaster; already joined the live game as `BROADCASTER`. |
| `athlete@statman.dev` | `USER` | Athlete-style account with an already-claimed athlete profile. |
| `fan1@statman.dev` | `USER` | Fan account with follows, reactions, and a pending profile claim. |
| `fan2@statman.dev` | `USER` | Fan account following Westview. |

`User.role` currently supports only `USER` and `ADMIN`. Scorer, team scorer,
and broadcaster are demo personas represented by `GameReporter.role` rows on
the live game.

## Test Database Warning

Do not point server tests at the seeded development database. The server test
setup truncates tables between tests. Use `.env.test` with a separate
`statman_test` database.

```bash
pnpm db:test:push
pnpm --filter server test
```

Both commands guard against accidentally targeting a non-test database.
`pnpm db:test:push` is allowed to replace enum values because `statman_test`
is disposable by design.

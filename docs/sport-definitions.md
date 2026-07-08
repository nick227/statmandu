# Sport Definitions

Statman keeps the competition model shared and pushes sport variance into
`packages/sports`.

## Shared Model

These concepts stay common across basketball, football, soccer, tennis, and
future sports:

- `Sport`
- `League`
- `Season`
- `Team`
- `Player`
- `RosterMembership`
- `Game`
- `GameTeam`
- `GameReporter`
- `GameEvent`
- `GameStatLine`
- `PlayerSeasonStat`
- `TeamSeasonStat`
- source, dispute, media, feed, follow, and reaction records

## Variable By Sport

Sport definitions own:

- league type vocabulary
- positions
- period/clock shape
- event types
- stat fields
- scoring deltas
- team/player aggregate fields

Current definitions live in:

```text
packages/sports/src/definitions/
  basketball.ts
  football.ts
  soccer.ts
  tennis.ts
```

## Database Bridge

The old basketball columns remain as indexed/projection fields:

- `points`
- `assists`
- `rebounds`
- shooting columns
- etc.

Portable stats now also live in JSON:

- `GameStatLine.stats`
- `PlayerSeasonStat.stats`
- `TeamSeasonStat.stats`

Basketball writes both the legacy columns and `stats`. Other sports can use
`stats` without requiring a migration for every new stat category.

## Adding A Sport

1. Add a definition in `packages/sports/src/definitions`.
2. Export it through `packages/sports/src/registry.ts`.
3. Add any new event/position enum values to Prisma and OpenAPI.
4. Add a small seed fixture proving leagues, teams, games, and at least one
   representative stat shape.
5. Add tests that the sport accepts its own events and rejects events from
   other sports.

Prefer declarative stat deltas first. Add custom reconcile logic only when a
sport genuinely cannot be expressed through the shared event/stat definition.

## Frontend Rule

Use one renderer per pattern and let sport config decide behavior.

Prefer:

- `SportStatStrip`
- `SportStatTable`
- `SportBoxScore`
- `SportLeaderboard`
- `SportEventPad`
- `SportGameTimeline`

`SportDefinition.views.profileHeadline` is for player profile headlines.
`SportDefinition.views.teamProfileHeadline` is for team season summaries from
`GET /teams/{teamSlug}/stats`.
`SportDefinition.views.leaderboard` defines the default stat choices for
`GET /leaderboards/players` and `GET /leaderboards/teams`.

Avoid sport-specific components such as `BasketballStatTable` or
`SoccerLiveEventPad` unless the interaction is structurally different and
cannot be expressed by config.

When adding a sport-specific component, include a code comment or doc note
explaining why the workflow cannot be represented by `SportDefinition` views,
events, validation rules, and formatters.

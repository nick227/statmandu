# OpenAPI & Generator Architecture

## Architecture stance

OpenAPI owns durable REST resources. Realtime contracts own live state and event streams. Sport config owns sport-specific UI/stat behavior. The SDK compresses frontend code.

## Contract structure

```txt
packages/contracts/openapi/
  root.yaml
  components/
    schemas/
    parameters/
    responses/
    security/
  paths/
    players.yaml
    teams.yaml
    games.yaml
    live-games.yaml
    stats.yaml
    media.yaml
    feed.yaml
    follows.yaml
    reactions.yaml
    sources.yaml
    disputes.yaml
    claims.yaml
    imports.yaml
    admin.yaml

packages/contracts/realtime/
  live-game-events.yaml
  presence-events.yaml
  feed-events.yaml

packages/sport-config/
  basketball.yaml
  baseball.yaml
  soccer.yaml
```

## Generator outputs

Generate:

- Types.
- Validators.
- Route registration.
- CRUD controllers.
- SDK methods.
- Query keys.
- React Query hooks.
- Mutation hooks.
- Cache invalidation helpers.

Hand-write:

- Live scoring rules.
- Stat derivation.
- Consensus engine.
- Permissions.
- Feed ranking.
- Profile composition.
- Dispute resolution.

## CRUD config example

```yaml
resource: Player
routeBase: /players
model: Player
public: true
operations:
  list: true
  get: true
  create: auth
  update: ownerOrAdmin
  delete: admin
features:
  search: true
  filters: true
  pagination: cursor
  audit: true
  softDelete: true
```

## SDK target

```ts
sdk.players.usePlayer(playerId)
sdk.players.useSearchPlayers(filters)
sdk.games.useCreateGame()
sdk.liveGames.useRoom(gameId)
sdk.media.useAttachYouTube()
sdk.disputes.useOpenDispute()
```

## Rule

The bundled spec may be huge. Human-authored files must stay small, domain-specific, and reviewable.

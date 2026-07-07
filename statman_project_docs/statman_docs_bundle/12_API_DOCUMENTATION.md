# API Documentation

## API design stance

OpenAPI defines durable REST resources. Realtime contracts define live two-way event streams. The SDK should hide most frontend boilerplate.

## REST resource domains

- Sports
- Players
- Teams
- Games
- Live game snapshots
- Stats
- Media
- Feed
- Follows
- Reactions
- Sources
- Claims
- Verification
- Disputes
- Imports
- Admin

## Example endpoint map

```txt
GET    /sports
GET    /players
POST   /players
GET    /players/{playerId}
PATCH  /players/{playerId}
POST   /players/{playerId}/claim
GET    /players/{playerId}/stats
GET    /players/{playerId}/games
POST   /players/{playerId}/media

GET    /teams
POST   /teams
GET    /teams/{teamId}
PATCH  /teams/{teamId}
GET    /teams/{teamId}/roster
POST   /teams/{teamId}/roster

POST   /games
GET    /games/{gameId}
POST   /games/{gameId}/start-live
GET    /games/{gameId}/snapshot
POST   /games/{gameId}/finalize
GET    /games/{gameId}/disputes

POST   /disputes
PATCH  /disputes/{disputeId}

POST   /media/youtube
GET    /feed
POST   /follows
DELETE /follows/{followId}
POST   /reactions
```

## SDK target shape

```ts
sdk.players.usePlayer(playerId)
sdk.players.useSearchPlayers(filters)
sdk.teams.useTeam(teamId)
sdk.games.useGame(gameId)
sdk.games.useCreateGame()
sdk.liveGames.useRoom(gameId)
sdk.media.useAttachYouTube()
sdk.disputes.useOpenDispute()
```

## Realtime room examples

Client to server:

```txt
liveGame.join
liveGame.submitEvent
liveGame.undoEvent
liveGame.submitBroadcasterNote
liveGame.submitSpectatorReaction
liveGame.endGame
```

Server to client:

```txt
liveGame.snapshot
liveGame.eventAccepted
liveGame.eventRejected
liveGame.scoreUpdated
liveGame.conflictDetected
liveGame.reporterPresenceUpdated
liveGame.finalizationReady
```

## Authentication assumptions

- Public reads for public profiles/feed/explore.
- Auth required for follows, reactions, profile edits, stat entry, disputes.
- Role checks required for team roster edits, official scoring, finalization, admin actions.

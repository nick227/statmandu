# API Reference

> Generated from `packages/api-spec/openapi.yaml`. Do not edit by hand.

## Auth

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `POST /auth/register` | Register a new user account | Public | `201` |
| `POST /auth/login` | Log in with email and password | Public | `200` |
| `POST /auth/logout` | Log out and clear the session cookie | Auth required | `200` |
| `GET /auth/me` | Get the current authenticated user | Auth required | `200` |

## Sports

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /sports` | List all sports | Public | `200` |

## Leagues

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /leagues` | List leagues | Public | `200` |
| `GET /leagues/{leagueSlug}` | Get a league by slug | Public | `200` |

## Teams

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /teams` | List teams | Public | `200` |
| `GET /teams/{teamSlug}` | Get a team by slug | Public | `200` |
| `GET /teams/{teamSlug}/roster` | Get a team's active roster for its current season | Public | `200` |
| `POST /teams/{teamId}/roster/members` | Add a player to a team's roster for a season | Auth required | `201` |

## Players

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /players` | List and search players | Public | `200` |
| `POST /players` | Create a new athlete profile and player (self-onboarding) | Auth required | `201` |
| `GET /players/{playerId}` | Get a player by id | Public | `200` |
| `PATCH /players/{playerId}` | Update a player (owner of the claimed profile, or admin) | Auth required | `200` |
| `POST /players/{playerId}/verify` | Set a player's source/verification status (admin only) | Auth required | `200` |

## Stats

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /players/{playerId}/games` | List a player's recent games with their stat line | Public | `200` |
| `GET /players/{playerId}/stats` | List a player's season stat aggregates | Public | `200` |
| `GET /games/{gameId}/stats` | Get the final box score for a game | Public | `200` |

## Claims

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `POST /players/{playerId}/claim` | Request to claim an unclaimed athlete profile | Auth required | `201` |
| `GET /claims` | List profile claims (admin moderation queue) | Auth required | `200` |
| `PATCH /claims/{claimId}` | Approve or reject a profile claim (admin only) | Auth required | `200` |

## Games

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /games` | List games | Public | `200` |
| `POST /games` | Schedule a new game between two teams | Auth required | `201` |
| `GET /games/{gameId}` | Get a game by id | Public | `200` |

## Live-games

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `POST /games/{gameId}/reporters` | Join a game as a scorekeeper/broadcaster/spectator reporter | Auth required | `201` |
| `POST /games/{gameId}/reporters/invite` | Invite or assign a reporter to a game (game manager only) | Auth required | `201` |
| `PATCH /games/{gameId}/reporters/{reporterId}` | Change a reporter role or team assignment (game manager only) | Auth required | `200` |
| `DELETE /games/{gameId}/reporters/{reporterId}` | Remove a reporter from a game (game manager only) | Auth required | `200` |
| `POST /games/{gameId}/start-live` | Transition a game to LIVE (official scorer or admin reporter only) | Auth required | `200` |
| `POST /games/{gameId}/events` | Submit a raw live-game event (offline-queueable by the client) | Auth required | `201` |
| `DELETE /games/{gameId}/events/{eventId}` | Undo an event submitted by the calling reporter | Auth required | `200` |
| `GET /games/{gameId}/snapshot` | Live score, recent events, and reporter presence (poll for realtime-lite updates) | Public | `200` |
| `POST /games/{gameId}/finalize` | Run end-of-game reconciliation and publish the final box score | Auth required | `200` |
| `GET /games/{gameId}/conflicts` | List open live-scoring conflicts for a game | Auth required | `200` |
| `POST /games/{gameId}/conflicts/{conflictId}/resolve` | Resolve a live-scoring conflict by selecting the accepted event | Auth required | `200` |
| `POST /games/{gameId}/conflicts/{conflictId}/mark-disputed` | Mark a live-scoring conflict as disputed instead of resolved | Auth required | `200` |

## Media

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /media` | List media attached to a target (player, team, or game) | Public | `200` |
| `POST /media/youtube` | Attach a YouTube video to a player, team, or game | Auth required | `201` |

## Follows

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /follows` | List followers of a target (player or team) | Public | `200` |
| `POST /follows` | Follow a player or team | Auth required | `201` |
| `DELETE /follows/{followId}` | Unfollow | Auth required | `200` |

## Reactions

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /reactions` | Get reaction counts for a target | Public | `200` |
| `POST /reactions` | React to a player, team, or game (one reaction per user per target) | Auth required | `201` |
| `DELETE /reactions/{reactionId}` | Remove the calling user's reaction | Auth required | `200` |

## Feed

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /feed` | Paginated activity feed (fresh athlete/game/media content) | Public | `200` |

## Sources

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /sources` | List source references for a target | Public | `200` |
| `POST /sources` | Attach a source reference to a target | Auth required | `201` |

## Disputes

| Endpoint | Description | Auth | Success |
|---|---|---|---|
| `GET /disputes` | List disputes for a target (disputed stats are public) | Public | `200` |
| `POST /disputes` | Submit a public correction/dispute | Auth required | `201` |
| `PATCH /disputes/{disputeId}` | Resolve or reject a dispute (admin only) | Auth required | `200` |

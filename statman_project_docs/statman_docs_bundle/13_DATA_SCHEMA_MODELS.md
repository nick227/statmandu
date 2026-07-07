# Data Schema Models

## Core entities

```txt
User
AthleteProfile
Player
Team
RosterMembership
Sport
League
School
Season
Game
GameTeam
GameReporter
GameEvent
GameEventClaim
GameConsensusGroup
GameStatLine
PlayerSeasonStat
TeamSeasonStat
MediaAsset
SourceReference
VerificationStatus
Dispute
Follow
Reaction
FeedItem
```

## Key relationships

```txt
User may claim AthleteProfile
Player belongs to AthleteProfile
Player belongs to Team through RosterMembership
Team belongs to Sport, League, School, Season
Game has two or more GameTeams
Game has many GameReporters
GameReporters submit GameEvents
GameEvents derive GameStatLines
GameStatLines update PlayerSeasonStats and TeamSeasonStats
MediaAsset can attach to Player, Team, Game, or FeedItem
SourceReference can attach to stat groups or imported data
Dispute can attach to stat line, game event, profile field, or source
```

## Source status values

```txt
SELF_REPORTED
TEAM_ENTERED
MANAGER_APPROVED
IMPORTED_SOURCE
SCRAPED_PUBLIC
VERIFIED
IN_DISPUTE
```

## Game event status values

```txt
PENDING
ACCEPTED
REJECTED
CONFLICTING
CORRECTED
DISPUTED
FINALIZED
```

## Important separation

Do not collapse live event capture into final totals.

```txt
Raw game event log = what reporters entered
Consensus layer = how events were grouped/compared
Final box score = resolved stats
Profile stats = display-ready aggregates
Dispute layer = unresolved conflicts and public footnotes
```

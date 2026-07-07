# Analytics Strategy Plan

## Measurement goals

- Understand athlete profile creation and completion.
- Measure stat entry speed and completion.
- Measure profile sharing and social loops.
- Measure live game engagement.
- Measure trust/verification/dispute friction.

## Core events

```txt
profile_created
profile_claim_started
profile_claim_completed
profile_viewed
profile_shared
profile_followed
media_added
youtube_link_added
stat_update_started
stat_update_saved
game_created
live_game_started
live_game_joined
live_event_submitted
live_event_undone
live_game_finalized
dispute_opened
dispute_resolved
share_card_generated
reaction_added
explore_search_performed
ranking_viewed
```

## Key funnels

### Athlete onboarding

Visit → create/claim profile → add media → add stats → share profile.

### Game-day loop

Create game → live capture → finalize → profiles update → share cards generated → reactions/follows.

### Fan loop

Homepage view → profile/game tap → follow/reaction/share → return.

## Useful properties

- sport
- entityType
- entityId
- teamId
- gameId
- reporterRole
- sourceType
- verificationStatus
- disputeStatus
- deviceType
- offlineMode
- latencyBucket

## North star candidates

- Weekly active athlete profiles with at least one stat/media update.
- Weekly finalized games that generated profile updates.
- Share cards generated per finalized game.

# Live Game Stat Capture Spec

## Purpose

Live Game Mode is a sport-specific control room for scorekeepers, broadcasters, and spectators. It turns messy live action into a clean box score, updated athlete profiles, shareable stat cards, game timelines, and dispute-aware source history.

## Roles

- Admin/Owner.
- Official Scorer.
- Team Scorer.
- Broadcaster.
- Player/Parent Contributor.
- Spectator Reporter.
- Viewer.

## Basketball scorekeeper UI

- Scoreboard at top.
- Team toggle.
- Player rail.
- Large event pad.
- Recent events.
- Undo always visible.
- Offline/sync status always visible.

## Event pad

```txt
+1 FT
+2 FG
+3 3PT
MISS
REB
AST
STL
BLK
TO
FOUL
SUB
UNDO
```

## Event lifecycle

```txt
Local pending
Submitted
Accepted
Grouped with matching events
Confirmed or conflicting
Finalized or disputed
```

## End-game reconciliation

1. End game.
2. Compare reporter logs.
3. Auto-merge matching events.
4. Flag conflicts.
5. Scorekeepers/admin resolve what they can.
6. Publish final box score.
7. Unresolved differences appear as disputed footnotes.

## Dispute footnote example

```txt
Jayden Rios: 27 PTS · 8 REB · 5 AST*

* Assist total disputed. Home scorer recorded 5; away scorer recorded 4.
```

## Spectator mode

- Scoreboard.
- Top performers.
- Live timeline.
- Reactions.
- Follow player/team.
- Share game/profile.

## Broadcaster mode

- Add note.
- Mark highlight.
- Tag player.
- Tag moment.
- Attach context to timeline.

## MVP exclusions

- Direct live video broadcasting.
- Complex clock synchronization.
- Automated AI stat resolution.
- Full fan chat moderation.

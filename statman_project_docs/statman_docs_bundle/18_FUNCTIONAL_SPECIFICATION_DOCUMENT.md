# Functional Specification Document

## Entity profile behavior

- Open with media-first hero.
- Show identity overlay and top stat chips.
- Sliding sheet supports collapsed, half, and expanded states.
- Expanded state shows sticky mini-header.
- Tabs vary by entity type but keep same shell pattern.
- Source and dispute details are accessible but visually minimal.

## Homepage behavior

- Shows fresh athlete/game content.
- Uses creative module rhythm, not identical cards only.
- Includes top athletes, big games, milestones, highlights, leaderboard movement.
- Personalization should trend local over time with global controls.

## Explore behavior

- Search and filters are primary.
- Supports sport, location, team, league, position, class year, verified-only.
- Advanced filters open in sheet.
- Tables appear only in research/deep stats contexts.

## Live game behavior

- User can join as scorekeeper, broadcaster, or spectator depending on role.
- Scorekeeper UI is sport-specific.
- Events autosave and queue offline.
- Undo is always visible.
- Recent event list is visible.
- Multiple reporters can submit overlapping events.
- End-game reconciliation compares reporter logs.
- Unresolved conflicts publish with disputed footnotes.

## Media behavior

- MVP supports YouTube URLs.
- Media can attach to player, team, game, or feed item.
- Smart media components lazy load and show fallbacks.

## Dispute behavior

- Public user can submit correction/dispute.
- Disputed stat preserves multiple submitted values.
- Public UI shows compact badge/footnote.
- Manager/admin can resolve disputes.

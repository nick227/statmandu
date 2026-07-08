# Functional Specification Document

## Entity profile behavior

- Open with media-first hero.
- Show identity overlay and top stat chips.
- Sliding sheet supports collapsed, half, and expanded states.
- Expanded state shows sticky mini-header.
- Tabs vary by entity type but keep same shell pattern.
- Source and dispute details are accessible but visually minimal.
- Claimed athlete profiles support low-stress inline editing for daily updates: avatar, bio, position, media, and stat corrections.
- Profile ownership tools require login and claim/ownership permission.
- Public profile editing should preserve the profile's media-first presentation; management controls appear contextually instead of turning the page into a settings form.

## Account and role behavior

- Accounts start neutral.
- Users unlock tools through claims, follows, team roles, and reporter assignments.
- Public users can browse, search, view profiles, follow public links, and spectate live games where allowed.
- Login is required for profile ownership, team management, persistent follows/reactions, media attachment, dispute tracking, and privileged game/reporting actions.
- Users should not have to choose a permanent account type such as athlete, manager, or spectator.
- Role-specific tools hide or show based on current capabilities and assignments, and those assignments can change over time.

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
- Scorekeeping optimizes for speed, prediction, undo, haptics, and offline capture.
- Lightweight public/spectator stat capture can be available without full team-management permissions, but authoritative management and finalization require assigned roles.

## Rapid Capture behavior

- Scorekeeping and athlete onboarding share a Rapid Capture component family.
- Rapid Capture uses large tap targets, visual choice tiles, bottom sheets, haptics, autosave, back/undo affordances, and immediate preview.
- The same interaction family changes pacing based on stakes: game capture favors repeatable speed, while profile completion favors confidence and review.
- Shared primitives should include subject selection, tile choice grids, picker sheets, autosave state, progress/completion feedback, and preview surfaces.

## Athlete onboarding behavior

- Athlete onboarding uses an optional Lightning Wizard for claim, create, and profile completion.
- The wizard should feel more like building a public player card than completing a settings form.
- Athlete onboarding optimizes for confidence, public preview, privacy clarity, and low-stress edits.
- Wizard steps: Identity, Sport Fit, Team, Proof, Media, Preview.
- Inline editing remains the primary day-to-day profile management model after onboarding.

## Media behavior

- MVP supports YouTube URLs.
- Media can attach to player, team, game, or feed item.
- Smart media components lazy load and show fallbacks.

## Dispute behavior

- Public user can submit correction/dispute.
- Disputed stat preserves multiple submitted values.
- Public UI shows compact badge/footnote.
- Manager/admin can resolve disputes.

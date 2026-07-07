# Product Requirements Document: Statman

## Product summary

Statman is a sport-agnostic, mobile-first public athlete profile platform. It helps athletes build beautiful, credible, media-rich profiles powered by stats, game activity, team context, source tracking, and social distribution.

## Product thesis

Athletes want exposure, confidence, and a profile that looks legitimate. Statman makes it fast to update stats, attach media, show proof, and turn game performance into shareable profile moments.

## Primary audience

- Athletes creating and improving public profiles.
- Fans and sports lovers following athletes, teams, and games.
- Team managers and scorekeepers supporting athlete profiles with better stats.

## MVP sport and demo scope

- Sport: Basketball.
- League: One demo league.
- Teams: Two demo teams.
- Players: Twenty player profiles.
- Media: YouTube links and embeds only.
- Platform: React Native Web/PWA first.

## Core product surfaces

- Home: freshest athlete/game content, top athletes, big games, stat stories.
- Explore: serious research, rankings, filters, search, comparisons.
- Enter: live/post-game stat capture and media updates.
- Teams: team management and roster support.
- Me: athlete/account/profile controls.

## Core features

### Public entity profiles

Entity pages support players, teams, games, leagues, schools, seasons, and tournaments using one shared profile shell:

- Media-first hero.
- Identity overlay.
- Key stat chips.
- Sliding content sheet.
- Activity feed.
- Related entities.
- Source, verification, and dispute layer.

### Athlete profile

- YouTube-first media stage.
- Player identity, team, class, position, status.
- Key sport-specific stat chips.
- Recent games and milestones.
- Game feed.
- Stats tab.
- Media tab.
- Source/dispute tab.
- Follow, react, share, claim/update actions.

### Live game stat capture

- Multiple reporter roles.
- Sport-specific touch interface.
- Offline-first event queue.
- Spectator mode.
- Broadcaster mode.
- End-of-game reconciliation.
- Disputed stat footnotes when consensus cannot be reached.

### Social and growth

- Follow athletes and teams.
- Reactions on athlete/team/game content.
- Feed comments only in early phase.
- Auto-generated share cards after big games and stat updates.

### Verification and disputes

- Unverified/self-reported stats are labeled.
- Team-entered and manager-approved stats get stronger status.
- Imported/scraped stats keep source references.
- Public corrections/disputes are allowed.
- Disputed stats preserve both versions and show a compact footnote.

## Success metrics

- Athlete profile creation completion rate.
- Stat update time per game.
- Share card generation and share rate.
- Follow rate per profile view.
- Return rate after game day.
- Number of public profiles with media attached.
- Number of games finalized without unresolved disputes.
- Number of profiles claimed from seeded/imported data.

## Non-goals for MVP

- Full native app store release.
- Direct video hosting.
- Full comment system on profiles.
- Paid monetization.
- Complex historical audit snapshots.
- Support for every sport’s full stat depth.

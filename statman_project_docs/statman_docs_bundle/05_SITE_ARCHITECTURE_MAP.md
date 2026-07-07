# Site Architecture Map

## Top-level navigation

Mobile app navigation:

- Home
- Explore
- Enter
- Teams
- Me

Public navigation:

- Home
- Explore
- Search
- Profile pages
- Claim/Login

## Core routes

```txt
/
/explore
/search
/feed
/rankings
/compare

/players
/players/:playerSlug
/players/:playerSlug/stats
/players/:playerSlug/games
/players/:playerSlug/media
/players/:playerSlug/sources
/players/:playerSlug/claim

/teams
/teams/:teamSlug
/teams/:teamSlug/roster
/teams/:teamSlug/stats
/teams/:teamSlug/games
/teams/:teamSlug/media
/teams/:teamSlug/sources

/games/:gameId
/games/:gameId/live
/games/:gameId/spectate
/games/:gameId/finalize
/games/:gameId/disputes

/leagues/:leagueSlug
/schools/:schoolSlug
/seasons/:seasonSlug
/tournaments/:tournamentSlug

/app/dashboard
/app/enter
/app/teams
/app/teams/:teamId/manage
/app/teams/:teamId/roster
/app/teams/:teamId/games
/app/teams/:teamId/live/:gameId
/app/settings

/admin
/admin/users
/admin/players
/admin/teams
/admin/games
/admin/claims
/admin/disputes
/admin/imports
/admin/sports
```

## Surface definitions

### Home

Fresh content: top athletes, big games, highlights, milestones, leaderboard movement, and trending updates.

### Explore

Research surface: filters, rankings, search, comparisons, schools, leagues, teams, players.

### Enter

Fast stat and media input: live scoring, post-game stats, YouTube link attach, roster tools.

### Entity profiles

Reusable layout for players, teams, games, schools, leagues, seasons, and tournaments.

### Admin

Operational review: teams, claims, disputes, imports, sports config, moderation.

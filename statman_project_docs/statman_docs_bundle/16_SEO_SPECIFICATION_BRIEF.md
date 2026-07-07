# SEO Specification Brief

## SEO strategy

Statman should generate indexable public pages for athletes, teams, games, leagues, schools, rankings, and sport/location pages.

## URL structure

```txt
/players/:playerSlug
/teams/:teamSlug
/games/:gameId
/leagues/:leagueSlug
/schools/:schoolSlug
/rankings/:sport
/rankings/:sport/:statKey
/sports/:sportSlug
/locations/:stateSlug/:citySlug/:sportSlug
```

## Metadata rules

### Player profile

Title: `{Player Name} Stats, Highlights, and Profile | Statman`

Description: `{Player Name} is a {position} for {team}. View stats, game log, highlights, and profile updates.`

### Team profile

Title: `{Team Name} Stats, Roster, Schedule, and Results | Statman`

### Game page

Title: `{Team A} vs {Team B} Box Score and Top Performers | Statman`

## Open Graph

- Use athlete/team media when available.
- Fallback to generated share card.
- Include key stats in description.

## Indexing priorities

1. Player profiles.
2. Team profiles.
3. Game pages.
4. Rankings.
5. League/school pages.
6. Sport/location pages.

## Structured data candidates

- SportsEvent for game pages.
- Person for athlete profiles.
- Organization for team/school pages.
- BreadcrumbList.

## Technical notes

React Native Web/PWA may need SSR or pre-rendering for SEO-critical pages if crawler-visible metadata is required.

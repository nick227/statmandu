export interface ExploreAuthorityBand {
  sportLabel: string
  headline: string
  subhead: string
  metrics: { label: string; value: string }[]
}

export const EXPLORE_SPORTS = ['basketball', 'soccer', 'football', 'tennis'] as const

export type ExploreSportSlug = (typeof EXPLORE_SPORTS)[number]

export const EXPLORE_COPY = {
  screenTitle: 'Explore',
  search: {
    placeholder: 'Search players, teams, games...',
    loadingLabel: 'Searching',
  },
  sections: {
    rankings: {
      title: 'Season rankings',
      subtitle: 'Leaders ranked from finalized games and verified stat lines.',
    },
    champion: {
      title: 'Champion Standard',
      subtitle: 'The current leader, lifted out of the table and into the story.',
    },
    podium: {
      title: 'The Podium',
      subtitle: 'The names pushing the leader every week.',
    },
    showcases: {
      title: 'Showcase Circuit',
      subtitle: 'Different categories, different kinds of dominance.',
    },
    deeperBoards: {
      title: 'More Ways To Win',
      subtitle: 'Situational boards built from athlete, team, and game results.',
    },
    featuredPlayer: {
      eyebrow: 'Season leader',
    },
    featuredTeam: {
      eyebrow: 'Season leader',
    },
    topPlayers: {
      title: 'Top players',
      subtitle: 'Tap a profile to see the full stat line and game log.',
    },
    topTeams: {
      title: 'Top teams',
      subtitle: 'Standings built from the same box scores powering player ranks.',
    },
    searchResults: {
      title: 'Search results',
      subtitle: 'Players, teams, and games matching your query.',
    },
    videos: {
      champion: {
        title: 'Leader video',
        subtitle: 'Video attached to the current #1 player.',
        empty: 'No video attached to the current leader yet.',
      },
      board: {
        title: 'Video from the board',
        subtitle: 'Recent uploads from ranked athletes and programs.',
      },
    },
  },
  filters: {
    verifiedOnly: 'Verified only',
  },
  errors: {
    search: 'Search could not be loaded.',
    rankings: 'Rankings could not be loaded.',
  },
  empty: {
    players: {
      title: 'No ranked players yet',
      description: 'Finalized games will populate the leaderboard for this sport.',
    },
    verifiedPlayers: {
      title: 'No verified leaders yet',
      description: 'Try turning off the verified filter or check back after more games finalize.',
    },
    playersGrowing: {
      description: 'More ranked players will appear as games finalize.',
    },
    teams: {
      title: 'No ranked teams yet',
      description: 'Team standings appear once season games are finalized.',
    },
    teamsGrowing: {
      description: 'More ranked teams will appear as the season progresses.',
    },
    search: {
      title: 'No results found',
      description: 'Try a different search or browse the rankings above.',
    },
  },
  linkLabels: {
    seeAll: 'See all',
  },
} as const

export function exploreAuthorityBand(sportName: string): ExploreAuthorityBand {
  return {
    sportLabel: `${sportName} · Statman rankings`,
    headline: `The ${sportName.toLowerCase()} numbers that matter`,
    subhead: 'Every rank ties back to a real box score — multi-reporter verified where it counts.',
    metrics: [
      { label: 'Stat sorts', value: '6+' },
      { label: 'Live updates', value: 'Yes' },
      { label: 'Source tracked', value: '100%' },
    ],
  }
}

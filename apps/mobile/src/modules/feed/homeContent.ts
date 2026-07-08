import type { PlatformAuthorityBandProps, PlatformPitchCardProps, UsageCta } from '@/modules/feed/HomeSections'

export const HOME_SPORT_SLUG = 'basketball'
export const HOME_PLAYER_STAT = 'points'
export const HOME_TEAM_STAT = 'wins'

export const HOME_SCREEN = {
  title: 'Home',
  error: 'The home feed could not be loaded.',
} as const

export const HOME_AUTHORITY: PlatformAuthorityBandProps = {
  sportLabel: 'Basketball · Central Texas',
  headline: 'Tonight\'s stats authority',
  subhead: 'Live box scores, verified leaders, and athlete profiles tied to real games.',
  metrics: [
    { label: 'Active profiles', value: '248' },
    { label: 'Games tracked', value: '36' },
    { label: 'Scorers online', value: '18' },
    { label: 'Feed reactions', value: '3.4k' },
  ],
}

export const HOME_PLATFORM_PITCH: PlatformPitchCardProps = {
  eyebrow: 'For athletes & programs',
  title: 'Post here. Get found.',
  body: 'Verified stats, highlight surfacing, and a feed that rewards real game nights.',
  proofPoints: [
    'Consensus scoring keeps your numbers credible',
    'Profiles update automatically after finalize',
  ],
}

export const HOME_USAGE_CTAS: UsageCta[] = [
  {
    id: 'claim',
    title: 'Claim your profile',
    description: 'Own your stats, media, and public identity.',
    href: { pathname: '/explore' },
    eyebrow: 'Athletes',
  },
  {
    id: 'enter',
    title: 'Score a game',
    description: 'Join live capture from the sideline.',
    href: { pathname: '/scores' },
    eyebrow: 'Teams',
  },
  {
    id: 'highlight',
    title: 'Browse video',
    description: 'Open the full highlight board.',
    href: { pathname: '/videos' },
    eyebrow: 'Media',
  },
]

export const HOME_COMMUNITY_METRICS = [
  { label: 'Reactions', value: '412' },
  { label: 'Follows', value: '89' },
  { label: 'Live now', value: '3' },
]

export const HOME_SECTION_COPY = {
  athletes: {
    title: 'Player leaders',
    subtitle: 'Points leaders from finalized games this season.',
    champion: 'Season leader',
    podium: 'Podium',
    podiumSubtitle: 'Top three by points.',
    ribbonStat: 'Season high',
    ribbonRank: 'Rank',
  },
  community: {
    title: 'In the feed',
    subtitle: 'Game nights, milestones, and media drops across the network.',
  },
  games: {
    title: 'Games',
    subtitle: 'Live now and recent finals.',
    liveShowcase: 'Live wire',
    liveShowcaseSubtitle: 'Tap in before the run ends.',
  },
  scores: {
    title: 'Tonight\'s board',
    subtitle: 'Live and upcoming — score, broadcast, or watch from here.',
  },
  teams: {
    title: 'Team leaders',
    subtitle: 'Programs setting the pace in the standings.',
    featuredEyebrow: 'Top program',
  },
  showcases: {
    rebounds: {
      title: 'Board leaders',
      subtitle: 'Rebounders controlling the paint this month.',
    },
    live: {
      title: 'On the floor',
      subtitle: 'Matchups with active reporting.',
    },
  },
  usage: {
    title: 'Join the board',
    subtitle: 'Three entry points for athletes and teams.',
  },
  videos: {
    featured: {
      title: 'Featured video',
      subtitle: 'Latest highlight across the network.',
    },
  },
  articles: {
    title: 'From the newsroom',
    subtitle: 'Recaps and reporting from the community.',
  },
  linkLabels: {
    seeAll: 'Search & rankings',
    allVideos: 'All videos',
    allArticles: 'All articles',
    allTeams: 'All teams',
    scores: 'Scores & entry',
  },
} as const

export const HOME_EMPTY_COPY = {
  feed: {
    title: 'Feed is quiet',
    description: 'Finalized games and new media will populate this section.',
  },
  videos: {
    title: 'No video uploaded yet',
    description: 'Athlete highlights, team reels, and game recaps will surface here as they are submitted.',
    browseCta: 'Browse Video',
  },
  articles: {
    title: 'No articles yet',
    description: 'Be the first to write one.',
    browseCta: 'Write an article',
  },
} as const

export interface HomeAdSlot {
  id: string
  format: 'banner' | 'card'
  sponsoredLabel: string
  sponsor: string
  headline: string
  body?: string
  cta: string
}

export const HOME_AD_SLOTS: HomeAdSlot[] = [
  {
    id: 'ad-top',
    format: 'banner',
    sponsoredLabel: 'Sponsored',
    sponsor: 'Austin Sports Medicine',
    headline: 'Friday night recovery starts here — free eval for varsity athletes',
    cta: 'Book',
  },
  {
    id: 'ad-mid',
    format: 'card',
    sponsoredLabel: 'Sponsored',
    sponsor: 'Central Texas Hoops Club',
    headline: 'Spring showcase circuit registration open',
    body: 'Exposure events with verified Statman stat tracking for every session.',
    cta: 'Register',
  },
  {
    id: 'ad-bottom',
    format: 'banner',
    sponsoredLabel: 'Sponsored',
    sponsor: 'Peak Performance Training',
    headline: 'Off-season vertical & agility blocks — small groups, real progress',
    cta: 'Details',
  },
]

export type HomeActivityIcon =
  | 'GAME_FINAL'
  | 'STAT_MILESTONE'
  | 'MEDIA_ADDED'
  | 'PLAYER_JOINED_TEAM'
  | 'PROFILE_CLAIMED'
  | 'DISPUTE_RESOLVED'
  | 'COMMUNITY'

export interface HomeMockActivity {
  id: string
  icon: HomeActivityIcon
  eyebrow: string
  title: string
  subtitle: string
  timestamp: string
}

export const HOME_MOCK_ACTIVITY: HomeMockActivity[] = [
  {
    id: 'mock-1',
    icon: 'STAT_MILESTONE',
    eyebrow: 'Milestone',
    title: 'Marcus Reed hits 500 career points',
    subtitle: 'Eastside Ballers · verified box score',
    timestamp: '2h ago',
  },
  {
    id: 'mock-2',
    icon: 'MEDIA_ADDED',
    eyebrow: 'Highlight',
    title: 'New video: Westview full-court press breakdown',
    subtitle: 'Team reel attached to game archive',
    timestamp: '4h ago',
  },
  {
    id: 'mock-3',
    icon: 'PROFILE_CLAIMED',
    eyebrow: 'Claimed',
    title: 'Jayden Rios claimed his public profile',
    subtitle: 'Athlete account now linked to verified stats',
    timestamp: '6h ago',
  },
  {
    id: 'mock-4',
    icon: 'COMMUNITY',
    eyebrow: 'Trending',
    title: '214 reactions on last night\'s rivalry final',
    subtitle: 'Eastside 72 – Westview 68 · most engaged game this week',
    timestamp: '8h ago',
  },
  {
    id: 'mock-5',
    icon: 'GAME_FINAL',
    eyebrow: 'Final',
    title: 'Knife-edge finish: Hawks edge Ballers by 2',
    subtitle: 'Box score disputed on one assist — community reviewing',
    timestamp: 'Yesterday',
  },
]

export const HOME_LAYOUT = {
  sectionGap: 'gap-md',
  railCardWidth: 'w-[34%]',
  maxFeedItems: 4,
  maxMockActivity: 5,
} as const

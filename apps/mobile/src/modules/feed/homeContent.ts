import type { PlatformAuthorityBandProps, PlatformPitchCardProps, UsageCta } from '@/modules/feed/HomeSections'

export const HOME_SPORT_SLUG = 'basketball'

export const HOME_AUTHORITY: PlatformAuthorityBandProps = {
  sportLabel: 'Basketball · Central Texas',
  headline: 'The stats authority for real game nights',
  subhead: 'Verified box scores, live capture, and athlete profiles that travel with every performance — online and in the gym.',
  metrics: [
    { label: 'Profiles tracked', value: '20' },
    { label: 'Games this season', value: '4' },
    { label: 'Live reporters', value: '12' },
    { label: 'Community reactions', value: '1.2k' },
  ],
}

export const HOME_PLATFORM_PITCH: PlatformPitchCardProps = {
  eyebrow: 'Why post here',
  title: 'Where verified stats become real opportunity',
  body: 'Coaches, fans, and recruiters follow the numbers that matter. Statman turns every game night into a credible profile moment — not a screenshot lost in a group chat.',
  proofPoints: [
    'Multi-reporter consensus keeps box scores trustworthy',
    'Highlights and milestones surface automatically after finalize',
    'Claimed profiles connect athletes to real accounts and exposure',
  ],
}

export const HOME_USAGE_CTAS: UsageCta[] = [
  {
    id: 'claim',
    title: 'Claim your athlete profile',
    description: 'Take ownership of your public stats, media, and identity.',
    href: { pathname: '/(tabs)/explore' },
  },
  {
    id: 'enter',
    title: 'Enter stats from the sideline',
    description: 'Join a live game as scorer, broadcaster, or contributor.',
    href: { pathname: '/(tabs)/enter' },
  },
  {
    id: 'highlight',
    title: 'Post a highlight reel',
    description: 'Attach YouTube film to your profile and get in the feed.',
    href: { pathname: '/(tabs)/explore' },
  },
]

export const HOME_COMMUNITY_METRICS = [
  { label: 'Reactions today', value: '186' },
  { label: 'New follows', value: '42' },
  { label: 'Games finalized', value: '2' },
]

export const HOME_SECTION_COPY = {
  athletes: {
    title: 'Athletes on the rise',
    subtitle: 'Featured players climbing the leaderboard — the profiles scouts and fans actually check.',
  },
  community: {
    title: 'Community pulse',
    subtitle: 'What the Statman network is doing right now — on the site and tied to real games.',
  },
  games: {
    title: 'Big games',
    subtitle: 'Final scores and live matchups driving tonight\'s conversation.',
  },
  leaders: {
    title: 'Season leaders',
    subtitle: 'The numbers that define this basketball season.',
  },
  usage: {
    title: 'Get on the board',
    subtitle: 'Three ways athletes and teams turn game nights into profile equity.',
  },
} as const

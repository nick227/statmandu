const playerKeys = [
  'jayden-rios', 'marcus-carter', 'elijah-bennett', 'noah-diallo', 'aiden-hughes',
  'cameron-ortiz', 'isaiah-bryant', 'xavier-coleman', 'malik-nguyen', 'tyler-foster',
  'josiah-walsh', 'devon-reyes', 'amir-sutton', 'caleb-grant', 'jordan-mercer',
  'dominic-booker', 'nasir-alston', 'ezra-pierce', 'miles-lindsey', 'zion-franco',
] as const

export const seedIds = {
  prefix: 'seed-',
  users: {
    admin: { id: 'seed-user-admin', email: 'admin@statman.dev', username: 'admin' },
    manager: { id: 'seed-user-manager', email: 'teamscorer@statman.dev', username: 'eastsidebook' },
    scorer: { id: 'seed-user-scorer', email: 'scorer@statman.dev', username: 'officialscorer' },
    reporter: { id: 'seed-user-reporter', email: 'broadcaster@statman.dev', username: 'riverradio' },
    athlete: { id: 'seed-user-athlete', email: 'athlete@statman.dev', username: 'jaydenrios' },
    fan: { id: 'seed-user-fan', email: 'fan1@statman.dev', username: 'hoopsfan' },
    verifier: { id: 'seed-user-verifier', email: 'fan2@statman.dev', username: 'courtside' },
  },
  sport: { basketball: 'seed-sport-basketball' },
  league: { basketball: 'seed-league-riverton' },
  seasons: { current: 'seed-season-2026', prior: 'seed-season-2025' },
  schools: {
    eastside: 'seed-school-eastside',
    westview: 'seed-school-westview',
    lakeview: 'seed-school-lakeview',
    cedar: 'seed-school-cedar',
  },
  teams: {
    comets: 'seed-team-austin-comets',
    falcons: 'seed-team-riverton-falcons',
    wolves: 'seed-team-lakeview-wolves',
    monarchs: 'seed-team-cedar-monarchs',
  },
  games: {
    close: 'seed-final-game-1',
    disputed: 'seed-final-game-2',
    live: 'seed-live-game',
    upcoming: 'seed-upcoming-game',
  },
  players: Object.fromEntries(playerKeys.map((key, index) => [key, `seed-player-${String(index + 1).padStart(2, '0')}`])) as Record<(typeof playerKeys)[number], string>,
  athleteProfiles: Object.fromEntries(playerKeys.map((key, index) => [key, `seed-athlete-${String(index + 1).padStart(2, '0')}`])) as Record<(typeof playerKeys)[number], string>,
  cards: {
    featured: 'seed-card-01',
    prefix: 'seed-card-',
  },
  generationJobs: { prefix: 'seed-card-job-' },
} as const

export const seedUserEmails = Object.values(seedIds.users).map((user) => user.email)
export const seedPlayerSlugs = playerKeys

export function numberedSeedId(prefix: string, index: number) {
  return `${prefix}${String(index + 1).padStart(2, '0')}`
}

export function isSeedOwnedId(id: string) {
  return id.startsWith(seedIds.prefix)
}

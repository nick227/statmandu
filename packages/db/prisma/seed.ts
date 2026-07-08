import { db } from '../src/client'
import { listSportDefinitions } from '@statman/sports'
import bcrypt from 'bcryptjs'

const FIRST_NAMES = [
  'Jayden', 'Marcus', 'Elijah', 'Noah', 'Aiden', 'Cameron', 'Isaiah', 'Xavier', 'Malik', 'Tyler',
  'Josiah', 'Devon', 'Amir', 'Caleb', 'Jordan', 'Dominic', 'Nasir', 'Ezra', 'Miles', 'Zion',
]
const LAST_NAMES = [
  'Rios', 'Carter', 'Bennett', 'Diallo', 'Hughes', 'Ortiz', 'Bryant', 'Coleman', 'Nguyen', 'Foster',
  'Walsh', 'Reyes', 'Sutton', 'Grant', 'Mercer', 'Booker', 'Alston', 'Pierce', 'Lindsey', 'Franco',
]
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const
const CLASS_YEARS = ['2026', '2027', '2028']
// Source-status ladder varied across the roster on purpose — real demo data
// should exercise every SourceBadge color, not just one flat status.
const SOURCE_STATUSES = [
  'PLAYER_REPORTED', 'PLAYER_REPORTED',
  'SPECTATOR_REPORTED', 'SPECTATOR_REPORTED',
  'MULTI_SPECTATOR_CONFIRMED', 'MULTI_SPECTATOR_CONFIRMED',
  'OFFICIAL_SCORER_RECORDED', 'OFFICIAL_SCORER_RECORDED', 'OFFICIAL_SCORER_RECORDED', 'OFFICIAL_SCORER_RECORDED',
  'TEAM_MANAGER_ENTERED', 'TEAM_MANAGER_ENTERED', 'TEAM_MANAGER_ENTERED', 'TEAM_MANAGER_ENTERED',
  'ONLINE_SOURCE_IMPORTED', 'PUBLIC_SOURCE_SCRAPED',
  'VERIFIED_TEAM_ACCOUNT', 'VERIFIED_TEAM_ACCOUNT', 'VERIFIED_TEAM_ACCOUNT',
  'IN_DISPUTE',
] as const

const DEMO_VIDEO_POOL = [
  'dQw4w9WgXcQ',
  '9bZkp7q19f0',
  'kJQP7kiw5Fk',
  '3JZ_D3ELwOQ',
  'fJ9rUzIMcZQ',
  'RgKAFK5djSk',
  'YQHsXMglC9A',
  'E8gmARGvPlI',
  'OPf0YbXqDm0',
  'e-ORhEE9VVg',
  'L_jWHffIx5E',
  'hT_nvWreIhg',
  'CevxZvSJLk8',
  'y6120QOlsfU',
  'Zi_XLOBDo_Y',
  'fRh_vgS2dFE',
  '1G4isv_Fylg',
  'uelHwf8o7_U',
] as const

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000)
}

// Deterministic-but-varied box score generator — re-running the seed script
// always produces the same demo numbers instead of new random ones each time.
function statLineFor(seed: number) {
  const r = (n: number) => seed % n
  const threeMade = r(4)
  const threeAttempted = threeMade + r(3) + 1
  const twoMade = 2 + r(6)
  const twoAttempted = twoMade + r(4) + 1
  const ftMade = r(5)
  const ftAttempted = ftMade + r(2)
  return {
    points: twoMade * 2 + threeMade * 3 + ftMade,
    offRebounds: r(4),
    defRebounds: 1 + r(6),
    assists: r(7),
    steals: r(3),
    blocks: r(2),
    turnovers: r(4),
    fouls: r(4),
    fgMade: twoMade + threeMade,
    fgAttempted: twoAttempted + threeAttempted,
    threeMade,
    threeAttempted,
    ftMade,
    ftAttempted,
  }
}

function sourceStatusForStatLine(gameIndex: number, sideIndex: number, playerIndex: number) {
  if (gameIndex === 0 && sideIndex === 0 && playerIndex < 2) return 'VERIFIED_TEAM_ACCOUNT'
  if (gameIndex === 0 && playerIndex === 2) return 'TEAM_MANAGER_ENTERED'
  if (gameIndex === 1 && sideIndex === 1 && playerIndex < 2) return 'MULTI_SPECTATOR_CONFIRMED'
  if (gameIndex === 1 && playerIndex === 3) return 'ONLINE_SOURCE_IMPORTED'
  return 'OFFICIAL_SCORER_RECORDED'
}

async function main() {
  console.log('Seeding...')

  // ── Users ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12)

  async function upsertDemoUser(opts: { email: string; username: string; displayName: string; role?: 'USER' | 'ADMIN' }) {
    return db.user.upsert({
      where: { email: opts.email },
      update: {
        role: opts.role ?? 'USER',
        profile: {
          upsert: {
            update: { username: opts.username, displayName: opts.displayName },
            create: { username: opts.username, displayName: opts.displayName },
          },
        },
      },
      create: {
        email: opts.email,
        passwordHash,
        role: opts.role ?? 'USER',
        profile: { create: { username: opts.username, displayName: opts.displayName } },
      },
    })
  }

  const admin = await upsertDemoUser({
    email: 'admin@statman.dev',
    username: 'admin',
    displayName: 'Statman Admin',
    role: 'ADMIN',
  })
  const scorer = await upsertDemoUser({
    email: 'scorer@statman.dev',
    username: 'officialscorer',
    displayName: 'Olivia Official Scorer',
  })
  const teamScorer = await upsertDemoUser({
    email: 'teamscorer@statman.dev',
    username: 'eastsidebook',
    displayName: 'Terry Team Scorer',
  })
  const broadcaster = await upsertDemoUser({
    email: 'broadcaster@statman.dev',
    username: 'riverradio',
    displayName: 'Blake Broadcaster',
  })
  const athleteUser = await upsertDemoUser({
    email: 'athlete@statman.dev',
    username: 'jaydenrios',
    displayName: 'Jayden Rios',
  })
  const fan1 = await upsertDemoUser({
    email: 'fan1@statman.dev',
    username: 'hoopsfan',
    displayName: 'Sam the Superfan',
  })
  const fan2 = await upsertDemoUser({
    email: 'fan2@statman.dev',
    username: 'courtside',
    displayName: 'Riley Courtside',
  })
  console.log(`✓ Users seeded: ${[admin, scorer, teamScorer, broadcaster, athleteUser, fan1, fan2].length} demo accounts (all password: password123)`)

  // ── Sport / league / season / schools / teams ───────────────────────────
  const sport = await db.sport.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: { slug: 'basketball', name: 'Basketball' },
  })

  const starterSports = await Promise.all(
    listSportDefinitions()
      .filter((definition) => definition.slug !== 'basketball')
      .map((definition) =>
        db.sport.upsert({
          where: { slug: definition.slug },
          update: { name: definition.name },
          create: { slug: definition.slug, name: definition.name },
        }),
      ),
  )

  const league = await db.league.upsert({
    where: { slug: 'demo-league' },
    update: {},
    create: { sportId: sport.id, slug: 'demo-league', name: 'Statman Demo League' },
  })

  const season = await db.season.upsert({
    where: { slug: '2025-26' },
    update: {},
    create: { leagueId: league.id, slug: '2025-26', name: '2025-26 Season', isActive: true },
  })

  const schools = await Promise.all([
    db.school.upsert({
      where: { slug: 'eastside-high' },
      update: {},
      create: { slug: 'eastside-high', name: 'Eastside High', city: 'Riverton', state: 'CA' },
    }),
    db.school.upsert({
      where: { slug: 'westview-high' },
      update: {},
      create: { slug: 'westview-high', name: 'Westview High', city: 'Riverton', state: 'CA' },
    }),
  ])

  const teams = await Promise.all([
    db.team.upsert({
      where: { slug: 'eastside-ballers' },
      update: {},
      create: {
        sportId: sport.id, leagueId: league.id, schoolId: schools[0].id,
        slug: 'eastside-ballers', name: 'Eastside Ballers', city: 'Riverton',
      },
    }),
    db.team.upsert({
      where: { slug: 'westview-hawks' },
      update: {},
      create: {
        sportId: sport.id, leagueId: league.id, schoolId: schools[1].id,
        slug: 'westview-hawks', name: 'Westview Hawks', city: 'Riverton',
      },
    }),
  ])
  console.log(`✓ Teams: ${teams.map((t) => t.name).join(', ')}`)

  // ── Players + roster ─────────────────────────────────────────────────────
  const players: Array<{ id: string; athleteProfileId: string; teamId: string; name: string }> = []

  for (let i = 0; i < 20; i++) {
    const team = teams[i % 2]!
    const firstName = FIRST_NAMES[i]!
    const lastName = LAST_NAMES[i]!
    const slug = slugify(`${firstName}-${lastName}`)
    const jerseyNumber = Math.floor(i / 2) + 1

    // Two players are pre-claimed/pre-requested so Claims screens have real content.
    const claimedByUserId = i === 1 ? athleteUser.id : undefined

    const athleteProfile = await db.athleteProfile.upsert({
      where: { slug },
      update: {},
      create: {
        slug, firstName, lastName,
        hometown: 'Riverton, CA',
        sourceStatus: SOURCE_STATUSES[i]!,
        claimedByUserId,
      },
    })

    const player = await db.player.upsert({
      where: { athleteProfileId_sportId: { athleteProfileId: athleteProfile.id, sportId: sport.id } },
      update: {},
      create: {
        athleteProfileId: athleteProfile.id,
        sportId: sport.id,
        position: POSITIONS[i % POSITIONS.length],
        classYear: CLASS_YEARS[i % CLASS_YEARS.length],
        jerseyNumber,
      },
    })

    await db.rosterMembership.upsert({
      where: { playerId_teamId_seasonId: { playerId: player.id, teamId: team.id, seasonId: season.id } },
      update: {},
      create: { playerId: player.id, teamId: team.id, seasonId: season.id, jerseyNumber },
    })

    players.push({ id: player.id, athleteProfileId: athleteProfile.id, teamId: team.id, name: `${firstName} ${lastName}` })
  }
  console.log(`✓ Players seeded: ${players.length} (10 per team)`)

  const eastsidePlayers = players.filter((p) => p.teamId === teams[0].id)
  const westviewPlayers = players.filter((p) => p.teamId === teams[1].id)

  // ── Finalized games (with box scores + season stat aggregation) ────────
  const ZERO_LINE = {
    points: 0, offRebounds: 0, defRebounds: 0, assists: 0, steals: 0, blocks: 0,
    turnovers: 0, fouls: 0, fgMade: 0, fgAttempted: 0, threeMade: 0, threeAttempted: 0,
    ftMade: 0, ftAttempted: 0,
  }
  const seasonTotals = new Map<string, typeof ZERO_LINE & { gamesPlayed: number }>()
  const teamRecord = new Map<string, { wins: number; losses: number; pointsFor: number; pointsAgainst: number }>()
  for (const t of teams) teamRecord.set(t.id, { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 })

  let disputeCount = 0

  // Fixed ids make this idempotent — re-running `pnpm db:seed` skips a game
  // (and its box score/stat aggregation) entirely if it already exists,
  // instead of creating duplicate finalized games on every run.
  async function seedFinalizedGame(opts: { id: string; scheduledAt: Date; gameIndex: number; withDispute: boolean }) {
    const existing = await db.game.findUnique({ where: { id: opts.id }, include: { gameTeams: true } })
    if (existing) return existing

    const game = await db.game.create({
      data: {
        id: opts.id,
        sportId: sport.id, seasonId: season.id, scheduledAt: opts.scheduledAt,
        status: opts.withDispute ? 'DISPUTED' : 'FINAL',
        startedAt: opts.scheduledAt,
        finalizedAt: new Date(opts.scheduledAt.getTime() + 2 * 60 * 60 * 1000),
        gameTeams: {
          create: [
            { teamId: teams[0].id, isHome: true },
            { teamId: teams[1].id, isHome: false },
          ],
        },
      },
      include: { gameTeams: true },
    })

    let homeScore = 0
    let awayScore = 0

    for (const [sideIndex, roster] of [eastsidePlayers, westviewPlayers].entries()) {
      for (const [playerIndex, p] of roster.entries()) {
        const seed = (opts.gameIndex + 1) * 31 + playerIndex * 7 + sideIndex * 3
        const line = statLineFor(seed)
        const isDisputedLine = opts.withDispute && sideIndex === 0 && playerIndex === 0

        const statLine = await db.gameStatLine.create({
          data: {
            gameId: game.id,
            playerId: p.id,
            teamId: p.teamId,
            ...line,
            stats: line,
            sourceStatus: isDisputedLine ? 'IN_DISPUTE' : sourceStatusForStatLine(opts.gameIndex, sideIndex, playerIndex),
            disputeNote: isDisputedLine
              ? 'Assist total disputed. Home scorer recorded a different count than the team scorer.'
              : null,
          },
        })

        if (isDisputedLine) {
          await db.dispute.upsert({
            where: { id: 'seed-dispute-final-game-2-assists' },
            update: {
              targetType: 'GAME_STAT_LINE',
              targetId: statLine.id,
              fieldName: 'assists',
              description: 'Home scorer and team scorer logs disagreed on assist count at reconciliation.',
              submittedByUserId: admin.id,
              status: 'OPEN',
            },
            create: {
              id: 'seed-dispute-final-game-2-assists',
              targetType: 'GAME_STAT_LINE',
              targetId: statLine.id,
              fieldName: 'assists',
              description: 'Home scorer and team scorer logs disagreed on assist count at reconciliation.',
              submittedByUserId: admin.id,
              status: 'OPEN',
            },
          })
          disputeCount++
        }

        if (sideIndex === 0) homeScore += line.points
        else awayScore += line.points

        const key = p.id
        const running = seasonTotals.get(key) ?? { ...ZERO_LINE, gamesPlayed: 0 }
        for (const statKey of Object.keys(line) as Array<keyof typeof line>) {
          ;(running as any)[statKey] = (running as any)[statKey] + line[statKey]
        }
        running.gamesPlayed += 1
        seasonTotals.set(key, running)
      }
    }

    await db.gameTeam.update({ where: { id: game.gameTeams.find((gt) => gt.isHome)!.id }, data: { finalScore: homeScore } })
    await db.gameTeam.update({ where: { id: game.gameTeams.find((gt) => !gt.isHome)!.id }, data: { finalScore: awayScore } })

    const home = teamRecord.get(teams[0].id)!
    const away = teamRecord.get(teams[1].id)!
    home.pointsFor += homeScore; home.pointsAgainst += awayScore
    away.pointsFor += awayScore; away.pointsAgainst += homeScore
    if (homeScore > awayScore) { home.wins++; away.losses++ } else { away.wins++; home.losses++ }

    await db.feedItem.create({
      data: {
        type: 'GAME_FINAL',
        targetType: 'GAME',
        targetId: game.id,
        summary: `Final: ${teams[0].name} ${homeScore} - ${teams[1].name} ${awayScore}`,
        occurredAt: game.finalizedAt!,
      },
    })

    return game
  }

  const finalGame1 = await seedFinalizedGame({ id: 'seed-final-game-1', scheduledAt: daysAgo(10), gameIndex: 0, withDispute: false })
  const finalGame2 = await seedFinalizedGame({ id: 'seed-final-game-2', scheduledAt: daysAgo(3), gameIndex: 1, withDispute: true })

  const disputedSeedLine = await db.gameStatLine.findUnique({
    where: { gameId_playerId: { gameId: finalGame2.id, playerId: eastsidePlayers[0]!.id } },
  })
  if (disputedSeedLine) {
    await db.dispute.deleteMany({
      where: {
        targetType: 'GAME_STAT_LINE',
        targetId: eastsidePlayers[0]!.id,
        fieldName: 'assists',
        description: 'Home scorer and team scorer logs disagreed on assist count at reconciliation.',
      },
    })
    await db.dispute.upsert({
      where: { id: 'seed-dispute-final-game-2-assists' },
      update: {
        targetType: 'GAME_STAT_LINE',
        targetId: disputedSeedLine.id,
        fieldName: 'assists',
        description: 'Home scorer and team scorer logs disagreed on assist count at reconciliation.',
        submittedByUserId: admin.id,
        status: 'OPEN',
      },
      create: {
        id: 'seed-dispute-final-game-2-assists',
        targetType: 'GAME_STAT_LINE',
        targetId: disputedSeedLine.id,
        fieldName: 'assists',
        description: 'Home scorer and team scorer logs disagreed on assist count at reconciliation.',
        submittedByUserId: admin.id,
        status: 'OPEN',
      },
    })
  }

  seasonTotals.clear()
  for (const t of teams) teamRecord.set(t.id, { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 })

  const seededFinalGameIds = [finalGame1.id, finalGame2.id]
  const seededStatLines = await db.gameStatLine.findMany({ where: { gameId: { in: seededFinalGameIds } } })
  for (const line of seededStatLines) {
    const running = seasonTotals.get(line.playerId) ?? { ...ZERO_LINE, gamesPlayed: 0 }
    for (const statKey of Object.keys(ZERO_LINE) as Array<keyof typeof ZERO_LINE>) {
      running[statKey] += line[statKey]
    }
    running.gamesPlayed += 1
    seasonTotals.set(line.playerId, running)
  }

  const seededFinalGames = await db.game.findMany({
    where: { id: { in: seededFinalGameIds } },
    include: { gameTeams: true },
  })
  for (const game of seededFinalGames) {
    const home = game.gameTeams.find((gt) => gt.isHome)
    const away = game.gameTeams.find((gt) => !gt.isHome)
    if (!home || !away || home.finalScore == null || away.finalScore == null) continue

    const homeRecord = teamRecord.get(home.teamId)!
    const awayRecord = teamRecord.get(away.teamId)!
    homeRecord.pointsFor += home.finalScore
    homeRecord.pointsAgainst += away.finalScore
    awayRecord.pointsFor += away.finalScore
    awayRecord.pointsAgainst += home.finalScore
    if (home.finalScore > away.finalScore) {
      homeRecord.wins++
      awayRecord.losses++
    } else {
      awayRecord.wins++
      homeRecord.losses++
    }
  }

  for (const [playerId, totals] of seasonTotals) {
    const { gamesPlayed, ...rest } = totals
    await db.playerSeasonStat.upsert({
      where: { playerId_seasonId: { playerId, seasonId: season.id } },
      update: { gamesPlayed, ...rest, stats: rest },
      create: { playerId, seasonId: season.id, gamesPlayed, ...rest, stats: rest },
    })
  }

  for (const team of teams) {
    const record = teamRecord.get(team.id)!
    await db.teamSeasonStat.upsert({
      where: { teamId_seasonId: { teamId: team.id, seasonId: season.id } },
      update: { ...record, stats: record },
      create: { teamId: team.id, seasonId: season.id, ...record, stats: record },
    })
  }
  disputeCount = await db.dispute.count({ where: { id: 'seed-dispute-final-game-2-assists' } })
  console.log(`✓ Finalized games: 2 (with season stats + team records + ${disputeCount} dispute)`)

  // ── Live game (in progress, with real events already submitted) ────────
  const liveGame = await db.game.upsert({
    where: { id: 'seed-live-game' },
    update: {},
    create: {
      id: 'seed-live-game',
      sportId: sport.id, seasonId: season.id,
      scheduledAt: new Date(),
      status: 'LIVE',
      startedAt: new Date(Date.now() - 20 * 60 * 1000),
      gameTeams: {
        create: [
          { teamId: teams[0].id, isHome: true },
          { teamId: teams[1].id, isHome: false },
        ],
      },
    },
  })

  const liveReporter = await db.gameReporter.upsert({
    where: { gameId_userId: { gameId: liveGame.id, userId: scorer.id } },
    update: {},
    create: { gameId: liveGame.id, userId: scorer.id, role: 'OFFICIAL_SCORER' },
  })
  await db.gameReporter.upsert({
    where: { gameId_userId: { gameId: liveGame.id, userId: admin.id } },
    update: { role: 'ADMIN_OWNER' },
    create: { gameId: liveGame.id, userId: admin.id, role: 'ADMIN_OWNER' },
  })
  await db.gameReporter.upsert({
    where: { gameId_userId: { gameId: liveGame.id, userId: teamScorer.id } },
    update: { role: 'TEAM_SCORER', teamId: teams[0].id },
    create: { gameId: liveGame.id, userId: teamScorer.id, teamId: teams[0].id, role: 'TEAM_SCORER' },
  })
  await db.gameReporter.upsert({
    where: { gameId_userId: { gameId: liveGame.id, userId: broadcaster.id } },
    update: { role: 'BROADCASTER' },
    create: { gameId: liveGame.id, userId: broadcaster.id, role: 'BROADCASTER' },
  })

  const liveEvents: Array<{ type: any; playerId: string; teamId: string }> = [
    { type: 'FG2_MADE', playerId: eastsidePlayers[0]!.id, teamId: teams[0].id },
    { type: 'ASSIST', playerId: eastsidePlayers[1]!.id, teamId: teams[0].id },
    { type: 'FG3_MADE', playerId: westviewPlayers[0]!.id, teamId: teams[1].id },
    { type: 'REBOUND_DEF', playerId: eastsidePlayers[2]!.id, teamId: teams[0].id },
    { type: 'FT_MADE', playerId: westviewPlayers[1]!.id, teamId: teams[1].id },
    { type: 'STEAL', playerId: eastsidePlayers[0]!.id, teamId: teams[0].id },
  ]
  const existingLiveEvents = await db.gameEvent.count({ where: { gameId: liveGame.id } })
  if (existingLiveEvents === 0) {
    for (const [i, e] of liveEvents.entries()) {
      await db.gameEvent.create({
        data: {
          gameId: liveGame.id,
          reporterId: liveReporter.id,
          playerId: e.playerId,
          teamId: e.teamId,
          type: e.type,
          clientTimestamp: new Date(Date.now() - (liveEvents.length - i) * 90 * 1000),
          status: 'ACCEPTED',
        },
      })
    }
  }
  console.log(`✓ Live game in progress: ${teams[0].name} vs ${teams[1].name} (${liveEvents.length} events)`)

  // ── Upcoming scheduled game ──────────────────────────────────────────────
  const upcomingGame = await db.game.upsert({
    where: { id: 'seed-upcoming-game' },
    update: {},
    create: {
      id: 'seed-upcoming-game',
      sportId: sport.id, seasonId: season.id,
      scheduledAt: daysFromNow(4),
      status: 'SCHEDULED',
      venue: 'Riverton Community Gym',
      gameTeams: {
        create: [
          { teamId: teams[0].id, isHome: true },
          { teamId: teams[1].id, isHome: false },
        ],
      },
    },
  })
  console.log(`✓ Upcoming scheduled game: ${teams[0].name} vs ${teams[1].name} on ${upcomingGame.scheduledAt.toDateString()}`)

  // ── Media (YouTube highlights) ───────────────────────────────────────────
  const mediaTargets: Array<{
    id: string
    feedItemId: string
    targetType: 'PLAYER' | 'TEAM' | 'GAME'
    targetId: string
    title: string
    youtubeVideoId: string
    occurredAt: Date
    uploadedByUserId: string
  }> = [
    { id: 'seed-media-01', feedItemId: 'seed-feed-media-01', targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id, title: `${eastsidePlayers[0]!.name} — and-one finish`, youtubeVideoId: DEMO_VIDEO_POOL[0]!, occurredAt: daysAgo(0), uploadedByUserId: athleteUser.id },
    { id: 'seed-media-02', feedItemId: 'seed-feed-media-02', targetType: 'PLAYER', targetId: eastsidePlayers[1]!.id, title: `${eastsidePlayers[1]!.name} — postgame interview`, youtubeVideoId: DEMO_VIDEO_POOL[1]!, occurredAt: daysAgo(1), uploadedByUserId: fan1.id },
    { id: 'seed-media-03', feedItemId: 'seed-feed-media-03', targetType: 'PLAYER', targetId: eastsidePlayers[2]!.id, title: `${eastsidePlayers[2]!.name} — transition dunk`, youtubeVideoId: DEMO_VIDEO_POOL[2]!, occurredAt: daysAgo(1), uploadedByUserId: fan2.id },
    { id: 'seed-media-04', feedItemId: 'seed-feed-media-04', targetType: 'PLAYER', targetId: eastsidePlayers[3]!.id, title: `${eastsidePlayers[3]!.name} — step-back three`, youtubeVideoId: DEMO_VIDEO_POOL[3]!, occurredAt: daysAgo(2), uploadedByUserId: fan1.id },
    { id: 'seed-media-05', feedItemId: 'seed-feed-media-05', targetType: 'PLAYER', targetId: westviewPlayers[0]!.id, title: `${westviewPlayers[0]!.name} — season highlights`, youtubeVideoId: DEMO_VIDEO_POOL[4]!, occurredAt: daysAgo(2), uploadedByUserId: athleteUser.id },
    { id: 'seed-media-06', feedItemId: 'seed-feed-media-06', targetType: 'PLAYER', targetId: westviewPlayers[1]!.id, title: `${westviewPlayers[1]!.name} — chase-down block`, youtubeVideoId: DEMO_VIDEO_POOL[5]!, occurredAt: daysAgo(3), uploadedByUserId: fan2.id },
    { id: 'seed-media-07', feedItemId: 'seed-feed-media-07', targetType: 'PLAYER', targetId: westviewPlayers[2]!.id, title: `${westviewPlayers[2]!.name} — pull-up jumper`, youtubeVideoId: DEMO_VIDEO_POOL[6]!, occurredAt: daysAgo(3), uploadedByUserId: broadcaster.id },
    { id: 'seed-media-08', feedItemId: 'seed-feed-media-08', targetType: 'PLAYER', targetId: westviewPlayers[3]!.id, title: `${westviewPlayers[3]!.name} — fan cam baseline angle`, youtubeVideoId: DEMO_VIDEO_POOL[7]!, occurredAt: daysAgo(4), uploadedByUserId: fan1.id },
    { id: 'seed-media-09', feedItemId: 'seed-feed-media-09', targetType: 'PLAYER', targetId: players[8]!.id, title: `${players[8]!.name} — overtime steal`, youtubeVideoId: DEMO_VIDEO_POOL[8]!, occurredAt: daysAgo(4), uploadedByUserId: fan2.id },
    { id: 'seed-media-10', feedItemId: 'seed-feed-media-10', targetType: 'PLAYER', targetId: players[9]!.id, title: `${players[9]!.name} — free throw routine`, youtubeVideoId: DEMO_VIDEO_POOL[9]!, occurredAt: daysAgo(5), uploadedByUserId: scorer.id },
    { id: 'seed-media-11', feedItemId: 'seed-feed-media-11', targetType: 'TEAM', targetId: teams[0].id, title: `${teams[0].name} — press break reel`, youtubeVideoId: DEMO_VIDEO_POOL[10]!, occurredAt: daysAgo(5), uploadedByUserId: teamScorer.id },
    { id: 'seed-media-12', feedItemId: 'seed-feed-media-12', targetType: 'TEAM', targetId: teams[1].id, title: `${teams[1].name} — team intro film`, youtubeVideoId: DEMO_VIDEO_POOL[11]!, occurredAt: daysAgo(6), uploadedByUserId: teamScorer.id },
    { id: 'seed-media-13', feedItemId: 'seed-feed-media-13', targetType: 'TEAM', targetId: teams[0].id, title: `${teams[0].name} — bench reaction cam`, youtubeVideoId: DEMO_VIDEO_POOL[12]!, occurredAt: daysAgo(6), uploadedByUserId: fan1.id },
    { id: 'seed-media-14', feedItemId: 'seed-feed-media-14', targetType: 'GAME', targetId: finalGame1.id, title: `${teams[0].name} vs ${teams[1].name} — full recap`, youtubeVideoId: DEMO_VIDEO_POOL[13]!, occurredAt: finalGame1.finalizedAt ?? daysAgo(10), uploadedByUserId: broadcaster.id },
    { id: 'seed-media-15', feedItemId: 'seed-feed-media-15', targetType: 'GAME', targetId: finalGame2.id, title: `${teams[0].name} vs ${teams[1].name} — disputed finish`, youtubeVideoId: DEMO_VIDEO_POOL[14]!, occurredAt: finalGame2.finalizedAt ?? daysAgo(3), uploadedByUserId: fan2.id },
    { id: 'seed-media-16', feedItemId: 'seed-feed-media-16', targetType: 'GAME', targetId: liveGame.id, title: `${teams[0].name} vs ${teams[1].name} — live fan stream`, youtubeVideoId: DEMO_VIDEO_POOL[15]!, occurredAt: daysAgo(0), uploadedByUserId: fan1.id },
    { id: 'seed-media-17', feedItemId: 'seed-feed-media-17', targetType: 'GAME', targetId: upcomingGame.id, title: `${teams[0].name} vs ${teams[1].name} — pregame walkthrough`, youtubeVideoId: DEMO_VIDEO_POOL[16]!, occurredAt: daysAgo(1), uploadedByUserId: scorer.id },
    { id: 'seed-media-18', feedItemId: 'seed-feed-media-18', targetType: 'PLAYER', targetId: players[10]!.id, title: `${players[10]!.name} — spectator upload`, youtubeVideoId: DEMO_VIDEO_POOL[17]!, occurredAt: daysAgo(2), uploadedByUserId: fan2.id },
  ]
  for (const m of mediaTargets) {
    await db.mediaAsset.upsert({
      where: { id: m.id },
      update: {
        youtubeVideoId: m.youtubeVideoId,
        title: m.title,
        targetType: m.targetType,
        targetId: m.targetId,
        uploadedByUserId: m.uploadedByUserId,
        deletedAt: null,
      },
      create: {
        id: m.id,
        type: 'YOUTUBE',
        youtubeVideoId: m.youtubeVideoId,
        title: m.title,
        targetType: m.targetType,
        targetId: m.targetId,
        uploadedByUserId: m.uploadedByUserId,
      },
    })
    await db.feedItem.upsert({
      where: { id: m.feedItemId },
      update: {
        targetType: m.targetType,
        targetId: m.targetId,
        summary: `New video: ${m.title}`,
        occurredAt: m.occurredAt,
      },
      create: {
        id: m.feedItemId,
        type: 'MEDIA_ADDED',
        targetType: m.targetType,
        targetId: m.targetId,
        summary: `New video: ${m.title}`,
        occurredAt: m.occurredAt,
      },
    })
  }
  console.log(`✓ Media attached: ${mediaTargets.length} videos`)

  // ── Source references / provenance evidence ──────────────────────────────
  const sourceReferences: Array<{
    id: string
    targetType: 'ATHLETE_PROFILE' | 'PLAYER' | 'GAME' | 'GAME_STAT_LINE'
    targetId: string
    sourceType:
      | 'VERIFIED_TEAM_ACCOUNT'
      | 'TEAM_MANAGER'
      | 'OFFICIAL_SCORER'
      | 'PLAYER_REPORT'
      | 'SPECTATOR_REPORT'
      | 'MULTI_SPECTATOR_REPORT'
      | 'TEAM_WEBSITE'
      | 'LEAGUE_WEBSITE'
      | 'MAXPREPS'
      | 'HUDL'
      | 'YOUTUBE'
      | 'NEWS_ARTICLE'
      | 'BOXSCORE_PDF'
      | 'SCOREBOOK_PHOTO'
      | 'PUBLIC_SCRAPE'
      | 'OTHER'
    label: string
    url?: string
  }> = [
    {
      id: 'seed-source-verified-team-roster-eastside-player-1',
      targetType: 'ATHLETE_PROFILE',
      targetId: eastsidePlayers[0]!.athleteProfileId,
      sourceType: 'VERIFIED_TEAM_ACCOUNT',
      label: `${teams[0].name} verified roster account`,
    },
    {
      id: 'seed-source-player-self-report-eastside-player-2',
      targetType: 'ATHLETE_PROFILE',
      targetId: eastsidePlayers[1]!.athleteProfileId,
      sourceType: 'PLAYER_REPORT',
      label: 'Player-submitted profile details',
    },
    {
      id: 'seed-source-team-manager-height-eastside-player-3',
      targetType: 'ATHLETE_PROFILE',
      targetId: eastsidePlayers[2]!.athleteProfileId,
      sourceType: 'TEAM_MANAGER',
      label: 'Coach roster sheet',
    },
    {
      id: 'seed-source-hudl-player-highlight',
      targetType: 'PLAYER',
      targetId: eastsidePlayers[0]!.id,
      sourceType: 'HUDL',
      label: 'HUDL highlight playlist',
      url: 'https://www.hudl.com/',
    },
    {
      id: 'seed-source-maxpreps-final-game-1',
      targetType: 'GAME',
      targetId: finalGame1.id,
      sourceType: 'MAXPREPS',
      label: 'MaxPreps box score import',
      url: 'https://www.maxpreps.com/',
    },
    {
      id: 'seed-source-league-final-game-1',
      targetType: 'GAME',
      targetId: finalGame1.id,
      sourceType: 'LEAGUE_WEBSITE',
      label: 'League schedule result',
      url: 'https://example.com/statman-demo-league/results',
    },
    {
      id: 'seed-source-scorebook-photo-dispute',
      targetType: 'GAME_STAT_LINE',
      targetId: disputedSeedLine?.id ?? eastsidePlayers[0]!.id,
      sourceType: 'SCOREBOOK_PHOTO',
      label: 'Photo of scorer table book',
      url: 'https://example.com/scorebook-photo.jpg',
    },
    {
      id: 'seed-source-spectator-consensus-live-game',
      targetType: 'GAME',
      targetId: liveGame.id,
      sourceType: 'MULTI_SPECTATOR_REPORT',
      label: 'Three spectators reported the same made three',
    },
    {
      id: 'seed-source-news-recap-final-game-2',
      targetType: 'GAME',
      targetId: finalGame2.id,
      sourceType: 'NEWS_ARTICLE',
      label: 'Local recap mentioned disputed finish',
      url: 'https://example.com/riverton-hoops-recap',
    },
  ]
  for (const source of sourceReferences) {
    await db.sourceReference.upsert({
      where: { id: source.id },
      update: {
        targetType: source.targetType,
        targetId: source.targetId,
        sourceType: source.sourceType,
        label: source.label,
        url: source.url,
        importedAt: ['VERIFIED_TEAM_ACCOUNT', 'TEAM_MANAGER', 'OFFICIAL_SCORER', 'PLAYER_REPORT', 'SPECTATOR_REPORT', 'MULTI_SPECTATOR_REPORT'].includes(source.sourceType)
          ? null
          : new Date(),
      },
      create: {
        id: source.id,
        targetType: source.targetType,
        targetId: source.targetId,
        sourceType: source.sourceType,
        label: source.label,
        url: source.url,
        importedAt: ['VERIFIED_TEAM_ACCOUNT', 'TEAM_MANAGER', 'OFFICIAL_SCORER', 'PLAYER_REPORT', 'SPECTATOR_REPORT', 'MULTI_SPECTATOR_REPORT'].includes(source.sourceType)
          ? null
          : new Date(),
      },
    })
  }
  console.log(`✓ Source references: ${sourceReferences.length} trust/provenance examples`)

  // ── Starter multi-sport fixtures ─────────────────────────────────────────
  for (const sportRow of starterSports) {
    const definition = listSportDefinitions().find((candidate) => candidate.slug === sportRow.slug)!
    const starterLeague = await db.league.upsert({
      where: { slug: `${sportRow.slug}-demo-league` },
      update: { name: `${definition.name} Demo League` },
      create: { sportId: sportRow.id, slug: `${sportRow.slug}-demo-league`, name: `${definition.name} Demo League` },
    })
    const starterSeason = await db.season.upsert({
      where: { slug: `${sportRow.slug}-2025-26` },
      update: { name: `${definition.name} 2025-26` },
      create: { leagueId: starterLeague.id, slug: `${sportRow.slug}-2025-26`, name: `${definition.name} 2025-26`, isActive: true },
    })
    const [home, away] = await Promise.all([
      db.team.upsert({
        where: { slug: `${sportRow.slug}-north` },
        update: { name: `North ${definition.name}` },
        create: { sportId: sportRow.id, leagueId: starterLeague.id, slug: `${sportRow.slug}-north`, name: `North ${definition.name}` },
      }),
      db.team.upsert({
        where: { slug: `${sportRow.slug}-south` },
        update: { name: `South ${definition.name}` },
        create: { sportId: sportRow.id, leagueId: starterLeague.id, slug: `${sportRow.slug}-south`, name: `South ${definition.name}` },
      }),
    ])
    await db.game.upsert({
      where: { id: `seed-${sportRow.slug}-starter-game` },
      update: {},
      create: {
        id: `seed-${sportRow.slug}-starter-game`,
        sportId: sportRow.id,
        leagueId: starterLeague.id,
        seasonId: starterSeason.id,
        scheduledAt: daysFromNow(7),
        status: 'SCHEDULED',
        gameTeams: {
          create: [
            { teamId: home.id, isHome: true },
            { teamId: away.id, isHome: false },
          ],
        },
      },
    })
  }
  console.log(`✓ Starter sports: football, soccer, tennis definitions + demo leagues/teams/games`)

  // ── Follows ───────────────────────────────────────────────────────────────
  const follows: Array<{ userId: string; targetType: 'PLAYER' | 'TEAM'; targetId: string }> = [
    { userId: admin.id, targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id },
    { userId: admin.id, targetType: 'TEAM', targetId: teams[0].id },
    { userId: scorer.id, targetType: 'TEAM', targetId: teams[0].id },
    { userId: broadcaster.id, targetType: 'TEAM', targetId: teams[1].id },
    { userId: athleteUser.id, targetType: 'PLAYER', targetId: eastsidePlayers[1]!.id },
    { userId: fan1.id, targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id },
    { userId: fan1.id, targetType: 'PLAYER', targetId: westviewPlayers[0]!.id },
    { userId: fan2.id, targetType: 'TEAM', targetId: teams[1].id },
  ]
  for (const f of follows) {
    await db.follow.upsert({
      where: { followerId_targetType_targetId: { followerId: f.userId, targetType: f.targetType, targetId: f.targetId } },
      update: {},
      create: { followerId: f.userId, targetType: f.targetType, targetId: f.targetId },
    })
  }
  console.log(`✓ Follows: ${follows.length}`)

  // ── Reactions ─────────────────────────────────────────────────────────────
  const reactions: Array<{ userId: string; targetType: 'PLAYER' | 'TEAM' | 'GAME'; targetId: string; type: 'LIKE' | 'FIRE' | 'CLAP' }> = [
    { userId: fan1.id, targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id, type: 'FIRE' },
    { userId: fan2.id, targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id, type: 'FIRE' },
    { userId: scorer.id, targetType: 'GAME', targetId: liveGame.id, type: 'LIKE' },
    { userId: broadcaster.id, targetType: 'GAME', targetId: liveGame.id, type: 'CLAP' },
    { userId: admin.id, targetType: 'GAME', targetId: finalGame1.id, type: 'CLAP' },
    { userId: fan1.id, targetType: 'GAME', targetId: finalGame2.id, type: 'LIKE' },
    { userId: fan2.id, targetType: 'TEAM', targetId: teams[1].id, type: 'FIRE' },
  ]
  for (const r of reactions) {
    await db.reaction.upsert({
      where: { userId_targetType_targetId: { userId: r.userId, targetType: r.targetType, targetId: r.targetId } },
      update: { type: r.type },
      create: r,
    })
  }
  console.log(`✓ Reactions: ${reactions.length}`)

  // ── Profile claim (pending, for the admin claims queue) ──────────────────
  const claimTarget = players[0]!
  const existingClaim = await db.claim.findFirst({ where: { athleteProfileId: claimTarget.athleteProfileId, status: 'PENDING' } })
  if (!existingClaim) {
    await db.claim.create({
      data: {
        athleteProfileId: claimTarget.athleteProfileId,
        requestedByUserId: fan1.id,
        verificationNote: `This is me — I played JV last year at ${schools[0].name} and varsity this season.`,
        status: 'PENDING',
      },
    })
  }
  console.log('✓ Pending profile claim: 1 (visible in the admin Claims queue)')

  console.log('\nSeeding complete.')
  console.log('Demo accounts (all password: password123):')
  console.log('  admin@statman.dev       — ADMIN account, sees the Claims queue')
  console.log('  scorer@statman.dev      — official scorer, already joined the live game')
  console.log('  teamscorer@statman.dev  — Eastside team scorer, already joined the live game')
  console.log('  broadcaster@statman.dev — broadcaster, already joined the live game')
  console.log('  athlete@statman.dev     — regular user with a claimed athlete profile')
  console.log('  fan1@statman.dev        — regular fan, has follows/reactions/a pending claim')
  console.log('  fan2@statman.dev        — regular fan, follows Westview')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

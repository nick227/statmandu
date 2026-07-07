import { db } from '../src/client'
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
  'SELF_REPORTED', 'SELF_REPORTED', 'SELF_REPORTED', 'SELF_REPORTED',
  'TEAM_ENTERED', 'TEAM_ENTERED', 'TEAM_ENTERED', 'TEAM_ENTERED', 'TEAM_ENTERED', 'TEAM_ENTERED', 'TEAM_ENTERED', 'TEAM_ENTERED',
  'MANAGER_APPROVED', 'MANAGER_APPROVED', 'MANAGER_APPROVED', 'MANAGER_APPROVED',
  'VERIFIED', 'VERIFIED', 'VERIFIED',
  'IN_DISPUTE',
] as const

// A real, always-public YouTube video — used as placeholder highlight
// content so media heroes/thumbnails actually render. Not a production
// content choice, just proof the media pipeline works end-to-end.
const DEMO_VIDEO_ID = 'dQw4w9WgXcQ'

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

async function main() {
  console.log('Seeding...')

  // ── Users ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12)

  const admin = await db.user.upsert({
    where: { email: 'admin@statman.dev' },
    update: {},
    create: {
      email: 'admin@statman.dev',
      passwordHash,
      role: 'ADMIN',
      profile: { create: { username: 'admin', displayName: 'Statman Admin' } },
    },
  })

  const fan1 = await db.user.upsert({
    where: { email: 'fan1@statman.dev' },
    update: {},
    create: {
      email: 'fan1@statman.dev',
      passwordHash,
      profile: { create: { username: 'hoopsfan', displayName: 'Sam the Superfan' } },
    },
  })

  const fan2 = await db.user.upsert({
    where: { email: 'fan2@statman.dev' },
    update: {},
    create: {
      email: 'fan2@statman.dev',
      passwordHash,
      profile: { create: { username: 'courtside', displayName: 'Riley Courtside' } },
    },
  })
  console.log(`✓ Users: ${admin.email}, ${fan1.email}, ${fan2.email} (all password: password123)`)

  // ── Sport / league / season / schools / teams ───────────────────────────
  const sport = await db.sport.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: { slug: 'basketball', name: 'Basketball' },
  })

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
    const claimedByUserId = i === 1 ? fan2.id : undefined

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

        await db.gameStatLine.create({
          data: {
            gameId: game.id,
            playerId: p.id,
            teamId: p.teamId,
            ...line,
            sourceStatus: isDisputedLine ? 'IN_DISPUTE' : 'TEAM_ENTERED',
            disputeNote: isDisputedLine
              ? 'Assist total disputed. Home scorer recorded a different count than the team scorer.'
              : null,
          },
        })

        if (isDisputedLine) {
          await db.dispute.create({
            data: {
              targetType: 'GAME_STAT_LINE',
              targetId: p.id,
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

  for (const [playerId, totals] of seasonTotals) {
    const { gamesPlayed, ...rest } = totals
    await db.playerSeasonStat.upsert({
      where: { playerId_seasonId: { playerId, seasonId: season.id } },
      update: { gamesPlayed, ...rest },
      create: { playerId, seasonId: season.id, gamesPlayed, ...rest },
    })
  }

  for (const team of teams) {
    const record = teamRecord.get(team.id)!
    await db.teamSeasonStat.upsert({
      where: { teamId_seasonId: { teamId: team.id, seasonId: season.id } },
      update: record,
      create: { teamId: team.id, seasonId: season.id, ...record },
    })
  }
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
    where: { gameId_userId: { gameId: liveGame.id, userId: admin.id } },
    update: {},
    create: { gameId: liveGame.id, userId: admin.id, role: 'OFFICIAL_SCORER' },
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
  const mediaTargets: Array<{ targetType: 'PLAYER' | 'TEAM' | 'GAME'; targetId: string; title: string }> = [
    { targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id, title: `${eastsidePlayers[0]!.name} — Season Highlights` },
    { targetType: 'PLAYER', targetId: eastsidePlayers[1]!.id, title: `${eastsidePlayers[1]!.name} — Top 10 Plays` },
    { targetType: 'PLAYER', targetId: westviewPlayers[0]!.id, title: `${westviewPlayers[0]!.name} — Season Highlights` },
    { targetType: 'TEAM', targetId: teams[0].id, title: `${teams[0].name} — Team Reel` },
    { targetType: 'TEAM', targetId: teams[1].id, title: `${teams[1].name} — Team Reel` },
    { targetType: 'GAME', targetId: finalGame1.id, title: 'Game Recap' },
  ]
  for (const m of mediaTargets) {
    const existing = await db.mediaAsset.findFirst({ where: { targetType: m.targetType, targetId: m.targetId, title: m.title } })
    if (existing) continue
    await db.mediaAsset.create({
      data: { type: 'YOUTUBE', youtubeVideoId: DEMO_VIDEO_ID, title: m.title, targetType: m.targetType, targetId: m.targetId, uploadedByUserId: admin.id },
    })
    await db.feedItem.create({
      data: { type: 'MEDIA_ADDED', targetType: m.targetType, targetId: m.targetId, summary: `New video: ${m.title}`, occurredAt: new Date() },
    })
  }
  console.log(`✓ Media attached: ${mediaTargets.length} videos`)

  // ── Follows ───────────────────────────────────────────────────────────────
  const follows: Array<{ userId: string; targetType: 'PLAYER' | 'TEAM'; targetId: string }> = [
    { userId: admin.id, targetType: 'PLAYER', targetId: eastsidePlayers[0]!.id },
    { userId: admin.id, targetType: 'TEAM', targetId: teams[0].id },
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
  console.log('  admin@statman.dev  — ADMIN role, sees the Claims queue')
  console.log('  fan1@statman.dev   — regular user, has follows/reactions/a pending claim')
  console.log('  fan2@statman.dev   — regular user, has claimed a player profile')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

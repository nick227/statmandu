import { db } from '@statman/db'
import { FeedService } from './FeedService'

const feedService = new FeedService()

const GAME_INCLUDE = {
  gameTeams: { include: { team: true } },
}

// Points contributed by each made-shot event type — used for both the live
// snapshot score and the finalized box score, so they can never drift apart.
const POINTS_BY_EVENT_TYPE: Record<string, number> = {
  FT_MADE: 1,
  FG2_MADE: 2,
  FG3_MADE: 3,
}

// Events within this many milliseconds of each other, for the same player +
// type, from a different reporter, are treated as corroborating each other.
const CONSENSUS_WINDOW_MS = 8000

export class GameService {
  list(opts: { status?: string; teamSlug?: string }) {
    return db.game.findMany({
      where: {
        ...(opts.status ? { status: opts.status as any } : {}),
        ...(opts.teamSlug ? { gameTeams: { some: { team: { slug: opts.teamSlug } } } } : {}),
      },
      include: GAME_INCLUDE,
      orderBy: { scheduledAt: 'desc' },
    })
  }

  async get(gameId: string) {
    const game = await db.game.findUnique({ where: { id: gameId }, include: GAME_INCLUDE })
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    return game
  }

  async create(data: {
    sportSlug: string
    seasonId?: string
    scheduledAt: string
    venue?: string
    homeTeamId: string
    awayTeamId: string
  }) {
    const sport = await db.sport.findUnique({ where: { slug: data.sportSlug } })
    if (!sport) throw { statusCode: 404, message: 'Sport not found' }

    return db.game.create({
      data: {
        sportId: sport.id,
        seasonId: data.seasonId,
        scheduledAt: new Date(data.scheduledAt),
        venue: data.venue,
        gameTeams: {
          create: [
            { teamId: data.homeTeamId, isHome: true },
            { teamId: data.awayTeamId, isHome: false },
          ],
        },
      },
      include: GAME_INCLUDE,
    })
  }

  async joinAsReporter(gameId: string, userId: string, data: { role: string; teamId?: string }) {
    const game = await db.game.findUnique({ where: { id: gameId } })
    if (!game) throw { statusCode: 404, message: 'Game not found' }

    return db.gameReporter.upsert({
      where: { gameId_userId: { gameId, userId } },
      update: { role: data.role as any, teamId: data.teamId },
      create: { gameId, userId, role: data.role as any, teamId: data.teamId },
    })
  }

  async startLive(gameId: string, userId: string) {
    // _requirePrivilegedReporter already looks up the reporter row (which has
    // a gameId FK), so re-fetching the game here would just confirm what the
    // update below already guarantees — the update throws P2025 if it's gone.
    await this._requirePrivilegedReporter(gameId, userId)

    return db.game.update({
      where: { id: gameId },
      data: { status: 'LIVE', startedAt: new Date() },
      include: GAME_INCLUDE,
    })
  }

  async submitEvent(gameId: string, userId: string, data: {
    type: string
    playerId?: string
    teamId?: string
    clientTimestamp: string
    deviceId?: string
  }) {
    const reporter = await db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId } } })
    if (!reporter) throw { statusCode: 403, message: 'Not a registered reporter for this game' }

    const clientTimestamp = new Date(data.clientTimestamp)

    const event = await db.gameEvent.create({
      data: {
        gameId,
        reporterId: reporter.id,
        playerId: data.playerId,
        teamId: data.teamId,
        type: data.type as any,
        clientTimestamp,
        deviceId: data.deviceId,
        status: 'PENDING',
      },
    })

    return this._reconcileAgainstExisting(event)
  }

  // Looks for a matching event from a different reporter within the
  // consensus window. A match confirms both events (ACCEPTED, grouped);
  // no match leaves the event PENDING until corroborated or finalized.
  private async _reconcileAgainstExisting(event: {
    id: string
    gameId: string
    reporterId: string
    playerId: string | null
    type: string
    clientTimestamp: Date
  }) {
    if (!event.playerId) {
      return db.gameEvent.update({ where: { id: event.id }, data: { status: 'ACCEPTED' } })
    }

    const windowStart = new Date(event.clientTimestamp.getTime() - CONSENSUS_WINDOW_MS)
    const windowEnd = new Date(event.clientTimestamp.getTime() + CONSENSUS_WINDOW_MS)

    const match = await db.gameEvent.findFirst({
      where: {
        gameId: event.gameId,
        playerId: event.playerId,
        type: event.type as any,
        id: { not: event.id },
        reporterId: { not: event.reporterId },
        status: { in: ['PENDING', 'ACCEPTED'] },
        clientTimestamp: { gte: windowStart, lte: windowEnd },
      },
    })

    if (!match) {
      // Single-reporter games have no one to corroborate with — accept immediately.
      const reporterCount = await db.gameReporter.count({ where: { gameId: event.gameId } })
      if (reporterCount <= 1) {
        return db.gameEvent.update({ where: { id: event.id }, data: { status: 'ACCEPTED' } })
      }
      return db.gameEvent.findUniqueOrThrow({ where: { id: event.id } })
    }

    const group = await db.gameConsensusGroup.create({
      data: { gameId: event.gameId, groupKey: `${event.playerId}:${event.type}:${event.clientTimestamp.toISOString()}`, status: 'CONFIRMED' },
    })

    await db.gameEvent.update({ where: { id: match.id }, data: { status: 'ACCEPTED', consensusGroupId: group.id } })
    return db.gameEvent.update({ where: { id: event.id }, data: { status: 'ACCEPTED', consensusGroupId: group.id } })
  }

  async undoEvent(gameId: string, userId: string, eventId: string) {
    const reporter = await db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId } } })
    if (!reporter) throw { statusCode: 403, message: 'Not a registered reporter for this game' }

    const event = await db.gameEvent.findUnique({ where: { id: eventId } })
    if (!event || event.gameId !== gameId) throw { statusCode: 404, message: 'Event not found' }
    if (event.reporterId !== reporter.id) {
      throw { statusCode: 403, message: 'Only the reporter who submitted this event can undo it' }
    }

    return db.gameEvent.update({ where: { id: eventId }, data: { status: 'REJECTED' } })
  }

  async getSnapshot(gameId: string) {
    const game = await db.game.findUnique({ where: { id: gameId }, include: GAME_INCLUDE })
    if (!game) throw { statusCode: 404, message: 'Game not found' }

    // Independent of each other and of `game` beyond the id — fetch in parallel.
    const [events, reporterCount] = await Promise.all([
      db.gameEvent.findMany({
        where: { gameId, status: { in: ['ACCEPTED', 'PENDING'] } },
        orderBy: { clientTimestamp: 'desc' },
      }),
      db.gameReporter.count({ where: { gameId } }),
    ])

    const score = new Map<string, number>()
    for (const gt of game.gameTeams) score.set(gt.teamId, 0)
    for (const e of events) {
      if (e.status !== 'ACCEPTED' || !e.teamId) continue
      const points = POINTS_BY_EVENT_TYPE[e.type] ?? 0
      if (points) score.set(e.teamId, (score.get(e.teamId) ?? 0) + points)
    }

    return {
      gameId,
      status: game.status,
      score: [...score.entries()].map(([teamId, points]) => ({ teamId, points })),
      recentEvents: events.slice(0, 20),
      reporterCount,
    }
  }

  private async _requirePrivilegedReporter(gameId: string, userId: string) {
    const reporter = await db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId } } })
    if (!reporter || !['ADMIN_OWNER', 'OFFICIAL_SCORER'].includes(reporter.role)) {
      throw { statusCode: 403, message: 'Not a registered reporter with permission for this action' }
    }
    return reporter
  }

  async finalize(gameId: string, userId: string) {
    await this._requirePrivilegedReporter(gameId, userId)

    const game = await db.game.findUnique({ where: { id: gameId }, include: GAME_INCLUDE })
    if (!game) throw { statusCode: 404, message: 'Game not found' }

    // Best-effort at finalize time: any still-PENDING single-source event
    // that never got corroborated is accepted rather than silently dropped.
    await db.gameEvent.updateMany({
      where: { gameId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    })

    const events = await db.gameEvent.findMany({ where: { gameId, status: 'ACCEPTED' } })
    const conflictingGroups = await db.gameConsensusGroup.findMany({ where: { gameId, status: 'CONFLICTING' } })

    const lines = new Map<string, any>()
    const teamScores = new Map<string, number>()
    for (const gt of game.gameTeams) teamScores.set(gt.teamId, 0)

    const ensureLine = (playerId: string, teamId: string) => {
      if (!lines.has(playerId)) {
        lines.set(playerId, {
          playerId, teamId, points: 0, offRebounds: 0, defRebounds: 0, assists: 0, steals: 0,
          blocks: 0, turnovers: 0, fouls: 0, fgMade: 0, fgAttempted: 0, threeMade: 0,
          threeAttempted: 0, ftMade: 0, ftAttempted: 0,
        })
      }
      return lines.get(playerId)
    }

    for (const e of events) {
      if (!e.playerId || !e.teamId) continue
      const line = ensureLine(e.playerId, e.teamId)
      const addPoints = (n: number) => {
        line.points += n
        teamScores.set(e.teamId!, (teamScores.get(e.teamId!) ?? 0) + n)
      }
      switch (e.type) {
        case 'FT_MADE': addPoints(1); line.ftMade += 1; line.ftAttempted += 1; break
        case 'FT_MISS': line.ftAttempted += 1; break
        case 'FG2_MADE': addPoints(2); line.fgMade += 1; line.fgAttempted += 1; break
        case 'FG2_MISS': line.fgAttempted += 1; break
        case 'FG3_MADE': addPoints(3); line.fgMade += 1; line.fgAttempted += 1; line.threeMade += 1; line.threeAttempted += 1; break
        case 'FG3_MISS': line.fgAttempted += 1; line.threeAttempted += 1; break
        case 'REBOUND_OFF': line.offRebounds += 1; break
        case 'REBOUND_DEF': line.defRebounds += 1; break
        case 'ASSIST': line.assists += 1; break
        case 'STEAL': line.steals += 1; break
        case 'BLOCK': line.blocks += 1; break
        case 'TURNOVER': line.turnovers += 1; break
        case 'FOUL': line.fouls += 1; break
      }
    }

    const disputedPlayerIds = new Set<string>()
    if (conflictingGroups.length > 0) {
      const groupEvents = await db.gameEvent.findMany({
        where: { consensusGroupId: { in: conflictingGroups.map((g) => g.id) } },
      })
      for (const e of groupEvents) if (e.playerId) disputedPlayerIds.add(e.playerId)
    }

    await db.$transaction(async (tx) => {
      for (const [playerId, line] of lines) {
        const sourceStatus = disputedPlayerIds.has(playerId) ? 'IN_DISPUTE' : 'TEAM_ENTERED'
        const disputeNote = disputedPlayerIds.has(playerId)
          ? 'One or more stats disputed — reporter logs did not agree.'
          : null

        await tx.gameStatLine.upsert({
          where: { gameId_playerId: { gameId, playerId } },
          update: { ...line, sourceStatus, disputeNote },
          create: { gameId, ...line, sourceStatus, disputeNote },
        })

        if (disputedPlayerIds.has(playerId)) {
          await tx.dispute.create({
            data: {
              targetType: 'GAME_STAT_LINE',
              targetId: playerId,
              submittedByUserId: userId,
              description: 'Automated: reporter logs conflicted at end-of-game reconciliation.',
              status: 'OPEN',
            },
          })
        }

        // playerId came from GameEvent.playerId, an enforced FK to Player —
        // no need to re-verify it exists before using it.
        if (game.seasonId) {
          await tx.playerSeasonStat.upsert({
            where: { playerId_seasonId: { playerId, seasonId: game.seasonId } },
            update: {
              gamesPlayed: { increment: 1 },
              points: { increment: line.points },
              offRebounds: { increment: line.offRebounds },
              defRebounds: { increment: line.defRebounds },
              assists: { increment: line.assists },
              steals: { increment: line.steals },
              blocks: { increment: line.blocks },
              turnovers: { increment: line.turnovers },
              fouls: { increment: line.fouls },
              fgMade: { increment: line.fgMade },
              fgAttempted: { increment: line.fgAttempted },
              threeMade: { increment: line.threeMade },
              threeAttempted: { increment: line.threeAttempted },
              ftMade: { increment: line.ftMade },
              ftAttempted: { increment: line.ftAttempted },
            },
            create: {
              playerId,
              seasonId: game.seasonId,
              gamesPlayed: 1,
              points: line.points,
              offRebounds: line.offRebounds,
              defRebounds: line.defRebounds,
              assists: line.assists,
              steals: line.steals,
              blocks: line.blocks,
              turnovers: line.turnovers,
              fouls: line.fouls,
              fgMade: line.fgMade,
              fgAttempted: line.fgAttempted,
              threeMade: line.threeMade,
              threeAttempted: line.threeAttempted,
              ftMade: line.ftMade,
              ftAttempted: line.ftAttempted,
            },
          })
        }
      }

      for (const gt of game.gameTeams) {
        await tx.gameTeam.update({ where: { id: gt.id }, data: { finalScore: teamScores.get(gt.teamId) ?? 0 } })
      }
    })

    const finalized = await db.game.update({
      where: { id: gameId },
      data: {
        status: disputedPlayerIds.size > 0 ? 'DISPUTED' : 'FINAL',
        finalizedAt: new Date(),
      },
      include: GAME_INCLUDE,
    })

    const homeTeam = finalized.gameTeams.find((gt) => gt.isHome)
    const awayTeam = finalized.gameTeams.find((gt) => !gt.isHome)
    if (homeTeam && awayTeam) {
      await feedService.record({
        type: 'GAME_FINAL',
        targetType: 'GAME',
        targetId: gameId,
        summary: `Final: ${homeTeam.team.name} ${homeTeam.finalScore} - ${awayTeam.team.name} ${awayTeam.finalScore}`,
      })
    }

    return finalized
  }

  getBoxScore(gameId: string) {
    return db.gameStatLine.findMany({ where: { gameId } })
  }
}

import { db } from '@statman/db'
import type { GameEventType, GameReporterRole, UserRole } from '@statman/db'
import { getSportDefinition, reconcileEvents, validateEventDefinition, type ReconciledPlayerLine } from '@statman/sports'
import { FeedService } from './FeedService'
import { PermissionPolicy } from './PermissionPolicy'
import { withGameStatLineContext } from '../lib/gameStatLine'

const feedService = new FeedService()
const policy = new PermissionPolicy()

const GAME_INCLUDE = {
  sport: true,
  gameTeams: { include: { team: true } },
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
    if (data.homeTeamId === data.awayTeamId) {
      throw { statusCode: 400, message: 'Home and away teams must be different' }
    }

    const [homeTeam, awayTeam, season] = await Promise.all([
      db.team.findUnique({ where: { id: data.homeTeamId } }),
      db.team.findUnique({ where: { id: data.awayTeamId } }),
      data.seasonId ? db.season.findUnique({ where: { id: data.seasonId } }) : Promise.resolve(null),
    ])
    if (!homeTeam) throw { statusCode: 404, message: 'Home team not found' }
    if (!awayTeam) throw { statusCode: 404, message: 'Away team not found' }
    if (data.seasonId && !season) throw { statusCode: 404, message: 'Season not found' }
    if (homeTeam.sportId !== sport.id || awayTeam.sportId !== sport.id) {
      throw { statusCode: 400, message: 'Both teams must play the requested sport' }
    }
    if (homeTeam.leagueId !== awayTeam.leagueId) {
      throw { statusCode: 400, message: 'Teams must belong to the same league' }
    }
    if (season && season.leagueId !== homeTeam.leagueId) {
      throw { statusCode: 400, message: 'Season must belong to the teams league' }
    }

    return db.game.create({
      data: {
        sportId: sport.id,
        leagueId: homeTeam.leagueId,
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

  async joinAsReporter(gameId: string, userId: string, data: { role: GameReporterRole; teamId?: string }) {
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        gameTeams: true,
        reporters: { select: { id: true, gameId: true, userId: true, role: true, teamId: true } },
      },
    })
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (['FINAL', 'DISPUTED'].includes(game.status)) {
      throw { statusCode: 409, message: 'Cannot join a finalized game as a reporter' }
    }
    if (data.teamId && !game.gameTeams.some((gt) => gt.teamId === data.teamId)) {
      throw { statusCode: 400, message: 'Reporter team must be part of this game' }
    }
    if (data.role === 'TEAM_SCORER' && !data.teamId) {
      throw { statusCode: 400, message: 'TEAM_SCORER reporters must include a teamId' }
    }

    const existingReporter = game.reporters.find((reporter) => reporter.userId === userId)
    if (existingReporter) {
      if (existingReporter.role !== data.role || existingReporter.teamId !== (data.teamId ?? null)) {
        throw { statusCode: 409, message: 'Reporter role changes require a moderation flow' }
      }
      return existingReporter
    }

    const privilegedRoles: GameReporterRole[] = ['ADMIN_OWNER', 'OFFICIAL_SCORER']
    if (game.reporters.length > 0 && privilegedRoles.includes(data.role)) {
      throw { statusCode: 403, message: 'Privileged reporter roles cannot be self-assigned after a game has reporters' }
    }

    return db.gameReporter.create({
      data: { gameId, userId, role: data.role, teamId: data.teamId },
    })
  }

  async inviteReporter(gameId: string, actorUserId: string, data: { userId: string; role: GameReporterRole; teamId?: string }) {
    const [actor, game, actorReporter, invitedUser] = await Promise.all([
      this._getActor(actorUserId),
      db.game.findUnique({ where: { id: gameId }, include: { gameTeams: true } }),
      db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId: actorUserId } } }),
      db.user.findUnique({ where: { id: data.userId } }),
    ])
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (!invitedUser) throw { statusCode: 404, message: 'Invited user not found' }
    if (['FINAL', 'DISPUTED'].includes(game.status)) throw { statusCode: 409, message: 'Cannot invite reporters to a finalized game' }
    policy.require(actor, 'inviteReporter', { reporter: actorReporter })
    this._validateReporterAssignment(game, data)

    const existingReporter = await db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId: data.userId } } })
    if (existingReporter) throw { statusCode: 409, message: 'User is already a reporter for this game' }

    return db.gameReporter.create({
      data: { gameId, userId: data.userId, role: data.role, teamId: data.teamId },
    })
  }

  async updateReporter(gameId: string, actorUserId: string, reporterId: string, data: { role?: GameReporterRole; teamId?: string | null }) {
    const [actor, game, actorReporter, reporter] = await Promise.all([
      this._getActor(actorUserId),
      db.game.findUnique({ where: { id: gameId }, include: { gameTeams: true } }),
      db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId: actorUserId } } }),
      db.gameReporter.findUnique({ where: { id: reporterId } }),
    ])
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (!reporter || reporter.gameId !== gameId) throw { statusCode: 404, message: 'Reporter not found' }
    if (['FINAL', 'DISPUTED'].includes(game.status)) throw { statusCode: 409, message: 'Cannot change reporters on a finalized game' }
    policy.require(actor, 'inviteReporter', { reporter: actorReporter })

    const next = {
      role: data.role ?? reporter.role,
      teamId: data.teamId === undefined ? reporter.teamId : data.teamId,
    }
    this._validateReporterAssignment(game, { role: next.role, teamId: next.teamId ?? undefined })

    return db.gameReporter.update({
      where: { id: reporterId },
      data: next,
    })
  }

  async removeReporter(gameId: string, actorUserId: string, reporterId: string) {
    const [actor, actorReporter, reporter] = await Promise.all([
      this._getActor(actorUserId),
      db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId: actorUserId } } }),
      db.gameReporter.findUnique({ where: { id: reporterId } }),
    ])
    if (!reporter || reporter.gameId !== gameId) throw { statusCode: 404, message: 'Reporter not found' }
    policy.require(actor, 'inviteReporter', { reporter: actorReporter })
    if (reporter.userId === actorUserId) throw { statusCode: 400, message: 'Reporters cannot remove themselves' }

    await db.gameReporter.delete({ where: { id: reporterId } })
    return null
  }

  async startLive(gameId: string, userId: string) {
    await this._requireGamePermission(gameId, userId, 'finalizeGame')
    const game = await db.game.findUnique({ where: { id: gameId } })
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (game.status !== 'SCHEDULED') {
      throw { statusCode: 409, message: `Cannot start a game with status ${game.status}` }
    }

    return db.game.update({
      where: { id: gameId },
      data: { status: 'LIVE', startedAt: new Date() },
      include: GAME_INCLUDE,
    })
  }

  async submitEvent(gameId: string, userId: string, data: {
    type: GameEventType
    playerId?: string
    teamId?: string
    clientTimestamp: string
    deviceId?: string
  }) {
    const [game, reporter] = await Promise.all([
      db.game.findUnique({ where: { id: gameId }, include: { gameTeams: true, sport: true } }),
      db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId } } }),
    ])
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (!reporter) throw { statusCode: 403, message: 'Not a registered reporter for this game' }
    const actor = await this._getActor(userId)
    policy.require(actor, 'submitLiveEvent', { reporter })
    if (game.status !== 'LIVE') throw { statusCode: 409, message: 'Game must be live before events can be submitted' }
    validateEventDefinition(getSportDefinition(game.sport.slug), data)
    await this._validateEventParticipants(game, reporter, data)

    const clientTimestamp = new Date(data.clientTimestamp)

    const event = await db.gameEvent.create({
      data: {
        gameId,
        reporterId: reporter.id,
        playerId: data.playerId,
        teamId: data.teamId,
        type: data.type,
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
    teamId: string | null
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
        type: event.type as GameEventType,
        id: { not: event.id },
        reporterId: { not: event.reporterId },
        status: { in: ['PENDING', 'ACCEPTED'] },
        clientTimestamp: { gte: windowStart, lte: windowEnd },
      },
    })

    if (!match) {
      const conflictingEvent = await db.gameEvent.findFirst({
        where: {
          gameId: event.gameId,
          playerId: event.playerId,
          teamId: event.teamId,
          type: { not: event.type as GameEventType },
          id: { not: event.id },
          reporterId: { not: event.reporterId },
          status: { in: ['PENDING', 'ACCEPTED'] },
          clientTimestamp: { gte: windowStart, lte: windowEnd },
        },
      })
      if (conflictingEvent) {
        const group = conflictingEvent.consensusGroupId
          ? await db.gameConsensusGroup.update({
              where: { id: conflictingEvent.consensusGroupId },
              data: { status: 'CONFLICTING' },
            })
          : await db.gameConsensusGroup.create({
              data: { gameId: event.gameId, groupKey: `${event.playerId}:${event.teamId}:${event.clientTimestamp.toISOString()}`, status: 'CONFLICTING' },
            })

        await db.gameEvent.update({
          where: { id: conflictingEvent.id },
          data: { status: 'CONFLICTING', consensusGroupId: group.id },
        })
        return db.gameEvent.update({
          where: { id: event.id },
          data: { status: 'CONFLICTING', consensusGroupId: group.id },
        })
      }

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
    const actor = await this._getActor(userId)
    policy.require(actor, 'undoOwnEvent', { reporter })

    const event = await db.gameEvent.findUnique({ where: { id: eventId } })
    if (!event || event.gameId !== gameId) throw { statusCode: 404, message: 'Event not found' }
    if (['FINALIZED', 'CORRECTED'].includes(event.status)) {
      throw { statusCode: 409, message: 'Cannot undo an event that has already been finalized' }
    }
    if (event.reporterId !== reporter.id) {
      throw { statusCode: 403, message: 'Only the reporter who submitted this event can undo it' }
    }

    return db.gameEvent.update({ where: { id: eventId }, data: { status: 'REJECTED' } })
  }

  async getSnapshot(gameId: string) {
    const game = await db.game.findUnique({ where: { id: gameId }, include: { ...GAME_INCLUDE, sport: true } })
    if (!game) throw { statusCode: 404, message: 'Game not found' }

    // Fetch all events for accurate scoring
    const events = await db.gameEvent.findMany({
      where: { gameId, status: { in: ['ACCEPTED', 'PENDING'] } },
      orderBy: { clientTimestamp: 'desc' },
    })

    const recentEvents = events.slice(0, 20)
    const recentEventIds = recentEvents.map(e => e.id)

    // Independent of each other and of `game` beyond the id — fetch in parallel.
    const [reporterCount, mediaAsset, recentReactions, recentImageAssets, recentMediaAssets] = await Promise.all([
      db.gameReporter.count({ where: { gameId } }),
      db.mediaAsset.findFirst({
        where: { targetType: 'GAME', targetId: gameId, type: 'YOUTUBE', deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      db.gameReaction.findMany({
        where: { gameId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.imageAsset.findMany({
        where: {
          OR: [
            { targetType: 'GAME', targetId: gameId },
            { targetType: 'GAME_EVENT', targetId: { in: recentEventIds } }
          ],
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      db.mediaAsset.findMany({
        where: {
          OR: [
            { targetType: 'GAME', targetId: gameId },
            { targetType: 'GAME_EVENT', targetId: { in: recentEventIds } }
          ],
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    const definition = getSportDefinition(game.sport.slug)
    const { teamScores } = reconcileEvents(definition, events, game.gameTeams.map((gt) => gt.teamId))

    return {
      gameId,
      status: game.status,
      youtubeVideoId: mediaAsset?.youtubeVideoId ?? null,
      score: [...teamScores.entries()].map(([teamId, points]) => ({ teamId, points })),
      recentEvents,
      recentReactions,
      recentImageAssets,
      recentMediaAssets,
      reporterCount,
    }
  }

  async createReaction(gameId: string, data: { deviceId: string; type: any }) {
    const game = await db.game.findUnique({ where: { id: gameId } })
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    return db.gameReaction.create({
      data: {
        gameId,
        deviceId: data.deviceId,
        type: data.type,
      },
    })
  }

  // Full play-by-play — unlike getSnapshot (live-polling, last 20, PENDING
  // included), this returns the entire game chronologically and works for
  // any status, including FINAL. REJECTED events are the reporter's own
  // undone mistakes and are excluded; everything else (including
  // CONFLICTING/DISPUTED) is returned so the client can flag it, same as
  // the live spectator timeline does.
  async listEvents(gameId: string) {
    const game = await db.game.findUnique({ where: { id: gameId } })
    if (!game) throw { statusCode: 404, message: 'Game not found' }

    return db.gameEvent.findMany({
      where: { gameId, status: { not: 'REJECTED' } },
      orderBy: { clientTimestamp: 'asc' },
    })
  }

  private async _requirePrivilegedReporter(gameId: string, userId: string) {
    return this._requireGamePermission(gameId, userId, 'finalizeGame').then(({ reporter }) => reporter)
  }

  async finalize(gameId: string, userId: string) {
    await this._requirePrivilegedReporter(gameId, userId)

    const game = await db.game.findUnique({ where: { id: gameId }, include: { ...GAME_INCLUDE, sport: true } })
    if (!game) throw { statusCode: 404, message: 'Game not found' }
    if (['FINAL', 'DISPUTED'].includes(game.status)) return game
    if (game.status !== 'LIVE') throw { statusCode: 409, message: 'Game must be live before it can be finalized' }

    // Best-effort at finalize time: any still-PENDING single-source event
    // that never got corroborated is accepted rather than silently dropped.
    await db.gameEvent.updateMany({
      where: { gameId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    })

    const events = await db.gameEvent.findMany({ where: { gameId, status: { in: ['ACCEPTED', 'DISPUTED'] } } })
    const conflictingGroups = await db.gameConsensusGroup.findMany({ where: { gameId, status: 'CONFLICTING' } })

    const definition = getSportDefinition(game.sport.slug)
    const reconciled = reconcileEvents(definition, events, game.gameTeams.map((gt) => gt.teamId))
    const lines = new Map<string, ReconciledPlayerLine>(reconciled.playerLines.map((line) => [line.playerId, line]))
    const teamScores = reconciled.teamScores

    const ensureLine = (playerId: string, teamId: string) => {
      if (!lines.has(playerId)) lines.set(playerId, { playerId, teamId, stats: {} })
      return lines.get(playerId)!
    }

    const disputedPlayerIds = new Set<string>()
    const groupEvents = await db.gameEvent.findMany({
      where: {
        OR: [
          ...(conflictingGroups.length > 0 ? [{ consensusGroupId: { in: conflictingGroups.map((g) => g.id) } }] : []),
          { gameId, status: 'DISPUTED' },
        ],
      },
    })
    for (const e of groupEvents) {
      if (!e.playerId) continue
      disputedPlayerIds.add(e.playerId)
      if (e.teamId) ensureLine(e.playerId, e.teamId)
    }

    await db.$transaction(async (tx) => {
      for (const [playerId, line] of lines) {
        const sourceStatus = disputedPlayerIds.has(playerId) ? 'IN_DISPUTE' : 'OFFICIAL_SCORER_RECORDED'
        const disputeNote = disputedPlayerIds.has(playerId)
          ? 'One or more stats disputed — reporter logs did not agree.'
          : null
        const basketballProjection = this._basketballProjection(line.stats)

        const statLine = await tx.gameStatLine.upsert({
          where: { gameId_playerId: { gameId, playerId } },
          update: { teamId: line.teamId, ...basketballProjection, stats: line.stats, sourceStatus, disputeNote },
          create: { gameId, playerId, teamId: line.teamId, ...basketballProjection, stats: line.stats, sourceStatus, disputeNote },
        })

        if (disputedPlayerIds.has(playerId)) {
          await tx.dispute.create({
            data: {
              targetType: 'GAME_STAT_LINE',
              targetId: statLine.id,
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
              points: { increment: basketballProjection.points },
              offRebounds: { increment: basketballProjection.offRebounds },
              defRebounds: { increment: basketballProjection.defRebounds },
              assists: { increment: basketballProjection.assists },
              steals: { increment: basketballProjection.steals },
              blocks: { increment: basketballProjection.blocks },
              turnovers: { increment: basketballProjection.turnovers },
              fouls: { increment: basketballProjection.fouls },
              fgMade: { increment: basketballProjection.fgMade },
              fgAttempted: { increment: basketballProjection.fgAttempted },
              threeMade: { increment: basketballProjection.threeMade },
              threeAttempted: { increment: basketballProjection.threeAttempted },
              ftMade: { increment: basketballProjection.ftMade },
              ftAttempted: { increment: basketballProjection.ftAttempted },
              stats: line.stats,
            },
            create: {
              playerId,
              seasonId: game.seasonId,
              gamesPlayed: 1,
              ...basketballProjection,
              stats: line.stats,
            },
          })
        }
      }

      for (const gt of game.gameTeams) {
        await tx.gameTeam.update({ where: { id: gt.id }, data: { finalScore: teamScores.get(gt.teamId) ?? 0 } })
      }

      if (game.seasonId) {
        for (const gt of game.gameTeams) {
          const opponent = game.gameTeams.find((candidate) => candidate.teamId !== gt.teamId)
          const pointsFor = teamScores.get(gt.teamId) ?? 0
          const pointsAgainst = opponent ? (teamScores.get(opponent.teamId) ?? 0) : 0
          const wins = pointsFor > pointsAgainst ? 1 : 0
          const losses = pointsFor < pointsAgainst ? 1 : 0
          const stats = { wins, losses, pointsFor, pointsAgainst }

          await tx.teamSeasonStat.upsert({
            where: { teamId_seasonId: { teamId: gt.teamId, seasonId: game.seasonId } },
            update: {
              wins: { increment: wins },
              losses: { increment: losses },
              pointsFor: { increment: pointsFor },
              pointsAgainst: { increment: pointsAgainst },
              stats,
            },
            create: {
              teamId: gt.teamId,
              seasonId: game.seasonId,
              wins,
              losses,
              pointsFor,
              pointsAgainst,
              stats,
            },
          })
        }
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

  async getBoxScore(gameId: string) {
    const lines = await db.gameStatLine.findMany({ where: { gameId } })
    return withGameStatLineContext(lines)
  }

  async listConflicts(gameId: string, userId: string) {
    const { actor, reporter } = await this._requireGamePermission(gameId, userId, 'resolveConflict')
    policy.require(actor, 'resolveConflict', { reporter })
    return db.gameConsensusGroup.findMany({
      where: { gameId, status: 'CONFLICTING' },
      include: { events: { orderBy: { clientTimestamp: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async resolveConflict(gameId: string, userId: string, conflictId: string, data: { resolvedEventId: string }) {
    await this._requireGamePermission(gameId, userId, 'resolveConflict')
    const group = await db.gameConsensusGroup.findUnique({
      where: { id: conflictId },
      include: { events: true },
    })
    if (!group || group.gameId !== gameId) throw { statusCode: 404, message: 'Conflict not found' }
    if (group.status !== 'CONFLICTING') throw { statusCode: 409, message: 'Conflict is not open' }
    if (!group.events.some((event) => event.id === data.resolvedEventId)) {
      throw { statusCode: 400, message: 'Resolved event must belong to this conflict' }
    }

    await db.$transaction([
      db.gameEvent.update({ where: { id: data.resolvedEventId }, data: { status: 'ACCEPTED' } }),
      db.gameEvent.updateMany({
        where: { consensusGroupId: conflictId, id: { not: data.resolvedEventId } },
        data: { status: 'REJECTED' },
      }),
      db.gameConsensusGroup.update({
        where: { id: conflictId },
        data: { status: 'RESOLVED', resolvedEventId: data.resolvedEventId },
      }),
    ])

    return db.gameConsensusGroup.findUniqueOrThrow({
      where: { id: conflictId },
      include: { events: { orderBy: { clientTimestamp: 'asc' } } },
    })
  }

  async markConflictDisputed(gameId: string, userId: string, conflictId: string) {
    await this._requireGamePermission(gameId, userId, 'resolveConflict')
    const group = await db.gameConsensusGroup.findUnique({
      where: { id: conflictId },
      include: { events: true },
    })
    if (!group || group.gameId !== gameId) throw { statusCode: 404, message: 'Conflict not found' }
    if (group.status !== 'CONFLICTING') throw { statusCode: 409, message: 'Conflict is not open' }

    const firstEvent = group.events[0]
    if (!firstEvent) throw { statusCode: 400, message: 'Conflict has no events' }

    await db.$transaction([
      db.gameEvent.updateMany({ where: { consensusGroupId: conflictId }, data: { status: 'DISPUTED' } }),
      db.gameConsensusGroup.update({ where: { id: conflictId }, data: { status: 'RESOLVED' } }),
      db.dispute.create({
        data: {
          targetType: 'GAME_EVENT',
          targetId: firstEvent.id,
          submittedByUserId: userId,
          description: 'Live scoring conflict marked disputed by a game manager.',
          status: 'OPEN',
        },
      }),
    ])

    return db.gameConsensusGroup.findUniqueOrThrow({
      where: { id: conflictId },
      include: { events: { orderBy: { clientTimestamp: 'asc' } } },
    })
  }

  private async _validateEventParticipants(
    game: { gameTeams: Array<{ teamId: string }>; seasonId: string | null },
    reporter: { role: GameReporterRole; teamId: string | null },
    data: { playerId?: string; teamId?: string },
  ) {
    if (!data.teamId) throw { statusCode: 400, message: 'Event teamId is required' }
    const gameTeamIds = new Set(game.gameTeams.map((gt) => gt.teamId))
    if (!gameTeamIds.has(data.teamId)) throw { statusCode: 400, message: 'Event team must be part of this game' }
    if (reporter.role === 'TEAM_SCORER' && reporter.teamId !== data.teamId) {
      throw { statusCode: 403, message: 'Team scorers can only submit events for their assigned team' }
    }
    if (!data.playerId) return

    const player = await db.player.findUnique({ where: { id: data.playerId }, select: { sportId: true } })
    if (!player) throw { statusCode: 404, message: 'Player not found' }

    const rosterMembership = await db.rosterMembership.findFirst({
      where: {
        playerId: data.playerId,
        teamId: data.teamId,
        isActive: true,
        ...(game.seasonId ? { seasonId: game.seasonId } : {}),
      },
      select: { id: true },
    })
    if (!rosterMembership) {
      throw { statusCode: 400, message: 'Event player must be active on the submitted team roster' }
    }
  }

  private _basketballProjection(stats: Record<string, number>) {
    return {
      points: stats.points ?? 0,
      offRebounds: stats.offRebounds ?? 0,
      defRebounds: stats.defRebounds ?? 0,
      assists: stats.assists ?? 0,
      steals: stats.steals ?? 0,
      blocks: stats.blocks ?? 0,
      turnovers: stats.turnovers ?? 0,
      fouls: stats.fouls ?? 0,
      fgMade: stats.fgMade ?? 0,
      fgAttempted: stats.fgAttempted ?? 0,
      threeMade: stats.threeMade ?? 0,
      threeAttempted: stats.threeAttempted ?? 0,
      ftMade: stats.ftMade ?? 0,
      ftAttempted: stats.ftAttempted ?? 0,
    }
  }

  private _validateReporterAssignment(game: { gameTeams: Array<{ teamId: string }> }, data: { role: GameReporterRole; teamId?: string | null }) {
    if (data.teamId && !game.gameTeams.some((gt) => gt.teamId === data.teamId)) {
      throw { statusCode: 400, message: 'Reporter team must be part of this game' }
    }
    if (data.role === 'TEAM_SCORER' && !data.teamId) {
      throw { statusCode: 400, message: 'TEAM_SCORER reporters must include a teamId' }
    }
  }

  private async _getActor(userId: string): Promise<{ id: string; role: UserRole }> {
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
    if (!user) throw { statusCode: 401, message: 'Unauthorized' }
    return user
  }

  private async _requireGamePermission(gameId: string, userId: string, action: Parameters<PermissionPolicy['require']>[1]) {
    const [actor, reporter] = await Promise.all([
      this._getActor(userId),
      db.gameReporter.findUnique({ where: { gameId_userId: { gameId, userId } } }),
    ])
    policy.require(actor, action, { reporter })
    return { actor, reporter }
  }
}

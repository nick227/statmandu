import { db } from '@statman/db'
import type { DisputeStatus, EntityType, FeedItemType } from '@statman/db'
import { decodeCursor, encodeCursor, normalizeLimit } from '../lib/pagination'
import { EntityTargetService } from './EntityTargetService'
import { FeedService } from './FeedService'
import { PlayerService } from './PlayerService'
import { TeamService } from './TeamService'

const targetService = new EntityTargetService()
const feedService = new FeedService()
const playerService = new PlayerService()
const teamService = new TeamService()

export class AdminService {
  async metrics() {
    const [
      playersCount,
      teamsCount,
      gamesCount,
      pendingClaimsCount,
      openDisputesCount,
      liveGamesCount,
      scheduledGamesCount,
    ] = await Promise.all([
      db.player.count(),
      db.team.count(),
      db.game.count(),
      db.claim.count({ where: { status: 'PENDING' } }),
      db.dispute.count({ where: { status: 'OPEN' } }),
      db.game.count({ where: { status: 'LIVE' } }),
      db.game.count({ where: { status: 'SCHEDULED' } }),
    ])

    return {
      playersCount,
      teamsCount,
      gamesCount,
      pendingClaimsCount,
      openDisputesCount,
      liveGamesCount,
      scheduledGamesCount,
    }
  }

  async bulkCreatePlayers(subjectUserId: string, items: Array<Record<string, unknown>>) {
    const created: any[] = []
    const errors: Array<{ index: number; message: string }> = []

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i]!
        const player = await playerService.create(subjectUserId, item as any)
        created.push(player)
      } catch (err: any) {
        errors.push({ index: i, message: err?.message ?? 'Unknown error' })
      }
    }

    return { created, errors }
  }

  async bulkAddRosterMembers(teamId: string, items: Array<{ playerId: string; seasonId: string; jerseyNumber?: number }>) {
    const created: any[] = []
    const errors: Array<{ index: number; message: string }> = []

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i]!
        const membership = await teamService.addRosterMember(teamId, item)
        created.push(membership)
      } catch (err: any) {
        errors.push({ index: i, message: err?.message ?? 'Unknown error' })
      }
    }

    return { created, errors }
  }

  listDisputes(opts: { status?: DisputeStatus; targetType?: EntityType; targetId?: string }) {
    return db.dispute.findMany({
      where: {
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.targetType ? { targetType: opts.targetType } : {}),
        ...(opts.targetId ? { targetId: opts.targetId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createFeedItem(data: { type: FeedItemType; targetType: EntityType; targetId: string; summary: string; occurredAt: string }) {
    await targetService.requireTarget(data.targetType, data.targetId)
    return db.feedItem.create({
      data: {
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        summary: data.summary,
        occurredAt: new Date(data.occurredAt),
      },
    })
  }

  async listAuditLog(opts: {
    cursor?: string
    limit?: number
    actorUserId?: string
    subjectUserId?: string
    targetType?: EntityType
    targetId?: string
  }) {
    const limit = normalizeLimit(opts.limit)
    const cursor = decodeCursor(opts.cursor)

    const where: any = {
      ...(opts.actorUserId ? { actorUserId: opts.actorUserId } : {}),
      ...(opts.subjectUserId ? { subjectUserId: opts.subjectUserId } : {}),
      ...(opts.targetType ? { targetType: opts.targetType } : {}),
      ...(opts.targetId ? { targetId: opts.targetId } : {}),
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : {}),
    }

    const rows = await db.adminAuditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    })

    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows
    const last = data[data.length - 1]
    const nextCursor = hasMore && last
      ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
      : null

    return { data, meta: { hasMore, nextCursor } }
  }
}


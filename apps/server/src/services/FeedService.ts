import { db } from '@statman/db'
import type { EntityType, FeedItemType } from '@statman/db'
import { decodeCursor, encodeCursor, normalizeLimit } from '../lib/pagination'
import { EntityTargetService } from './EntityTargetService'

const targetService = new EntityTargetService()

export class FeedService {
  async record(data: { type: FeedItemType; targetType: EntityType; targetId: string; summary: string }) {
    await targetService.requireTarget(data.targetType, data.targetId)
    return db.feedItem.create({
      data: {
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        summary: data.summary,
        occurredAt: new Date(),
      },
    })
  }

  async list(opts: { cursor?: string; limit?: number }) {
    const limit = normalizeLimit(opts.limit)
    const cursor = decodeCursor(opts.cursor)

    const items = await db.feedItem.findMany({
      where: cursor
        ? {
            OR: [
              { occurredAt: { lt: new Date(cursor.createdAt) } },
              { occurredAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : undefined,
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    })

    const hasMore = items.length > limit
    const data = hasMore ? items.slice(0, limit) : items
    const last = data[data.length - 1]
    const nextCursor = hasMore && last
      ? encodeCursor({ createdAt: last.occurredAt.toISOString(), id: last.id })
      : null

    return { data, meta: { hasMore, nextCursor } }
  }
}

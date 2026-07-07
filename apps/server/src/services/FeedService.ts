import { db } from '@statman/db'
import { decodeCursor, encodeCursor, normalizeLimit } from '../lib/pagination'

export class FeedService {
  record(data: { type: string; targetType: string; targetId: string; summary: string }) {
    return db.feedItem.create({
      data: {
        type: data.type as any,
        targetType: data.targetType as any,
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

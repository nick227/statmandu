import { db } from '@statman/db'
import { CardService } from './CardService'
import { requireActiveCreator } from './CardAccess'

const OWNER = { include: { profile: true } } as const

export class StorefrontService {
  async mine(userId: string) {
    await requireActiveCreator(userId)
    const store = await db.storefront.upsert({ where: { userId }, update: {}, create: { userId }, include: { user: OWNER } })
    return this.serialize(store)
  }

  async update(userId: string, description: string | null) {
    await requireActiveCreator(userId)
    if (description !== null && (typeof description !== 'string' || description.length > 2000)) throw { statusCode: 400, message: 'Description must be at most 2000 characters' }
    const store = await db.storefront.upsert({ where: { userId }, update: { description }, create: { userId, description }, include: { user: OWNER } })
    return this.serialize(store)
  }

  async get(username: string) {
    const profile = await db.profile.findUnique({ where: { username }, include: { user: true } })
    if (!profile || profile.user.suspendedAt || profile.user.deletedAt) throw { statusCode: 404, message: 'Storefront not found' }
    // Covers accounts imported/seeded outside registration as well as migrated accounts.
    const store = await db.storefront.upsert({ where: { userId: profile.userId }, update: {}, create: { userId: profile.userId }, include: { user: OWNER } })
    return this.serialize(store)
  }

  async releases(username: string, cursor?: string, requestedLimit = 20, viewerId?: string) {
    const store = await this.get(username)
    const limit = Math.min(50, Math.max(1, requestedLimit))
    const rows = await db.cardRelease.findMany({
      where: { storefrontId: store.id, createdByUserId: store.userId, status: 'PUBLISHED', visibility: 'PUBLIC', ...(cursor ? { id: { lt: cursor } } : {}) },
      orderBy: { id: 'desc' }, take: limit + 1, select: { id: true },
    })
    const hasMore = rows.length > limit
    const page = rows.slice(0, limit)
    const cards = new CardService()
    return { data: await Promise.all(page.map(row => cards.getCard(row.id, viewerId))), meta: { hasMore, nextCursor: hasMore ? page[page.length - 1]!.id : null } }
  }

  private serialize(store: any) {
    return { id: store.id, userId: store.userId, username: store.user.profile?.username ?? null, displayName: store.user.profile?.displayName ?? null, avatarUrl: store.user.profile?.avatarUrl ?? null, description: store.description, commerceEnabled: false as const, createdAt: store.createdAt, updatedAt: store.updatedAt }
  }
}

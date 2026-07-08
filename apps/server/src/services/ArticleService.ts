import { db } from '@statman/db'
import type { ArticleStatus } from '@statman/db'
import { decodeCursor, encodeCursor, normalizeLimit } from '../lib/pagination'

type Actor = { id: string; role: string } | null

const AUTHOR_INCLUDE = { authorUser: { include: { profile: true } } } as const

function serialize(article: any) {
  const { authorUser, keywords, ...rest } = article
  return {
    ...rest,
    keywords: (keywords as string[] | null) ?? [],
    author: {
      id: authorUser.id,
      username: authorUser.profile?.username ?? null,
      displayName: authorUser.profile?.displayName ?? null,
    },
  }
}

function isAdmin(actor: Actor) {
  return actor?.role === 'ADMIN'
}

export class ArticleService {
  async list(actor: Actor, opts: {
    cursor?: string
    limit?: number
    q?: string
    keyword?: string
    authorUserId?: string
  }) {
    const limit = normalizeLimit(opts.limit)
    const cursor = decodeCursor(opts.cursor)

    const canSeeAllStatuses = Boolean(
      opts.authorUserId && (isAdmin(actor) || actor?.id === opts.authorUserId)
    )

    const where: any = {
      ...(canSeeAllStatuses ? {} : { status: 'PUBLISHED' }),
      ...(opts.authorUserId ? { authorUserId: opts.authorUserId } : {}),
      ...(opts.q
        ? { OR: [{ title: { contains: opts.q } }, { body: { contains: opts.q } }] }
        : {}),
      ...(opts.keyword ? { keywords: { array_contains: opts.keyword } } : {}),
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : {}),
    }

    const articles = await db.article.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: AUTHOR_INCLUDE,
    })

    const hasMore = articles.length > limit
    const items = hasMore ? articles.slice(0, limit) : articles
    const last = items[items.length - 1]
    const nextCursor = hasMore && last
      ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
      : null

    return { data: items.map(serialize), meta: { hasMore, nextCursor } }
  }

  async get(actor: Actor, articleId: string) {
    const article = await db.article.findUnique({ where: { id: articleId }, include: AUTHOR_INCLUDE })
    if (!article) throw { statusCode: 404, message: 'Article not found' }
    if (article.status !== 'PUBLISHED' && article.authorUserId !== actor?.id && !isAdmin(actor)) {
      throw { statusCode: 403, message: 'This article is not published' }
    }
    return serialize(article)
  }

  async create(userId: string, data: { title: string; body: string; keywords?: string[] }) {
    const article = await db.article.create({
      data: {
        authorUserId: userId,
        title: data.title,
        body: data.body,
        keywords: data.keywords ?? [],
        status: 'DRAFT',
      },
      include: AUTHOR_INCLUDE,
    })
    return serialize(article)
  }

  async update(actor: NonNullable<Actor>, articleId: string, data: { title?: string; body?: string; keywords?: string[] }) {
    const article = await db.article.findUnique({ where: { id: articleId } })
    if (!article) throw { statusCode: 404, message: 'Article not found' }

    if (!isAdmin(actor)) {
      if (article.authorUserId !== actor.id) throw { statusCode: 403, message: 'Forbidden' }
      if (article.status !== 'DRAFT' && article.status !== 'REJECTED') {
        throw { statusCode: 403, message: 'Only DRAFT or REJECTED articles can be edited' }
      }
    }

    const updated = await db.article.update({
      where: { id: articleId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.body !== undefined ? { body: data.body } : {}),
        ...(data.keywords !== undefined ? { keywords: data.keywords } : {}),
      },
      include: AUTHOR_INCLUDE,
    })
    return serialize(updated)
  }

  async submit(userId: string, articleId: string) {
    const article = await db.article.findUnique({ where: { id: articleId } })
    if (!article) throw { statusCode: 404, message: 'Article not found' }
    if (article.authorUserId !== userId) throw { statusCode: 403, message: 'Forbidden' }
    if (article.status !== 'DRAFT' && article.status !== 'REJECTED') {
      throw { statusCode: 409, message: 'Only DRAFT or REJECTED articles can be submitted for review' }
    }

    const updated = await db.article.update({
      where: { id: articleId },
      data: { status: 'PENDING_REVIEW', rejectionNote: null },
      include: AUTHOR_INCLUDE,
    })
    return serialize(updated)
  }

  listForReview(status?: ArticleStatus) {
    return db.article.findMany({
      where: { status: status ?? 'PENDING_REVIEW' },
      orderBy: { createdAt: 'asc' },
      include: AUTHOR_INCLUDE,
    }).then((articles) => articles.map(serialize))
  }

  async moderate(adminUserId: string, articleId: string, data: { status: 'PUBLISHED' | 'REJECTED'; rejectionNote?: string }) {
    const article = await db.article.findUnique({ where: { id: articleId } })
    if (!article) throw { statusCode: 404, message: 'Article not found' }
    if (article.status !== 'PENDING_REVIEW') {
      throw { statusCode: 409, message: 'Only PENDING_REVIEW articles can be moderated' }
    }

    const updated = await db.$transaction(async (tx) => {
      const result = await tx.article.update({
        where: { id: articleId },
        data: {
          status: data.status,
          rejectionNote: data.status === 'REJECTED' ? data.rejectionNote ?? null : null,
          reviewedByUserId: adminUserId,
          reviewedAt: new Date(),
          publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        },
        include: AUTHOR_INCLUDE,
      })

      if (data.status === 'PUBLISHED') {
        await tx.feedItem.create({
          data: {
            type: 'ARTICLE_PUBLISHED',
            targetType: 'ARTICLE',
            targetId: result.id,
            summary: `New article: ${result.title}`,
            occurredAt: new Date(),
          },
        })
      }

      return result
    })

    return serialize(updated)
  }
}

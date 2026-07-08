import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId, testOtherUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function makeAdmin(userId: string) {
  await db.user.update({ where: { id: userId }, data: { role: 'ADMIN' } })
}

function seedArticle(overrides: Record<string, any> = {}) {
  return db.article.create({
    data: {
      authorUserId: testUserId,
      title: 'Season opener recap',
      body: 'It was a great game.',
      keywords: ['basketball', 'recap'],
      status: 'DRAFT',
      ...overrides,
    },
  })
}

describe('createArticle', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/articles', payload: { title: 't', body: 'b' } })
    expect(res.statusCode).toBe(401)
  })

  it('POST /articles creates a DRAFT owned by the caller', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/articles',
      headers: asAuth(testUserId),
      payload: { title: 'My first article', body: 'Body text', keywords: ['hoops'] },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('createArticle', 201, res.json())
    expect(res.json().data.status).toBe('DRAFT')
    expect(res.json().data.author.username).toBe('alice')
  })
})

describe('getArticle', () => {
  it('a stranger cannot see an unpublished article', async () => {
    const article = await seedArticle()
    const res = await app.inject({ method: 'GET', url: `/articles/${article.id}`, headers: asAuth(testOtherUserId) })
    expect(res.statusCode).toBe(403)
  })

  it('the author can see their own unpublished article', async () => {
    const article = await seedArticle()
    const res = await app.inject({ method: 'GET', url: `/articles/${article.id}`, headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(200)
    await validateResponse('getArticle', 200, res.json())
  })

  it('anyone, including anonymous callers, can see a PUBLISHED article', async () => {
    const article = await seedArticle({ status: 'PUBLISHED', publishedAt: new Date() })
    const res = await app.inject({ method: 'GET', url: `/articles/${article.id}` })
    expect(res.statusCode).toBe(200)
  })
})

describe('listArticles', () => {
  it('public listing only returns PUBLISHED articles', async () => {
    await seedArticle({ status: 'DRAFT' })
    await seedArticle({ status: 'PUBLISHED', publishedAt: new Date(), title: 'Published one' })

    const res = await app.inject({ method: 'GET', url: '/articles' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listArticles', 200, res.json())
    expect(res.json().data).toHaveLength(1)
    expect(res.json().data[0].title).toBe('Published one')
  })

  it('authorUserId=self surfaces the caller’s own non-published articles', async () => {
    await seedArticle({ status: 'DRAFT' })

    const res = await app.inject({
      method: 'GET',
      url: `/articles?authorUserId=${testUserId}`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data).toHaveLength(1)
  })
})

describe('updateArticle', () => {
  it('the author can edit a DRAFT article', async () => {
    const article = await seedArticle()
    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}`,
      headers: asAuth(testUserId),
      payload: { title: 'Updated title' },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('updateArticle', 200, res.json())
    expect(res.json().data.title).toBe('Updated title')
  })

  it('rejects a non-author editing the article', async () => {
    const article = await seedArticle()
    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}`,
      headers: asAuth(testOtherUserId),
      payload: { title: 'Hijacked' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('rejects the author editing a PENDING_REVIEW article', async () => {
    const article = await seedArticle({ status: 'PENDING_REVIEW' })
    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}`,
      headers: asAuth(testUserId),
      payload: { title: 'Nope' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('an admin can edit a PENDING_REVIEW article', async () => {
    await makeAdmin(testOtherUserId)
    const article = await seedArticle({ status: 'PENDING_REVIEW' })
    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}`,
      headers: asAuth(testOtherUserId),
      payload: { title: 'Admin edit' },
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('submitArticle', () => {
  it('moves a DRAFT article to PENDING_REVIEW', async () => {
    const article = await seedArticle()
    const res = await app.inject({ method: 'POST', url: `/articles/${article.id}/submit`, headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(200)
    await validateResponse('submitArticle', 200, res.json())
    expect(res.json().data.status).toBe('PENDING_REVIEW')
  })

  it('rejects submitting an already-pending article', async () => {
    const article = await seedArticle({ status: 'PENDING_REVIEW' })
    const res = await app.inject({ method: 'POST', url: `/articles/${article.id}/submit`, headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(409)
  })

  it('rejects a non-author submitting the article', async () => {
    const article = await seedArticle()
    const res = await app.inject({ method: 'POST', url: `/articles/${article.id}/submit`, headers: asAuth(testOtherUserId) })
    expect(res.statusCode).toBe(403)
  })
})

describe('listArticlesForReview', () => {
  it('rejects a non-admin', async () => {
    const res = await app.inject({ method: 'GET', url: '/articles/review', headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(403)
  })

  it('defaults to PENDING_REVIEW articles', async () => {
    await makeAdmin(testUserId)
    await seedArticle({ status: 'DRAFT' })
    await seedArticle({ status: 'PENDING_REVIEW', title: 'Awaiting review' })

    const res = await app.inject({ method: 'GET', url: '/articles/review', headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(200)
    await validateResponse('listArticlesForReview', 200, res.json())
    expect(res.json().data).toHaveLength(1)
    expect(res.json().data[0].title).toBe('Awaiting review')
  })
})

describe('moderateArticle', () => {
  it('approving publishes the article and records a feed item', async () => {
    await makeAdmin(testUserId)
    const article = await seedArticle({ status: 'PENDING_REVIEW' })

    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}/review`,
      headers: asAuth(testUserId),
      payload: { status: 'PUBLISHED' },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('moderateArticle', 200, res.json())
    expect(res.json().data.status).toBe('PUBLISHED')
    expect(res.json().data.publishedAt).not.toBeNull()

    const feedItems = await db.feedItem.findMany({ where: { targetType: 'ARTICLE', targetId: article.id } })
    expect(feedItems).toHaveLength(1)
    expect(feedItems[0]?.type).toBe('ARTICLE_PUBLISHED')
  })

  it('rejecting sets a rejection note and leaves it unpublished', async () => {
    await makeAdmin(testUserId)
    const article = await seedArticle({ status: 'PENDING_REVIEW' })

    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}/review`,
      headers: asAuth(testUserId),
      payload: { status: 'REJECTED', rejectionNote: 'Needs a source' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.status).toBe('REJECTED')
    expect(res.json().data.rejectionNote).toBe('Needs a source')
  })

  it('rejects moderating an article that is not PENDING_REVIEW', async () => {
    await makeAdmin(testUserId)
    const article = await seedArticle({ status: 'DRAFT' })

    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}/review`,
      headers: asAuth(testUserId),
      payload: { status: 'PUBLISHED' },
    })
    expect(res.statusCode).toBe(409)
  })

  it('rejects a non-admin', async () => {
    const article = await seedArticle({ status: 'PENDING_REVIEW' })
    const res = await app.inject({
      method: 'PATCH',
      url: `/articles/${article.id}/review`,
      headers: asAuth(testUserId),
      payload: { status: 'PUBLISHED' },
    })
    expect(res.statusCode).toBe(403)
  })
})

// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId, testOtherUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedPlayer() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
  })
  return db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
}

describe('getReactionCounts', () => {
  it('GET /reactions', async () => {
    const player = await seedPlayer()
    await db.reaction.create({ data: { userId: testUserId, targetType: 'PLAYER', targetId: player.id, type: 'FIRE' } })
    await db.reaction.create({ data: { userId: testOtherUserId, targetType: 'PLAYER', targetId: player.id, type: 'FIRE' } })

    const res = await app.inject({ method: 'GET', url: `/reactions?targetType=PLAYER&targetId=${player.id}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getReactionCounts', 200, res.json())
    expect(res.json().data.total).toBe(2)
    expect(res.json().data.byType.FIRE).toBe(2)
  })
})

describe('createReaction', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/reactions' })
    expect(res.statusCode).toBe(401)
  })

  it('changes the reaction type on a second call instead of duplicating', async () => {
    const player = await seedPlayer()

    const first = await app.inject({
      method: 'POST',
      url: '/reactions',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: player.id, type: 'LIKE' },
    })
    expect(first.statusCode).toBe(201)
    await validateResponse('createReaction', 201, first.json())

    const second = await app.inject({
      method: 'POST',
      url: '/reactions',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: player.id, type: 'FIRE' },
    })
    expect(second.json().data.id).toBe(first.json().data.id)
    expect(second.json().data.type).toBe('FIRE')
    expect(await db.reaction.count({ where: { userId: testUserId, targetId: player.id } })).toBe(1)
  })

  it('rejects reacting to an unknown target', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/reactions',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: 'missing-player', type: 'LIKE' },
    })
    expect(res.statusCode).toBe(404)
  })
})

describe('deleteReaction', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/reactions/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(401)
  })

  it('forbids deleting another user\'s reaction', async () => {
    const player = await seedPlayer()
    const reaction = await db.reaction.create({ data: { userId: testUserId, targetType: 'PLAYER', targetId: player.id, type: 'LIKE' } })

    const res = await app.inject({
      method: 'DELETE',
      url: `/reactions/${reaction.id}`,
      headers: asAuth(testOtherUserId),
    })
    expect(res.statusCode).toBe(403)
  })

  it('DELETE /reactions/{reactionId}', async () => {
    const player = await seedPlayer()
    const reaction = await db.reaction.create({ data: { userId: testUserId, targetType: 'PLAYER', targetId: player.id, type: 'LIKE' } })

    const res = await app.inject({
      method: 'DELETE',
      url: `/reactions/${reaction.id}`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('deleteReaction', 200, res.json())
  })
})

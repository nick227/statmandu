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

describe('listFollows', () => {
  it('GET /follows', async () => {
    const player = await seedPlayer()
    await db.follow.create({ data: { followerId: testUserId, targetType: 'PLAYER', targetId: player.id } })

    const res = await app.inject({ method: 'GET', url: `/follows?targetType=PLAYER&targetId=${player.id}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listFollows', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('createFollow', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/follows' })
    expect(res.statusCode).toBe(401)
  })

  it('is idempotent for the same follower/target pair', async () => {
    const player = await seedPlayer()

    const first = await app.inject({
      method: 'POST',
      url: '/follows',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: player.id },
    })
    expect(first.statusCode).toBe(201)
    await validateResponse('createFollow', 201, first.json())

    const second = await app.inject({
      method: 'POST',
      url: '/follows',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: player.id },
    })
    expect(second.statusCode).toBe(201)
    expect(second.json().data.id).toBe(first.json().data.id)
  })

  it('rejects following an unknown target', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/follows',
      headers: asAuth(testUserId),
      payload: { targetType: 'PLAYER', targetId: 'missing-player' },
    })
    expect(res.statusCode).toBe(404)
  })
})

describe('deleteFollow', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/follows/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(401)
  })

  it('forbids deleting another user\'s follow', async () => {
    const player = await seedPlayer()
    const follow = await db.follow.create({ data: { followerId: testUserId, targetType: 'PLAYER', targetId: player.id } })

    const res = await app.inject({
      method: 'DELETE',
      url: `/follows/${follow.id}`,
      headers: asAuth(testOtherUserId),
    })
    expect(res.statusCode).toBe(403)
  })

  it('DELETE /follows/{followId}', async () => {
    const player = await seedPlayer()
    const follow = await db.follow.create({ data: { followerId: testUserId, targetType: 'PLAYER', targetId: player.id } })

    const res = await app.inject({
      method: 'DELETE',
      url: `/follows/${follow.id}`,
      headers: asAuth(testUserId),
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('deleteFollow', 200, res.json())
    expect(await db.follow.findUnique({ where: { id: follow.id } })).toBeNull()
  })
})

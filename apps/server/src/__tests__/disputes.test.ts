// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedPlayer() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
  })
  return db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
}

describe('listDisputes', () => {
  it('GET /disputes', async () => {
    const player = await seedPlayer()
    await db.dispute.create({
      data: {
        targetType: 'ATHLETE_PROFILE',
        targetId: player.athleteProfileId,
        description: 'Wrong hometown',
        submittedByUserId: testUserId,
        status: 'OPEN',
      },
    })

    const res = await app.inject({ method: 'GET', url: `/disputes?targetType=ATHLETE_PROFILE&targetId=${player.athleteProfileId}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listDisputes', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('openDispute', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/disputes' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /disputes', async () => {
    const player = await seedPlayer()

    const res = await app.inject({
      method: 'POST',
      url: '/disputes',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'ATHLETE_PROFILE',
        targetId: player.athleteProfileId,
        fieldName: 'hometown',
        description: 'Wrong hometown listed',
      },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('openDispute', 201, res.json())
    expect(res.json().data.status).toBe('OPEN')
  })

  it('rejects a dispute for an unknown target', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/disputes',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'ATHLETE_PROFILE',
        targetId: 'missing-profile',
        description: 'Wrong hometown listed',
      },
    })
    expect(res.statusCode).toBe(404)
  })
})

describe('resolveDispute', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/disputes/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(401)
  })

  it('rejects a non-admin', async () => {
    const player = await seedPlayer()
    const dispute = await db.dispute.create({
      data: { targetType: 'ATHLETE_PROFILE', targetId: player.athleteProfileId, description: 'x', submittedByUserId: testUserId, status: 'OPEN' },
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/disputes/${dispute.id}`,
      headers: asAuth(testUserId),
      payload: { status: 'RESOLVED' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('resolving a dispute records a feed item', async () => {
    await db.user.update({ where: { id: testUserId }, data: { role: 'ADMIN' } })
    const player = await seedPlayer()
    const dispute = await db.dispute.create({
      data: { targetType: 'ATHLETE_PROFILE', targetId: player.athleteProfileId, description: 'x', submittedByUserId: testUserId, status: 'OPEN' },
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/disputes/${dispute.id}`,
      headers: asAuth(testUserId),
      payload: { status: 'RESOLVED', resolutionNote: 'Confirmed correct' },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('resolveDispute', 200, res.json())

    const feedItems = await db.feedItem.findMany({ where: { targetType: 'ATHLETE_PROFILE', targetId: player.athleteProfileId } })
    expect(feedItems.some((f) => f.type === 'DISPUTE_RESOLVED')).toBe(true)
  })
})

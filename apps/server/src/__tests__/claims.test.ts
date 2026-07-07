// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId, testOtherUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedUnclaimedPlayer() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const athleteProfile = await db.athleteProfile.create({
    data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'SELF_REPORTED' },
  })
  const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })
  return { athleteProfile, player }
}

async function makeAdmin(userId: string) {
  await db.user.update({ where: { id: userId }, data: { role: 'ADMIN' } })
}

describe('claimPlayer', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/players/00000000-0000-0000-0000-000000000001/claim' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /players/{playerId}/claim', async () => {
    const { player } = await seedUnclaimedPlayer()

    const res = await app.inject({
      method: 'POST',
      url: `/players/${player.id}/claim`,
      headers: asAuth(testUserId),
      payload: { verificationNote: 'This is me' },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('claimPlayer', 201, res.json())
    expect(res.json().data.status).toBe('PENDING')
  })

  it('rejects claiming an already-claimed profile', async () => {
    const { athleteProfile, player } = await seedUnclaimedPlayer()
    await db.athleteProfile.update({ where: { id: athleteProfile.id }, data: { claimedByUserId: testOtherUserId } })

    const res = await app.inject({
      method: 'POST',
      url: `/players/${player.id}/claim`,
      headers: asAuth(testUserId),
      payload: {},
    })
    expect(res.statusCode).toBe(409)
  })
})

describe('listClaims', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/claims' })
    expect(res.statusCode).toBe(401)
  })

  it('rejects a non-admin', async () => {
    const res = await app.inject({ method: 'GET', url: '/claims', headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(403)
  })

  it('GET /claims (admin)', async () => {
    await makeAdmin(testUserId)
    const { athleteProfile } = await seedUnclaimedPlayer()
    await db.claim.create({ data: { athleteProfileId: athleteProfile.id, requestedByUserId: testUserId, status: 'PENDING' } })

    const res = await app.inject({ method: 'GET', url: '/claims', headers: asAuth(testUserId) })
    expect(res.statusCode).toBe(200)
    await validateResponse('listClaims', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('reviewClaim', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/claims/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(401)
  })

  it('approving a claim sets claimedByUserId and records a feed item', async () => {
    await makeAdmin(testUserId)
    const { athleteProfile } = await seedUnclaimedPlayer()
    const claim = await db.claim.create({
      data: { athleteProfileId: athleteProfile.id, requestedByUserId: testOtherUserId, status: 'PENDING' },
    })

    const res = await app.inject({
      method: 'PATCH',
      url: `/claims/${claim.id}`,
      headers: asAuth(testUserId),
      payload: { status: 'APPROVED' },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('reviewClaim', 200, res.json())

    const updatedProfile = await db.athleteProfile.findUnique({ where: { id: athleteProfile.id } })
    expect(updatedProfile?.claimedByUserId).toBe(testOtherUserId)

    const feedItems = await db.feedItem.findMany({ where: { targetType: 'ATHLETE_PROFILE', targetId: athleteProfile.id } })
    expect(feedItems).toHaveLength(1)
    expect(feedItems[0]?.type).toBe('PROFILE_CLAIMED')
  })
})

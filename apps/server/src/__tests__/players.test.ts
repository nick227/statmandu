// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId, testOtherUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedSport() {
  return db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
}

describe('listPlayers', () => {
  it('GET /players', async () => {
    const sport = await seedSport()
    const athleteProfile = await db.athleteProfile.create({
      data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
    })
    await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })

    const res = await app.inject({ method: 'GET', url: '/players' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listPlayers', 200, res.json())
    expect(res.json().data).toHaveLength(1)
    expect(res.json().meta).toEqual({ hasMore: false, nextCursor: null })
  })

  it('searches by name via q', async () => {
    const sport = await seedSport()
    const alpha = await db.athleteProfile.create({
      data: { slug: 'alpha-jones', firstName: 'Alpha', lastName: 'Jones', sourceStatus: 'PLAYER_REPORTED' },
    })
    const beta = await db.athleteProfile.create({
      data: { slug: 'beta-smith', firstName: 'Beta', lastName: 'Smith', sourceStatus: 'PLAYER_REPORTED' },
    })
    await db.player.create({ data: { athleteProfileId: alpha.id, sportId: sport.id } })
    await db.player.create({ data: { athleteProfileId: beta.id, sportId: sport.id } })

    const res = await app.inject({ method: 'GET', url: '/players?q=Alpha' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data).toHaveLength(1)
    expect(res.json().data[0].athleteProfile.firstName).toBe('Alpha')
  })
})

describe('createPlayer', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/players' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /players', async () => {
    await seedSport()

    const res = await app.inject({
      method: 'POST',
      url: '/players',
      headers: asAuth(testUserId),
      payload: { firstName: 'Jayden', lastName: 'Rios', sportSlug: 'basketball', position: 'PG' },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('createPlayer', 201, res.json())
    expect(res.json().data.athleteProfile.claimedByUserId).toBe(testUserId)
  })
})

describe('getPlayer', () => {
  it('GET /players/{playerId}', async () => {
    const sport = await seedSport()
    const athleteProfile = await db.athleteProfile.create({
      data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })

    const res = await app.inject({ method: 'GET', url: `/players/${player.id}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('getPlayer', 200, res.json())
    expect(res.json().data.id).toBe(player.id)
  })
})

describe('updatePlayer', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/players/00000000-0000-0000-0000-000000000001' })
    expect(res.statusCode).toBe(401)
  })

  it('lets the claimed owner update', async () => {
    const sport = await seedSport()
    const athleteProfile = await db.athleteProfile.create({
      data: {
        slug: 'jayden-rios',
        firstName: 'Jayden',
        lastName: 'Rios',
        sourceStatus: 'PLAYER_REPORTED',
        claimedByUserId: testUserId,
      },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })

    const res = await app.inject({
      method: 'PATCH',
      url: `/players/${player.id}`,
      headers: asAuth(testUserId),
      payload: { classYear: '2027', jerseyNumber: 11 },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('updatePlayer', 200, res.json())
    expect(res.json().data.classYear).toBe('2027')
  })

  it('forbids a non-owner, non-admin from updating', async () => {
    const sport = await seedSport()
    const athleteProfile = await db.athleteProfile.create({
      data: {
        slug: 'jayden-rios',
        firstName: 'Jayden',
        lastName: 'Rios',
        sourceStatus: 'PLAYER_REPORTED',
        claimedByUserId: testUserId,
      },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })

    const res = await app.inject({
      method: 'PATCH',
      url: `/players/${player.id}`,
      headers: asAuth(testOtherUserId),
      payload: { classYear: '2027' },
    })
    expect(res.statusCode).toBe(403)
  })
})

describe('verifyPlayer', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/players/00000000-0000-0000-0000-000000000001/verify' })
    expect(res.statusCode).toBe(401)
  })

  it('rejects a non-admin', async () => {
    const sport = await seedSport()
    const athleteProfile = await db.athleteProfile.create({
      data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })

    const res = await app.inject({
      method: 'POST',
      url: `/players/${player.id}/verify`,
      headers: asAuth(testUserId),
      payload: { sourceStatus: 'VERIFIED_TEAM_ACCOUNT' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('POST /players/{playerId}/verify (admin)', async () => {
    await db.user.update({ where: { id: testUserId }, data: { role: 'ADMIN' } })
    const sport = await seedSport()
    const athleteProfile = await db.athleteProfile.create({
      data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: sport.id } })

    const res = await app.inject({
      method: 'POST',
      url: `/players/${player.id}/verify`,
      headers: asAuth(testUserId),
      payload: { sourceStatus: 'VERIFIED_TEAM_ACCOUNT' },
    })
    expect(res.statusCode).toBe(200)
    await validateResponse('verifyPlayer', 200, res.json())
    expect(res.json().data.athleteProfile.sourceStatus).toBe('VERIFIED_TEAM_ACCOUNT')
  })
})

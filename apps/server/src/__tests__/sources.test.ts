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

describe('listSources', () => {
  it('GET /sources', async () => {
    const player = await seedPlayer()
    await db.sourceReference.create({
      data: { targetType: 'ATHLETE_PROFILE', targetId: player.athleteProfileId, sourceType: 'TEAM_MANAGER', label: 'Coach report' },
    })

    const res = await app.inject({ method: 'GET', url: `/sources?targetType=ATHLETE_PROFILE&targetId=${player.athleteProfileId}` })
    expect(res.statusCode).toBe(200)
    await validateResponse('listSources', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('createSourceReference', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/sources' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /sources', async () => {
    const player = await seedPlayer()

    const res = await app.inject({
      method: 'POST',
      url: '/sources',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'ATHLETE_PROFILE',
        targetId: player.athleteProfileId,
        sourceType: 'TEAM_MANAGER',
        label: 'Coach report',
      },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('createSourceReference', 201, res.json())
  })

  it('rejects a source for an unknown target', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/sources',
      headers: asAuth(testUserId),
      payload: {
        targetType: 'ATHLETE_PROFILE',
        targetId: 'missing-profile',
        sourceType: 'TEAM_MANAGER',
        label: 'Coach report',
      },
    })
    expect(res.statusCode).toBe(404)
  })
})

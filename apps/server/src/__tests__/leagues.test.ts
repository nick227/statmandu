// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, validateResponse } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedLeague() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  return db.league.create({ data: { sportId: sport.id, slug: 'demo-league', name: 'Demo League' } })
}

describe('listLeagues', () => {
  it('GET /leagues', async () => {
    await seedLeague()

    const res = await app.inject({ method: 'GET', url: '/leagues' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listLeagues', 200, res.json())
    expect(res.json().data.some((l: any) => l.slug === 'demo-league')).toBe(true)
  })
})

describe('getLeague', () => {
  it('GET /leagues/{leagueSlug}', async () => {
    await seedLeague()

    const res = await app.inject({ method: 'GET', url: '/leagues/demo-league' })
    expect(res.statusCode).toBe(200)
    await validateResponse('getLeague', 200, res.json())
    expect(res.json().data.slug).toBe('demo-league')
  })

  it('404s for an unknown slug', async () => {
    const res = await app.inject({ method: 'GET', url: '/leagues/no-such-league' })
    expect(res.statusCode).toBe(404)
  })
})

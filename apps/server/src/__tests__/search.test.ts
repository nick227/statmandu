import { describe, it, expect } from 'vitest'
import { buildTestApp, validateResponse } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedFixtures() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const league = await db.league.create({ data: { sportId: sport.id, slug: 'demo-league', name: 'Demo League' } })

  const lakersProfile = await db.athleteProfile.create({
    data: { slug: 'jordan-lake', firstName: 'Jordan', lastName: 'Lake', sourceStatus: 'PLAYER_REPORTED' },
  })
  const lakersPlayer = await db.player.create({ data: { athleteProfileId: lakersProfile.id, sportId: sport.id, position: 'PG' } })

  const otherProfile = await db.athleteProfile.create({
    data: { slug: 'alex-summit', firstName: 'Alex', lastName: 'Summit', sourceStatus: 'PLAYER_REPORTED' },
  })
  await db.player.create({ data: { athleteProfileId: otherProfile.id, sportId: sport.id, position: 'C' } })

  const lakeside = await db.team.create({ data: { sportId: sport.id, leagueId: league.id, slug: 'lakeside', name: 'Lakeside Lakers' } })
  const riverside = await db.team.create({ data: { sportId: sport.id, leagueId: league.id, slug: 'riverside', name: 'Riverside Rivers' } })

  const game = await db.game.create({
    data: {
      sportId: sport.id,
      leagueId: league.id,
      scheduledAt: new Date('2026-01-15T18:00:00.000Z'),
      status: 'FINAL',
      gameTeams: {
        create: [
          { teamId: lakeside.id, isHome: true },
          { teamId: riverside.id, isHome: false },
        ],
      },
    },
  })

  return { sport, league, lakersPlayer, lakeside, riverside, game }
}

describe('search', () => {
  it('requires q', async () => {
    const res = await app.inject({ method: 'GET', url: '/search' })
    expect(res.statusCode).toBe(400)
  })

  it('finds a player by fuzzy/typo-tolerant name match', async () => {
    await seedFixtures()

    const res = await app.inject({ method: 'GET', url: '/search?q=Jordn%20Lak' })
    expect(res.statusCode).toBe(200)
    await validateResponse('search', 200, res.json())
    expect(res.json().data.some((r: any) => r.type === 'PLAYER' && r.title === 'Jordan Lake')).toBe(true)
  })

  it('matches across players, teams, and games in one query', async () => {
    await seedFixtures()

    const res = await app.inject({ method: 'GET', url: '/search?q=Lake' })
    expect(res.statusCode).toBe(200)
    const types = res.json().data.map((r: any) => r.type)
    expect(types).toContain('PLAYER')
    expect(types).toContain('TEAM')
    expect(types).toContain('GAME')
  })

  it('ranks a closer match higher than a looser one', async () => {
    await seedFixtures()

    const res = await app.inject({ method: 'GET', url: '/search?q=Lakeside%20Lakers' })
    expect(res.statusCode).toBe(200)
    const data = res.json().data
    const team = data.find((r: any) => r.type === 'TEAM' && r.title === 'Lakeside Lakers')
    expect(team).toBeDefined()
    expect(data[0].id).toBe(team.id)
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1].score).toBeGreaterThanOrEqual(data[i].score)
    }
  })

  it('restricts to requested types', async () => {
    await seedFixtures()

    const res = await app.inject({ method: 'GET', url: '/search?q=Lake&types=TEAM' })
    expect(res.statusCode).toBe(200)
    const types = new Set(res.json().data.map((r: any) => r.type))
    expect(types.has('TEAM')).toBe(true)
    expect(types.has('PLAYER')).toBe(false)
    expect(types.has('GAME')).toBe(false)
  })

  it('paginates with a cursor that doesn\'t repeat or skip results', async () => {
    await seedFixtures()

    const first = await app.inject({ method: 'GET', url: '/search?q=e&limit=1' })
    expect(first.statusCode).toBe(200)
    await validateResponse('search', 200, first.json())
    expect(first.json().data).toHaveLength(1)
    expect(first.json().meta.hasMore).toBe(true)
    expect(first.json().meta.nextCursor).toBeTruthy()

    const second = await app.inject({ method: 'GET', url: `/search?q=e&limit=1&cursor=${first.json().meta.nextCursor}` })
    expect(second.statusCode).toBe(200)
    expect(second.json().data).toHaveLength(1)
    expect(second.json().data[0].id).not.toBe(first.json().data[0].id)
  })
})

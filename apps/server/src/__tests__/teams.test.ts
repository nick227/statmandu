// Generated from openapi.yaml — fill in seeds and assertions.
// Run `pnpm test:generate` to add stubs for new routes.
import { describe, it, expect } from 'vitest'
import { buildTestApp, asAuth, validateResponse, testUserId } from './helpers'
import { db } from '@statman/db'

const app = buildTestApp()

async function seedTeam() {
  const sport = await db.sport.create({ data: { slug: 'basketball', name: 'Basketball' } })
  const league = await db.league.create({ data: { sportId: sport.id, slug: 'demo-league', name: 'Demo League' } })
  const season = await db.season.create({ data: { leagueId: league.id, slug: '2025-26', name: '2025-26' } })
  const team = await db.team.create({
    data: { sportId: sport.id, leagueId: league.id, slug: 'ballers', name: 'Ballers' },
  })
  return { sport, league, season, team }
}

describe('listTeams', () => {
  it('GET /teams', async () => {
    await seedTeam()

    const res = await app.inject({ method: 'GET', url: '/teams' })
    expect(res.statusCode).toBe(200)
    await validateResponse('listTeams', 200, res.json())
    expect(res.json().data.some((t: any) => t.slug === 'ballers')).toBe(true)
  })
})

describe('getTeam', () => {
  it('GET /teams/{teamSlug}', async () => {
    await seedTeam()

    const res = await app.inject({ method: 'GET', url: '/teams/ballers' })
    expect(res.statusCode).toBe(200)
    await validateResponse('getTeam', 200, res.json())
    expect(res.json().data.slug).toBe('ballers')
  })
})

describe('getTeamRoster', () => {
  it('GET /teams/{teamSlug}/roster', async () => {
    const { team, season } = await seedTeam()
    const athleteProfile = await db.athleteProfile.create({
      data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'SELF_REPORTED' },
    })
    const player = await db.player.create({
      data: { athleteProfileId: athleteProfile.id, sportId: team.sportId, jerseyNumber: 23 },
    })
    await db.rosterMembership.create({ data: { playerId: player.id, teamId: team.id, seasonId: season.id } })

    const res = await app.inject({ method: 'GET', url: '/teams/ballers/roster' })
    expect(res.statusCode).toBe(200)
    await validateResponse('getTeamRoster', 200, res.json())
    expect(res.json().data).toHaveLength(1)
  })
})

describe('addTeamRosterMember', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/teams/00000000-0000-0000-0000-000000000001/roster/members' })
    expect(res.statusCode).toBe(401)
  })

  it('POST /teams/{teamId}/roster/members', async () => {
    const { team, season } = await seedTeam()
    const athleteProfile = await db.athleteProfile.create({
      data: { slug: 'sam-lee', firstName: 'Sam', lastName: 'Lee', sourceStatus: 'SELF_REPORTED' },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: team.sportId } })

    const res = await app.inject({
      method: 'POST',
      url: `/teams/${team.id}/roster/members`,
      headers: asAuth(testUserId),
      payload: { playerId: player.id, seasonId: season.id, jerseyNumber: 7 },
    })
    expect(res.statusCode).toBe(201)
    await validateResponse('addTeamRosterMember', 201, res.json())
    expect(res.json().data.playerId).toBe(player.id)
  })
})

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

describe('createTeam', () => {
  it('requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/teams', payload: { name: 'New Team', leagueId: 'missing' } })
    expect(res.statusCode).toBe(401)
  })

  it('creates a team and infers its sport from the league', async () => {
    const { sport, league } = await seedTeam()
    const res = await app.inject({
      method: 'POST',
      url: '/teams',
      headers: asAuth(testUserId),
      payload: { name: 'Westview Hawks', city: 'Westview', leagueId: league.id },
    })

    expect(res.statusCode).toBe(201)
    await validateResponse('createTeam', 201, res.json())
    expect(res.json().data.slug).toBe('westview-hawks')
    expect(res.json().data.sportId).toBe(sport.id)
    expect(res.json().data.leagueId).toBe(league.id)
  })

  it('generates a unique slug when names repeat', async () => {
    const { league } = await seedTeam()
    const payload = { name: 'Ballers', leagueId: league.id }
    const res = await app.inject({ method: 'POST', url: '/teams', headers: asAuth(testUserId), payload })
    expect(res.statusCode).toBe(201)
    expect(res.json().data.slug).toBe('ballers-2')
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

  it('resolves the ID-based profile links used by the mobile app', async () => {
    const { team } = await seedTeam()
    const res = await app.inject({ method: 'GET', url: `/teams/${team.id}` })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.id).toBe(team.id)
  })
})

describe('getTeamRoster', () => {
  it('GET /teams/{teamSlug}/roster', async () => {
    const { team, season } = await seedTeam()
    const athleteProfile = await db.personProfile.create({
      data: { slug: 'jayden-rios', firstName: 'Jayden', lastName: 'Rios', sourceStatus: 'PLAYER_REPORTED' },
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
    const athleteProfile = await db.personProfile.create({
      data: { slug: 'sam-lee', firstName: 'Sam', lastName: 'Lee', sourceStatus: 'PLAYER_REPORTED' },
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

  it('rejects a roster season from another league', async () => {
    const { sport, team } = await seedTeam()
    const otherLeague = await db.league.create({ data: { sportId: sport.id, slug: 'other-league', name: 'Other League' } })
    const otherSeason = await db.season.create({ data: { leagueId: otherLeague.id, slug: 'other-season', name: 'Other Season' } })
    const athleteProfile = await db.personProfile.create({
      data: { slug: 'sam-lee', firstName: 'Sam', lastName: 'Lee', sourceStatus: 'PLAYER_REPORTED' },
    })
    const player = await db.player.create({ data: { athleteProfileId: athleteProfile.id, sportId: team.sportId } })

    const res = await app.inject({
      method: 'POST',
      url: `/teams/${team.id}/roster/members`,
      headers: asAuth(testUserId),
      payload: { playerId: player.id, seasonId: otherSeason.id },
    })
    expect(res.statusCode).toBe(400)
  })
})

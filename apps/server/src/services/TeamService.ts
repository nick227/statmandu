import { db } from '@statman/db'
import { CLAIMED_BY_USER_INCLUDE, withClaimFields } from '../lib/athleteProfile'

function serializeRosterMembership(membership: any) {
  const { player, ...rest } = membership
  const { athleteProfile, ...playerRest } = player
  return { ...rest, player: { ...playerRest, athleteProfile: withClaimFields(athleteProfile) } }
}

export class TeamService {
  listTeams(leagueSlug?: string) {
    return db.team.findMany({
      where: leagueSlug ? { league: { slug: leagueSlug } } : undefined,
      include: { league: true, sport: true },
      orderBy: { name: 'asc' },
    })
  }

  async getTeam(teamSlug: string) {
    const team = await db.team.findFirst({
      where: { OR: [{ slug: teamSlug }, { id: teamSlug }] },
      include: { league: true, sport: true },
    })
    if (!team) throw { statusCode: 404, message: 'Team not found' }
    return team
  }

  async createTeam(data: { name: string; leagueId: string; city?: string; logoUrl?: string }) {
    const name = data.name.trim()
    if (!name) throw { statusCode: 400, message: 'Team name is required' }

    const league = await db.league.findUnique({ where: { id: data.leagueId }, include: { sport: true } })
    if (!league) throw { statusCode: 404, message: 'League not found' }

    const slug = await this.uniqueTeamSlug(name)
    return db.team.create({
      data: {
        name,
        slug,
        city: data.city?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        leagueId: league.id,
        sportId: league.sportId,
      },
      include: { league: true, sport: true },
    })
  }

  async getRoster(teamSlug: string, seasonId?: string) {
    const team = await db.team.findUnique({ where: { slug: teamSlug } })
    if (!team) throw { statusCode: 404, message: 'Team not found' }

    const resolvedSeasonId = seasonId ?? (await this.resolveCurrentSeasonId(team.leagueId))

    const memberships = await db.rosterMembership.findMany({
      where: { teamId: team.id, seasonId: resolvedSeasonId, isActive: true },
      include: { player: { include: { athleteProfile: { include: CLAIMED_BY_USER_INCLUDE } } } },
      orderBy: { jerseyNumber: 'asc' },
    })
    return memberships.map(serializeRosterMembership)
  }

  // Mirrors getTeamSeasonStats' "current first" ordering: prefer the
  // league's isActive season, falling back to its most recently started
  // one if isActive was never set.
  private async resolveCurrentSeasonId(leagueId: string) {
    const season = await db.season.findFirst({
      where: { leagueId },
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
    })
    return season?.id
  }

  async addRosterMember(teamId: string, data: { playerId: string; seasonId: string; jerseyNumber?: number }) {
    // None of these three lookups depend on each other — run them concurrently.
    const [team, player, season] = await Promise.all([
      db.team.findUnique({ where: { id: teamId } }),
      db.player.findUnique({ where: { id: data.playerId } }),
      db.season.findUnique({ where: { id: data.seasonId } }),
    ])
    if (!team) throw { statusCode: 404, message: 'Team not found' }
    if (!player) throw { statusCode: 404, message: 'Player not found' }
    if (!season) throw { statusCode: 404, message: 'Season not found' }
    if (player.sportId !== team.sportId) {
      throw { statusCode: 400, message: 'Player and team must belong to the same sport' }
    }
    if (season.leagueId !== team.leagueId) {
      throw { statusCode: 400, message: 'Roster season must belong to the team league' }
    }

    const membership = await db.rosterMembership.create({
      data: {
        teamId,
        playerId: data.playerId,
        seasonId: data.seasonId,
        jerseyNumber: data.jerseyNumber,
      },
      include: { player: { include: { athleteProfile: { include: CLAIMED_BY_USER_INCLUDE } } } },
    })
    return serializeRosterMembership(membership)
  }

  private async uniqueTeamSlug(name: string) {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team'
    let slug = base
    let suffix = 1
    while (await db.team.findUnique({ where: { slug } })) slug = `${base}-${++suffix}`
    return slug
  }
}

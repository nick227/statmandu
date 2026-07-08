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
    const team = await db.team.findUnique({
      where: { slug: teamSlug },
      include: { league: true, sport: true },
    })
    if (!team) throw { statusCode: 404, message: 'Team not found' }
    return team
  }

  async getRoster(teamSlug: string) {
    const team = await db.team.findUnique({ where: { slug: teamSlug } })
    if (!team) throw { statusCode: 404, message: 'Team not found' }

    const memberships = await db.rosterMembership.findMany({
      where: { teamId: team.id, isActive: true },
      include: { player: { include: { athleteProfile: { include: CLAIMED_BY_USER_INCLUDE } } } },
      orderBy: { jerseyNumber: 'asc' },
    })
    return memberships.map(serializeRosterMembership)
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
}

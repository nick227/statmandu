import { SportsService } from '../services/SportsService'

const sportsService = new SportsService()

export async function listSports(_request: any, reply: any) {
  const sports = await sportsService.listSports()
  return reply.send({ data: sports })
}

export async function listLeagues(request: any, reply: any) {
  const leagues = await sportsService.listLeagues(request.query?.sportSlug)
  return reply.send({ data: leagues })
}

export async function getLeague(request: any, reply: any) {
  const league = await sportsService.getLeague(request.params.leagueSlug)
  return reply.send({ data: league })
}

import { TeamService } from '../services/TeamService'

const teamService = new TeamService()

export async function listTeams(request: any, reply: any) {
  const teams = await teamService.listTeams(request.query?.leagueSlug)
  return reply.send({ data: teams })
}

export async function getTeam(request: any, reply: any) {
  const team = await teamService.getTeam(request.params.teamSlug)
  return reply.send({ data: team })
}

export async function getTeamRoster(request: any, reply: any) {
  const roster = await teamService.getRoster(request.params.teamSlug)
  return reply.send({ data: roster })
}

export async function addTeamRosterMember(request: any, reply: any) {
  const membership = await teamService.addRosterMember(request.params.teamId, request.body)
  return reply.status(201).send({ data: membership })
}

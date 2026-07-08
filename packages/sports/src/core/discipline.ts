import type { ReconcileEvent, SportDefinition } from './types'

export type DisciplineStatus = {
  teamFouls: Record<string, number>
  inBonus: Record<string, boolean>
  fouledOutPlayerIds: string[]
}

// Sport-agnostic reader over a raw event log — mirrors reconcileEvents'
// shape/filtering (only ACCEPTED/FINALIZED events count) but computes what
// reconcileEvents doesn't: team-level foul totals and the bonus/foul-out
// flags derived from them. Returns null for any sport with no `discipline`
// config declared, rather than guessing at a rule that hasn't been
// verified for that sport.
export function computeDisciplineStatus(
  definition: SportDefinition,
  events: ReconcileEvent[],
  teamIds: string[]
): DisciplineStatus | null {
  const discipline = definition.discipline
  if (!discipline) return null

  const teamFouls: Record<string, number> = Object.fromEntries(teamIds.map((id) => [id, 0]))
  const playerFouls: Record<string, number> = {}

  for (const event of events) {
    if (event.status && !['ACCEPTED', 'FINALIZED'].includes(event.status)) continue
    if (!discipline.foulEventTypes.includes(event.type) || !event.teamId) continue
    teamFouls[event.teamId] = (teamFouls[event.teamId] ?? 0) + 1
    if (event.playerId) playerFouls[event.playerId] = (playerFouls[event.playerId] ?? 0) + 1
  }

  const inBonus = Object.fromEntries(teamIds.map((id) => [id, (teamFouls[id] ?? 0) >= discipline.bonusThreshold]))
  const fouledOutPlayerIds = discipline.foulOutThreshold
    ? Object.entries(playerFouls)
        .filter(([, count]) => count >= discipline.foulOutThreshold!)
        .map(([playerId]) => playerId)
    : []

  return { teamFouls, inBonus, fouledOutPlayerIds }
}

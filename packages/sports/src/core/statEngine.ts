import type { ReconcileEvent, ReconcileResult, SportDefinition } from './types'

export function emptyNumericStats(definition: SportDefinition) {
  const stats: Record<string, number> = {}
  for (const [key, field] of Object.entries(definition.playerStatFields)) {
    if (field.type === 'integer' || field.type === 'decimal') stats[key] = 0
  }
  return stats
}

export function reconcileEvents(definition: SportDefinition, events: ReconcileEvent[], teamIds: string[]): ReconcileResult {
  const lines = new Map<string, { playerId: string; teamId: string; stats: Record<string, number> }>()
  const teamScores = new Map<string, number>()
  for (const teamId of teamIds) teamScores.set(teamId, 0)

  const ensureLine = (playerId: string, teamId: string) => {
    const key = `${playerId}:${teamId}`
    if (!lines.has(key)) lines.set(key, { playerId, teamId, stats: emptyNumericStats(definition) })
    return lines.get(key)!
  }

  for (const event of events) {
    if (event.status && !['ACCEPTED', 'FINALIZED'].includes(event.status)) continue
    const eventDefinition = definition.events[event.type]
    if (!eventDefinition || !event.playerId || !event.teamId) continue

    const line = ensureLine(event.playerId, event.teamId)
    for (const [stat, delta] of Object.entries(eventDefinition.statDeltas ?? {})) {
      line.stats[stat] = (line.stats[stat] ?? 0) + delta
    }
    if (eventDefinition.points) {
      teamScores.set(event.teamId, (teamScores.get(event.teamId) ?? 0) + eventDefinition.points)
    }
  }

  return { playerLines: [...lines.values()], teamScores }
}

export function validateEventDefinition(definition: SportDefinition, event: { type: string; playerId?: string; teamId?: string }) {
  const eventDefinition = definition.events[event.type]
  if (!eventDefinition) throw { statusCode: 400, message: `${event.type} is not a supported ${definition.name} event` }
  if (eventDefinition.requiresPlayer && !event.playerId) throw { statusCode: 400, message: `${event.type} requires a playerId` }
  if (eventDefinition.requiresTeam && !event.teamId) throw { statusCode: 400, message: `${event.type} requires a teamId` }
}

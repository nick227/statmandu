import { getSportDefinition, formatStatValue, getStatField, readStatValue } from '@statman/sports'

type StatSource = Record<string, unknown> & {
  stats?: Record<string, unknown> | null
  offRebounds?: number
  defRebounds?: number
  gamesPlayed?: number
}

export function readSportStat(sportSlug: string, source: StatSource, statKey: string): unknown {
  const definition = getSportDefinition(sportSlug)
  return readStatValue(definition, source, statKey)
}

export function formattedSportStat(sportSlug: string, source: StatSource, statKey: string) {
  const definition = getSportDefinition(sportSlug)
  return formatStatValue(definition, statKey, readSportStat(sportSlug, source, statKey) as never)
}

export function sportStatLabel(sportSlug: string, statKey: string) {
  const definition = getSportDefinition(sportSlug)
  return getStatField(definition, statKey)?.label ?? statKey
}

export function sportStatChips(sportSlug: string, source: StatSource, view: 'profileHeadline' | 'teamProfileHeadline' | 'leaderboard' = 'profileHeadline') {
  const definition = getSportDefinition(sportSlug)
  return definition.views[view].map((key) => ({
    label: sportStatLabel(sportSlug, key),
    value: formattedSportStat(sportSlug, source, key),
  }))
}

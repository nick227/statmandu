import type { SportDefinition, StatValue } from './types'

type StatSource = Record<string, unknown> & {
  stats?: Record<string, unknown> | null
  gamesPlayed?: number
}

export function getStatField(definition: SportDefinition, statKey: string) {
  return definition.playerStatFields[statKey] ?? definition.teamStatFields[statKey]
}

export function readStatValue(definition: SportDefinition, source: StatSource, statKey: string): unknown {
  const field = getStatField(definition, statKey)

  if (field?.derived?.type === 'sum') {
    return field.derived.stats.reduce((total, key) => total + Number(readStatValue(definition, source, key) ?? 0), 0)
  }
  if (field?.derived?.type === 'perGame') {
    const gamesPlayed = Number(readStatValue(definition, source, 'gamesPlayed') ?? source.gamesPlayed ?? 0)
    if (gamesPlayed <= 0) return 0
    return Number(readStatValue(definition, source, field.derived.stat) ?? 0) / gamesPlayed
  }

  const sourceValue = source[statKey]
  if (sourceValue != null) return sourceValue
  return source.stats?.[statKey]
}

export function formatStatValue(definition: SportDefinition, statKey: string, value: StatValue | undefined) {
  if (value == null) return '0'
  const field = getStatField(definition, statKey)
  const format = field?.format ?? field?.type ?? 'integer'

  if (typeof value !== 'number') return String(value)
  switch (format) {
    case 'decimal1':
      return value.toFixed(1)
    case 'decimal2':
      return value.toFixed(2)
    case 'percent':
      return `${Math.round(value * 100)}%`
    default:
      return String(Math.round(value))
  }
}

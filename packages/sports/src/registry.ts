import type { SportDefinition } from './core/types'
import { basketballDefinition } from './definitions/basketball'
import { footballDefinition } from './definitions/football'
import { soccerDefinition } from './definitions/soccer'
import { tennisDefinition } from './definitions/tennis'

const DEFINITIONS = [
  basketballDefinition,
  footballDefinition,
  soccerDefinition,
  tennisDefinition,
] satisfies SportDefinition[]

export function getSportDefinition(slug: string) {
  const definition = DEFINITIONS.find((sport) => sport.slug === slug)
  if (!definition) throw { statusCode: 400, message: `Unsupported sport: ${slug}` }
  return definition
}

export function listSportDefinitions() {
  return DEFINITIONS
}

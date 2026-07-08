import { getSportDefinition } from '../registry'

export type PredictedNext = {
  suggestedEventTypes: string[]
  flipPossession: boolean
  keepPlayer: boolean
}

const NO_PREDICTION: PredictedNext = { suggestedEventTypes: [], flipPossession: false, keepPlayer: true }

// Sport-agnostic — every sport supplies its own EventDefinition.flow map
// (see packages/sports/src/definitions/basketball.ts); this function just
// reads it. A sport with no flow data (or an unrecognized/undone last event)
// degrades to "no suggestion" rather than throwing.
export function predictNext(sport: string, lastEventType: string | undefined): PredictedNext {
  if (!lastEventType) return NO_PREDICTION

  const definition = getSportDefinition(sport)
  const flow = definition.events[lastEventType]?.flow
  if (!flow) return NO_PREDICTION

  return {
    suggestedEventTypes: flow.suggestsEvents ?? [],
    flipPossession: flow.flipsPossession ?? false,
    keepPlayer: flow.keepsPlayer ?? true,
  }
}

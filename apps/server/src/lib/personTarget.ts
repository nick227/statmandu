export function personTargetType(value: string) { return value === 'PERSON_PROFILE' ? 'ATHLETE_PROFILE' : value }

// Compatibility normalization happens before validation and storage, so aliases
// share the same uniqueness constraints in follows, reactions, media and sources.
export async function normalizePersonTarget(request: any) {
  for (const container of [request.query, request.body, request.params]) {
    if (container && typeof container === 'object' && container.targetType === 'PERSON_PROFILE') container.targetType = personTargetType(container.targetType)
  }
}

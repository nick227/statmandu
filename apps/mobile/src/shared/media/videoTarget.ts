import { mediaFilmLabel, type MediaTargetType } from './mediaLabels'

export type { MediaTargetType }

export function mediaTargetHref(targetType: MediaTargetType, targetId: string) {
  switch (targetType) {
    case 'PLAYER':
      return { pathname: '/players/[playerId]' as const, params: { playerId: targetId } }
    case 'TEAM':
      return { pathname: '/teams/[teamId]' as const, params: { teamId: targetId } }
    case 'GAME':
      return { pathname: '/games/[gameId]' as const, params: { gameId: targetId } }
    default:
      return null
  }
}

export function mediaSourceEyebrow(targetType: MediaTargetType) {
  return mediaFilmLabel(targetType)
}

export { isMediaTargetType, mediaFilmLabelForTarget } from './mediaLabels'

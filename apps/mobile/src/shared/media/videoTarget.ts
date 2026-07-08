type MediaTargetType = 'PLAYER' | 'TEAM' | 'GAME'

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
  switch (targetType) {
    case 'PLAYER':
      return 'Athlete'
    case 'TEAM':
      return 'Team'
    case 'GAME':
      return 'Game film'
    default:
      return 'Video'
  }
}

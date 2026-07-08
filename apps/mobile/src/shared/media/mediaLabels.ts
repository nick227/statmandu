export type MediaTargetType = 'PLAYER' | 'TEAM' | 'GAME'

export function isMediaTargetType(value: string): value is MediaTargetType {
  return value === 'PLAYER' || value === 'TEAM' || value === 'GAME'
}

export function mediaFilmLabel(targetType: MediaTargetType) {
  switch (targetType) {
    case 'PLAYER':
      return 'Athlete film'
    case 'TEAM':
      return 'Team film'
    case 'GAME':
      return 'Game film'
  }
}

export function mediaFilmLabelForTarget(targetType: string) {
  return isMediaTargetType(targetType) ? mediaFilmLabel(targetType) : 'Video'
}

export function mediaTargetActionLabel(targetType: MediaTargetType) {
  switch (targetType) {
    case 'PLAYER':
    case 'TEAM':
      return 'View profile'
    case 'GAME':
      return 'View game'
  }
}

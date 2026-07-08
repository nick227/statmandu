import { gameStatusColor, sourceStatusColor } from '../theme'

describe('sourceStatusColor', () => {
  it('maps every real SourceStatus enum value to a color token', () => {
    expect(sourceStatusColor('PLAYER_REPORTED')).toBe('muted-text')
    expect(sourceStatusColor('SPECTATOR_REPORTED')).toBe('muted-text')
    expect(sourceStatusColor('MULTI_SPECTATOR_CONFIRMED')).toBe('brand')
    expect(sourceStatusColor('TEAM_MANAGER_ENTERED')).toBe('brand')
    expect(sourceStatusColor('OFFICIAL_SCORER_RECORDED')).toBe('brand')
    expect(sourceStatusColor('VERIFIED_TEAM_ACCOUNT')).toBe('verified')
    expect(sourceStatusColor('ONLINE_SOURCE_IMPORTED')).toBe('imported')
    expect(sourceStatusColor('PUBLIC_SOURCE_SCRAPED')).toBe('imported')
    expect(sourceStatusColor('IN_DISPUTE')).toBe('dispute')
  })

  it('falls back to muted-text for an unrecognized status rather than throwing', () => {
    expect(sourceStatusColor('SOMETHING_NEW')).toBe('muted-text')
  })
})

describe('gameStatusColor', () => {
  it('maps every real GameStatus enum value to a color token', () => {
    expect(gameStatusColor('SCHEDULED')).toBe('muted-text')
    expect(gameStatusColor('LIVE')).toBe('live')
    expect(gameStatusColor('FINAL')).toBe('brand')
    expect(gameStatusColor('DISPUTED')).toBe('dispute')
  })

  it('falls back to muted-text for an unrecognized status rather than throwing', () => {
    expect(gameStatusColor('SOMETHING_NEW')).toBe('muted-text')
  })
})

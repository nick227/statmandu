import { formattedSportStat, readSportStat, sportStatLabel } from '../sportStats'

describe('readSportStat', () => {
  it('reads a plain (non-derived) field straight off the source object', () => {
    expect(readSportStat('basketball', { points: 20 }, 'points')).toBe(20)
  })

  it('computes a "sum" derived field from its component stats', () => {
    // basketball's `rebounds` field is derived: offRebounds + defRebounds
    expect(readSportStat('basketball', { offRebounds: 3, defRebounds: 5 }, 'rebounds')).toBe(8)
  })

  it('computes a "perGame" derived field by dividing by gamesPlayed', () => {
    // basketball's `ppg` field is derived: points / gamesPlayed
    expect(readSportStat('basketball', { points: 20, gamesPlayed: 4 }, 'ppg')).toBe(5)
  })

  it('guards against division by zero when gamesPlayed is 0', () => {
    expect(readSportStat('basketball', { points: 20, gamesPlayed: 0 }, 'ppg')).toBe(0)
  })

  it('falls back to the stats JSON bag when the key is not a direct property', () => {
    expect(readSportStat('basketball', { stats: { points: 15 } }, 'points')).toBe(15)
  })
})

describe('formattedSportStat', () => {
  it('formats an integer-type field as a rounded whole number', () => {
    expect(formattedSportStat('basketball', { points: 20.6 }, 'points')).toBe('21')
  })

  it('formats a decimal1-type derived field to one decimal place', () => {
    expect(formattedSportStat('basketball', { points: 20, gamesPlayed: 4 }, 'ppg')).toBe('5.0')
  })
})

describe('sportStatLabel', () => {
  it('returns the short label for a known stat field', () => {
    expect(sportStatLabel('basketball', 'points')).toBe('PTS')
  })

  it('falls back to the raw key for an unknown stat field', () => {
    expect(sportStatLabel('basketball', 'not_a_real_stat')).toBe('not_a_real_stat')
  })
})

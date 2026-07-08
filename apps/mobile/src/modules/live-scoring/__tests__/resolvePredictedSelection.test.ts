import { resolvePredictedSelection } from '../useLiveScoringSession'

const teams = { homeTeamId: 'home-1', awayTeamId: 'away-1' }

describe('resolvePredictedSelection', () => {
  it('flips the selected team from home to away after a possession-flipping event', () => {
    const result = resolvePredictedSelection('basketball', 'REBOUND_DEF', { selectedTeamId: 'home-1', ...teams })
    expect(result.selectedTeamId).toBe('away-1')
  })

  it('flips the selected team from away to home after a possession-flipping event', () => {
    const result = resolvePredictedSelection('basketball', 'TURNOVER', { selectedTeamId: 'away-1', ...teams })
    expect(result.selectedTeamId).toBe('home-1')
  })

  it('keeps the same team selected for a non-possession-flipping event', () => {
    const result = resolvePredictedSelection('basketball', 'REBOUND_OFF', { selectedTeamId: 'home-1', ...teams })
    expect(result.selectedTeamId).toBe('home-1')
  })

  it('leaves selectedTeamId untouched if it does not match either known team', () => {
    const result = resolvePredictedSelection('basketball', 'STEAL', { selectedTeamId: null, ...teams })
    expect(result.selectedTeamId).toBeNull()
  })

  it('signals clearing the sticky player after a miss (rebounder is likely someone else)', () => {
    const result = resolvePredictedSelection('basketball', 'FG3_MISS', { selectedTeamId: 'home-1', ...teams })
    expect(result.clearPlayer).toBe(true)
    expect(result.suggestedEventTypes).toEqual(['REBOUND_OFF', 'REBOUND_DEF'])
  })

  it('keeps the sticky player after a made shot (assist follow-up is the same possession)', () => {
    const result = resolvePredictedSelection('basketball', 'FG2_MADE', { selectedTeamId: 'home-1', ...teams })
    expect(result.clearPlayer).toBe(false)
    expect(result.selectedTeamId).toBe('away-1')
  })

  it('degrades to no-op selection for an event with no flow data', () => {
    const result = resolvePredictedSelection('basketball', 'ASSIST', { selectedTeamId: 'home-1', ...teams })
    expect(result).toEqual({ selectedTeamId: 'home-1', clearPlayer: false, suggestedEventTypes: [] })
  })
})

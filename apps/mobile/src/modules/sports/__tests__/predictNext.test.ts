import { predictNext } from '@statman/sports'

describe('predictNext', () => {
  it('returns no suggestion when there is no prior event', () => {
    expect(predictNext('basketball', undefined)).toEqual({
      suggestedEventTypes: [],
      flipPossession: false,
      keepPlayer: true,
    })
  })

  it('suggests an assist and flips possession after a made shot', () => {
    expect(predictNext('basketball', 'FG2_MADE')).toEqual({
      suggestedEventTypes: ['ASSIST'],
      flipPossession: true,
      keepPlayer: true,
    })
    expect(predictNext('basketball', 'FG3_MADE').suggestedEventTypes).toEqual(['ASSIST'])
    expect(predictNext('basketball', 'FT_MADE').suggestedEventTypes).toEqual(['ASSIST'])
  })

  it('suggests both rebound types and clears the sticky player after a miss', () => {
    const result = predictNext('basketball', 'FG3_MISS')
    expect(result.suggestedEventTypes).toEqual(['REBOUND_OFF', 'REBOUND_DEF'])
    expect(result.keepPlayer).toBe(false)
    expect(result.flipPossession).toBe(false)
  })

  it('flips possession on a defensive rebound but not an offensive one', () => {
    expect(predictNext('basketball', 'REBOUND_DEF').flipPossession).toBe(true)
    expect(predictNext('basketball', 'REBOUND_OFF').flipPossession).toBe(false)
  })

  it('flips possession on a steal or turnover', () => {
    expect(predictNext('basketball', 'STEAL').flipPossession).toBe(true)
    expect(predictNext('basketball', 'TURNOVER').flipPossession).toBe(true)
  })

  it('suggests free throws, flips possession, and clears the player after a foul', () => {
    const result = predictNext('basketball', 'FOUL')
    expect(result.suggestedEventTypes).toEqual(['FT_MADE', 'FT_MISS'])
    expect(result.flipPossession).toBe(true)
    expect(result.keepPlayer).toBe(false)
  })

  it('degrades to no suggestion for an event type with no flow data', () => {
    expect(predictNext('basketball', 'ASSIST')).toEqual({
      suggestedEventTypes: [],
      flipPossession: false,
      keepPlayer: true,
    })
  })

  it('degrades to no suggestion for a sport with no flow data declared on any event', () => {
    // Tennis defines events with no `flow` field at all.
    expect(predictNext('tennis', 'TENNIS_ACE')).toEqual({
      suggestedEventTypes: [],
      flipPossession: false,
      keepPlayer: true,
    })
  })
})

import { computeDisciplineStatus, getSportDefinition } from '@statman/sports'

const basketball = getSportDefinition('basketball')
const tennis = getSportDefinition('tennis')
const teamIds = ['home-1', 'away-1']

function foulEvent(teamId: string, playerId: string, status = 'ACCEPTED') {
  return { type: 'FOUL', playerId, teamId, status }
}

describe('computeDisciplineStatus', () => {
  it('returns null for a sport with no discipline config declared', () => {
    expect(computeDisciplineStatus(tennis, [], teamIds)).toBeNull()
  })

  it('counts team fouls only from accepted/finalized events', () => {
    const events = [
      foulEvent('home-1', 'p1'),
      foulEvent('home-1', 'p2', 'FINALIZED'),
      foulEvent('home-1', 'p1', 'REJECTED'),
      foulEvent('away-1', 'p3'),
    ]
    const status = computeDisciplineStatus(basketball, events, teamIds)
    expect(status?.teamFouls).toEqual({ 'home-1': 2, 'away-1': 1 })
  })

  it('flags a team as in bonus once it reaches the sport bonus threshold', () => {
    const events = Array.from({ length: 7 }, (_, i) => foulEvent('home-1', `p${i}`))
    const status = computeDisciplineStatus(basketball, events, teamIds)
    expect(status?.inBonus['home-1']).toBe(true)
    expect(status?.inBonus['away-1']).toBe(false)
  })

  it('does not flag bonus below the threshold', () => {
    const events = Array.from({ length: 6 }, (_, i) => foulEvent('home-1', `p${i}`))
    const status = computeDisciplineStatus(basketball, events, teamIds)
    expect(status?.inBonus['home-1']).toBe(false)
  })

  it('flags a player as fouled out once they reach the individual threshold', () => {
    const events = Array.from({ length: 5 }, () => foulEvent('home-1', 'p1'))
    const status = computeDisciplineStatus(basketball, events, teamIds)
    expect(status?.fouledOutPlayerIds).toEqual(['p1'])
  })

  it('does not flag a player fouled out below the individual threshold', () => {
    const events = Array.from({ length: 4 }, () => foulEvent('home-1', 'p1'))
    const status = computeDisciplineStatus(basketball, events, teamIds)
    expect(status?.fouledOutPlayerIds).toEqual([])
  })

  it('ignores non-foul event types entirely', () => {
    const events = [{ type: 'FG2_MADE', playerId: 'p1', teamId: 'home-1', status: 'ACCEPTED' }]
    const status = computeDisciplineStatus(basketball, events, teamIds)
    expect(status?.teamFouls).toEqual({ 'home-1': 0, 'away-1': 0 })
  })
})

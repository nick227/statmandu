import { selectDiscoveryGames } from '../discoverySelection'

function game(id: string, status: 'LIVE' | 'FINAL' | 'SCHEDULED', scheduledAt: string, finalizedAt?: string) {
  return { id, status, scheduledAt, finalizedAt, gameTeams: [] } as never
}

describe('selectDiscoveryGames', () => {
  it('orders live games before fresh finals and upcoming games', () => {
    const games = [
      game('upcoming-later', 'SCHEDULED', '2026-07-14T12:00:00Z'),
      game('final-old', 'FINAL', '2026-07-01T12:00:00Z', '2026-07-01T14:00:00Z'),
      game('live', 'LIVE', '2026-07-12T12:00:00Z'),
      game('final-new', 'FINAL', '2026-07-11T12:00:00Z', '2026-07-11T14:00:00Z'),
      game('upcoming-next', 'SCHEDULED', '2026-07-13T12:00:00Z'),
    ]

    expect(selectDiscoveryGames(games).map((item) => item.id)).toEqual([
      'live', 'final-new', 'final-old', 'upcoming-next', 'upcoming-later',
    ])
  })

  it('respects the mobile rail limit', () => {
    const games = Array.from({ length: 8 }, (_, index) => game(`live-${index}`, 'LIVE', '2026-07-12T12:00:00Z'))
    expect(selectDiscoveryGames(games, 4)).toHaveLength(4)
  })
})

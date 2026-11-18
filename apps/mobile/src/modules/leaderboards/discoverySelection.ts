import type { components } from '@statman/sdk'

type Game = components['schemas']['Game']

/** Prioritizes what a fan can act on now: live, then fresh results, then
 * upcoming games. De-duplicates because API groupings can overlap later. */
export function selectDiscoveryGames(games: Game[], limit = 6): Game[] {
  const live = games.filter((game) => game.status === 'LIVE')
  const finals = games
    .filter((game) => game.status === 'FINAL')
    .sort((a, b) => new Date(b.finalizedAt ?? b.scheduledAt).getTime() - new Date(a.finalizedAt ?? a.scheduledAt).getTime())
  const upcoming = games
    .filter((game) => game.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  return [...live, ...finals, ...upcoming]
    .filter((game, index, all) => all.findIndex((candidate) => candidate.id === game.id) === index)
    .slice(0, limit)
}

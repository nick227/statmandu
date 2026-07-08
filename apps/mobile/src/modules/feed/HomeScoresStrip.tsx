import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import type { components } from '@statman/sdk'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'

type Game = components['schemas']['Game']

function gameLabel(game: Game) {
  const home = game.gameTeams.find((gt) => gt.isHome)?.team?.name ?? 'Home'
  const away = game.gameTeams.find((gt) => !gt.isHome)?.team?.name ?? 'Away'
  return `${home} vs ${away}`
}

/** Compact scoreboard strip — entry jobs stay on /scores, not duplicated here. */
export function HomeScoresStrip({ games }: { games: Game[] }) {
  if (games.length === 0) return null

  return (
    <View className="gap-sm">
      {games.map((game) => (
        <Link
          key={game.id}
          href={{ pathname: '/games/[gameId]', params: { gameId: game.id } }}
          asChild
        >
          <Pressable className="flex-row items-center justify-between gap-sm rounded-md border border-border bg-surface px-md py-sm active:opacity-70">
            <View className="flex-1 gap-xs">
              <Text className="font-semibold" numberOfLines={1}>{gameLabel(game)}</Text>
              <Text variant="caption">{new Date(game.scheduledAt).toLocaleString()}</Text>
            </View>
            <GameStatusBadge status={game.status} />
          </Pressable>
        </Link>
      ))}
      <Link href="/scores" asChild>
        <Button variant="secondary">Score, broadcast & watch</Button>
      </Link>
    </View>
  )
}

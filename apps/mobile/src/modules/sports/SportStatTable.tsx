import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { getSportDefinition } from '@statman/sports'
import { ClipboardList } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { EmptyState } from '@/shared/ui/EmptyState'
import { DisputeFootnote } from '@/modules/disputes/DisputeFootnote'
import { formattedSportStat, sportStatLabel } from './sportStats'

type SportStatRow = Record<string, unknown> & {
  id: string
  playerId: string
  gameId: string
  playerName: string
  gameOpponentName: string
  gameScheduledAt: string
  disputeNote?: string | null
}

interface SportStatTableProps {
  sport: string
  rows: SportStatRow[]
  /** 'byPlayer' (default): one game, many players — first column links to
   *  the player. 'byGame': one player, many games — first column shows
   *  date + opponent and links to that game instead. */
  mode?: 'byPlayer' | 'byGame'
  view?: 'boxScore' | 'leaderboard'
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function SportStatTable({
  sport,
  rows,
  mode = 'byPlayer',
  view = 'boxScore',
  emptyTitle = 'No stats yet',
  emptyDescription = 'Stats appear once they are available.',
  className,
}: SportStatTableProps) {
  const definition = getSportDefinition(sport)
  const statKeys = definition.views[view]

  if (rows.length === 0) {
    return <EmptyState icon={ClipboardList} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <View className={className}>
      <View className="flex-row px-lg py-sm border-b border-border">
        <Text variant="caption" className="flex-1">{mode === 'byGame' ? 'Game' : 'Player'}</Text>
        {statKeys.map((key) => (
          <Text key={key} variant="caption" className="w-12 text-center">{sportStatLabel(sport, key)}</Text>
        ))}
      </View>
      {rows.map((row) => {
        const href =
          mode === 'byGame'
            ? { pathname: '/games/[gameId]' as const, params: { gameId: row.gameId } }
            : { pathname: '/players/[playerId]' as const, params: { playerId: row.playerId } }
        const label =
          mode === 'byGame'
            ? [new Date(row.gameScheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), row.gameOpponentName ? `vs ${row.gameOpponentName}` : null]
                .filter(Boolean)
                .join(' · ')
            : row.playerName

        return (
          <Link key={row.id} href={href} asChild>
            <Pressable className="px-lg py-sm border-b border-border active:bg-surface">
              <View className="flex-row items-center">
                <Text className="flex-1" numberOfLines={1}>{label}</Text>
                {statKeys.map((key) => (
                  <Text key={key} className="w-12 text-center">{formattedSportStat(sport, row, key)}</Text>
                ))}
              </View>
              {row.disputeNote ? <DisputeFootnote note={row.disputeNote} className="pt-xs" /> : null}
            </Pressable>
          </Link>
        )
      })}
    </View>
  )
}

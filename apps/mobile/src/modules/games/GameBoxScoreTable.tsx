import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { DisputeFootnote } from '@/modules/disputes/DisputeFootnote'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ClipboardList } from 'lucide-react-native'

type GameStatLine = components['schemas']['GameStatLine']

export interface GameBoxScoreTableProps {
  lines: GameStatLine[]
  playerNameById: Record<string, string>
  className?: string
}

// "Tables appear only in research/deep stats contexts" (docs) — this is one
// of those contexts (post-game box score), so a compact table is appropriate
// here even though profile pages avoid table-first layouts.
export function GameBoxScoreTable({ lines, playerNameById, className }: GameBoxScoreTableProps) {
  if (lines.length === 0) {
    return <EmptyState icon={ClipboardList} title="No box score yet" description="Stats appear once the game is finalized." />
  }

  return (
    <View className={className}>
      <View className="flex-row px-lg py-sm border-b border-border">
        <Text variant="caption" className="flex-1">Player</Text>
        <Text variant="caption" className="w-10 text-center">PTS</Text>
        <Text variant="caption" className="w-10 text-center">REB</Text>
        <Text variant="caption" className="w-10 text-center">AST</Text>
      </View>
      {lines.map((line) => {
        const rebounds = line.offRebounds + line.defRebounds
        return (
          <View key={line.id} className="px-lg py-sm border-b border-border">
            <View className="flex-row items-center">
              <Text className="flex-1" numberOfLines={1}>{playerNameById[line.playerId] ?? line.playerId}</Text>
              <Text className="w-10 text-center">{line.points}</Text>
              <Text className="w-10 text-center">{rebounds}</Text>
              <Text className="w-10 text-center">{line.assists}</Text>
            </View>
            {line.disputeNote ? <DisputeFootnote note={line.disputeNote} className="pt-xs" /> : null}
          </View>
        )
      })}
    </View>
  )
}

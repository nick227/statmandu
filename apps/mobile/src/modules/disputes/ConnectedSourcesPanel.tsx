import { View } from 'react-native'
import { useDisputes, useSources } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'

export interface ConnectedSourcesPanelProps {
  targetType: 'PLAYER' | 'TEAM' | 'GAME' | 'ATHLETE_PROFILE' | 'GAME_STAT_LINE'
  targetId: string
  className?: string
}

// Reused as-is on Player/Team/Game — same shape, different targetType/targetId.
// Sources and disputes share one tab per the site map's "Sources & Disputes"
// surface rather than splitting into two tabs per entity.
export function ConnectedSourcesPanel({ targetType, targetId, className }: ConnectedSourcesPanelProps) {
  const sourcesQuery = useSources(targetType, targetId)
  const disputesQuery = useDisputes(targetType, targetId)
  const sources = sourcesQuery.data?.data ?? []
  const disputes = disputesQuery.data?.data ?? []

  return (
    <View className={className ?? 'px-lg gap-lg'}>
      <View className="gap-sm">
        <Text className="font-semibold">Sources</Text>
        {sources.length === 0 ? (
          <Text variant="caption">No sources cited yet.</Text>
        ) : (
          sources.map((s) => (
            <View key={s.id} className="flex-row items-center justify-between border-b border-border py-sm">
              <Text>{s.label ?? s.sourceType.replace(/_/g, ' ')}</Text>
              {s.url ? <Text variant="caption">{s.url}</Text> : null}
            </View>
          ))
        )}
      </View>

      <View className="gap-sm">
        <Text className="font-semibold">Disputes</Text>
        {disputes.length === 0 ? (
          <Text variant="caption">No disputes on record.</Text>
        ) : (
          disputes.map((d) => (
            <View key={d.id} className="gap-xs border-b border-border py-sm">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-sm">{d.description}</Text>
                <Badge tone={d.status === 'OPEN' ? 'dispute' : 'verified'}>{d.status}</Badge>
              </View>
              {d.resolutionNote ? <Text variant="caption">{d.resolutionNote}</Text> : null}
            </View>
          ))
        )}
      </View>
    </View>
  )
}

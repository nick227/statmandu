import { View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import type { QueuedLiveEvent } from '@/modules/live-scoring/useLiveScoringSession'

export interface SyncStatusBarProps {
  queue: QueuedLiveEvent[]
  onRetry: () => void
  onDismiss: (localId: string) => void
  className?: string
}

// "Offline/sync status always visible" per the live game stat capture spec —
// props-only (queue state lives in useLiveScoringSession), so this stays
// dumb and easy to reason about independent of the sync logic itself.
export function SyncStatusBar({ queue, onRetry, onDismiss, className }: SyncStatusBarProps) {
  const inFlightCount = queue.filter((e) => e.status === 'pending' || e.status === 'syncing').length
  const failedCount = queue.filter((e) => e.status === 'failed').length
  const rejectedEvents = queue.filter((e) => e.status === 'rejected')

  if (queue.length === 0) {
    return (
      <View className={className ?? 'px-lg py-xs'}>
        <Badge tone="verified">Synced</Badge>
      </View>
    )
  }

  return (
    <View className={className ?? 'gap-xs px-lg py-xs'}>
      <View className="flex-row items-center gap-sm">
        {inFlightCount > 0 ? <Badge tone="live">{`Syncing ${inFlightCount}`}</Badge> : null}
        {failedCount > 0 ? (
          <>
            <Badge tone="dispute">{`${failedCount} pending sync`}</Badge>
            <Button size="sm" variant="secondary" onPress={onRetry}>Retry Now</Button>
          </>
        ) : null}
      </View>
      {rejectedEvents.map((event) => (
        <View key={event.localId} className="flex-row items-center justify-between">
          <Text variant="caption" className="text-dispute flex-1">
            {`${event.type.replace(/_/g, ' ')} event was rejected — not saved.`}
          </Text>
          <Button size="sm" variant="ghost" onPress={() => onDismiss(event.localId)}>Dismiss</Button>
        </View>
      ))}
    </View>
  )
}

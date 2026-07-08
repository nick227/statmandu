import { View } from 'react-native'
import { ShieldAlert } from 'lucide-react-native'
import { useGameConflicts, useMarkGameConflictDisputed, useResolveGameConflict } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { EmptyState } from '@/shared/ui/EmptyState'

export interface ConnectedConflictQueueProps {
  gameId: string
  playerNameById?: Record<string, string>
  className?: string
}

// Manager-only view — reporters submitting events don't see this, only
// OFFICIAL_SCORER/ADMIN_OWNER (gated by the caller checking a manager role).
// No reporter list endpoint exists yet, so conflicting submissions are
// disambiguated by timestamp only, not by reporter name — see CLAUDE.md.
export function ConnectedConflictQueue({ gameId, playerNameById = {}, className }: ConnectedConflictQueueProps) {
  const conflictsQuery = useGameConflicts(gameId)
  const resolve = useResolveGameConflict(gameId)
  const markDisputed = useMarkGameConflictDisputed(gameId)
  const conflicts = conflictsQuery.data?.data ?? []

  if (conflicts.length === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No open conflicts"
        description="Reporter logs agree so far."
        className={className ?? 'items-center justify-center py-lg px-lg gap-sm'}
      />
    )
  }

  return (
    <View className={className ?? 'gap-md px-lg'}>
      <Text className="font-semibold">Conflicts ({conflicts.length})</Text>
      {conflicts.map((conflict) => {
        const firstEvent = conflict.events[0]
        const playerName = firstEvent?.playerId ? playerNameById[firstEvent.playerId] ?? firstEvent.playerId : 'Unknown player'
        return (
          <Card key={conflict.id}>
            <CardContent className="gap-sm">
              <Text className="font-semibold">{playerName} — {firstEvent?.type.replace(/_/g, ' ') ?? 'event'}</Text>
              <Text variant="caption">{conflict.events.length} conflicting reports — pick the correct one</Text>
              {conflict.events.map((event) => (
                <Button
                  key={event.id}
                  variant="secondary"
                  size="sm"
                  isLoading={resolve.isPending}
                  onPress={() => resolve.mutate({ conflictId: conflict.id, resolvedEventId: event.id })}
                >
                  {`Accept ${new Date(event.clientTimestamp).toLocaleTimeString()}`}
                </Button>
              ))}
              <Button
                variant="destructive"
                size="sm"
                isLoading={markDisputed.isPending}
                onPress={() => markDisputed.mutate(conflict.id)}
              >
                Mark Disputed
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </View>
  )
}

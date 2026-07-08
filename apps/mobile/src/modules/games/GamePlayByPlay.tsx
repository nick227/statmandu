import { View } from 'react-native'
import { Radio } from 'lucide-react-native'
import { getSportDefinition } from '@statman/sports'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { EmptyState } from '@/shared/ui/EmptyState'

type GameEvent = components['schemas']['GameEvent']

const DISPUTED_STATUSES = new Set(['CONFLICTING', 'DISPUTED'])

export interface GamePlayByPlayProps {
  sport: string
  events: GameEvent[]
  playerNameById: Record<string, string>
  teamNameById: Record<string, string>
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

// The game's story, told chronologically from real captured events — not a
// summary, the actual sequence a reporter (or corroborating reporters)
// entered live. Distinct from Box Score (aggregated totals) and Top
// Performers (derived highlights): this is play-by-play, one row per thing
// that happened. Disputed/conflicting events are shown, not hidden, flagged
// the same way the live spectator timeline already does.
export function GamePlayByPlay({
  sport,
  events,
  playerNameById,
  teamNameById,
  emptyTitle = 'No plays recorded',
  emptyDescription = 'Play-by-play appears once events are captured for this game.',
  className,
}: GamePlayByPlayProps) {
  if (events.length === 0) {
    return <EmptyState icon={Radio} title={emptyTitle} description={emptyDescription} />
  }

  const definition = getSportDefinition(sport)

  return (
    <View className={className ?? 'px-lg gap-sm'}>
      {events.map((event) => {
        const eventDefinition = definition.events[event.type]
        const label = eventDefinition?.label ?? event.type.replace(/_/g, ' ')
        const playerName = event.playerId ? playerNameById[event.playerId] : null
        const teamName = event.teamId ? teamNameById[event.teamId] : null
        const isScoring = Boolean(eventDefinition?.points)
        const title = [playerName, label].filter(Boolean).join(' — ') || label

        return (
          <View key={event.id} className="flex-row items-start justify-between gap-sm border-b border-border py-sm">
            <View className="flex-1 gap-xs">
              <Text className={isScoring ? 'font-semibold' : undefined} numberOfLines={2}>
                {title}
              </Text>
              {teamName ? <Text variant="caption">{teamName}</Text> : null}
            </View>
            <View className="items-end gap-xs">
              <Text variant="caption">
                {new Date(event.clientTimestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </Text>
              {DISPUTED_STATUSES.has(event.status) ? <Badge tone="dispute">Disputed</Badge> : null}
            </View>
          </View>
        )
      })}
    </View>
  )
}

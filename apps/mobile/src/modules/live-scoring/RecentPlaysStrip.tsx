import { Pressable, View } from 'react-native'
import { Undo2 } from 'lucide-react-native'
import { getSportDefinition } from '@statman/sports'
import type { components } from '@statman/sdk'
import { useNativeColor } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'

type GameEvent = components['schemas']['GameEvent']

const UNDOABLE_STATUSES = new Set(['ACCEPTED', 'PENDING'])

export interface RecentPlaysStripProps {
  sport: string
  events: GameEvent[]
  playerById: Record<string, { jerseyNumber: string | number | null; name: string }>
  onUndo: (eventId: string) => void
  undoingEventId?: string | null
  // Track-a-Player mode: only that player's own plays, not the whole game's
  // — a single-player tracker doesn't need to see every other player's taps.
  filterPlayerId?: string | null
  className?: string
}

// A scorer's real failure mode isn't "I mis-tapped the last thing," it's
// "I notice two plays later that a rebound was wrong." A single "Undo Last"
// button can't fix that. This shows the last 3 confirmed plays with
// per-row undo — CONFLICTING/DISPUTED events are still shown (so the strip
// stays an honest record) but don't get an undo affordance, since undoing an
// event already in a corroboration group has real, unresolved backend edge
// cases (see CLAUDE.md) that this UI deliberately doesn't invite.
export function RecentPlaysStrip({ sport, events, playerById, onUndo, undoingEventId, filterPlayerId, className }: RecentPlaysStripProps) {
  const mutedColor = useNativeColor('mutedText')
  const scoped = filterPlayerId ? events.filter((e) => e.playerId === filterPlayerId) : events
  if (scoped.length === 0) return null

  const definition = getSportDefinition(sport)
  const recent = [...scoped].slice(-3).reverse()

  return (
    <View className={className ?? 'px-lg gap-xs'}>
      {recent.map((event) => {
        const eventDefinition = definition.events[event.type]
        const label = eventDefinition?.label ?? event.type.replace(/_/g, ' ')
        const player = event.playerId ? playerById[event.playerId] : null
        const canUndo = UNDOABLE_STATUSES.has(event.status)
        return (
          <View key={event.id} className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-sm py-xs">
            {player ? (
              <View className="h-7 w-7 items-center justify-center rounded bg-sport-accent/15">
                <Text className="font-bold text-xs text-sport-accent">{player.jerseyNumber ?? '–'}</Text>
              </View>
            ) : null}
            <Text className="flex-1" numberOfLines={1}>
              {[player?.name, label].filter(Boolean).join(' — ')}
            </Text>
            {canUndo ? (
              <Pressable
                onPress={() => onUndo(event.id)}
                disabled={undoingEventId === event.id}
                hitSlop={8}
                className={undoingEventId === event.id ? 'opacity-40' : undefined}
              >
                <Undo2 size={16} color={mutedColor} />
              </Pressable>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

import { Users } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SheetScrollView } from '@/shared/ui/Sheet'
import { PlayerPickRow } from '@/modules/live-scoring/PlayerPickRow'

type RosterMembership = components['schemas']['RosterMembership']

export interface PlayerSwitchSheetProps {
  roster: RosterMembership[]
  selectedPlayerId: string | null
  onSelect: (playerId: string) => void
  fouledOutPlayerIds?: string[]
  title?: string
}

// Content-only — rendered inside the live-scoring screen's single shared
// Sheet instance (see LiveScoringSessionScreen), not a Sheet of its own.
// Replaces the always-visible horizontal roster strip so the event pad can
// stay the dominant thing on screen; opened from the active-player chip.
export function PlayerSwitchSheet({ roster, selectedPlayerId, onSelect, fouledOutPlayerIds = [], title = 'Switch player' }: PlayerSwitchSheetProps) {
  if (roster.length === 0) {
    return <EmptyState icon={Users} title="No roster yet" description="Select a team to see its players." />
  }

  return (
    <SheetScrollView contentContainerClassName="pb-xxl">
      <Text className="font-semibold px-lg pb-sm">{title}</Text>
      {roster.map((m) => (
        <PlayerPickRow
          key={m.id}
          membership={m}
          isSelected={selectedPlayerId === m.player.id}
          isFouledOut={fouledOutPlayerIds.includes(m.player.id)}
          onPress={() => onSelect(m.player.id)}
        />
      ))}
    </SheetScrollView>
  )
}

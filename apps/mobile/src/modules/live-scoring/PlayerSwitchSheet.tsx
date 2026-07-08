import { Pressable } from 'react-native'
import { Users } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Avatar } from '@/shared/ui/Avatar'
import { Text } from '@/shared/ui/Text'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SheetScrollView } from '@/shared/ui/Sheet'

type RosterMembership = components['schemas']['RosterMembership']

export interface PlayerSwitchSheetProps {
  roster: RosterMembership[]
  selectedPlayerId: string | null
  onSelect: (playerId: string) => void
  title?: string
}

// Content-only — rendered inside the live-scoring screen's single shared
// Sheet instance (see LiveScoringSessionScreen), not a Sheet of its own.
// Replaces the always-visible horizontal roster strip so the event pad can
// stay the dominant thing on screen; opened from the active-player chip.
export function PlayerSwitchSheet({ roster, selectedPlayerId, onSelect, title = 'Switch player' }: PlayerSwitchSheetProps) {
  if (roster.length === 0) {
    return <EmptyState icon={Users} title="No roster yet" description="Select a team to see its players." />
  }

  return (
    <SheetScrollView contentContainerClassName="pb-xxl">
      <Text className="font-semibold px-lg pb-sm">{title}</Text>
      {roster.map((m) => {
        const name = `${m.player.athleteProfile.firstName} ${m.player.athleteProfile.lastName}`
        const isSelected = selectedPlayerId === m.player.id
        return (
          <Pressable
            key={m.id}
            onPress={() => onSelect(m.player.id)}
            className={`flex-row items-center gap-md px-lg py-sm border-b border-border ${isSelected ? 'bg-brand/10' : ''}`}
          >
            <Text variant="caption" className="w-8 text-center">{m.jerseyNumber ?? m.player.jerseyNumber ?? '-'}</Text>
            <Avatar uri={m.player.athleteProfile.avatarUrl} fallback={name} size="sm" />
            <Text className="flex-1 font-semibold">{name}</Text>
          </Pressable>
        )
      })}
    </SheetScrollView>
  )
}

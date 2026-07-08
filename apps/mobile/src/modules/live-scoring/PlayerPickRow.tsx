import { Pressable, View } from 'react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'

type RosterMembership = components['schemas']['RosterMembership']

export interface PlayerPickRowProps {
  membership: RosterMembership
  isSelected?: boolean
  isFouledOut?: boolean
  onPress: () => void
}

// Jersey number leads, name is secondary — matches how a scorer (or a
// broadcaster glancing at a monitor) actually identifies a player during
// live action: by the number on their back, not by reading a name. Shared
// by PlayerSwitchSheet and SubstitutionPicker so the one visual rule lives
// in one place instead of being restyled twice.
export function PlayerPickRow({ membership, isSelected, isFouledOut, onPress }: PlayerPickRowProps) {
  const jersey = membership.jerseyNumber ?? membership.player.jerseyNumber ?? '–'
  const name = `${membership.player.athleteProfile.firstName} ${membership.player.athleteProfile.lastName}`
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-md px-lg py-sm border-b border-border active:opacity-70 ${isSelected ? 'bg-brand/10' : ''}`}
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-sport-accent/15">
        <Text className="font-bold text-lg text-sport-accent">{jersey}</Text>
      </View>
      <Text className="flex-1 font-semibold" numberOfLines={1}>{name}</Text>
      {/* Flagged, not blocked — a scorer occasionally needs to correct a
          mistaken foul entry, so selection stays allowed even fouled out. */}
      {isFouledOut ? <Badge tone="dispute">OUT</Badge> : null}
    </Pressable>
  )
}

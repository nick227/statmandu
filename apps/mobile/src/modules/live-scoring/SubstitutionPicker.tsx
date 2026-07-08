import { useState } from 'react'
import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { SheetScrollView } from '@/shared/ui/Sheet'
import { PlayerPickRow } from '@/modules/live-scoring/PlayerPickRow'

type RosterMembership = components['schemas']['RosterMembership']

export interface SubstitutionPickerProps {
  roster: RosterMembership[]
  onComplete: (outgoingPlayerId: string, incomingPlayerId: string) => void
  onCancel: () => void
}

// The one concrete use of EventDefinition.confirmationMode: 'detail' +
// requiresSecondaryPlayer (SUBSTITUTION_IN) — a real two-player swap
// instead of a single disconnected substitution tap. No backend change
// needed: it submits two ordinary events (SUBSTITUTION_OUT then
// SUBSTITUTION_IN), each already supported by the existing single-player
// submitEvent endpoint — requiresSecondaryPlayer drives this UI step, it
// isn't a second field on the API request.
export function SubstitutionPicker({ roster, onComplete, onCancel }: SubstitutionPickerProps) {
  const [outgoingId, setOutgoingId] = useState<string | null>(null)
  const candidates = outgoingId ? roster.filter((m) => m.player.id !== outgoingId) : roster

  return (
    <SheetScrollView contentContainerClassName="pb-xxl">
      <View className="flex-row items-center justify-between px-lg pb-sm">
        <Text className="font-semibold">{outgoingId ? "Who's coming in?" : "Who's coming out?"}</Text>
        <Button variant="ghost" size="sm" onPress={outgoingId ? () => setOutgoingId(null) : onCancel}>
          {outgoingId ? 'Back' : 'Cancel'}
        </Button>
      </View>
      {candidates.map((m) => (
        <PlayerPickRow
          key={m.id}
          membership={m}
          onPress={() => (outgoingId ? onComplete(outgoingId, m.player.id) : setOutgoingId(m.player.id))}
        />
      ))}
    </SheetScrollView>
  )
}

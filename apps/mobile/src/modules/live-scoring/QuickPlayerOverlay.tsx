import { Modal, Pressable, View } from 'react-native'
import type { components } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'

type RosterMembership = components['schemas']['RosterMembership']

export interface QuickPlayerOverlayProps {
  visible: boolean
  roster: RosterMembership[]
  title?: string
  selectedPlayerId?: string | null
  onSelect: (playerId: string) => void
  onRequestClose: () => void
  className?: string
}

export function QuickPlayerOverlay({
  visible,
  roster,
  title = 'Select player',
  selectedPlayerId,
  onSelect,
  onRequestClose,
  className,
}: QuickPlayerOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable onPress={onRequestClose} className="flex-1 bg-black/60">
        <Pressable
          onPress={() => null}
          className={cn(
            'mx-lg mt-auto mb-lg rounded-xl border border-border bg-surface p-lg',
            className
          )}
        >
          <Text className="font-semibold pb-md">{title}</Text>
          <View className="flex-row flex-wrap gap-sm">
            {roster.map((m) => {
              const jersey = m.jerseyNumber ?? m.player.jerseyNumber ?? '–'
              const name = `${m.player.athleteProfile.firstName} ${m.player.athleteProfile.lastName}`
              const isSelected = selectedPlayerId === m.player.id
              return (
                <Pressable
                  key={m.id}
                  onPress={() => onSelect(m.player.id)}
                  className={cn(
                    'min-w-[48%] flex-1 rounded-md border px-md py-sm active:opacity-70',
                    isSelected ? 'border-sport-accent bg-sport-accent/10' : 'border-border'
                  )}
                >
                  <View className="flex-row items-center gap-sm">
                    <View className="h-9 w-9 items-center justify-center rounded-md bg-sport-accent/15">
                      <Text className="font-bold text-sport-accent">{String(jersey)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold" numberOfLines={1}>
                        {name}
                      </Text>
                      <Text variant="caption" numberOfLines={1}>
                        Tap to log
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}


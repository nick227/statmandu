import { Modal, Pressable, View } from 'react-native'
import { X } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'

export interface CardAuthenticitySheetProps {
  visible: boolean
  onClose: () => void
  originHash?: string | null
}

// Plain Modal rather than the gorhom Sheet used on entity profiles — this
// screen isn't built on EntityProfileShell, so there's no persistent Sheet
// instance to snap open on demand; a self-contained modal is simpler here.
export function CardAuthenticitySheet({ visible, onClose, originHash }: CardAuthenticitySheetProps) {
  const mutedTextColor = useNativeColor('mutedText')

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable className="gap-md rounded-t-lg bg-surface p-lg" onPress={(e) => e.stopPropagation()}>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold">What makes this authentic?</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={mutedTextColor} />
            </Pressable>
          </View>

          <Text>Origin hash proves this card was issued by Statman with this athlete/game/stat snapshot.</Text>

          {originHash ? (
            <View className="rounded-md border border-border bg-canvas p-sm">
              <Text variant="caption">Origin hash</Text>
              <Text className="font-mono" numberOfLines={1}>{originHash}</Text>
            </View>
          ) : null}

          <Text variant="caption">
            A Statman Card is a digital collectible, not a financial instrument. Claiming one does not transfer
            legal ownership of any image, likeness, or statistic — the edition number and origin hash exist to
            prove a card's authenticity within Statman, nothing more.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

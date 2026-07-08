import { Modal, Pressable, View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'

export type FollowUpOption = {
  id: string
  label: string
  tone?: 'primary' | 'secondary' | 'destructive'
  onPress: () => void
}

export interface EventFollowUpModalProps {
  visible: boolean
  title: string
  description?: string
  options: FollowUpOption[]
  onRequestClose: () => void
  className?: string
}

export function EventFollowUpModal({
  visible,
  title,
  description,
  options,
  onRequestClose,
  className,
}: EventFollowUpModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable onPress={onRequestClose} className="flex-1 bg-black/60">
        <Pressable
          onPress={() => null}
          className={cn('mx-lg mt-auto mb-lg rounded-xl border border-border bg-surface p-lg gap-md', className)}
        >
          <View className="gap-xs">
            <Text className="text-lg font-bold">{title}</Text>
            {description ? <Text variant="caption">{description}</Text> : null}
          </View>
          <View className="gap-sm">
            {options.map((opt) => (
              <Button
                key={opt.id}
                variant={opt.tone ?? 'secondary'}
                size="lg"
                onPress={opt.onPress}
              >
                {opt.label}
              </Button>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}


import React from 'react'
import { Pressable, View } from 'react-native'
import { Check, ZoomIn } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { StudioAppearanceState } from '@/modules/designs/flagshipDesigns'

export interface ArtworkAdjustControlsProps {
  appearance: StudioAppearanceState
  onUpdate: (patch: Partial<StudioAppearanceState>) => void
}

const BORDER_SIZES = [0, 4, 8, 16]

export function ArtworkAdjustControls({
  appearance,
  onUpdate,
}: ArtworkAdjustControlsProps) {
  const brandColor = useNativeColor('brand')
  const currentBorder = appearance.borderWidth ?? 0

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-sm font-semibold text-text">
          Artwork Framing
        </Text>
        <Text variant="caption" className="text-xs text-muted-text">
          Adjust the framing and presentation of the selected image:
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-semibold text-text">
          Border Thickness
        </Text>
        <View className="flex-row gap-2">
          {BORDER_SIZES.map((sz) => {
            const isSelected = currentBorder === sz
            return (
              <Pressable
                key={sz}
                testID={`artwork-border-${sz}`}
                onPress={() => onUpdate({ borderWidth: sz })}
                className={cn(
                  'flex-1 rounded-xl border p-3 items-center justify-center active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10'
                    : 'border-border/80 bg-surface hover:border-brand/40'
                )}
              >
                <Text className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-text')}>
                  {sz === 0 ? 'None' : `${sz}px`}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

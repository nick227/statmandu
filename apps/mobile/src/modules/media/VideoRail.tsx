import { ScrollView, View } from 'react-native'
import type { components } from '@statman/sdk'
import { ConnectedVideoCard } from '@/modules/media/ConnectedVideoCard'
import type { YouTubeVideoVariant } from '@/shared/media/videoVariants'

type MediaAsset = components['schemas']['MediaAsset']

export interface VideoRailProps {
  items: MediaAsset[]
  variant?: Extract<YouTubeVideoVariant, 'rail' | 'tile'>
  cardClassName?: string
  onItemPress: (index: number) => void
  className?: string
}

export function VideoRail({ items, variant = 'rail', cardClassName, onItemPress, className }: VideoRailProps) {
  if (items.length === 0) return null

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName={className ?? 'gap-sm'}>
      {items.map((item, index) => (
        <View key={item.id} className={cardClassName ?? (variant === 'rail' ? 'w-[68%]' : 'w-[48%]')}>
          <ConnectedVideoCard item={item} variant={variant} onPress={() => onItemPress(index)} />
        </View>
      ))}
    </ScrollView>
  )
}

import { Pressable, View } from 'react-native'
import { Video } from 'lucide-react-native'
import { YouTubeVideoCard } from '@/shared/media/YouTubeVideoCard'
import { SmartImage } from '@/shared/media/SmartImage'
import { EmptyState } from '@/shared/ui/EmptyState'

export type MediaGridItem =
  | { id: string; kind: 'video'; youtubeVideoId: string; title?: string | null }
  | { id: string; kind: 'photo'; imageUri: string; title?: string | null }

export interface MediaGridProps {
  items: MediaGridItem[]
  onItemPress: (index: number) => void
  className?: string
}

export function MediaGrid({ items, onItemPress, className }: MediaGridProps) {
  if (items.length === 0) {
    return <EmptyState icon={Video} title="No media attached yet" />
  }

  return (
    <View className={className ?? 'flex-row flex-wrap gap-xs'}>
      {items.map((item, index) =>
        item.kind === 'video' ? (
          <YouTubeVideoCard
            key={item.id}
            videoId={item.youtubeVideoId}
            variant="grid"
            onPress={() => onItemPress(index)}
            className="active:opacity-80"
            style={{ width: '32.5%' }}
          />
        ) : (
          <Pressable
            key={item.id}
            onPress={() => onItemPress(index)}
            className="aspect-square overflow-hidden rounded-md active:opacity-80"
            style={{ width: '32.5%' }}
          >
            <SmartImage uri={item.imageUri} className="h-full w-full" resizeMode="cover" />
          </Pressable>
        )
      )}
    </View>
  )
}

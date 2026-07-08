import { Pressable, View } from 'react-native'
import { Video } from 'lucide-react-native'
import { YouTubeVideoCard } from '@/shared/media/YouTubeVideoCard'
import { EmptyState } from '@/shared/ui/EmptyState'

export interface MediaGridItem {
  id: string
  youtubeVideoId: string
  title?: string | null
}

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
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onItemPress(index)}
          className="active:opacity-80"
          style={{ width: '32.5%' }}
        >
          <YouTubeVideoCard videoId={item.youtubeVideoId} variant="grid" />
        </Pressable>
      ))}
    </View>
  )
}

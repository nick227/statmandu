import { useState } from 'react'
import { Dimensions, FlatList, Pressable, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { VideoStage } from './VideoStage'

export interface MediaCarouselItem {
  id: string
  youtubeVideoId: string
  title?: string | null
}

export interface MediaCarouselProps {
  items: MediaCarouselItem[]
  height?: number
  className?: string
  onItemPress?: (index: number) => void
}

export function MediaCarousel({ items, height = 420, className, onItemPress }: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const width = Dimensions.get('window').width

  if (items.length === 0) return null

  function handleMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))
  }

  return (
    <View className={className} style={{ height }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item, index }) => (
          <VideoStage
            videoId={item.youtubeVideoId}
            mode="chrome"
            width={width}
            height={height}
            onPlayRequest={() => onItemPress?.(index)}
          />
        )}
      />
      {items.length > 1 ? (
        <View pointerEvents="none" className="absolute inset-x-0 bottom-4 flex-row items-center justify-center gap-xs">
          {items.map((item, i) => (
            <View key={item.id} className={i === activeIndex ? 'h-1.5 w-4 rounded-full bg-white' : 'h-1.5 w-1.5 rounded-full bg-white/40'} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

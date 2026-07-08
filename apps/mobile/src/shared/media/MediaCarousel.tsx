import { useState } from 'react'
import { Dimensions, FlatList, Linking, Pressable, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { YouTubeVideoCardThumb } from './YouTubeVideoCard'
import { youtubeWatchUrl } from './youtube'

export interface MediaCarouselItem {
  id: string
  youtubeVideoId: string
  title?: string | null
}

export interface MediaCarouselProps {
  items: MediaCarouselItem[]
  height?: number
  className?: string
  /** Called with the tapped index instead of the default tap-out-to-YouTube
   *  behavior — e.g. escalate to the full-screen immersive viewer. */
  onItemPress?: (index: number) => void
}

// A swipeable, paged stage for all of an entity's attached media — the
// "video/photo carousel" called for in the wireframes, replacing a single
// static hero video. Taps out to YouTube directly by default (no in-app
// player/new dependency needed, same pattern as YouTubeEmbed elsewhere) —
// pass onItemPress to redirect the tap instead, e.g. to open
// FullScreenMediaViewer for the half-screen-hero → full-screen tier jump.
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
          <Pressable
            style={{ width, height }}
            onPress={() => (onItemPress ? onItemPress(index) : Linking.openURL(youtubeWatchUrl(item.youtubeVideoId)))}
          >
            <YouTubeVideoCardThumb videoId={item.youtubeVideoId} variant="hero" className="h-full rounded-none" />
          </Pressable>
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

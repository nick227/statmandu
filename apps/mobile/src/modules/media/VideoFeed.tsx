import { useEffect, useRef } from 'react'
import { AppState, FlatList, View, useWindowDimensions, type ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'
import type { components } from '@statman/sdk'
import { VideoFeedCard } from '@/modules/media/VideoFeedCard'
import { VideoPlaybackProvider, useVideoPlayback } from '@/shared/media'

type MediaAsset = components['schemas']['MediaAsset']

export interface VideoFeedProps {
  items: MediaAsset[]
  stageWidth?: number
}

function VideoFeedList({ items, stageWidth }: { items: MediaAsset[]; stageWidth?: number }) {
  const { width } = useWindowDimensions()
  const resolvedWidth = stageWidth ?? width
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  const { activeVideoId, setActiveVideoId } = useVideoPlayback()

  const stateRef = useRef({ activeVideoId, setActiveVideoId })
  stateRef.current = { activeVideoId, setActiveVideoId }

  useEffect(() => {
    if (!isFocused) {
      setActiveVideoId(null)
    }
  }, [isFocused, setActiveVideoId])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') {
        setActiveVideoId(null)
      }
    })
    return () => subscription.remove()
  }, [setActiveVideoId])

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 30 }).current

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const { activeVideoId: currentActive, setActiveVideoId: set } = stateRef.current
    if (currentActive) {
      const isStillVisible = viewableItems.some((v) => v.item.id === currentActive)
      if (!isStillVisible) {
        set(null)
      }
    }
  }).current

  return (
    <View className="flex-1 bg-canvas" style={{ width: resolvedWidth }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 16, gap: 24 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <VideoFeedCard
            item={item}
            isActive={item.id === activeVideoId}
            onPlay={() => setActiveVideoId(item.id)}
          />
        )}
      />
    </View>
  )
}

export function VideoFeed({ items, stageWidth }: VideoFeedProps) {
  return (
    <VideoPlaybackProvider>
      <VideoFeedList items={items} stageWidth={stageWidth} />
    </VideoPlaybackProvider>
  )
}

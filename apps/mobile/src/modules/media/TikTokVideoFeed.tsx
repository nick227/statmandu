import { useCallback, useRef, useState } from 'react'
import { FlatList, View, useWindowDimensions, type ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { components } from '@statman/sdk'
import { useImmersiveFilmStageHeight } from '@/lib/videoViewport'
import { TikTokVideoPage } from '@/modules/media/TikTokVideoPage'
import { Text } from '@/shared/ui/Text'

type MediaAsset = components['schemas']['MediaAsset']

export interface TikTokVideoFeedProps {
  items: MediaAsset[]
}

export function TikTokVideoFeed({ items }: TikTokVideoFeedProps) {
  const pageHeight = useImmersiveFilmStageHeight()
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [activeIndex, setActiveIndex] = useState(0)
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 85 }).current

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const next = viewableItems[0]?.index
    if (typeof next === 'number') setActiveIndex(next)
  }, [])

  return (
    <View className="flex-1 bg-black" style={{ width }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={pageHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: pageHeight, offset: pageHeight * index, index })}
        renderItem={({ item, index }) => (
          <TikTokVideoPage
            item={item}
            isActive={index === activeIndex}
            preload={index === activeIndex + 1}
            pageHeight={pageHeight}
          />
        )}
      />
      {items.length > 1 ? (
        <Text
          variant="caption"
          className="absolute inset-x-0 text-center text-white/60"
          style={{ bottom: insets.bottom + 12 }}
        >
          {activeIndex + 1} / {items.length}
        </Text>
      ) : null}
    </View>
  )
}

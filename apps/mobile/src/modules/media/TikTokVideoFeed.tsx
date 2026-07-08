import { useCallback, useRef, useState } from 'react'
import { FlatList, View, useWindowDimensions, type ViewToken } from 'react-native'
import type { components } from '@statman/sdk'
import { TikTokVideoPage } from '@/modules/media/TikTokVideoPage'
import { VIDEOS_COPY } from '@/modules/media/videosContent'
import { Text } from '@/shared/ui/Text'

type MediaAsset = components['schemas']['MediaAsset']

export interface TikTokVideoFeedProps {
  items: MediaAsset[]
  onOpenViewer: (index: number) => void
}

export function TikTokVideoFeed({ items, onOpenViewer }: TikTokVideoFeedProps) {
  const { height } = useWindowDimensions()
  const pageHeight = height - 120
  const [activeIndex, setActiveIndex] = useState(0)
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const next = viewableItems[0]?.index
    if (typeof next === 'number') setActiveIndex(next)
  }, [])

  return (
    <View className="gap-sm">
      <Text variant="caption" className="px-lg text-muted-text">{VIDEOS_COPY.actions.swipeHint}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={pageHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({ length: pageHeight, offset: pageHeight * index, index })}
        renderItem={({ item, index }) => (
          <TikTokVideoPage item={item} onOpenViewer={() => onOpenViewer(index)} />
        )}
      />
      {items.length > 1 ? (
        <Text variant="caption" className="text-center text-muted-text">{activeIndex + 1} / {items.length}</Text>
      ) : null}
    </View>
  )
}

import { Linking, Pressable, View, useWindowDimensions } from 'react-native'
import { Play } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { SmartImage, mediaFilmLabelForTarget, youtubeThumbnailUrl, youtubeWatchUrl } from '@/shared/media'
import { Text } from '@/shared/ui/Text'

type MediaAsset = components['schemas']['MediaAsset']

export interface TikTokVideoPageProps {
  item: MediaAsset
  onOpenViewer: () => void
}

export function TikTokVideoPage({ item, onOpenViewer }: TikTokVideoPageProps) {
  const { height, width } = useWindowDimensions()
  const pageHeight = height - 120
  const filmLabel = mediaFilmLabelForTarget(item.targetType)

  return (
    <Pressable style={{ height: pageHeight, width }} className="overflow-hidden bg-black" onPress={onOpenViewer}>
      <SmartImage uri={youtubeThumbnailUrl(item.youtubeVideoId)} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View className="absolute inset-x-0 bottom-0 h-1/2 bg-black/60" />
      <View className="absolute left-lg top-lg rounded-pill border border-white/20 bg-black/45 px-sm py-xs">
        <Text variant="statLabel" className="text-white">{filmLabel}</Text>
      </View>
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <View className="h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/50">
          <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>
      <View className="absolute inset-x-0 bottom-0 gap-sm p-lg pb-xl">
        {item.title ? <Text className="font-semibold text-white">{item.title}</Text> : null}
        <Pressable
          onPress={() => Linking.openURL(youtubeWatchUrl(item.youtubeVideoId))}
          className="self-start rounded-pill border border-white/25 bg-white/10 px-md py-xs"
        >
          <Text variant="caption" className="font-semibold text-white">YouTube</Text>
        </Pressable>
      </View>
    </Pressable>
  )
}

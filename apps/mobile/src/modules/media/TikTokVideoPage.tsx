import { Linking, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { UserRound } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { FilmLabelBadge, PlayOverlay, SmartImage, YouTubePlayer, isMediaTargetType, mediaFilmLabelForTarget, mediaTargetActionLabel, mediaTargetHref, youtubeThumbnailUrl, youtubeWatchUrl } from '@/shared/media'
import { Text } from '@/shared/ui/Text'

type MediaAsset = components['schemas']['MediaAsset']

export interface TikTokVideoPageProps {
  item: MediaAsset
  isActive: boolean
  pageHeight: number
}

export function TikTokVideoPage({ item, isActive, pageHeight }: TikTokVideoPageProps) {
  const router = useRouter()
  const filmLabel = mediaFilmLabelForTarget(item.targetType)
  const targetType = isMediaTargetType(item.targetType) ? item.targetType : null
  const targetActionLabel = targetType ? mediaTargetActionLabel(targetType) : null

  function handleViewTarget() {
    if (!targetType) return
    const href = mediaTargetHref(targetType, item.targetId)
    if (href) router.push(href)
  }

  return (
    <View style={{ height: pageHeight, width: '100%' }} className="overflow-hidden bg-black">
      {isActive ? (
        <YouTubePlayer videoId={item.youtubeVideoId} autoplay className="absolute inset-0" style={{ height: pageHeight }} />
      ) : (
        <>
          <SmartImage uri={youtubeThumbnailUrl(item.youtubeVideoId)} className="absolute inset-0 h-full w-full" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/25" />
          <PlayOverlay variant="hero" />
        </>
      )}

      <View className="absolute left-lg top-lg z-10">
        <FilmLabelBadge label={filmLabel} tone="light" />
      </View>

      <View className="absolute inset-x-0 bottom-0 gap-sm bg-black/55 px-lg pb-lg pt-12">
        {item.title ? <Text className="font-semibold text-white" numberOfLines={2}>{item.title}</Text> : null}
        <View className="flex-row flex-wrap gap-sm">
          {targetType && targetActionLabel ? (
            <Pressable onPress={handleViewTarget} className="flex-row items-center gap-xs rounded-pill border border-white/25 bg-white/10 px-md py-xs">
              <UserRound size={14} color="#FFFFFF" />
              <Text variant="caption" className="font-semibold text-white">{targetActionLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => Linking.openURL(youtubeWatchUrl(item.youtubeVideoId))}
            className="rounded-pill border border-white/20 bg-white/10 px-md py-xs"
          >
            <Text variant="caption" className="font-semibold text-white">Open in YouTube</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

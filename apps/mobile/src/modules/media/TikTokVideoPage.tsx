import { Linking, Pressable, View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { UserRound } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { VideoStage, VideoStageChrome, isMediaTargetType, mediaFilmLabelForTarget, mediaTargetActionLabel, mediaTargetHref, youtubeWatchUrl } from '@/shared/media'
import { Text } from '@/shared/ui/Text'

type MediaAsset = components['schemas']['MediaAsset']

export interface TikTokVideoPageProps {
  item: MediaAsset
  isActive: boolean
  preload?: boolean
  pageHeight: number
}

export function TikTokVideoPage({ item, isActive, preload = false, pageHeight }: TikTokVideoPageProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const filmLabel = mediaFilmLabelForTarget(item.targetType)
  const targetType = isMediaTargetType(item.targetType) ? item.targetType : null
  const targetActionLabel = targetType ? mediaTargetActionLabel(targetType) : null

  function handleViewTarget() {
    if (!targetType) return
    const href = mediaTargetHref(targetType, item.targetId)
    if (href) router.push(href)
  }

  return (
    <View style={{ height: pageHeight, width }} className="bg-black">
      <VideoStage
        videoId={item.youtubeVideoId}
        mode="inline"
        width={width}
        height={pageHeight}
        isActive={isActive}
        preload={preload}
      />
      <VideoStageChrome filmLabel={filmLabel} title={item.title} immersive>
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
      </VideoStageChrome>
    </View>
  )
}

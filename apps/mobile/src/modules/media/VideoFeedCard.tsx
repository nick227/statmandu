import { Linking, Pressable, View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { UserRound } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { VideoStage, isMediaTargetType, mediaFilmLabelForTarget, mediaTargetActionLabel, mediaTargetHref, youtubeWatchUrl } from '@/shared/media'
import { Text } from '@/shared/ui/Text'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'

type MediaAsset = components['schemas']['MediaAsset']

export interface VideoFeedCardProps {
  item: MediaAsset
  isActive: boolean
  onPlay: () => void
}

function formatRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${Math.max(1, minutes)}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

export function VideoFeedCard({ item, isActive, onPlay }: VideoFeedCardProps) {
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

  const uploadedBy = item.uploadedBy
  const avatarUrl = uploadedBy?.profile?.avatarUrl
  const displayName = uploadedBy?.profile?.displayName || 'Unknown User'

  // 16:9 aspect ratio for standard YouTube videos
  const videoHeight = (width * 9) / 16

  return (
    <View className="bg-canvas">
      {/* Header */}
      <View className="flex-row items-center px-md py-sm gap-sm">
        {avatarUrl ? (
          <SmartImage uri={avatarUrl} className="h-10 w-10 rounded-full bg-surface" />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <UserRound size={20} color="#888" />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-semibold">{displayName}</Text>
          <View className="flex-row items-center gap-xs">
            <Text variant="caption" className="text-secondary">{formatRelativeTime(item.createdAt)}</Text>
            {filmLabel && (
              <>
                <Text variant="caption" className="text-secondary">•</Text>
                <Text variant="caption" className="text-accent">{filmLabel}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Video Stage */}
      <View className="bg-black" style={{ width, height: videoHeight }}>
        <VideoStage
          videoId={item.youtubeVideoId}
          mode="inline"
          width={width}
          height={videoHeight}
          isActive={isActive}
          onPlayRequest={onPlay}
          interactive={true}
        />
      </View>

      {/* Footer Actions */}
      <View className="px-md py-sm gap-sm">
        {item.title ? (
          <Text className="font-semibold">{item.title}</Text>
        ) : null}
        <View className="flex-row flex-wrap gap-sm">
          {targetType && targetActionLabel ? (
            <Pressable onPress={handleViewTarget} className="flex-row items-center gap-xs rounded-pill border border-border bg-surface px-md py-xs">
              <UserRound size={14} color="#888" />
              <Text variant="caption" className="font-semibold">{targetActionLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => Linking.openURL(youtubeWatchUrl(item.youtubeVideoId))}
            className="flex-row items-center gap-xs rounded-pill border border-border bg-surface px-md py-xs"
          >
            <Text variant="caption" className="font-semibold">Open in YouTube</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

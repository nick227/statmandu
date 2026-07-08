import { Linking, Pressable } from 'react-native'
import { YouTubeVideoCard } from './YouTubeVideoCard'
import { youtubeWatchUrl } from './youtube'

export interface YouTubeEmbedProps {
  videoId: string
  className?: string
}

export function YouTubeEmbed({ videoId, className }: YouTubeEmbedProps) {
  return (
    <YouTubeVideoCard
      videoId={videoId}
      variant="tile"
      className={className}
      onPress={() => Linking.openURL(youtubeWatchUrl(videoId))}
    />
  )
}

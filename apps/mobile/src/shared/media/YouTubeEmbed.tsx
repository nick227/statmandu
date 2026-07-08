import { Pressable } from 'react-native'
import { YouTubeVideoCard } from './YouTubeVideoCard'

export interface YouTubeEmbedProps {
  videoId: string
  className?: string
  onPress?: () => void
}

export function YouTubeEmbed({ videoId, className, onPress }: YouTubeEmbedProps) {
  return (
    <YouTubeVideoCard
      videoId={videoId}
      variant="tile"
      className={className}
      onPress={onPress}
    />
  )
}

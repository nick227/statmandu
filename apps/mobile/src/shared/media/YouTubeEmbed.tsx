import { Linking, Pressable } from 'react-native'
import { SmartImage } from './SmartImage'
import { youtubeThumbnailUrl, youtubeWatchUrl } from './youtube'

export interface YouTubeEmbedProps {
  videoId: string
  className?: string
}

export function YouTubeEmbed({ videoId, className }: YouTubeEmbedProps) {
  return (
    <Pressable onPress={() => Linking.openURL(youtubeWatchUrl(videoId))}>
      <SmartImage uri={youtubeThumbnailUrl(videoId)} className={className} resizeMode="cover" />
    </Pressable>
  )
}

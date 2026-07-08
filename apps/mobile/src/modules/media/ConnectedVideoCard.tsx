import type { components } from '@statman/sdk'
import { YouTubeVideoCard, type YouTubeVideoVariant } from '@/shared/media/YouTubeVideoCard'
import { mediaFilmLabelForTarget } from '@/shared/media/videoTarget'

type MediaAsset = components['schemas']['MediaAsset']

export interface ConnectedVideoCardProps {
  item: MediaAsset
  variant: YouTubeVideoVariant
  subtitle?: string | null
  onPress: () => void
  className?: string
}

export function ConnectedVideoCard({ item, variant, subtitle, onPress, className }: ConnectedVideoCardProps) {
  return (
    <YouTubeVideoCard
      videoId={item.youtubeVideoId}
      title={item.title}
      subtitle={subtitle}
      eyebrow={mediaFilmLabelForTarget(item.targetType)}
      variant={variant}
      className={className}
      onPress={onPress}
    />
  )
}

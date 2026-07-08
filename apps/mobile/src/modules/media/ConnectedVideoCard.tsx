import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { YouTubeVideoCard, type YouTubeVideoVariant } from '@/shared/media/YouTubeVideoCard'
import { mediaFilmLabelForTarget, mediaTargetHref, isMediaTargetType } from '@/shared/media/videoTarget'

type MediaAsset = components['schemas']['MediaAsset']

export interface ConnectedVideoCardProps {
  item: MediaAsset
  variant: YouTubeVideoVariant
  subtitle?: string | null
  onPress?: () => void
  className?: string
}

export function ConnectedVideoCard({ item, variant, subtitle, onPress, className }: ConnectedVideoCardProps) {
  const href = isMediaTargetType(item.targetType) ? mediaTargetHref(item.targetType, item.targetId) : null
  const cardProps = {
    videoId: item.youtubeVideoId,
    title: item.title,
    subtitle,
    eyebrow: mediaFilmLabelForTarget(item.targetType),
    variant,
    className,
    onPress,
  }

  if (!href || onPress) {
    return <YouTubeVideoCard {...cardProps} />
  }

  return (
    <Link href={href} asChild>
      <YouTubeVideoCard {...cardProps} />
    </Link>
  )
}

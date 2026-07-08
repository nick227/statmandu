import type { ReactNode } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { Play } from 'lucide-react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { SmartImage } from './SmartImage'
import { youtubeThumbnailUrl } from './youtube'

export type YouTubeVideoVariant = 'grid' | 'tile' | 'hero' | 'rail' | 'banner'

const PLAY_SIZE: Record<YouTubeVideoVariant, number> = {
  grid: 18,
  tile: 24,
  hero: 32,
  rail: 22,
  banner: 22,
}

export interface YouTubeVideoCardProps extends PressableProps {
  videoId: string
  title?: string | null
  subtitle?: string | null
  eyebrow?: string | null
  variant: YouTubeVideoVariant
  className?: string
  footer?: ReactNode
}

function PlayOverlay({ variant }: { variant: YouTubeVideoVariant }) {
  const size = PLAY_SIZE[variant]
  const shell = variant === 'hero' ? 'h-16 w-16' : variant === 'grid' ? 'h-10 w-10' : 'h-12 w-12'
  const icon = variant === 'hero' ? 28 : variant === 'grid' ? 16 : 22
  return (
    <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
      <View className={cn('items-center justify-center rounded-full border border-white/30 bg-black/50', shell)}>
        <Play size={icon} color="#FFFFFF" fill="#FFFFFF" />
      </View>
    </View>
  )
}

function ThumbFrame({
  videoId,
  variant,
  className,
}: {
  videoId: string
  variant: YouTubeVideoVariant
  className?: string
}) {
  const frameClass =
    variant === 'banner'
      ? 'aspect-[21/9] min-h-[88px]'
      : variant === 'grid'
        ? 'aspect-square'
        : 'aspect-video'

  return (
    <View className={cn('relative w-full overflow-hidden rounded-md bg-black', frameClass, className)}>
      <SmartImage uri={youtubeThumbnailUrl(videoId)} className="h-full w-full" resizeMode="cover" />
      <View className="absolute inset-0 bg-black/15" />
      <PlayOverlay variant={variant} />
    </View>
  )
}

export function YouTubeVideoCard({
  videoId,
  title,
  subtitle,
  eyebrow,
  variant,
  className,
  footer,
  ...props
}: YouTubeVideoCardProps) {
  const showMeta = Boolean(eyebrow || title || subtitle) && variant !== 'grid'

  return (
    <Pressable className={cn('active:opacity-90', className)} {...props}>
      <View className="gap-xs">
        <ThumbFrame videoId={videoId} variant={variant} />
        {showMeta ? (
          <View className="gap-xs px-xs">
            {eyebrow ? <Text variant="statLabel" className="text-sport-accent">{eyebrow}</Text> : null}
            {title ? <Text className="font-semibold" numberOfLines={variant === 'hero' ? 2 : 1}>{title}</Text> : null}
            {subtitle ? <Text variant="caption" numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {footer}
      </View>
    </Pressable>
  )
}

export function YouTubeVideoCardThumb({ videoId, variant, className }: Pick<YouTubeVideoCardProps, 'videoId' | 'variant' | 'className'>) {
  return <ThumbFrame videoId={videoId} variant={variant} className={className} />
}

import type { ReactNode } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { cn } from '@/lib/utils'
import { motion } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'
import { FilmLabelBadge } from './FilmLabelBadge'
import { PlayOverlay } from './PlayOverlay'
import { SmartImage } from './SmartImage'
import { youtubeThumbnailUrl } from './youtube'
import type { YouTubeVideoVariant } from './videoVariants'

export type { YouTubeVideoVariant }

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface YouTubeVideoCardProps extends PressableProps {
  videoId: string
  title?: string | null
  subtitle?: string | null
  eyebrow?: string | null
  variant: YouTubeVideoVariant
  className?: string
  footer?: ReactNode
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
  onPressIn,
  onPressOut,
  ...props
}: YouTubeVideoCardProps) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const showMeta = Boolean(eyebrow || title || subtitle) && variant !== 'grid'

  return (
    <AnimatedPressable
      className={cn(className)}
      style={animatedStyle}
      onPressIn={(e) => {
        scale.value = withTiming(0.98, { duration: motion.cardPressMs })
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: motion.cardPressMs })
        onPressOut?.(e)
      }}
      {...props}
    >
      <View className="gap-xs">
        <ThumbFrame videoId={videoId} variant={variant} />
        {showMeta ? (
          <View className="gap-xs px-xs">
            {eyebrow ? <FilmLabelBadge label={eyebrow} tone="accent" /> : null}
            {title ? <Text className="font-semibold" numberOfLines={variant === 'hero' ? 2 : 1}>{title}</Text> : null}
            {subtitle ? <Text variant="caption" numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {footer}
      </View>
    </AnimatedPressable>
  )
}

export function YouTubeVideoCardThumb({ videoId, variant, className }: Pick<YouTubeVideoCardProps, 'videoId' | 'variant' | 'className'>) {
  return <ThumbFrame videoId={videoId} variant={variant} className={className} />
}

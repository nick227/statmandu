import type { ReactNode } from 'react'
import { useState } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { cn } from '@/lib/utils'
import { motion } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'
import { FilmLabelBadge } from './FilmLabelBadge'
import { VideoStage } from './VideoStage'
import { videoCardFrameClass } from './videoCardLayout'
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

function VideoStageThumb({ videoId, variant, className }: { videoId: string; variant: YouTubeVideoVariant; className?: string }) {
  const [layout, setLayout] = useState({ width: 0, height: 0 })

  return (
    <View
      className={cn('relative w-full overflow-hidden rounded-md bg-black', videoCardFrameClass(variant), className)}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout
        if (width > 0 && height > 0) setLayout({ width, height })
      }}
    >
      {layout.width > 0 ? (
        <VideoStage
          videoId={videoId}
          mode="chrome"
          width={layout.width}
          height={layout.height}
          playVariant={variant}
          interactive={false}
          showCardScrim
        />
      ) : null}
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
        <VideoStageThumb videoId={videoId} variant={variant} />
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
  return <VideoStageThumb videoId={videoId} variant={variant} className={className} />
}

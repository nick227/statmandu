import type { ReactNode } from 'react'
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'
import { FilmLabelBadge, type FilmLabelTone } from './FilmLabelBadge'
import { PlayOverlay } from './PlayOverlay'
import { SmartImage } from './SmartImage'
import { YouTubePlayer } from './YouTubePlayer'
import { videoFrameSize } from './videoFrame'
import { videoStageFit, type VideoStageMode } from './videoStageTypes'
import type { YouTubeVideoVariant } from './videoVariants'
import { youtubeThumbnailUrl } from './youtube'

export interface VideoStageProps {
  videoId: string
  mode: VideoStageMode
  width: number
  height: number
  /** Vertical/inline feed: this page is snapped in view. */
  isActive?: boolean
  /** Immersive viewer: user tapped play. */
  isPlaying?: boolean
  /** Preload embed for next clip (inline feed). */
  preload?: boolean
  /** Play overlay size — grid/tile/hero etc. Defaults to hero. */
  playVariant?: YouTubeVideoVariant
  /** When false, preview is display-only (parent handles press). */
  interactive?: boolean
  /** Subtle scrim on card-style previews. */
  showCardScrim?: boolean
  onPlayRequest?: () => void
  className?: string
  style?: StyleProp<ViewStyle>
}

export function VideoStage({
  videoId,
  mode,
  width,
  height,
  isActive = false,
  isPlaying = false,
  preload = false,
  playVariant = 'hero',
  interactive = true,
  showCardScrim = false,
  onPlayRequest,
  className,
  style,
}: VideoStageProps) {
  const fit = videoStageFit(mode)
  const frame = videoFrameSize(width, height, fit)
  const shouldPlay = (mode === 'inline' && isActive) || (mode === 'immersive' && isPlaying)
  const mountPlayer = shouldPlay || preload
  const showPreview = !shouldPlay

  const previewLayer = showPreview ? (
    <>
      <SmartImage uri={youtubeThumbnailUrl(videoId)} className="h-full w-full" resizeMode="cover" />
      {showCardScrim ? <View className="absolute inset-0 bg-black/15" /> : null}
      {mode !== 'chrome' ? <View className="absolute inset-0 bg-black/25" /> : null}
      {mode === 'inline' && !isActive ? <PlayOverlay variant={playVariant} /> : null}
      {mode === 'immersive' || mode === 'chrome' ? <PlayOverlay variant={playVariant} /> : null}
    </>
  ) : null

  return (
    <View style={[{ width, height }, style]} className={cn('items-center justify-center overflow-hidden bg-black', className)}>
      {mountPlayer ? (
        <YouTubePlayer
          videoId={videoId}
          autoplay={shouldPlay}
          mounted={mountPlayer}
          style={{
            ...frame,
            opacity: preload && !shouldPlay ? 0 : 1,
            position: preload && !shouldPlay ? 'absolute' : undefined,
          }}
        />
      ) : null}

      {showPreview ? (
        interactive ? (
          <Pressable
            className="absolute inset-0"
            onPress={onPlayRequest}
            accessibilityRole="button"
            accessibilityLabel="Play video"
          >
            {previewLayer}
          </Pressable>
        ) : (
          <View className="absolute inset-0" pointerEvents="none">
            {previewLayer}
          </View>
        )
      ) : null}
    </View>
  )
}

export interface VideoStageChromeProps {
  filmLabel?: string
  filmLabelTone?: FilmLabelTone
  title?: string | null
  children?: ReactNode
  immersive?: boolean
  className?: string
}

export function VideoStageChrome({ filmLabel, filmLabelTone = 'light', title, children, immersive, className }: VideoStageChromeProps) {
  const insets = useSafeAreaInsets()
  const top = insets.top + 12
  const bottom = immersive ? insets.bottom + 16 : insets.bottom + 16

  return (
    <>
      {filmLabel ? (
        <View className="absolute left-lg z-10" style={{ top }}>
          <FilmLabelBadge label={filmLabel} tone={filmLabelTone} />
        </View>
      ) : null}
      <View
        className={cn('absolute inset-x-0 bottom-0 gap-sm bg-black/55 px-lg pt-12', className)}
        style={{ paddingBottom: bottom }}
        pointerEvents="box-none"
      >
        {title ? <Text className="font-semibold text-white" numberOfLines={2}>{title}</Text> : null}
        {children ? <View className="flex-row flex-wrap gap-sm" pointerEvents="box-none">{children}</View> : null}
      </View>
    </>
  )
}

import { ImageBackground, Pressable, View, useWindowDimensions, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MoreHorizontal } from 'lucide-react-native'
import { cn } from '@/lib/utils'
import { BackButton } from '@/shared/ui/BackButton'
import { Text } from '@/shared/ui/Text'
import { VideoStage } from '@/shared/media/VideoStage'

export const mediaSurfaceStyles = {
  root: 'flex-1 bg-black overflow-hidden',
  bottomScrim: 'absolute inset-x-0 bottom-0 h-72 bg-black/45',
  fallbackAccent: 'absolute inset-0 bg-sport-accent/20',
  fallbackLiveOrb: 'absolute -right-24 -top-20 h-72 w-72 rounded-full bg-live/20',
  fallbackSportOrb: 'absolute -left-20 bottom-24 h-80 w-80 rounded-full bg-sport-accent/25',
  chromeBar: 'absolute inset-x-0 z-20 flex-row items-center justify-between px-lg',
  chromeTitle: 'flex-1 px-md text-center font-semibold text-white',
  chromeButton: 'h-10 w-10 items-center justify-center rounded-full bg-black/40',
  floatingIconShell: 'h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/45',
  glassPanel: 'rounded-lg border border-white/15 bg-black/40',
} as const

export const mediaOverlayStyles = {
  deep: 'bg-black/45',
  soft: 'bg-black/25',
} as const

export interface MediaSurfaceProps extends ViewProps {
  imageUri?: string | null
  youtubeVideoId?: string | null
  onVideoPress?: () => void
  children?: React.ReactNode
  overlay?: 'deep' | 'soft'
}

export function MediaSurface({ imageUri, youtubeVideoId, onVideoPress, children, className, overlay = 'deep', ...props }: MediaSurfaceProps) {
  const { width, height } = useWindowDimensions()
  const baseClassName = cn(mediaSurfaceStyles.root, className)
  const overlayClassName = mediaOverlayStyles[overlay]

  if (youtubeVideoId) {
    return (
      <View className={baseClassName} {...props}>
        <VideoStage
          videoId={youtubeVideoId}
          mode="chrome"
          width={width}
          height={height}
          interactive={Boolean(onVideoPress)}
          onPlayRequest={onVideoPress}
        />
        <View className={cn('absolute inset-0', overlayClassName)} pointerEvents="none" />
        <View className={mediaSurfaceStyles.bottomScrim} pointerEvents="none" />
        {children}
      </View>
    )
  }

  if (!imageUri) {
    return (
      <View className={baseClassName} {...props}>
        <View className={mediaSurfaceStyles.fallbackAccent} />
        <View className={mediaSurfaceStyles.fallbackLiveOrb} />
        <View className={mediaSurfaceStyles.fallbackSportOrb} />
        {children}
      </View>
    )
  }

  return (
    <ImageBackground source={{ uri: imageUri }} resizeMode="cover" className={baseClassName} {...props}>
      <View className={cn('absolute inset-0', overlayClassName)} />
      <View className={mediaSurfaceStyles.bottomScrim} />
      {children}
    </ImageBackground>
  )
}

export interface MediaChromeProps {
  title?: string
  right?: React.ReactNode
}

export function MediaChrome({ title, right }: MediaChromeProps) {
  const insets = useSafeAreaInsets()

  return (
    <View className={mediaSurfaceStyles.chromeBar} style={{ top: insets.top + 12 }}>
      <BackButton tone="light" />
      {title ? <Text className={mediaSurfaceStyles.chromeTitle} numberOfLines={1}>{title}</Text> : <View className="flex-1" />}
      {right ?? (
        <Pressable className={mediaSurfaceStyles.chromeButton}>
          <MoreHorizontal size={22} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  )
}

export interface FloatingActionRailProps {
  children: React.ReactNode
  className?: string
}

export function FloatingActionRail({ children, className }: FloatingActionRailProps) {
  return <View className={cn('absolute right-lg bottom-40 z-20 gap-sm', className)}>{children}</View>
}

export interface FloatingIconButtonProps {
  icon: React.ComponentType<{ size?: number; color?: string }>
  label?: string
  onPress?: () => void
}

export function FloatingIconButton({ icon: Icon, label, onPress }: FloatingIconButtonProps) {
  return (
    <Pressable onPress={onPress} className="items-center gap-xs">
      <View className={mediaSurfaceStyles.floatingIconShell}>
        <Icon size={21} color="#FFFFFF" />
      </View>
      {label ? <Text variant="caption" className="text-center text-white">{label}</Text> : null}
    </Pressable>
  )
}

export interface GlassPanelProps extends ViewProps {
  children?: React.ReactNode
}

export function GlassPanel({ className, children, ...props }: GlassPanelProps) {
  return (
    <View className={cn(mediaSurfaceStyles.glassPanel, className)} {...props}>
      {children}
    </View>
  )
}

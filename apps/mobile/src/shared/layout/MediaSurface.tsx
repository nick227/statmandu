import { ImageBackground, Pressable, View, useWindowDimensions, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MoreHorizontal } from 'lucide-react-native'
import { cn } from '@/lib/utils'
import { BackButton } from '@/shared/ui/BackButton'
import { Text } from '@/shared/ui/Text'
import { VideoStage } from '@/shared/media/VideoStage'

export interface MediaSurfaceProps extends ViewProps {
  imageUri?: string | null
  youtubeVideoId?: string | null
  onVideoPress?: () => void
  children?: React.ReactNode
  overlay?: 'deep' | 'soft'
}

export function MediaSurface({ imageUri, youtubeVideoId, onVideoPress, children, className, overlay = 'deep', ...props }: MediaSurfaceProps) {
  const { width, height } = useWindowDimensions()
  const baseClassName = cn('flex-1 bg-black overflow-hidden', className)
  const overlayClassName = overlay === 'deep' ? 'bg-black/45' : 'bg-black/25'

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
        <View className="absolute inset-x-0 bottom-0 h-72 bg-black/45" pointerEvents="none" />
        {children}
      </View>
    )
  }

  if (!imageUri) {
    return (
      <View className={baseClassName} {...props}>
        <View className="absolute inset-0 bg-sport-accent/20" />
        <View className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-live/20" />
        <View className="absolute -left-20 bottom-24 h-80 w-80 rounded-full bg-sport-accent/25" />
        {children}
      </View>
    )
  }

  return (
    <ImageBackground source={{ uri: imageUri }} resizeMode="cover" className={baseClassName} {...props}>
      <View className={cn('absolute inset-0', overlayClassName)} />
      <View className="absolute inset-x-0 bottom-0 h-72 bg-black/45" />
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
    <View className="absolute inset-x-0 z-20 flex-row items-center justify-between px-lg" style={{ top: insets.top + 12 }}>
      <BackButton tone="light" />
      {title ? <Text className="flex-1 px-md text-center font-semibold text-white" numberOfLines={1}>{title}</Text> : <View className="flex-1" />}
      {right ?? (
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
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
      <View className="h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/45">
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
    <View className={cn('rounded-lg border border-white/15 bg-black/40', className)} {...props}>
      {children}
    </View>
  )
}

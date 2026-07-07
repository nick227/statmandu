import { View, ImageBackground } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { youtubeThumbnailUrl } from '@/shared/media/youtube'
import { BackButton } from '@/shared/ui/BackButton'

export interface EntityHeroProps {
  youtubeVideoId?: string | null
  fallbackImageUri?: string | null
  children?: React.ReactNode
  className?: string
  /** Set false only if this hero is not the top of a pushed screen (rare). */
  showBackButton?: boolean
}

// Full-bleed media hero — "use media as the emotional layer" (brand guide).
// Falls back to a flat brand-tinted panel when the entity has no media yet,
// rather than a broken image or empty gray box. Always carries the back
// affordance for the screen it's the top of — see BackButton for why hero
// screens use this instead of a native header.
export function EntityHero({ youtubeVideoId, fallbackImageUri, children, className, showBackButton = true }: EntityHeroProps) {
  const insets = useSafeAreaInsets()
  const uri = youtubeVideoId ? youtubeThumbnailUrl(youtubeVideoId) : fallbackImageUri

  const backButton = showBackButton ? (
    <View className="absolute left-lg z-10" style={{ top: insets.top + 12 }}>
      <BackButton tone="light" />
    </View>
  ) : null

  if (!uri) {
    return (
      <View className={cn('h-72 w-full bg-brand/10 justify-end', className)}>
        {backButton}
        {children}
      </View>
    )
  }

  return (
    <ImageBackground source={{ uri }} resizeMode="cover" className={cn('h-72 w-full justify-end', className)}>
      <View className="absolute inset-0 bg-black/25" />
      {backButton}
      {children}
    </ImageBackground>
  )
}

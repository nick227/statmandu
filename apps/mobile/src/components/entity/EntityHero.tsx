import { View, ImageBackground } from 'react-native'
import { cn } from '@/lib/utils'
import { youtubeThumbnailUrl } from '@/lib/media'

export interface EntityHeroProps {
  youtubeVideoId?: string | null
  fallbackImageUri?: string | null
  children?: React.ReactNode
  className?: string
}

// Full-bleed media hero — "use media as the emotional layer" (brand guide).
// Falls back to a flat brand-tinted panel when the entity has no media yet,
// rather than a broken image or empty gray box.
export function EntityHero({ youtubeVideoId, fallbackImageUri, children, className }: EntityHeroProps) {
  const uri = youtubeVideoId ? youtubeThumbnailUrl(youtubeVideoId) : fallbackImageUri

  if (!uri) {
    return (
      <View className={cn('h-72 w-full bg-brand/10 justify-end', className)}>
        {children}
      </View>
    )
  }

  return (
    <ImageBackground source={{ uri }} resizeMode="cover" className={cn('h-72 w-full justify-end', className)}>
      <View className="absolute inset-0 bg-black/25" />
      {children}
    </ImageBackground>
  )
}

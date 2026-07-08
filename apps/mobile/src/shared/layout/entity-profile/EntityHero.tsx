import { Pressable, View, ImageBackground } from 'react-native'
import { Share2 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'
import { youtubeThumbnailUrl } from '@/shared/media/youtube'
import { MediaCarousel, type MediaCarouselItem } from '@/shared/media/MediaCarousel'
import { BackButton } from '@/shared/ui/BackButton'

export interface EntityHeroProps {
  youtubeVideoId?: string | null
  fallbackImageUri?: string | null
  /** All of the entity's attached media — when 1+ items are given, renders
   *  a swipeable carousel instead of the single youtubeVideoId/fallback. */
  mediaItems?: MediaCarouselItem[]
  children?: React.ReactNode
  className?: string
  /** Set false only if this hero is not the top of a pushed screen (rare). */
  showBackButton?: boolean
  /** Renders a share button (top-right) when provided. */
  onShare?: () => void
  /** Overrides the carousel's default tap-out-to-YouTube — e.g. escalate to
   *  the full-screen immersive viewer instead. No-op unless mediaItems is set. */
  onMediaPress?: (index: number) => void
}

// Full-bleed media hero — "use media as the emotional layer" (brand guide).
// Falls back to a flat brand-tinted panel when the entity has no media yet,
// rather than a broken image or empty gray box. Always carries the back
// affordance for the screen it's the top of — see BackButton for why hero
// screens use this instead of a native header.
export function EntityHero({ youtubeVideoId, fallbackImageUri, mediaItems, children, className, showBackButton = true, onShare, onMediaPress }: EntityHeroProps) {
  const insets = useSafeAreaInsets()
  const uri = youtubeVideoId ? youtubeThumbnailUrl(youtubeVideoId) : fallbackImageUri
  const hasCarousel = Boolean(mediaItems && mediaItems.length > 0)

  const backButton = showBackButton ? (
    <View className="absolute left-lg z-10" style={{ top: insets.top + 12 }}>
      <BackButton tone="light" />
    </View>
  ) : null

  const shareButton = onShare ? (
    <View className="absolute right-lg z-10" style={{ top: insets.top + 12 }}>
      <Pressable onPress={onShare} className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
        <Share2 size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  ) : null

  if (hasCarousel) {
    return (
      <View className={cn('h-[420px] w-full justify-end overflow-hidden', className)}>
        <View className="absolute inset-0">
          <MediaCarousel items={mediaItems!} height={420} onItemPress={onMediaPress} />
        </View>
        <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-56 bg-black/45" />
        {backButton}
        {shareButton}
        {children}
      </View>
    )
  }

  if (!uri) {
    return (
      <View className={cn('h-[420px] w-full bg-black justify-end overflow-hidden', className)}>
        <View className="absolute inset-0 bg-sport-accent/15" />
        <View className="absolute -right-20 top-12 h-64 w-64 rounded-full bg-live/15" />
        <View className="absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-sport-accent/25" />
        {backButton}
        {shareButton}
        {children}
      </View>
    )
  }

  return (
    <ImageBackground source={{ uri }} resizeMode="cover" className={cn('h-[420px] w-full justify-end overflow-hidden', className)}>
      <View className="absolute inset-0 bg-black/35" />
      <View className="absolute inset-x-0 bottom-0 h-56 bg-black/45" />
      {backButton}
      {shareButton}
      {children}
    </ImageBackground>
  )
}

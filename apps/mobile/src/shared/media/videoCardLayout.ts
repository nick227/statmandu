import type { YouTubeVideoVariant } from './videoVariants'

export function videoCardFrameClass(variant: YouTubeVideoVariant) {
  if (variant === 'banner') return 'aspect-[21/9] min-h-[88px]'
  if (variant === 'grid') return 'aspect-square'
  return 'aspect-video'
}

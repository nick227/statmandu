import { View } from 'react-native'
import { Play } from 'lucide-react-native'
import { cn } from '@/lib/utils'
import type { YouTubeVideoVariant } from './videoVariants'

const SHELL: Record<YouTubeVideoVariant, string> = {
  grid: 'h-10 w-10',
  tile: 'h-12 w-12',
  hero: 'h-16 w-16',
  rail: 'h-12 w-12',
  banner: 'h-12 w-12',
}

const ICON: Record<YouTubeVideoVariant, number> = {
  grid: 16,
  tile: 22,
  hero: 28,
  rail: 22,
  banner: 22,
}

export function PlayOverlay({ variant, className }: { variant: YouTubeVideoVariant; className?: string }) {
  return (
    <View pointerEvents="none" className={cn('absolute inset-0 items-center justify-center', className)}>
      <View className={cn('items-center justify-center rounded-full border border-white/30 bg-black/50', SHELL[variant])}>
        <Play size={ICON[variant]} color="#FFFFFF" fill="#FFFFFF" />
      </View>
    </View>
  )
}

import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { cn } from '@/lib/utils'

export interface BackButtonProps {
  /** 'light' for dark backgrounds (overlaid on a media hero), 'dark' for light backgrounds */
  tone?: 'light' | 'dark'
  className?: string
}

// Floating circular back affordance for hero/media screens (Player, Team
// profile) where a full native header bar would duplicate the identity
// overlay's title and clutter the "one meaningful object at a time" hero —
// see docs/frontend-architecture.md. Non-hero screens (Game, Live Capture,
// Disputes, Claims) use a native Stack header instead; this is only for
// screens with `headerShown: false`.
export function BackButton({ tone = 'light', className }: BackButtonProps) {
  const router = useRouter()
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      hitSlop={12}
      className={cn(
        'w-10 h-10 rounded-full items-center justify-center',
        tone === 'light' ? 'bg-black/40' : 'bg-surface border border-border',
        className
      )}
    >
      <ChevronLeft size={22} color={tone === 'light' ? '#FFFFFF' : 'rgb(17 17 17)'} />
    </Pressable>
  )
}

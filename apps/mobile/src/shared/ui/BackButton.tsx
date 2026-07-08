import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { cn } from '@/lib/utils'
import { useNativeColor } from '@/lib/theme'

export interface BackButtonProps {
  /** 'light' for dark backgrounds (overlaid on a media hero), 'dark' for light backgrounds */
  tone?: 'light' | 'dark'
  className?: string
}

export function BackButton({ tone = 'light', className }: BackButtonProps) {
  const router = useRouter()
  const textColor = useNativeColor('text')
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
      <ChevronLeft size={22} color={tone === 'light' ? '#FFFFFF' : textColor} />
    </Pressable>
  )
}

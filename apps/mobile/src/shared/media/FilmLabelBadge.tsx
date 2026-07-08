import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'

export type FilmLabelTone = 'accent' | 'light' | 'dark'

const toneClass: Record<FilmLabelTone, string> = {
  accent: 'border-border bg-surface',
  light: 'border-white/20 bg-black/45',
  dark: 'border-white/20 bg-black/40',
}

const textClass: Record<FilmLabelTone, string> = {
  accent: 'text-sport-accent',
  light: 'text-white',
  dark: 'text-white/90',
}

export function FilmLabelBadge({ label, tone = 'accent', className }: { label: string; tone?: FilmLabelTone; className?: string }) {
  return (
    <View className={cn('self-start rounded-pill border px-sm py-xs', toneClass[tone], className)}>
      <Text variant="statLabel" className={textClass[tone]}>{label}</Text>
    </View>
  )
}

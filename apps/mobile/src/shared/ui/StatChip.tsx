import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from './Text'

export interface StatChipProps {
  label: string
  value: string | number
  className?: string
  tone?: 'surface' | 'glass'
}

// Compact chip inside stat rails — brand guide: "Compact spacing inside stat
// chips." Large numeral + small uppercase label, nothing else.
export function StatChip({ label, value, className, tone = 'surface' }: StatChipProps) {
  return (
    <View
      className={cn(
        'items-center justify-center rounded-md border px-md py-sm min-w-[72px]',
        tone === 'glass' ? 'border-white/15 bg-black/35' : 'border-border bg-surface',
        className
      )}
    >
      <Text variant="statValue" className={tone === 'glass' ? 'text-white' : undefined}>{value}</Text>
      <Text variant="statLabel" className={tone === 'glass' ? 'text-white/60' : undefined}>{label}</Text>
    </View>
  )
}

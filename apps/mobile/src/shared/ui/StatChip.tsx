import { View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from './Text'

export interface StatChipProps {
  label: string
  value: string | number
  className?: string
}

// Compact chip inside stat rails — brand guide: "Compact spacing inside stat
// chips." Large numeral + small uppercase label, nothing else.
export function StatChip({ label, value, className }: StatChipProps) {
  return (
    <View className={cn('items-center justify-center rounded-md bg-surface border border-border px-md py-sm min-w-[72px]', className)}>
      <Text variant="statValue">{value}</Text>
      <Text variant="statLabel">{label}</Text>
    </View>
  )
}

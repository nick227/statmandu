import { ScrollView } from 'react-native'
import { StatChip } from '@/shared/ui/StatChip'

export interface StatChipRailProps {
  stats: Array<{ label: string; value: string | number }>
  className?: string
}

// Horizontal rail of key stat chips right below the identity overlay —
// brand guide: "Use large stat numbers as the credibility layer."
export function StatChipRail({ stats, className }: StatChipRailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      contentContainerClassName="gap-sm px-lg py-md"
    >
      {stats.map((stat) => (
        <StatChip key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </ScrollView>
  )
}

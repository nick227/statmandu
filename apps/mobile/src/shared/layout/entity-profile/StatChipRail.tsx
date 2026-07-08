import { ScrollView } from 'react-native'
import Animated, { FadeInRight } from 'react-native-reanimated'
import { StatChip } from '@/shared/ui/StatChip'

export interface StatChipRailProps {
  stats: Array<{ label: string; value: string | number }>
  className?: string
  tone?: 'surface' | 'glass'
}

// Horizontal rail of key stat chips right below the identity overlay —
// brand guide: "Use large stat numbers as the credibility layer." Chips
// stagger in on mount rather than appearing all at once — "motion for depth
// ... not decoration" (brand guide): it draws the eye across the numbers in
// reading order instead of a flat instant dump of digits.
export function StatChipRail({ stats, className, tone = 'surface' }: StatChipRailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      contentContainerClassName="gap-sm px-lg py-md"
    >
      {stats.map((stat, i) => (
        <Animated.View key={stat.label} entering={FadeInRight.delay(i * 60).duration(280).springify()}>
          <StatChip label={stat.label} value={stat.value} tone={tone} />
        </Animated.View>
      ))}
    </ScrollView>
  )
}

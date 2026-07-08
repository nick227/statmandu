import { View } from 'react-native'
import { getSportDefinition } from '@statman/sports'
import { Text } from '@/shared/ui/Text'
import { formattedSportStat, sportStatLabel } from './sportStats'

interface SportStatStripProps {
  sport: string
  stats?: Record<string, unknown> | null
  source?: Record<string, unknown> | null
  view?: 'profileHeadline' | 'teamProfileHeadline' | 'leaderboard' | 'boxScore'
  className?: string
}

// Headline views (4 stats) stay an even flex-row split; the expanded
// boxScore view (6+ stats) wraps into a fixed-width grid instead of
// squeezing everything into one increasingly cramped row.
export function SportStatStrip({ sport, stats, source, view = 'profileHeadline', className }: SportStatStripProps) {
  const definition = getSportDefinition(sport)
  const keys = definition.views[view]
  const wraps = keys.length > 4

  return (
    <View className={className ?? (wraps ? 'flex-row flex-wrap gap-sm' : 'flex-row gap-sm')}>
      {keys.map((key) => (
        <View
          key={key}
          className={wraps ? 'items-center rounded-md border border-border px-sm py-md' : 'flex-1 items-center rounded-md border border-border px-sm py-md'}
          style={wraps ? { width: '31%' } : undefined}
        >
          <Text variant="statValue">{formattedSportStat(sport, { ...(source ?? {}), stats }, key)}</Text>
          <Text variant="statLabel">{sportStatLabel(sport, key)}</Text>
        </View>
      ))}
    </View>
  )
}

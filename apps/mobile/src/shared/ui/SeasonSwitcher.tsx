import { Pressable, ScrollView } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from './Text'

export interface SeasonSwitcherOption {
  id: string
  label: string
}

export interface SeasonSwitcherProps {
  seasons: SeasonSwitcherOption[]
  selectedSeasonId?: string
  onChange: (seasonId: string) => void
  className?: string
}

// Generic "scan through years" control — a horizontal pill row, same visual
// language as the sport-accent pills already used for tab badges/edition
// labels. Not tied to Team: any entity with season-scoped history (Team
// today) can reuse this rather than hand-rolling its own year picker.
export function SeasonSwitcher({ seasons, selectedSeasonId, onChange, className }: SeasonSwitcherProps) {
  if (seasons.length <= 1) return null

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      contentContainerClassName="gap-xs px-lg py-sm"
    >
      {seasons.map((season) => {
        const isActive = season.id === selectedSeasonId
        return (
          <Pressable
            key={season.id}
            onPress={() => onChange(season.id)}
            hitSlop={4}
            className={cn(
              'rounded-pill border px-md py-xs',
              isActive ? 'border-sport-accent bg-sport-accent' : 'border-border bg-canvas'
            )}
          >
            <Text className={cn('font-semibold', isActive ? 'text-white' : 'text-muted-text')}>{season.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

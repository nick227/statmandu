import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { getSportDefinition } from '@statman/sports'
import type { components } from '@statman/sdk'
import { cn } from '@/lib/utils'
import { motion } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'

type GameEventType = components['schemas']['GameEventType']

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// Presentation-only grouping — sport data supplies the `group` string,
// this file just decides how each group reads visually. Unrecognized/absent
// groups (e.g. substitutions, which have none) fall back to a neutral tile.
const GROUP_STYLE: Record<string, { tile: string; text: string }> = {
  Scoring: { tile: 'bg-sport-accent border-sport-accent', text: 'text-white' },
  Misses: { tile: 'bg-surface border-border', text: 'text-muted-text' },
  Possession: { tile: 'bg-brand/10 border-brand/30', text: 'text-brand' },
  Playmaking: { tile: 'bg-verified/10 border-verified/30', text: 'text-verified' },
  Defense: { tile: 'bg-brand/10 border-brand/30', text: 'text-brand' },
  Discipline: { tile: 'bg-dispute/10 border-dispute/30', text: 'text-dispute' },
}
const DEFAULT_GROUP_STYLE = { tile: 'bg-surface border-border', text: 'text-text' }

export interface SportEventPadProps {
  sport: string
  disabled?: boolean
  // Event types the prediction engine (predictNext, @statman/sports) thinks
  // are the likely next tap — these tiles get a subtle pulse to draw the eye
  // without forcing the user's hand (every tile stays tappable regardless).
  suggestedEventTypes?: string[]
  onEvent: (type: GameEventType) => void
  className?: string
}

export function SportEventPad({ sport, disabled, suggestedEventTypes = [], onEvent, className }: SportEventPadProps) {
  const definition = getSportDefinition(sport)

  return (
    <View className={cn('gap-sm', className)}>
      {definition.views.livePad.map((row, i) => {
        // A row only gets hero (larger) sizing when every tile in it is a
        // quickAdjust event (basketball's made-shot row) — mixing tile
        // sizes within one flex row would stretch unevenly, so this is an
        // all-or-nothing choice per row, not per tile.
        const isHeroRow = row.every((type) => definition.events[type]?.quickAdjust)
        return (
          <View key={i} className="flex-1 flex-row gap-sm">
            {row.map((eventType) => {
              const event = definition.events[eventType]
              if (!event) return null
              const style = GROUP_STYLE[event.group ?? ''] ?? DEFAULT_GROUP_STYLE
              return (
                <EventTile
                  key={eventType}
                  label={event.shortLabel ?? event.label}
                  disabled={disabled}
                  isHero={isHeroRow}
                  isSuggested={suggestedEventTypes.includes(eventType)}
                  tileClassName={style.tile}
                  textClassName={style.text}
                  onPress={() => onEvent(eventType as GameEventType)}
                />
              )
            })}
          </View>
        )
      })}
    </View>
  )
}

interface EventTileProps {
  label: string
  disabled?: boolean
  isHero: boolean
  isSuggested: boolean
  tileClassName: string
  textClassName: string
  onPress: () => void
}

function EventTile({ label, disabled, isHero, isSuggested, tileClassName, textClassName, onPress }: EventTileProps) {
  const scale = useSharedValue(1)

  useEffect(() => {
    if (isSuggested && !disabled) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: motion.liveEventFeedbackMs }),
          withTiming(1, { duration: motion.liveEventFeedbackMs })
        ),
        -1,
        true
      )
    } else {
      cancelAnimation(scale)
      scale.value = withTiming(1, { duration: motion.liveEventFeedbackMs })
    }
    return () => cancelAnimation(scale)
  }, [isSuggested, disabled, scale])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={animatedStyle}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'flex-1 items-center justify-center rounded-md border active:opacity-70',
        isHero ? 'py-lg' : 'py-md',
        tileClassName,
        isSuggested && !disabled && 'border-2',
        disabled && 'opacity-40'
      )}
    >
      <Text className={cn('font-semibold', isHero && 'text-lg', textClassName)}>{label}</Text>
    </AnimatedPressable>
  )
}

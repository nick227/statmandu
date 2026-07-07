import { Pressable, View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/Text'

export type LiveEventType =
  | 'FT_MADE' | 'FT_MISS'
  | 'FG2_MADE' | 'FG2_MISS'
  | 'FG3_MADE' | 'FG3_MISS'
  | 'REBOUND_OFF' | 'REBOUND_DEF'
  | 'ASSIST' | 'STEAL' | 'BLOCK' | 'TURNOVER' | 'FOUL'

const ROWS: Array<Array<{ type: LiveEventType; label: string }>> = [
  [{ type: 'FT_MADE', label: '+1 FT' }, { type: 'FG2_MADE', label: '+2 FG' }, { type: 'FG3_MADE', label: '+3 3PT' }],
  [{ type: 'FT_MISS', label: 'MISS FT' }, { type: 'FG2_MISS', label: 'MISS 2' }, { type: 'FG3_MISS', label: 'MISS 3' }],
  [{ type: 'REBOUND_OFF', label: 'OREB' }, { type: 'REBOUND_DEF', label: 'DREB' }, { type: 'ASSIST', label: 'AST' }],
  [{ type: 'STEAL', label: 'STL' }, { type: 'BLOCK', label: 'BLK' }, { type: 'TURNOVER', label: 'TO' }, { type: 'FOUL', label: 'FOUL' }],
]

export interface LiveEventPadProps {
  disabled?: boolean
  onEvent: (type: LiveEventType) => void
  className?: string
}

// Sport-specific touch interface for basketball (26_LIVE_GAME_STAT_CAPTURE_SPEC.md
// "Event pad"). `disabled` is true until a player is selected in the rail above.
export function LiveEventPad({ disabled, onEvent, className }: LiveEventPadProps) {
  return (
    <View className={cn('gap-sm', className)}>
      {ROWS.map((row, i) => (
        <View key={i} className="flex-row gap-sm">
          {row.map(({ type, label }) => (
            <Pressable
              key={type}
              disabled={disabled}
              onPress={() => onEvent(type)}
              className={cn(
                'flex-1 items-center justify-center rounded-md bg-brand py-md active:opacity-70',
                disabled && 'opacity-40'
              )}
            >
              <Text className="text-white font-semibold">{label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  )
}

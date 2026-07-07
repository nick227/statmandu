import { View } from 'react-native'
import { Text } from '@/components/ui/Text'

export interface DisputeFootnoteProps {
  note: string
  className?: string
}

// Compact footnote for a disputed stat line — matches the exact pattern from
// 26_LIVE_GAME_STAT_CAPTURE_SPEC.md:
//   Jayden Rios: 27 PTS · 8 REB · 5 AST*
//   * Assist total disputed. Home scorer recorded 5; away scorer recorded 4.
export function DisputeFootnote({ note, className }: DisputeFootnoteProps) {
  return (
    <View className={className}>
      <Text variant="caption" className="text-dispute">* {note}</Text>
    </View>
  )
}

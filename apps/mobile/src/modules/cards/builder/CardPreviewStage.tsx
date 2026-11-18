import { View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { StatmanCardPreview } from './StatmanCardPreview'
import type { CardBuilderState } from './cardBuilderTypes'
import type { CardSide } from '../FlippableCard'

export function CardPreviewStage({ state, isLoading, onSideChange }: { state: CardBuilderState; isLoading: boolean; onSideChange?: (side: CardSide) => void }) {
  return (
    <View className="items-center gap-md py-md">
      <View className="w-full">
        <StatmanCardPreview state={state} onSideChange={onSideChange} />
      </View>
      {isLoading ? <Text variant="caption">Working...</Text> : null}
    </View>
  )
}

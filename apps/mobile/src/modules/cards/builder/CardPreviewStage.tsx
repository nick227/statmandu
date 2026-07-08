import { View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { StatmanCardPreview } from './StatmanCardPreview'
import type { CardBuilderState } from './cardBuilderTypes'

export function CardPreviewStage({ state, isLoading }: { state: CardBuilderState; isLoading: boolean }) {
  return (
    <View className="items-center gap-md py-md">
      <View className="w-[85%] max-w-[420px]">
        <StatmanCardPreview state={state} />
      </View>
      {isLoading ? <Text variant="caption">Working...</Text> : null}
    </View>
  )
}


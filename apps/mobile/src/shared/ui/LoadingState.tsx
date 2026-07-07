import { View } from 'react-native'
import { Spinner } from './Spinner'

export interface LoadingStateProps {
  className?: string
}

export function LoadingState({ className = 'flex-1 items-center justify-center bg-canvas' }: LoadingStateProps) {
  return (
    <View className={className}>
      <Spinner />
    </View>
  )
}

import { ActivityIndicator, View } from 'react-native'

export interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <View className={className}>
      <ActivityIndicator color="rgb(29 78 216)" />
    </View>
  )
}

import { View } from 'react-native'
import { Text } from './Text'

export interface ErrorStateProps {
  title?: string
  message?: string
  className?: string
}

export function ErrorState({ title = 'Something went wrong', message, className = 'flex-1 items-center justify-center bg-canvas p-lg gap-sm' }: ErrorStateProps) {
  return (
    <View className={className}>
      <Text className="font-semibold text-center">{title}</Text>
      {message ? <Text variant="caption" className="text-center">{message}</Text> : null}
    </View>
  )
}

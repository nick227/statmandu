import { ActivityIndicator, View } from 'react-native'
import { useNativeColor } from '@/lib/theme'

export interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  const brandColor = useNativeColor('brand')
  return (
    <View className={className}>
      <ActivityIndicator color={brandColor} />
    </View>
  )
}

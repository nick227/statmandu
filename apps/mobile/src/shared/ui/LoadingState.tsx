import { View } from 'react-native'
import { brand } from '@/config/brand'
import { Text } from './Text'
import { Spinner } from './Spinner'

export interface LoadingStateProps {
  className?: string
  label?: string
  minimal?: boolean
}

export function LoadingState({ className = 'flex-1 items-center justify-center bg-black', label = brand.wordmark, minimal }: LoadingStateProps) {
  return (
    <View className={className}>
      <View className="absolute inset-0 bg-brand/10" />
      <View className="absolute -top-20 right-[-96px] h-64 w-64 rounded-full bg-live/15" />
      <View className="absolute bottom-[-120px] left-[-80px] h-72 w-72 rounded-full bg-brand/20" />
      <View className="items-center gap-md">
        <Text variant="entityName" className="text-white">{label}</Text>
        {minimal ? null : <Text variant="caption" className="max-w-[220px] text-center text-white/60">{brand.tagline}</Text>}
        <Spinner />
      </View>
    </View>
  )
}

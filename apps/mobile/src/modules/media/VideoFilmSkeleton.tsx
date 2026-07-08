import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useImmersiveFilmStageHeight } from '@/lib/videoViewport'

export function VideoFilmSkeleton() {
  const height = useImmersiveFilmStageHeight()
  const insets = useSafeAreaInsets()
  return (
    <View className="flex-1 bg-canvas px-lg pt-sm gap-sm" style={{ paddingTop: insets.top }}>
      <View className="h-6 w-40 rounded-md bg-border" />
      <View className="h-4 w-64 rounded-md bg-border/70" />
      <View className="rounded-md bg-border/40" style={{ height: height * 0.85 }} />
    </View>
  )
}

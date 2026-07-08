import { ScrollView, View } from 'react-native'
import { Skeleton } from '@/shared/ui/Skeleton'

export function RankingsSkeleton() {
  return (
    <View className="gap-lg">
      <Skeleton className="h-[280px] w-full rounded-lg" />
      <View className="gap-sm">
        <Skeleton className="h-4 w-28" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[156px] w-44 rounded-lg" />
          ))}
        </ScrollView>
      </View>
      <View className="gap-sm">
        <Skeleton className="h-4 w-24" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[156px] w-44 rounded-lg" />
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

export function SearchResultsSkeleton() {
  return (
    <View className="flex-row flex-wrap gap-md pb-lg">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[156px] flex-1 min-w-[45%] rounded-lg" />
      ))}
    </View>
  )
}

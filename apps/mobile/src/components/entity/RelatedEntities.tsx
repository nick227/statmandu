import { ScrollView, View } from 'react-native'
import { Text } from '@/components/ui/Text'

export interface RelatedEntitiesProps<T> {
  title: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
  className?: string
}

// Horizontal rail pattern reused for "related players", "related teams",
// "other games this week", etc. — generic over what card it renders.
export function RelatedEntities<T>({ title, items, renderItem, keyExtractor, className }: RelatedEntitiesProps<T>) {
  if (items.length === 0) return null

  return (
    <View className={className}>
      <Text className="font-semibold px-lg pb-sm">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-md px-lg">
        {items.map((item) => (
          <View key={keyExtractor(item)}>{renderItem(item)}</View>
        ))}
      </ScrollView>
    </View>
  )
}

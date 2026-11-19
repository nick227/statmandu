import { ScrollView, View } from 'react-native'
import { Filter } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { SidebarChip } from '@/shared/layout/SidebarRail'
import { useNativeColor } from '@/lib/theme'

export interface GlobalFilterBarProps {
  categories?: string[]
  activeCategory?: string
  onSelectCategory?: (category: string) => void
  sports?: string[]
  activeSport?: string
  onSelectSport?: (sport: string) => void
}

const DEFAULT_CATEGORIES = [
  'All',
  'Music',
  'Film',
  'Art',
  'Comedy',
  'Gaming',
  'Science',
  'Business',
  'Sports',
]

export function GlobalFilterBar({ 
  categories,
  activeCategory,
  onSelectCategory,
  sports, 
  activeSport, 
  onSelectSport 
}: GlobalFilterBarProps) {
  const iconColor = useNativeColor('text')
  const items = categories ?? sports ?? DEFAULT_CATEGORIES
  const selected = activeCategory ?? activeSport ?? items[0]
  const handleSelect = onSelectCategory ?? onSelectSport
  
  return (
    <View className="mb-md flex-row items-center gap-sm border-b border-border pb-sm">
      <View className="flex-row items-center gap-xs pr-xs border-r border-border">
        <Filter size={16} color={iconColor} />
        <Text variant="statLabel">Filter</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-xs pr-md">
        {items.map((item) => (
          <SidebarChip 
            key={item} 
            label={item} 
            active={selected === item} 
            onPress={() => handleSelect?.(item)} 
          />
        ))}
      </ScrollView>
    </View>
  )
}

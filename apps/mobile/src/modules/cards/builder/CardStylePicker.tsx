import { Pressable, ScrollView, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import { STYLE_PRESETS } from './builderConstants'

export function CardStylePicker({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16, gap: 16 }}>
      {STYLE_PRESETS.map((style) => {
        const active = selected === style.value
        return (
          <Pressable
            key={style.value}
            onPress={() => onSelect(style.value)}
            className={cn('w-40 h-56 rounded-xl p-md justify-between border-2', active ? 'border-brand bg-brand/10' : 'border-transparent bg-surface-elevated')}
          >
            <View className="flex-row gap-xs">
              {[style.primary, style.secondary].map((c, i) => (
                <View key={i} style={{ backgroundColor: c }} className="w-4 h-4 rounded-full border border-black/20" />
              ))}
            </View>
            <View>
              <Text className={cn('font-semibold', active ? 'text-brand' : 'text-text')}>{style.label}</Text>
              <Text className="text-muted-text mt-xs text-xs">Palette preset</Text>
            </View>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}


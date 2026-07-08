import { Pressable, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import type { CardType } from './cardBuilderTypes'
import { CARD_TYPES } from './builderConstants'

export function CardTypePicker({ selected, onSelect }: { selected: CardType; onSelect: (type: CardType) => void }) {
  return (
    <View className="gap-md py-md">
      {CARD_TYPES.map(({ value, label, helper }) => {
        const active = selected === value
        return (
          <Pressable key={value} onPress={() => onSelect(value)} className="active:opacity-70">
            <View className={cn('p-md rounded-xl border flex-row items-center gap-md', active ? 'bg-brand/10 border-brand' : 'bg-surface border-white/10')}>
              <View className="flex-1">
                <Text className={cn('font-semibold', active ? 'text-brand' : 'text-text')}>{label}</Text>
                <Text className="text-muted-text mt-xs">{helper}</Text>
              </View>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}


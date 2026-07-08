import { Pressable, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/lib/utils'
import type { ReleaseType } from './cardBuilderTypes'
import { RELEASE_OPTIONS } from './builderConstants'

export function CardReleasePicker({
  selected,
  editionSize,
  onSelect,
}: {
  selected: ReleaseType
  editionSize: string
  onSelect: (release: ReleaseType, editionSize?: string) => void
}) {
  return (
    <View className="gap-md py-md">
      {RELEASE_OPTIONS.map(({ value, label, helper }) => {
        const active = selected === value
        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value, value === 'limited' ? (editionSize || '100') : undefined)}
            className={cn('p-md rounded-xl border', active ? 'bg-brand/10 border-brand' : 'bg-surface border-white/10')}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className={cn('font-semibold', active ? 'text-brand' : 'text-text')}>{label}</Text>
                <Text className="text-muted-text mt-xs">{helper}</Text>
              </View>
              <View className={cn('w-6 h-6 rounded-full border-2 items-center justify-center', active ? 'border-brand' : 'border-white/20')}>
                {active ? <View className="w-3 h-3 rounded-full bg-brand" /> : null}
              </View>
            </View>

            {active && value === 'limited' ? (
              <View className="mt-md pt-md border-t border-white/10 flex-row items-center justify-between">
                <Text className="text-text">Edition Size</Text>
                <View className="flex-row items-center gap-md">
                  <Button size="sm" variant="ghost" onPress={() => onSelect(value, String(Math.max(10, Number(editionSize || '100') - 10)))}>-</Button>
                  <Text className="text-lg font-bold w-12 text-center">{editionSize || '100'}</Text>
                  <Button size="sm" variant="ghost" onPress={() => onSelect(value, String(Number(editionSize || '100') + 10))}>+</Button>
                </View>
              </View>
            ) : null}
          </Pressable>
        )
      })}

      <View className="mt-md p-md bg-white/5 rounded-lg">
        <Text className="text-muted-text text-sm text-center">
          Edition size locks after publish.
        </Text>
      </View>
    </View>
  )
}


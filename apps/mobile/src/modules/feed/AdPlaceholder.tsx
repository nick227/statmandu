import { Pressable, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import type { HomeAdSlot } from '@/modules/feed/homeContent'

export function AdPlaceholder({ slot }: { slot: HomeAdSlot }) {
  const isBanner = slot.format === 'banner'

  return (
    <Pressable className="active:opacity-90">
      <View
        className={
          isBanner
            ? 'min-h-[72px] justify-center rounded-lg border border-dashed border-border bg-surface px-md py-sm'
            : 'min-h-[120px] justify-between rounded-lg border border-dashed border-border bg-surface p-md'
        }
      >
        <View className="flex-row items-center justify-between gap-sm">
          <Text variant="statLabel" className="text-muted-text">{slot.sponsoredLabel}</Text>
          <Text variant="caption" className="text-muted-text">{slot.sponsor}</Text>
        </View>
        <View className={isBanner ? 'flex-row items-center justify-between gap-md pt-xs' : 'gap-xs pt-sm'}>
          <View className="flex-1 gap-xs">
            <Text className={isBanner ? 'font-semibold' : 'text-lg font-bold'} numberOfLines={isBanner ? 1 : 2}>
              {slot.headline}
            </Text>
            {!isBanner && slot.body ? <Text variant="caption" numberOfLines={2}>{slot.body}</Text> : null}
          </View>
          <View className="rounded-pill border border-border bg-canvas px-sm py-xs">
            <Text variant="caption" className="font-semibold">{slot.cta}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

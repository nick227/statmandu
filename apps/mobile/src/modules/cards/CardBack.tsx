import { View } from 'react-native'
import { brand } from '@/config/brand'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import { parseStatValue, teamInitials, type CardFaceData } from './cardDisplay'

export interface CardBackProps {
  data: CardFaceData
  dense?: boolean
  productionLabel?: string
}

/** Card 1A back: a fixed print ledger, never an application panel. */
export function CardBack({ data, dense = false, productionLabel }: CardBackProps) {
  const { athleteName, backCopy, cardNumber, rarityLabel, setName, stats, style, teamName } = data

  return (
    <View
      className="flex-1 overflow-hidden rounded-lg border"
      style={{ borderColor: style.secondary, borderWidth: dense ? 3 : 6, backgroundColor: style.primary }}
    >
      <View className={cn('flex-1', dense ? 'gap-1 p-1' : 'gap-2 p-2')}>
        <View className={cn('flex-1 justify-between border', dense ? 'p-2' : 'p-4')} style={{ borderColor: style.secondary, backgroundColor: style.plate }}>
          <View className={dense ? 'gap-2' : 'gap-4'}>
            <View className="flex-row items-center justify-between border-b pb-2" style={{ borderBottomColor: style.secondary }}>
              <View>
                <Text className={cn('font-bold uppercase tracking-[2px]', dense ? 'text-[9px]' : 'text-sm')} style={{ color: style.secondary }}>
                  {brand.wordmark}
                </Text>
                <Text className={cn('uppercase', dense ? 'text-[7px]' : 'text-[10px]')} style={{ color: style.text, opacity: 0.7 }}>
                  Card 1A · {setName}
                </Text>
              </View>
              <View className={cn('items-center justify-center rounded-full border-2', dense ? 'h-8 w-8' : 'h-14 w-14')} style={{ borderColor: style.secondary }}>
                <Text className={cn('font-bold', dense ? 'text-[9px]' : 'text-base')} style={{ color: style.text }}>{teamInitials(teamName)}</Text>
              </View>
            </View>

            <View>
              <Text className={cn('font-bold uppercase tracking-tight', dense ? 'text-sm' : 'text-2xl')} style={{ color: style.text }} numberOfLines={1}>
                {athleteName}
              </Text>
              <Text className={dense ? 'text-[8px]' : 'text-xs'} style={{ color: style.text, opacity: 0.7 }} numberOfLines={1}>
                {teamName} · {setName}
              </Text>
            </View>

            {dense ? null : (
              <Text className="text-sm leading-5" style={{ color: style.text }} numberOfLines={5}>
                {backCopy}
              </Text>
            )}

            <View className="border-y" style={{ borderColor: style.secondary }}>
              <View className="flex-row items-center justify-between py-2">
                <Text className={cn('font-bold uppercase tracking-widest', dense ? 'text-[8px]' : 'text-xs')} style={{ color: style.text }}>Card details</Text>
                <Text className={cn('font-bold', dense ? 'text-[9px]' : 'text-sm')} style={{ color: style.text }}>{stats.length} details</Text>
              </View>
              {(dense ? stats.slice(0, 2) : stats).map((stat, index) => (
                <View key={`${stat}-back-${index}`} className="flex-row justify-between border-t py-1" style={{ borderTopColor: style.secondary }}>
                  <Text className={dense ? 'text-[8px]' : 'text-xs'} style={{ color: style.text }}>{stat.replace(/\d+/g, '').trim() || `STAT ${index + 1}`}</Text>
                  <Text className={cn('font-bold', dense ? 'text-[8px]' : 'text-xs')} style={{ color: style.text }}>{parseStatValue(stat) || stat}</Text>
                </View>
              ))}
              {stats.length === 0 ? (
                <Text className={cn('border-t py-2 uppercase', dense ? 'text-[8px]' : 'text-xs')} style={{ borderTopColor: style.secondary, color: style.text, opacity: 0.6 }}>
                  No details added
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row items-end justify-between border-t pt-2" style={{ borderTopColor: style.secondary }}>
            <View>
              <Text className={cn('font-bold', dense ? 'text-[8px]' : 'text-xs')} style={{ color: style.text }}>{cardNumber || 'RDC-001'}</Text>
              <Text className={dense ? 'text-[7px]' : 'text-[10px]'} style={{ color: style.text, opacity: 0.65 }}>{productionLabel ?? rarityLabel}</Text>
            </View>
            <Text className={dense ? 'text-[7px]' : 'text-[10px]'} style={{ color: style.text, opacity: 0.65 }}>© 2026 {brand.wordmark}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

import { StyleSheet, View } from 'react-native'
import { ImagePlus } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { brand } from '@/config/brand'
import { Text } from '@/shared/ui/Text'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'
import { CARD_GEOMETRY } from './cardGeometry'
import { teamInitials, type BadgeTone, type CardFaceData } from './cardDisplay'

export interface CardFaceProps {
  data: CardFaceData
  /** Rail-size cards keep the same print anatomy with smaller type. */
  dense?: boolean
  /** Replaces the printed edition line with an owner-only production state. */
  statusBadge?: { label: string; tone: BadgeTone }
}

// The one real trading-card face — shared by every place a card renders
// (Home's New Drops, profile Cards tabs, Card Studio's rail and detail
// pages) and the Card Studio builder's own live preview. A single source
// of truth means what a creator designs in the builder is what actually
// ships, and the two can't visually drift apart the way they had before
// this component existed.
export function CardFace({ data, dense = false, statusBadge }: CardFaceProps) {
  const { athleteName, framePreset, imageUri, isRare, rarityLabel, setName, stats, style, teamName, title } = data
  const editionText = statusBadge?.label ?? rarityLabel

  return (
    <View
      className="flex-1 overflow-hidden rounded-lg border bg-black"
      style={{ borderColor: style.secondary, borderWidth: dense ? 3 : 6, backgroundColor: style.primary }}
    >
      <View className={cn('flex-1', dense ? 'gap-1 p-1' : 'gap-2 p-2')}>
        {/* The photograph is physically inset into a common frame. It is
            never also used as the card background. */}
        <View className="relative flex-[4] overflow-hidden border bg-black" style={{ borderColor: style.secondary }}>
          {imageUri ? (
            <SmartImage uri={imageUri} className="absolute inset-0 h-full w-full" resizeMode="cover" />
          ) : (
            <View className="absolute inset-0 items-center justify-center bg-muted-text/15">
              <ImagePlus size={dense ? 24 : 42} color={style.secondary} />
            </View>
          )}

          <View className="absolute left-0 top-0 p-2">
            <View
              className={cn('items-center justify-center rounded-full border-2', dense ? 'h-8 w-8' : 'h-14 w-14')}
              style={{ borderColor: style.secondary, backgroundColor: style.plate }}
            >
              <Text className={cn('font-bold', dense ? 'text-[10px]' : 'text-base')} style={{ color: style.text }}>
                {teamInitials(teamName)}
              </Text>
            </View>
          </View>

          {framePreset === 'stat-battle' && !dense ? (
            <View className="absolute bottom-2 right-2 border-2 bg-black/80 px-2 py-1" style={{ borderColor: style.secondary }}>
              <Text className="text-center text-[10px] font-bold text-white/70">DETAILS</Text>
              <Text className="text-center text-3xl font-bold text-white">{stats.length}</Text>
            </View>
          ) : null}
        </View>

        {/* Fixed print nameplate: player identity and Statman branding are
            part of the card, not web UI floating over it. */}
        <View className={cn('flex-1 justify-between border', dense ? 'px-2 py-1' : 'px-3 py-2')} style={{ borderColor: style.secondary, backgroundColor: style.plate }}>
          <View>
            <Text className={cn('font-bold uppercase tracking-tight', dense ? 'text-sm' : 'text-2xl')} style={{ color: style.text }} numberOfLines={1}>
              {athleteName}
            </Text>
            <Text className={cn(dense ? 'text-[9px]' : 'text-xs')} style={{ color: style.text, opacity: 0.75 }} numberOfLines={1}>
              {teamName}{dense ? '' : ` · ${title}`}
            </Text>
          </View>
          <View className="flex-row items-end justify-between gap-2">
            <Text className={cn('font-bold uppercase tracking-[2px]', dense ? 'text-[8px]' : 'text-xs')} style={{ color: style.secondary }}>
              {brand.wordmark}
            </Text>
            <Text className={cn(dense ? 'text-[7px]' : 'text-[10px]')} style={{ color: style.text, opacity: 0.7 }} numberOfLines={1}>
              {framePreset === 'heritage-back' ? setName : editionText}
            </Text>
          </View>
        </View>
      </View>

      {/* Limited editions may change the stock/finish, never the anatomy. */}
      {isRare ? (
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.24)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
    </View>
  )
}

/**
 * Print-export canvas. The inner CardFace remains the exact 5:7 trim card;
 * the surrounding 75 px at 600 DPI extends the frame color beyond every
 * cut edge to produce the required 1650 x 2250 (2.75 x 3.75 inch) sheet.
 */
export function PrintableCardFace(props: CardFaceProps) {
  const { style } = props.data

  return (
    <View
      className="relative w-full"
      style={{ aspectRatio: CARD_GEOMETRY.printPixels.width / CARD_GEOMETRY.printPixels.height, backgroundColor: style.primary }}
    >
      <View className="absolute" style={{ left: '4.5455%', right: '4.5455%', top: '3.3333%', bottom: '3.3333%' }}>
        <CardFace {...props} dense={false} />
      </View>
    </View>
  )
}

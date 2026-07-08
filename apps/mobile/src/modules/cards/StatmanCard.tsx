import type { ReactNode } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'
import {
  CARD_STATUS_LABEL,
  CARD_STATUS_TONE,
  CARD_TYPE_LABEL,
  athleteFullName,
  cardImageUri,
  editionLabel,
  isLimitedEdition,
} from './cardDisplay'

type Card = components['schemas']['Card']

export type StatmanCardSize = 'rail' | 'featured' | 'detail'

export interface StatmanCardProps extends Omit<PressableProps, 'children'> {
  card: Card
  size?: StatmanCardSize
  /** Owner-only context (draft/generating/failed) — hidden for public discovery surfaces. */
  showStatus?: boolean
  footer?: ReactNode
  className?: string
}

const HEIGHT_BY_SIZE: Record<StatmanCardSize, number> = {
  rail: 232,
  featured: 340,
  detail: 420,
}

// Same premium-collectible visual language as SpotlightCard (dark backdrop,
// accent glow, pill badges, bold white type) but a portrait card layout —
// SpotlightCard's athlete/game/activity bodies are landscape-composed and
// don't fit a trading card, so this extends the DNA rather than the
// component itself.
export function StatmanCard({ card, size = 'rail', showStatus = false, footer, className, style, ...props }: StatmanCardProps) {
  const large = size !== 'rail'
  const imageUri = cardImageUri(card)
  const name = athleteFullName(card)
  const limited = isLimitedEdition(card)

  return (
    <Pressable className={cn('active:opacity-90', className)} style={style} {...props}>
      <View
        className="overflow-hidden rounded-lg bg-black"
        style={{ height: HEIGHT_BY_SIZE[size] }}
      >
        {imageUri ? (
          <>
            <SmartImage uri={imageUri} className="absolute inset-0 h-full w-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/35" />
          </>
        ) : (
          <View className="absolute inset-0 bg-sport-accent/20" />
        )}
        <View className="absolute inset-x-0 bottom-0 h-2/3 bg-black/70" />
        <View className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sport-accent/25" />

        <View className="flex-1 justify-between p-md">
          <View className="flex-row items-start justify-between">
            <View className="self-start rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
              <Text variant="caption" className="text-white/80">{CARD_TYPE_LABEL[card.cardType]}</Text>
            </View>
            {showStatus ? (
              <Badge tone={CARD_STATUS_TONE[card.status]}>{CARD_STATUS_LABEL[card.status]}</Badge>
            ) : limited ? (
              <View className="rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
                <Text variant="caption" className="text-white/80">{editionLabel(card)}</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-xs">
            <Text className={large ? 'text-2xl font-bold text-white' : 'text-lg font-semibold text-white'} numberOfLines={1}>
              {name}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text variant="caption" className="text-white/60" numberOfLines={1}>
                {!showStatus ? editionLabel(card) : card.team?.name ?? ''}
              </Text>
              {card.currentUserHasClaimed ? (
                <Badge tone="verified">Claimed</Badge>
              ) : null}
            </View>
            {footer}
          </View>
        </View>
      </View>
    </Pressable>
  )
}

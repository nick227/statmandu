import type { ReactNode } from 'react'
import { Image, Pressable, View, type PressableProps } from 'react-native'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'
import { Text } from './Text'

export type SpotlightCardSize = 'large' | 'small'
export type SpotlightCardKind = 'athlete' | 'game' | 'activity'

export interface SpotlightStat {
  label: string
  value: string
}

export interface SpotlightCardProps extends PressableProps {
  size: SpotlightCardSize
  kind: SpotlightCardKind
  eyebrow?: string
  title: string
  subtitle?: string
  stats?: SpotlightStat[]
  imageUri?: string | null
  badge?: ReactNode
  footer?: ReactNode
  className?: string
}

function CardBackdrop({ imageUri }: { imageUri?: string | null }) {
  return (
    <>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} className="absolute inset-0 h-full w-full opacity-35" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/55" />
        </>
      ) : null}
      <View className="absolute inset-0 bg-sport-accent/20" />
      <View className="absolute -right-20 -top-16 h-56 w-56 rounded-full bg-live/15" />
      <View className="absolute -left-16 bottom-[-72px] h-52 w-52 rounded-full bg-sport-accent/25" />
    </>
  )
}

function StatRow({ stats, large }: { stats: SpotlightStat[]; large: boolean }) {
  return (
    <View className="flex-row flex-wrap gap-sm">
      {stats.map((stat) => (
        <View key={stat.label} className="rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
          <Text variant={large ? 'statValue' : 'caption'} className={large ? 'text-white' : 'text-white/90'}>
            {stat.value}
          </Text>
          <Text variant="statLabel" className="text-white/55">{stat.label}</Text>
        </View>
      ))}
    </View>
  )
}

function AthleteBody({ size, eyebrow, title, subtitle, stats, imageUri, badge, footer }: Omit<SpotlightCardProps, 'kind'>) {
  const large = size === 'large'
  return (
    <View className={cn('flex-1 justify-between', large ? 'gap-md' : 'items-center gap-sm')}>
      {eyebrow ? (
        <View className="self-start rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
          <Text variant="caption" className="text-white/80">{eyebrow}</Text>
        </View>
      ) : null}
      <View className={cn('flex-row items-start justify-between', !large && 'w-full')}>
        <View className={cn('flex-row items-center gap-sm', large && 'flex-1')}>
          <View className={cn('rounded-full border border-white/15 bg-white/5', large ? 'p-sm' : 'p-xs')}>
            <Avatar uri={imageUri} fallback={title} size={large ? 'lg' : 'md'} className="border border-white/20" />
          </View>
          {large ? (
            <View className="flex-1 gap-xs">
              <Text className="text-2xl font-bold text-white" numberOfLines={2}>{title}</Text>
              {subtitle ? <Text variant="caption" className="text-white/65" numberOfLines={2}>{subtitle}</Text> : null}
            </View>
          ) : null}
        </View>
        {badge}
      </View>
      {!large ? (
        <View className="min-h-[44px] w-full items-center gap-xs">
          <Text className="text-center font-semibold text-white" numberOfLines={2}>{title}</Text>
          {subtitle ? <Text variant="caption" className="text-center text-white/60" numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {stats && stats.length > 0 ? <StatRow stats={stats} large={large} /> : null}
      {footer}
    </View>
  )
}

function GameBody({ size, eyebrow, title, subtitle, stats, badge, footer }: Omit<SpotlightCardProps, 'kind' | 'imageUri'>) {
  const large = size === 'large'
  const [homeScore, awayScore] = stats ?? []
  return (
    <View className="flex-1 justify-between gap-md">
      <View className="flex-row items-center justify-between">
        <View className="rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
          <Text variant="caption" className="text-white/80">{eyebrow ?? subtitle}</Text>
        </View>
        {badge}
      </View>
      <View className="gap-sm">
        <Text className={large ? 'text-2xl font-bold text-white' : 'text-lg font-semibold text-white'} numberOfLines={2}>
          {title}
        </Text>
        {stats && stats.length >= 2 ? (
          <View className="flex-row items-end gap-md">
            <Text variant="statValue" className="text-white">{homeScore?.value ?? '—'}</Text>
            <Text variant="caption" className="pb-sm text-white/45">vs</Text>
            <Text variant="statValue" className="text-white">{awayScore?.value ?? '—'}</Text>
          </View>
        ) : null}
      </View>
      {footer}
    </View>
  )
}

function ActivityBody({ size, eyebrow, title, subtitle, badge, footer }: Omit<SpotlightCardProps, 'kind' | 'imageUri' | 'stats'>) {
  const large = size === 'large'
  return (
    <View className="flex-1 justify-between">
      <View className="flex-row items-center justify-between">
        {eyebrow ? (
          <View className="rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
            <Text variant="caption" className="text-white/80">{eyebrow}</Text>
          </View>
        ) : <View />}
        {badge}
      </View>
      <View className="gap-sm">
        <Text className={large ? 'text-2xl font-bold text-white' : 'text-lg font-semibold text-white'} numberOfLines={large ? 3 : 2}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption" className="text-white/60" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {footer}
    </View>
  )
}

export function SpotlightCard({
  size,
  kind,
  eyebrow,
  title,
  subtitle,
  stats,
  imageUri,
  badge,
  footer,
  className,
  style,
  ...props
}: SpotlightCardProps) {
  const minHeight = size === 'large' ? 280 : 156
  const padding = size === 'large' ? 'p-lg' : 'p-md'

  return (
    <Pressable className={cn('active:opacity-90', className)} style={style} {...props}>
      <View className={cn('overflow-hidden rounded-lg bg-black', padding)} style={{ minHeight }}>
        <CardBackdrop imageUri={kind === 'athlete' ? imageUri : undefined} />
        {kind === 'athlete' ? (
          <AthleteBody size={size} eyebrow={eyebrow} title={title} subtitle={subtitle} stats={stats} imageUri={imageUri} badge={badge} footer={footer} />
        ) : null}
        {kind === 'game' ? (
          <GameBody size={size} eyebrow={eyebrow} title={title} subtitle={subtitle} stats={stats} badge={badge} footer={footer} />
        ) : null}
        {kind === 'activity' ? (
          <ActivityBody size={size} eyebrow={eyebrow} title={title} subtitle={subtitle} badge={badge} footer={footer} />
        ) : null}
      </View>
    </Pressable>
  )
}

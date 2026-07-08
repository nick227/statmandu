import { View } from 'react-native'
import { ImagePlus } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'
import type { CardBuilderState } from './cardBuilderTypes'
import { CARD_TYPES, CARD_FRAMES, STYLE_PRESETS } from './builderConstants'

function parseStatValue(stat: string) {
  const match = stat.match(/\d+/)
  return match ? Number(match[0]) : 0
}

function ratingFromStats(stats: string[]) {
  const total = stats.reduce((sum, stat) => sum + parseStatValue(stat), 0)
  return Math.max(68, Math.min(99, 72 + Math.round(total / 3)))
}

function teamInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'SM'
  )
}

export function StatmanCardPreview({ state }: { state: CardBuilderState }) {
  const style = STYLE_PRESETS.find((s) => s.value === state.stylePreset) ?? STYLE_PRESETS[0]
  const frame = CARD_FRAMES.find((f) => f.value === state.framePreset) ?? CARD_FRAMES[0]
  const typeLabel = CARD_TYPES.find((t) => t.value === state.cardType)?.label ?? 'Card'
  const statTiles = [state.statOne, state.statTwo, state.statThree].filter(Boolean)
  const overallRating = ratingFromStats(statTiles)
  const teamName = state.athleteTeamName ?? 'Independent'
  const athleteName = state.athleteName ?? 'Select athlete'

  return (
    <View className="overflow-hidden rounded-lg border bg-black" style={{ aspectRatio: 0.72, borderColor: style.secondary }}>
      {state.sourceImageUrl ? (
        <SmartImage uri={state.sourceImageUrl} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      ) : (
        <View className="absolute inset-0 items-center justify-center bg-muted-text/15">
          <ImagePlus size={42} color={style.secondary} />
        </View>
      )}
      <View className="absolute inset-0 bg-black/30" />
      <View className="absolute inset-x-0 top-0 h-3" style={{ backgroundColor: style.primary }} />
      <View className="absolute inset-x-4 top-5 h-px" style={{ backgroundColor: style.secondary }} />
      <View className="absolute inset-x-4 bottom-5 h-px" style={{ backgroundColor: style.secondary }} />

      {state.side === 'front' ? (
        <View className="flex-1 justify-between p-lg">
          <View className="flex-row items-start justify-between gap-sm">
            <View className="h-16 w-16 items-center justify-center rounded-full border-2" style={{ borderColor: style.secondary, backgroundColor: style.plate }}>
              <Text className="text-lg font-bold" style={{ color: style.text }}>
                {teamInitials(teamName)}
              </Text>
            </View>
            <View className="items-end gap-xs">
              <Badge tone="brand">{typeLabel}</Badge>
              <Badge tone="verified">
                {state.release === 'one-of-one' ? '1-of-1' : state.release === 'limited' ? `${state.editionSize} max` : state.release === 'draft' ? 'Draft' : 'Unlimited'}
              </Badge>
            </View>
          </View>

          {state.framePreset === 'stat-battle' ? (
            <View className="self-end rounded-lg border border-white/20 bg-black/60 p-sm">
              <Text variant="caption" className="text-white/60 text-center">OVR</Text>
              <Text className="text-4xl font-bold text-white text-center">{overallRating}</Text>
            </View>
          ) : null}

          <View className="gap-md">
            {state.framePreset === 'heritage-back' ? (
              <View className="self-start rounded-md px-md py-xs" style={{ backgroundColor: style.secondary }}>
                <Text className="font-semibold" style={{ color: style.contrast }}>{state.setName}</Text>
              </View>
            ) : null}

            <View className="rounded-lg border border-white/15 bg-black/65 p-md">
              <Text className="text-3xl font-bold text-white" numberOfLines={1}>{athleteName}</Text>
              <Text className="text-white/70" numberOfLines={1}>{teamName} - {state.title}</Text>
            </View>

            <View className={cn('gap-sm', state.framePreset === 'stat-battle' ? 'flex-col' : 'flex-row')}>
              {statTiles.map((stat, index) => (
                <View key={`${stat}-${index}`} className={cn('rounded-md border border-white/15 bg-white/15 px-sm py-xs', state.framePreset !== 'stat-battle' && 'min-w-20')}>
                  <View className="flex-row items-center justify-between gap-sm">
                    <Text className="text-white font-semibold">{stat}</Text>
                    {state.framePreset === 'stat-battle' ? <Text className="text-white/70">{Math.min(99, 70 + parseStatValue(stat))}</Text> : null}
                  </View>
                  {state.framePreset === 'stat-battle' ? (
                    <View className="mt-xs h-1 overflow-hidden rounded-full bg-white/20">
                      <View className="h-full" style={{ width: `${Math.min(100, 35 + parseStatValue(stat) * 2)}%`, backgroundColor: style.secondary }} />
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-between p-lg" style={{ backgroundColor: style.plate }}>
          <View className="gap-sm">
            <View className="flex-row items-start justify-between gap-sm">
              <View className="flex-1">
                <Text className="text-2xl font-bold" style={{ color: style.text }}>{athleteName}</Text>
                <Text style={{ color: style.text }} numberOfLines={1}>{teamName} - {state.setName}</Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: style.secondary }}>
                <Text className="font-bold" style={{ color: style.text }}>{teamInitials(teamName)}</Text>
              </View>
            </View>

            <View className="rounded-md p-sm" style={{ backgroundColor: style.secondary }}>
              <Text className="font-semibold" style={{ color: style.contrast }}>{state.cardNumber}</Text>
              <Text variant="caption" style={{ color: style.contrast }}>{typeLabel} - {frame.label}</Text>
            </View>

            <Text style={{ color: style.text }}>{state.backCopy}</Text>
          </View>

          <View className="gap-sm">
            <View className="rounded-md border p-sm" style={{ borderColor: style.secondary }}>
              <View className="flex-row justify-between">
                <Text className="font-semibold" style={{ color: style.text }}>Stats</Text>
                <Text style={{ color: style.text }}>OVR {overallRating}</Text>
              </View>
              {statTiles.map((stat, index) => (
                <View key={`${stat}-back-${index}`} className="flex-row justify-between py-xs">
                  <Text style={{ color: style.text }}>{stat.replace(/\d+/g, '').trim() || `Stat ${index + 1}`}</Text>
                  <Text className="font-semibold" style={{ color: style.text }}>{parseStatValue(stat) || stat}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row justify-between gap-sm">
              <Text variant="caption" style={{ color: style.text }}>
                {state.release === 'limited' ? `Limited ${state.editionSize}` : state.release === 'one-of-one' ? 'One-of-one' : state.release === 'draft' ? 'Draft' : 'Unlimited'}
              </Text>
              <Text variant="caption" style={{ color: style.text }}>Copyright 2026 Statman</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}


import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, Sparkles } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { SmartImage } from '@/shared/media/SmartImage'
import { useNativeColor } from '@/lib/theme'
import { getArtworkById } from '@/modules/designs/curatedArtwork'
import {
  FINISHED_PREFAB_CARDS,
  type FinishedPrefabCard,
} from '../data/finishedPrefabCards'

export interface PrefabCardBrowserRailProps {
  /** Currently active prefab ID if any */
  activePrefabId?: string | null
  /** Currently active flagship design ID */
  activeFlagshipId?: string
  /** Handler when user clicks a prefab card */
  onSelectPrefab: (prefab: FinishedPrefabCard) => void
  /** Optional container className */
  className?: string
}

export function PrefabCardBrowserRail({
  activePrefabId,
  activeFlagshipId,
  onSelectPrefab,
  className = '',
}: PrefabCardBrowserRailProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  return (
    <View
      testID="prefab-card-browser-rail"
      className={`border-t border-border/80 bg-surface/95 backdrop-blur-md px-md pt-2.5 pb-3 ${className}`}
    >
      {/* Rail Header */}
      <View className="flex-row items-center justify-between pb-2">
        <View className="flex-row items-center gap-2">
          <View className="h-5 w-5 rounded-md bg-brand/10 items-center justify-center">
            <Sparkles size={12} color={brandColor} />
          </View>
          <Text className="text-xs font-bold uppercase tracking-wider text-text">
            Finished Collectibles
          </Text>
          <View className="rounded-full bg-brand/10 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-brand">
              {FINISHED_PREFAB_CARDS.length} Prefabs
            </Text>
          </View>
        </View>

        <Text variant="caption" className="text-[11px] text-muted-text hidden sm:flex">
          1-click apply complete artwork, layout, typography & story
        </Text>
      </View>

      {/* Horizontal Scrollable Cards Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 py-1 pr-4"
        keyboardShouldPersistTaps="handled"
      >
        {FINISHED_PREFAB_CARDS.map((prefab) => {
          const isActive =
            activePrefabId === prefab.id ||
            (!activePrefabId && activeFlagshipId === prefab.flagshipId)
          const artwork = getArtworkById(prefab.imageAssetId)
          const imgUrl = artwork?.url || prefab.avatarUrl

          return (
            <Pressable
              key={prefab.id}
              testID={`prefab-card-${prefab.id}`}
              onPress={() => onSelectPrefab(prefab)}
              className="group items-center gap-1.5 active:opacity-80 transition-all"
              accessibilityRole="button"
              accessibilityLabel={`Select ${prefab.title} card design`}
            >
              {/* Miniature Realistic Collectible Card */}
              <View
                style={{
                  width: 104,
                  height: 156,
                  backgroundColor: prefab.appearance.backgroundColor,
                  borderColor: isActive ? brandColor : prefab.appearance.borderColor,
                  borderWidth: isActive ? 2.5 : 1.5,
                }}
                className={`relative rounded-xl overflow-hidden shadow-md transition-all ${
                  isActive ? 'ring-2 ring-brand/40 shadow-lg scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                {/* Background Shimmer Layer */}
                <View
                  style={{
                    backgroundColor: prefab.appearance.accentColor,
                    opacity: 0.12,
                  }}
                  className="absolute inset-0"
                />

                {/* Top Badge Banner */}
                <View className="px-1.5 pt-1.5 flex-row items-center justify-between z-10">
                  <View
                    style={{ backgroundColor: prefab.badgeColor }}
                    className="px-1.5 py-0.2 rounded"
                  >
                    <Text className="text-[8px] font-extrabold text-black uppercase tracking-tight">
                      {prefab.badge}
                    </Text>
                  </View>

                  {isActive && (
                    <View className="h-4 w-4 rounded-full bg-brand items-center justify-center shadow-xs">
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>

                {/* Subject Image Window */}
                <View className="mx-1.5 my-1 rounded-md overflow-hidden bg-black/40 flex-1 relative">
                  {imgUrl ? (
                    <SmartImage
                      uri={imgUrl}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <Text className="text-[9px] text-muted-text">Portrait</Text>
                    </View>
                  )}

                  {/* Gradient scrim at bottom of image */}
                  <View className="absolute bottom-0 inset-x-0 h-6 bg-black/60" />
                </View>

                {/* Subject Nameplate at Bottom of Card */}
                <View
                  style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
                  className="px-1.5 py-1 border-t border-white/10"
                >
                  <Text
                    style={{ color: prefab.appearance.textColor }}
                    className="text-[9px] font-bold text-center uppercase tracking-tight"
                    numberOfLines={1}
                  >
                    {prefab.subjectName}
                  </Text>
                  <Text
                    style={{ color: prefab.accentColor }}
                    className="text-[7.5px] font-semibold text-center uppercase"
                    numberOfLines={1}
                  >
                    {prefab.contentStore.input2}
                  </Text>
                </View>
              </View>

              {/* Title & Style Tag Below Mini Card */}
              <View className="w-[104px] items-center">
                <Text
                  className={`text-[11px] font-bold text-center ${
                    isActive ? 'text-brand' : 'text-text'
                  }`}
                  numberOfLines={1}
                >
                  {prefab.title}
                </Text>
                <Text
                  variant="caption"
                  className="text-[9px] text-muted-text text-center"
                  numberOfLines={1}
                >
                  {prefab.subtitle}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

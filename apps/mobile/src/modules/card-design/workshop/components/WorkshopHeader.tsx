import React from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Sparkles, Layers, Eye, Smartphone, Monitor } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'

export interface WorkshopHeaderProps {
  selectedDesignName: string
  selectedFixtureLabel: string
  viewMode: 'split' | 'front' | 'back'
  onViewModeChange: (mode: 'split' | 'front' | 'back') => void
  cardScale: number
  onCardScaleChange: (scale: number) => void
  totalLayers: { front: number; back: number }
}

export function WorkshopHeader({
  selectedDesignName,
  selectedFixtureLabel,
  viewMode,
  onViewModeChange,
  cardScale,
  onCardScaleChange,
  totalLayers,
}: WorkshopHeaderProps) {
  const router = useRouter()
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="border-b border-border bg-surface px-4 py-3 flex-row items-center justify-between flex-wrap gap-3">
      {/* Left: Branding & Back to Studio link */}
      <View className="flex-row items-center gap-3">
        <Pressable
          testID="workshop-back-button"
          onPress={() => router.push('/cards/studio')}
          className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-canvas active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel="Back to Studio"
        >
          <ArrowLeft size={14} color={mutedColor} />
          <Text variant="caption" className="font-semibold text-xs text-text">
            Studio
          </Text>
        </Pressable>

        <View className="h-4 w-px bg-border" />

        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 rounded-md bg-brand/10 items-center justify-center">
            <Sparkles size={14} color={brandColor} />
          </View>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-text">
                Card Design Workshop
              </Text>
              <View className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                <Text className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Dev Tool
                </Text>
              </View>
            </View>
            <Text variant="caption" className="text-xs text-muted-text">
              {selectedDesignName} · {selectedFixtureLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Center: Face View Mode Tabs */}
      <View className="flex-row items-center bg-canvas p-1 rounded-xl border border-border">
        <Pressable
          testID="view-mode-split"
          accessibilityRole="button"
          onPress={() => onViewModeChange('split')}
          className={`px-3 py-1 rounded-lg ${viewMode === 'split' ? 'bg-surface shadow-xs' : ''}`}
        >
          <Text className={`text-xs font-semibold ${viewMode === 'split' ? 'text-brand' : 'text-muted-text'}`}>
            Side-by-Side
          </Text>
        </Pressable>
        <Pressable
          testID="view-mode-front"
          accessibilityRole="button"
          onPress={() => onViewModeChange('front')}
          className={`px-3 py-1 rounded-lg ${viewMode === 'front' ? 'bg-surface shadow-xs' : ''}`}
        >
          <Text className={`text-xs font-semibold ${viewMode === 'front' ? 'text-brand' : 'text-muted-text'}`}>
            Front ({totalLayers.front} layers)
          </Text>
        </Pressable>
        <Pressable
          testID="view-mode-back"
          accessibilityRole="button"
          onPress={() => onViewModeChange('back')}
          className={`px-3 py-1 rounded-lg ${viewMode === 'back' ? 'bg-surface shadow-xs' : ''}`}
        >
          <Text className={`text-xs font-semibold ${viewMode === 'back' ? 'text-brand' : 'text-muted-text'}`}>
            Back ({totalLayers.back} layers)
          </Text>
        </Pressable>
      </View>

      {/* Right: Scale Presets */}
      <View className="flex-row items-center gap-1.5">
        <Pressable
          testID="scale-thumb"
          onPress={() => onCardScaleChange(220)}
          className={`px-2.5 py-1 rounded-lg border ${cardScale === 220 ? 'border-brand bg-brand/10' : 'border-border bg-surface'}`}
        >
          <Text className={`text-xs font-semibold ${cardScale === 220 ? 'text-brand' : 'text-muted-text'}`}>
            Thumbnail (220px)
          </Text>
        </Pressable>
        <Pressable
          testID="scale-regular"
          onPress={() => onCardScaleChange(360)}
          className={`px-2.5 py-1 rounded-lg border ${cardScale === 360 ? 'border-brand bg-brand/10' : 'border-border bg-surface'}`}
        >
          <Text className={`text-xs font-semibold ${cardScale === 360 ? 'text-brand' : 'text-muted-text'}`}>
            Standard (360px)
          </Text>
        </Pressable>
        <Pressable
          testID="scale-full"
          onPress={() => onCardScaleChange(520)}
          className={`px-2.5 py-1 rounded-lg border ${cardScale === 520 ? 'border-brand bg-brand/10' : 'border-border bg-surface'}`}
        >
          <Text className={`text-xs font-semibold ${cardScale === 520 ? 'text-brand' : 'text-muted-text'}`}>
            Master (520px)
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

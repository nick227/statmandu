import React from 'react'
import { View, ScrollView } from 'react-native'
import { Text } from '@/shared/ui/Text'
import type { AuthoredDesignContract } from '../../types/designContract'

export interface DesignInspectorProps {
  design: AuthoredDesignContract
  frontLayerCount: number
  backLayerCount: number
}

export function DesignInspector({
  design,
  frontLayerCount,
  backLayerCount,
}: DesignInspectorProps) {
  return (
    <View className="w-80 border-l border-border bg-surface p-4 flex-col gap-5 hidden lg:flex">
      <View>
        <Text className="text-xs font-bold text-text uppercase tracking-wider mb-1">
          Art Direction Profile
        </Text>
        <Text className="text-sm font-semibold text-brand">
          {design.name}
        </Text>
        <Text variant="caption" className="text-xs text-muted-text mt-1">
          {design.visualTradition}
        </Text>
      </View>

      {/* Palette Tokens */}
      <View>
        <Text className="text-[11px] font-bold text-muted-text uppercase tracking-wider mb-2">
          Color Palette
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(design.palette)
            .filter(([_, val]) => typeof val === 'string')
            .map(([key, val]) => (
              <View key={key} className="items-center gap-1">
                <View
                  style={{ backgroundColor: val as string }}
                  className="w-7 h-7 rounded-lg border border-border shadow-2xs"
                />
                <Text variant="caption" className="text-[10px] text-muted-text">
                  {key.slice(0, 5)}
                </Text>
              </View>
            ))}
        </View>
      </View>

      {/* Typography Hierarchy */}
      <View>
        <Text className="text-[11px] font-bold text-muted-text uppercase tracking-wider mb-2">
          Typography System
        </Text>
        <View className="gap-1.5 bg-canvas/60 p-2.5 rounded-xl border border-border">
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Headline:</Text>
            <Text className="text-xs font-semibold text-text uppercase">{design.typography.headlineFont}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Body Narrative:</Text>
            <Text className="text-xs font-semibold text-text uppercase">{design.typography.bodyFont}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Subtext / Moniker:</Text>
            <Text className="text-xs font-semibold text-text uppercase">{design.typography.subtextFont}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Numerals / Serial:</Text>
            <Text className="text-xs font-semibold text-text uppercase">{design.typography.numberFont}</Text>
          </View>
        </View>
      </View>

      {/* Material Simulation */}
      <View>
        <Text className="text-[11px] font-bold text-muted-text uppercase tracking-wider mb-2">
          Material & Finish
        </Text>
        <View className="gap-1.5 bg-canvas/60 p-2.5 rounded-xl border border-border">
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Finish Effect:</Text>
            <Text className="text-xs font-bold text-amber-500 uppercase">{design.materials.finish}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Front Layers:</Text>
            <Text className="text-xs font-semibold text-text">{frontLayerCount}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" className="text-xs text-muted-text">Back Layers:</Text>
            <Text className="text-xs font-semibold text-text">{backLayerCount}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

import React from 'react'
import { View, type ViewStyle } from 'react-native'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import type { CardComposition } from '../hooks/useCardDesigns'

export interface CardPreviewStageProps {
  /** Compiled card composition to render */
  composition: CardComposition
  /** Responsive preview canvas width */
  canvasWidth: number
  /** Available image assets from unified media library */
  assets?: Array<{ id: string; url: string; objectKey?: string }>
  /** Optional container class name */
  className?: string
  /** Optional container style */
  style?: ViewStyle
}

/**
 * Workspace Card Stage:
 * Displays the live physical collectible card in an expansive, neutral workspace.
 * Centers the card horizontally and vertically, providing confidence, scale, and clarity.
 */
export function CardPreviewStage({
  composition,
  canvasWidth,
  assets,
  className,
  style,
}: CardPreviewStageProps) {
  return (
    <View
      testID="card-preview-stage"
      className={cn(
        'relative items-center justify-center bg-neutral-100/90 dark:bg-neutral-900/60 overflow-hidden',
        className,
      )}
      style={style}
    >
      {/* Central Canvas with Physical Realistic Drop Shadow */}
      <View className="items-center justify-center my-auto py-md">
        <View className="items-center justify-center rounded-2xl shadow-2xl transition-all">
          <CardCompositionRenderer
            composition={composition}
            width={canvasWidth}
            isPreview={true}
            assets={assets}
          />
        </View>
      </View>

      {/* Subtle Canva-style Stage Status Bar */}
      <View className="w-full flex-row items-center justify-between px-md py-xs border-t border-border/40 bg-surface/60 backdrop-blur-sm mt-auto">
        <View className="flex-row items-center gap-xs">
          <Text variant="caption" className="text-[11px] font-medium text-muted-text">
            Standard 2:3 Collectible (600 × 900 px)
          </Text>
        </View>
        <View className="flex-row items-center gap-sm">
          <Text variant="caption" className="text-[11px] font-medium text-muted-text">
            Live Preview · {Math.round((canvasWidth / 600) * 100)}%
          </Text>
        </View>
      </View>
    </View>
  )
}

import React from 'react'
import { View, type ViewStyle } from 'react-native'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
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
      className={cn(
        'items-center justify-center bg-neutral-100 dark:bg-neutral-900/60',
        className,
      )}
      style={style}
    >
      <View className="items-center justify-center shadow-2xl">
        <CardCompositionRenderer
          composition={composition}
          width={canvasWidth}
          isPreview={true}
          assets={assets}
        />
      </View>
    </View>
  )
}

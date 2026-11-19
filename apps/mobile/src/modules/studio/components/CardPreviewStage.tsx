import React from 'react'
import { Pressable, View, type ViewStyle } from 'react-native'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import type { CardComposition } from '../hooks/useCardDesigns'

export interface CardPreviewStageProps {
  /** Compiled front card composition to render */
  composition: CardComposition
  /** Coordinated back card composition */
  backComposition?: CardComposition
  /** Responsive preview canvas width */
  canvasWidth: number
  /** Available image assets from unified media library */
  assets?: Array<{ id: string; url: string; objectKey?: string }>
  /** Active card face to preview ('front' | 'back') */
  activeFace?: 'front' | 'back'
  /** Toggle card face callback */
  onToggleFace?: (face: 'front' | 'back') => void
  /** Optional container class name */
  className?: string
  /** Optional container style */
  style?: ViewStyle
}

/**
 * Workspace Card Stage:
 * Displays the live physical collectible card in an expansive, neutral workspace.
 * Features an interactive [ Front | Back ] face switcher directly above the card.
 * Centers the card horizontally and vertically, providing confidence, scale, and clarity.
 */
export function CardPreviewStage({
  composition,
  backComposition,
  canvasWidth,
  assets,
  activeFace = 'front',
  onToggleFace,
  className,
  style,
}: CardPreviewStageProps) {
  const isBack = activeFace === 'back' && Boolean(backComposition)
  const activeComposition = isBack && backComposition ? backComposition : composition

  return (
    <View
      testID="card-preview-stage"
      className={cn(
        'relative items-center justify-center bg-neutral-100/90 dark:bg-neutral-900/60 overflow-hidden',
        className,
      )}
      style={style}
    >
      {/* Central Canvas Container with Face Switcher */}
      <View className="items-center justify-center my-auto py-md gap-3">
        {/* Interactive [ Front | Back ] Segmented Face Toggle */}
        <View className="flex-row items-center rounded-full bg-surface border border-border p-1 shadow-sm">
          <Pressable
            testID="toggle-card-face-front"
            onPress={() => onToggleFace?.('front')}
            className={cn(
              'px-4 py-1.5 rounded-full flex-row items-center gap-1.5 transition-all',
              activeFace === 'front' ? 'bg-brand' : 'bg-transparent',
            )}
            accessibilityRole="button"
            accessibilityLabel="Show Front Face"
          >
            <Text
              className={cn(
                'text-xs font-bold',
                activeFace === 'front' ? 'text-brand-foreground' : 'text-muted-text',
              )}
            >
              Front
            </Text>
          </Pressable>

          <Pressable
            testID="toggle-card-face-back"
            onPress={() => onToggleFace?.('back')}
            className={cn(
              'px-4 py-1.5 rounded-full flex-row items-center gap-1.5 transition-all',
              activeFace === 'back' ? 'bg-brand' : 'bg-transparent',
            )}
            accessibilityRole="button"
            accessibilityLabel="Show Back Face"
          >
            <Text
              className={cn(
                'text-xs font-bold',
                activeFace === 'back' ? 'text-brand-foreground' : 'text-muted-text',
              )}
            >
              Back
            </Text>
          </Pressable>
        </View>

        {/* Physical Realistic Drop Shadow Canvas */}
        <View
          testID="raw-card-container"
          className="items-center justify-center rounded-2xl shadow-2xl transition-all"
        >
          <CardCompositionRenderer
            composition={activeComposition}
            width={canvasWidth}
            isPreview={true}
            assets={assets}
          />
        </View>
      </View>
    </View>
  )
}

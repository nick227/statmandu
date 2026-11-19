import React, { useState } from 'react'
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
  /** Active display mode ('card' | 'slab') */
  displayMode?: 'card' | 'slab'
  /** Toggle display mode callback */
  onToggleDisplayMode?: (mode: 'card' | 'slab') => void
  /** Optional container class name */
  className?: string
  /** Optional container style */
  style?: ViewStyle
}

/**
 * Workspace Card Stage:
 * Displays the live physical collectible card in an expansive, neutral workspace.
 * Features an interactive [ Front | Back ] face switcher and [ Card | Gem Slab ] display mode.
 * Centers the card horizontally and vertically, providing confidence, scale, and clarity.
 */
export function CardPreviewStage({
  composition,
  backComposition,
  canvasWidth,
  assets,
  activeFace = 'front',
  onToggleFace,
  displayMode: controlledDisplayMode,
  onToggleDisplayMode,
  className,
  style,
}: CardPreviewStageProps) {
  const [internalDisplayMode, setInternalDisplayMode] = useState<'card' | 'slab'>('card')
  const displayMode = controlledDisplayMode ?? internalDisplayMode
  const setDisplayMode = onToggleDisplayMode ?? setInternalDisplayMode
  const isBack = activeFace === 'back' && Boolean(backComposition)
  const activeComposition = isBack && backComposition ? backComposition : composition

  // Extract metadata for archival slab plaque (retaining identity across front & back)
  const flagship = (composition.metadata as any)?.flagship || (activeComposition.metadata as any)?.flagship
  const subjectName = flagship?.subject?.displayName ||
    composition.layers?.find((l: any) => l.id === 'slot-input1')?.text ||
    activeComposition.layers?.find((l: any) => l.id === 'slot-input1')?.text ||
    'COLLECTIBLE'
  const archetypeTitle = flagship?.title ||
    flagship?.designId?.replace(/-/g, ' ')?.toUpperCase() ||
    'FLAGSHIP COLLECTIBLE'
  const certNumber = 'CERT #RARE-88492019'

  // Slab dimensions scale proportionally to canvasWidth
  const slabScale = canvasWidth / 300
  const slabPadding = Math.round(14 * slabScale)
  const plaqueHeight = Math.round(62 * slabScale)

  return (
    <View
      testID="card-preview-stage"
      className={cn(
        'relative items-center justify-center bg-neutral-100/90 dark:bg-neutral-900/60 overflow-hidden',
        className,
      )}
      style={style}
    >
      {/* Central Canvas Container with Stage Controls */}
      <View className="items-center justify-center my-auto py-md gap-3">
        {/* Stage Header Controls: [ Front | Back ] and [ Card | Gem Slab ] */}
        <View className="flex-row items-center gap-3">
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

          {/* Interactive [ Card | Gem Slab ] Display Mode Toggle */}
          <View className="flex-row items-center rounded-full bg-surface border border-border p-1 shadow-sm">
            <Pressable
              testID="toggle-display-mode-card"
              onPress={() => setDisplayMode('card')}
              className={cn(
                'px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 transition-all',
                displayMode === 'card' ? 'bg-brand' : 'bg-transparent',
              )}
              accessibilityRole="button"
              accessibilityLabel="Raw Card Display Mode"
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  displayMode === 'card' ? 'text-brand-foreground' : 'text-muted-text',
                )}
              >
                Card
              </Text>
            </Pressable>

            <Pressable
              testID="toggle-display-mode-slab"
              onPress={() => setDisplayMode('slab')}
              className={cn(
                'px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 transition-all',
                displayMode === 'slab' ? 'bg-amber-500' : 'bg-transparent',
              )}
              accessibilityRole="button"
              accessibilityLabel="Collector Slab Mode"
            >
              <Text
                className={cn(
                  'text-xs font-bold',
                  displayMode === 'slab' ? 'text-neutral-950 font-black' : 'text-muted-text',
                )}
              >
                💎 Slab
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Display Wrapper: Raw Card or Archival Gem Mint Slab */}
        {displayMode === 'card' ? (
          /* Physical Realistic Drop Shadow Canvas */
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
        ) : (
          /* Archival Acrylic Magnetic One-Touch Display Slab */
          <View
            testID="collector-slab-container"
            style={{
              padding: slabPadding,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: Math.round(22 * slabScale),
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.35)',
              position: 'relative',
              boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            } as any}
          >
            {/* Magnetic Corner Brass Screw Rivets */}
            {/* Top-Left */}
            <View
              style={{
                position: 'absolute',
                top: 7 * slabScale,
                left: 7 * slabScale,
                width: 9 * slabScale,
                height: 9 * slabScale,
                borderRadius: 5 * slabScale,
                backgroundColor: '#D97706',
                borderWidth: 1,
                borderColor: '#FDE68A',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
              } as any}
            />
            {/* Top-Right */}
            <View
              style={{
                position: 'absolute',
                top: 7 * slabScale,
                right: 7 * slabScale,
                width: 9 * slabScale,
                height: 9 * slabScale,
                borderRadius: 5 * slabScale,
                backgroundColor: '#D97706',
                borderWidth: 1,
                borderColor: '#FDE68A',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
              } as any}
            />
            {/* Bottom-Left */}
            <View
              style={{
                position: 'absolute',
                bottom: 7 * slabScale,
                left: 7 * slabScale,
                width: 9 * slabScale,
                height: 9 * slabScale,
                borderRadius: 5 * slabScale,
                backgroundColor: '#D97706',
                borderWidth: 1,
                borderColor: '#FDE68A',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
              } as any}
            />
            {/* Bottom-Right */}
            <View
              style={{
                position: 'absolute',
                bottom: 7 * slabScale,
                right: 7 * slabScale,
                width: 9 * slabScale,
                height: 9 * slabScale,
                borderRadius: 5 * slabScale,
                backgroundColor: '#D97706',
                borderWidth: 1,
                borderColor: '#FDE68A',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7)',
              } as any}
            />

            {/* Archival PSA-Grade Header Plaque */}
            <View
              style={{
                width: canvasWidth,
                height: plaqueHeight,
                marginBottom: slabPadding,
                backgroundColor: '#0F172A',
                borderRadius: 8 * slabScale,
                borderWidth: 1.5,
                borderColor: '#D97706',
                paddingHorizontal: 10 * slabScale,
                paddingVertical: 5 * slabScale,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'inset 0 0 12px rgba(217, 119, 6, 0.25)',
              } as any}
            >
              {/* Plaque Left & Center Info */}
              <View style={{ flex: 1, paddingRight: 8 * slabScale }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 8.5 * slabScale,
                      fontWeight: '900',
                      color: '#F59E0B',
                      letterSpacing: 1.2,
                    }}
                  >
                    ★ RARE ARCHIVE
                  </Text>
                  <Text
                    style={{
                      fontSize: 8 * slabScale,
                      fontWeight: '600',
                      color: '#94A3B8',
                    }}
                  >
                    · 2025
                  </Text>
                </View>

                {/* Subject Name Line */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12 * slabScale,
                    fontWeight: '800',
                    color: '#F8FAFC',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginTop: 1 * slabScale,
                  }}
                >
                  {subjectName}
                </Text>

                {/* Archetype & Cert Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 * slabScale }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 8 * slabScale,
                      fontWeight: '700',
                      color: '#CBD5E1',
                      letterSpacing: 0.3,
                      maxWidth: '65%',
                    }}
                  >
                    {archetypeTitle}
                  </Text>
                  <Text
                    style={{
                      fontSize: 7.5 * slabScale,
                      fontFamily: 'monospace',
                      fontWeight: '600',
                      color: '#64748B',
                    }}
                  >
                    {certNumber}
                  </Text>
                </View>
              </View>

              {/* Plaque Right Grade Badge */}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1E293B',
                  borderRadius: 6 * slabScale,
                  borderWidth: 1,
                  borderColor: '#F59E0B',
                  paddingHorizontal: 7 * slabScale,
                  paddingVertical: 3 * slabScale,
                }}
              >
                <Text
                  style={{
                    fontSize: 7.5 * slabScale,
                    fontWeight: '800',
                    color: '#F59E0B',
                    letterSpacing: 0.8,
                  }}
                >
                  GEM MT
                </Text>
                <Text
                  style={{
                    fontSize: 18 * slabScale,
                    fontWeight: '900',
                    color: '#F8FAFC',
                    lineHeight: 20 * slabScale,
                  }}
                >
                  10
                </Text>
              </View>
            </View>

            {/* Recessed Card Well holding the Active Face */}
            <View
              style={{
                borderRadius: 16 * slabScale,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.6)',
              } as any}
            >
              <CardCompositionRenderer
                composition={activeComposition}
                width={canvasWidth}
                isPreview={true}
                assets={assets}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

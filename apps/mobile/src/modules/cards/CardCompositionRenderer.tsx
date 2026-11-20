import React from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import type { components } from '@statman/sdk'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'
import { FONT_ROLE_CSS_FAMILIES, type FontRole } from '@/modules/typography/textFit'
import { getArtworkById, DEFAULT_ARTWORK } from '@/modules/designs/curatedArtwork'

export interface GradientSpec {
  type?: 'linear' | 'radial'
  colors: string[]
  locations?: number[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  angle?: number
}

export interface ShadowSpec {
  color?: string
  offsetX?: number
  offsetY?: number
  blur?: number
  opacity?: number
}

export type CardLayerType = 'TEXT' | 'IMAGE' | 'RECTANGLE' | 'SVG' | 'PATH'

export type CardComposition = Omit<components['schemas']['CardComposition'], 'layers'> & {
  layers: CardCompositionLayer[]
  metadata?: {
    rendererVersion?: string
    taxonomy?: {
      version: number
      selections: any
      overrides?: any
    }
    [key: string]: any
  }
}

export type CardCompositionLayer = Omit<components['schemas']['CardCompositionLayer'], 'type'> & {
  type: CardLayerType
  fontRole?: FontRole
  allCaps?: boolean
  bold?: boolean
  italic?: boolean
  tracking?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  borderRadius?: number
  borderColor?: string
  borderWidth?: number
  borderLeftWidth?: number
  borderRightWidth?: number
  borderTopWidth?: number
  borderBottomWidth?: number
  gradient?: GradientSpec
  shadow?: ShadowSpec
  opacity?: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'color-dodge' | 'soft-light'
  pathData?: string
  viewBox?: string
  stroke?: string
  strokeWidth?: number
  [key: string]: any
}

export const RDC_COMPOSITION_RENDERER_VERSION = 'rdc-composition-v1'

export interface CardCompositionRendererProps {
  composition: CardComposition
  person?: {
    displayName?: string | null
    bio?: string | null
    hometown?: string | null
  } | null
  assets?: Array<{ id: string; url: string; objectKey?: string }>
  issue?: {
    issueNumber?: number | null
    editionSize?: number | null
    editionMode?: string | null
  } | null
  width?: number
  className?: string
  testID?: string
  isPreview?: boolean
}

export function resolvePersonField(
  personField: 'displayName' | 'bio' | 'hometown' | undefined,
  person?: { displayName?: string | null; bio?: string | null; hometown?: string | null } | null,
): string {
  if (!personField || !person) return ''
  if (personField === 'displayName') return person.displayName ?? ''
  if (personField === 'bio') return person.bio ?? ''
  if (personField === 'hometown') return person.hometown ?? ''
  return ''
}

export function resolveLayerText(
  layer: CardCompositionLayer,
  person?: { displayName?: string | null; bio?: string | null; hometown?: string | null } | null,
): string {
  if (layer.text) return layer.text
  if (layer.personField) return resolvePersonField(layer.personField, person)
  return ''
}

export function resolveAssetUrl(
  imageAssetId?: string,
  assets?: Array<{ id: string; url: string; objectKey?: string }>,
  isPreview: boolean = false,
): string | null {
  if (!imageAssetId) {
    return isPreview ? DEFAULT_ARTWORK.url : null
  }
  // Check curated artworks first
  const curated = getArtworkById(imageAssetId)
  if (curated) return curated.url

  if (assets && assets.length > 0) {
    const match = assets.find((a) => a.id === imageAssetId)
    if (match?.url) return match.url
  }
  // If the asset ID is already a full URL, local URI, or relative path
  if (
    imageAssetId.startsWith('http://') ||
    imageAssetId.startsWith('https://') ||
    imageAssetId.startsWith('/') ||
    imageAssetId.startsWith('data:') ||
    imageAssetId.startsWith('file://') ||
    imageAssetId.startsWith('blob:') ||
    imageAssetId.startsWith('content://') ||
    imageAssetId.startsWith('ph://')
  ) {
    return imageAssetId
  }
  return `/uploads/images/${imageAssetId}`
}

export function CardCompositionRenderer({
  composition,
  person,
  assets,
  issue,
  width = 320,
  className,
  testID = 'card-composition-renderer',
  isPreview = false,
}: CardCompositionRendererProps) {
  const canvasWidth = composition.canvas?.width || 600
  const canvasHeight = composition.canvas?.height || 900
  const scale = width / canvasWidth
  const height = canvasHeight * scale

  const layers = composition.layers || []

  // Interactive holographic / refractor sheen tracking
  const finishEffect = (composition.metadata as any)?.flagship?.appearance?.finishEffect
  const isHolo = finishEffect === 'holographic'
  const isMetallic = finishEffect === 'metallic'
  const hasRefractor = isHolo || isMetallic || isPreview
  const [lightOffset, setLightOffset] = React.useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = React.useState(false)

  const handlePointerMove = React.useCallback((e: any) => {
    const rect = e.currentTarget?.getBoundingClientRect?.()
    if (!rect) return
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)))
    setLightOffset({ x, y })
  }, [])

  // Authentic issue number display (never fabricated in preview)
  const isAuthenticIssue = Boolean(issue && typeof issue.issueNumber === 'number')
  const formattedIssueNumber = isAuthenticIssue
    ? `#${String(issue!.issueNumber).padStart(3, '0')}${
        issue!.editionSize ? ` / ${String(issue!.editionSize).padStart(3, '0')}` : ''
      }`
    : null

  return (
    <View
      testID={testID}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-md',
        className,
      )}
      style={{
        width,
        height,
      }}
      {...({
        onPointerMove: handlePointerMove,
        onPointerEnter: () => setIsHovered(true),
        onPointerLeave: () => {
          setIsHovered(false)
          setLightOffset({ x: 50, y: 50 })
        },
      } as any)}
    >
      {/* Ordered layers back-to-front */}
      {layers.map((layer, index) => {
        const layerAny = layer as any
        const shadow = layerAny.shadow
        const gradient = layerAny.gradient

        const baseLayerStyle: any = {
          position: 'absolute' as const,
          left: (layer.x ?? 0) * scale,
          top: (layer.y ?? 0) * scale,
          width: (layer.width ?? 100) * scale,
          height: (layer.height ?? 100) * scale,
          opacity: layerAny.opacity !== undefined ? layerAny.opacity : 1,
        }

        if (layerAny.blendMode) {
          baseLayerStyle.mixBlendMode = layerAny.blendMode
        }

        if (shadow) {
          baseLayerStyle.shadowColor = shadow.color || '#000000'
          baseLayerStyle.shadowOffset = {
            width: (shadow.offsetX ?? 0) * scale,
            height: (shadow.offsetY ?? 2) * scale,
          }
          baseLayerStyle.shadowOpacity = shadow.opacity ?? 0.4
          baseLayerStyle.shadowRadius = (shadow.blur ?? 4) * scale
          baseLayerStyle.elevation = (shadow.blur ?? 4) * scale
          baseLayerStyle.boxShadow = `${(shadow.offsetX ?? 0) * scale}px ${(shadow.offsetY ?? 2) * scale}px ${(shadow.blur ?? 4) * scale}px ${shadow.color || 'rgba(0,0,0,0.45)'}`
        }

        if (layer.type === 'RECTANGLE') {
          const borderRadius = layerAny.borderRadius ? layerAny.borderRadius * scale : undefined
          const borderWidth = layerAny.borderWidth ? layerAny.borderWidth * scale : undefined
          const borderColor = layerAny.borderColor || undefined

          return (
            <View
              key={layer.id || `rect-${index}`}
              testID={`layer-rect-${layer.id || index}`}
              style={[
                baseLayerStyle,
                {
                  borderRadius,
                  borderWidth,
                  borderColor,
                  overflow: gradient ? 'hidden' : undefined,
                  backgroundColor: gradient ? undefined : (layer.fill || '#18181b'),
                },
              ]}
            >
              {gradient && (
                <LinearGradient
                  colors={gradient.colors as [string, string, ...string[]]}
                  locations={gradient.locations}
                  start={gradient.start || { x: 0, y: 0 }}
                  end={gradient.end || { x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius }]}
                />
              )}
            </View>
          )
        }

        if (layer.type === 'IMAGE') {
          const imgUrl = resolveAssetUrl(layer.imageAssetId, assets, isPreview)
          return (
            <View
              key={layer.id || `img-${index}`}
              testID={`layer-img-${layer.id || index}`}
              style={[
                baseLayerStyle,
                {
                  overflow: 'hidden',
                  borderRadius: layerAny.borderRadius ? layerAny.borderRadius * scale : undefined,
                  borderWidth: layerAny.borderWidth ? layerAny.borderWidth * scale : undefined,
                  borderColor: layerAny.borderColor || undefined,
                },
              ]}
            >
              {imgUrl ? (
                <SmartImage
                  uri={imgUrl}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-neutral-800">
                  <RNText style={{ color: '#71717a', fontSize: 12 * scale }}>No image</RNText>
                </View>
              )}
            </View>
          )
        }

        if (layer.type === 'SVG' || layerAny.type === 'PATH') {
          const viewBox = layerAny.viewBox || `0 0 ${layer.width ?? 100} ${layer.height ?? 100}`
          const strokeWidth = layerAny.strokeWidth ? layerAny.strokeWidth * scale : undefined
          return (
            <View
              key={layer.id || `svg-${index}`}
              testID={`layer-svg-${layer.id || index}`}
              style={baseLayerStyle}
              pointerEvents="none"
            >
              <Svg
                viewBox={viewBox}
                width="100%"
                height="100%"
              >
                {layerAny.pathData && (
                  <Path
                    d={layerAny.pathData}
                    fill={layer.fill || 'none'}
                    stroke={layerAny.stroke}
                    strokeWidth={strokeWidth}
                  />
                )}
              </Svg>
            </View>
          )
        }

        if (layer.type === 'TEXT') {
          const textContent = resolveLayerText(layer, person)
          const fontSize = (layer.fontSize ?? 18) * scale
          const color = layer.fill || '#FFFFFF'
          const fontFamily = layerAny.fontRole ? FONT_ROLE_CSS_FAMILIES[layerAny.fontRole as FontRole] : undefined

          return (
            <View
              key={layer.id || `text-${index}`}
              testID={`layer-text-${layer.id || index}`}
              style={[baseLayerStyle, { justifyContent: 'center' }]}
            >
              <RNText
                numberOfLines={layer.height ? Math.max(1, Math.floor((layer.height * scale) / (fontSize * 1.2))) : 2}
                style={{
                  fontSize,
                  color,
                  fontWeight: layerAny.bold ? '700' : '600',
                  fontStyle: layerAny.italic ? 'italic' : 'normal',
                  lineHeight: fontSize * 1.25,
                  textTransform: layerAny.allCaps ? 'uppercase' : undefined,
                  letterSpacing: layerAny.tracking ? layerAny.tracking * scale : layerAny.allCaps ? 1.2 * scale : undefined,
                  textAlign: layerAny.textAlign || layerAny.align || undefined,
                  ...(fontFamily ? { fontFamily } : {}),
                  ...(shadow ? {
                    textShadowColor: shadow.color || 'rgba(0,0,0,0.6)',
                    textShadowOffset: { width: (shadow.offsetX ?? 0) * scale, height: (shadow.offsetY ?? 1) * scale },
                    textShadowRadius: (shadow.blur ?? 2) * scale,
                  } : {}),
                }}
              >
                {textContent}
              </RNText>
            </View>
          )
        }

        return null
      })}

      {/* Dynamic Holographic & Prismatic Refractor Sheen Layer */}
      {isHolo && (
        <View
          pointerEvents="none"
          testID="holographic-sheen-overlay"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 16 * scale,
              opacity: isHovered ? 0.55 : 0.28,
              background: `linear-gradient(${115 + (lightOffset.x - 50) * 0.75}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) ${Math.max(0, lightOffset.x - 24)}%, rgba(6,182,212,0.45) ${lightOffset.x - 12}%, rgba(236,72,153,0.48) ${lightOffset.x - 4}%, rgba(244,63,94,0.48) ${lightOffset.x + 4}%, rgba(250,204,21,0.45) ${lightOffset.x + 12}%, rgba(16,185,129,0.38) ${lightOffset.x + 18}%, rgba(255,255,255,0.18) ${Math.min(100, lightOffset.x + 24)}%, rgba(255,255,255,0) 100%), radial-gradient(circle at ${lightOffset.x}% ${lightOffset.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 45%)`,
              mixBlendMode: 'color-dodge',
              transition: 'opacity 0.25s ease',
            } as any,
          ]}
        />
      )}

      {/* Dynamic Metallic Specular Lustre Sheen */}
      {isMetallic && (
        <View
          pointerEvents="none"
          testID="metallic-sheen-overlay"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 16 * scale,
              opacity: isHovered ? 0.48 : 0.25,
              background: `linear-gradient(${125 + (lightOffset.x - 50) * 0.6}deg, transparent 0%, rgba(254,240,138,0.2) ${Math.max(0, lightOffset.x - 18)}%, rgba(255,255,255,0.55) ${lightOffset.x}%, rgba(245,158,11,0.25) ${Math.min(100, lightOffset.x + 18)}%, transparent 100%), radial-gradient(circle at ${lightOffset.x}% ${lightOffset.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
              mixBlendMode: 'color-dodge',
              transition: 'opacity 0.25s ease',
            } as any,
          ]}
        />
      )}

      {/* Specular Diagonal Reflection Glass Sheen */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 16 * scale,
            background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 60%), radial-gradient(circle at ${lightOffset.x}% ${lightOffset.y}%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
          } as any,
        ]}
      />

      {/* Number overlay for authentic issued copies */}
      {isAuthenticIssue && formattedIssueNumber && (
        <View
          testID="authentic-issue-badge"
          style={[
            styles.issueBadge,
            {
              bottom: 12 * scale,
              right: 12 * scale,
              paddingHorizontal: 8 * scale,
              paddingVertical: 4 * scale,
              borderRadius: 6 * scale,
            },
          ]}
        >
          <RNText
            style={{
              color: '#FFFFFF',
              fontSize: 11 * scale,
              fontWeight: '700',
              letterSpacing: 0.5,
            }}
          >
            {formattedIssueNumber}
          </RNText>
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  issueBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
})

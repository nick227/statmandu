import React from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import type { components } from '@statman/sdk'
import { SmartImage } from '@/shared/media/SmartImage'
import { cn } from '@/lib/utils'

export type CardComposition = components['schemas']['CardComposition']
export type CardCompositionLayer = components['schemas']['CardCompositionLayer']

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
): string | null {
  if (!imageAssetId) return null
  if (assets && assets.length > 0) {
    const match = assets.find((a) => a.id === imageAssetId)
    if (match?.url) return match.url
  }
  // If the asset ID is already a full URL or relative path
  if (imageAssetId.startsWith('http://') || imageAssetId.startsWith('https://') || imageAssetId.startsWith('/')) {
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
    >
      {/* Ordered layers back-to-front */}
      {layers.map((layer, index) => {
        const layerStyle = {
          position: 'absolute' as const,
          left: (layer.x ?? 0) * scale,
          top: (layer.y ?? 0) * scale,
          width: (layer.width ?? 100) * scale,
          height: (layer.height ?? 100) * scale,
        }

        if (layer.type === 'RECTANGLE') {
          return (
            <View
              key={layer.id || `rect-${index}`}
              testID={`layer-rect-${layer.id || index}`}
              style={[
                layerStyle,
                {
                  backgroundColor: layer.fill || '#18181b',
                },
              ]}
            />
          )
        }

        if (layer.type === 'IMAGE') {
          const imgUrl = resolveAssetUrl(layer.imageAssetId, assets)
          return (
            <View
              key={layer.id || `img-${index}`}
              testID={`layer-img-${layer.id || index}`}
              style={[layerStyle, { overflow: 'hidden' }]}
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

        if (layer.type === 'TEXT') {
          const textContent = resolveLayerText(layer, person)
          const fontSize = (layer.fontSize ?? 18) * scale
          const color = layer.fill || '#FFFFFF'

          return (
            <View
              key={layer.id || `text-${index}`}
              testID={`layer-text-${layer.id || index}`}
              style={[layerStyle, { justifyContent: 'center' }]}
            >
              <RNText
                numberOfLines={layer.height ? Math.max(1, Math.floor((layer.height * scale) / (fontSize * 1.2))) : 2}
                style={{
                  fontSize,
                  color,
                  fontWeight: '600',
                  lineHeight: fontSize * 1.2,
                }}
              >
                {textContent}
              </RNText>
            </View>
          )
        }

        return null
      })}

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

      {/* Unissued preview indicator */}
      {isPreview && !isAuthenticIssue && (
        <View
          testID="unissued-preview-indicator"
          style={[
            styles.previewBadge,
            {
              top: 10 * scale,
              right: 10 * scale,
              paddingHorizontal: 6 * scale,
              paddingVertical: 2 * scale,
              borderRadius: 4 * scale,
            },
          ]}
        >
          <RNText
            style={{
              color: '#F43F5E',
              fontSize: 9 * scale,
              fontWeight: '700',
              letterSpacing: 0.5,
            }}
          >
            PREVIEW · UNISSUED
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

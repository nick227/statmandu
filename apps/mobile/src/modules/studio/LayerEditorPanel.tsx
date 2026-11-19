import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import type { CardCompositionLayer } from './hooks/useCardDesigns'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react-native'

export interface LayerEditorPanelProps {
  layer: CardCompositionLayer
  layerIndex: number
  totalLayers: number
  onChange: (updatedLayer: CardCompositionLayer) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

const COLOR_SWATCHES = [
  '#FFFFFF',
  '#09090B',
  '#18181B',
  '#27272A',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
]

const FONT_SIZES = [14, 18, 24, 32, 40, 48]

export function LayerEditorPanel({
  layer,
  layerIndex,
  totalLayers,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: LayerEditorPanelProps) {
  function update(partial: Partial<CardCompositionLayer>) {
    onChange({ ...layer, ...partial })
  }

  return (
    <View className="gap-md rounded-2xl border border-border bg-surface p-md">
      {/* Layer Header & Reorder/Delete */}
      <View className="flex-row items-center justify-between border-b border-border pb-sm">
        <View className="flex-row items-center gap-xs">
          <Text className="font-bold text-text">
            {layer.type} Layer #{layerIndex + 1}
          </Text>
          <Text variant="caption">({layer.id})</Text>
        </View>

        <View className="flex-row items-center gap-xs">
          <Button
            size="sm"
            variant="ghost"
            icon={ArrowUp}
            disabled={layerIndex === totalLayers - 1}
            onPress={onMoveUp}
          >
            Forward
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={ArrowDown}
            disabled={layerIndex === 0}
            onPress={onMoveDown}
          >
            Back
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            className="text-error"
            onPress={onDelete}
          >
            Delete
          </Button>
        </View>
      </View>

      {/* Layer Type-Specific Controls */}
      {layer.type === 'TEXT' && (
        <View className="gap-sm">
          {/* Binding selector */}
          <Text className="text-xs font-semibold uppercase text-muted-text">Content Source</Text>
          <View className="flex-row flex-wrap gap-xs">
            <Pressable
              onPress={() => update({ personField: undefined, text: layer.text || 'Custom text' })}
              className={`rounded-lg border px-sm py-xs ${
                !layer.personField ? 'border-brand bg-brand/10' : 'border-border bg-card-surface'
              }`}
            >
              <Text className="text-xs font-medium">Custom Text</Text>
            </Pressable>
            <Pressable
              onPress={() => update({ personField: 'displayName', text: undefined })}
              className={`rounded-lg border px-sm py-xs ${
                layer.personField === 'displayName'
                  ? 'border-brand bg-brand/10'
                  : 'border-border bg-card-surface'
              }`}
            >
              <Text className="text-xs font-medium">Person Name</Text>
            </Pressable>
            <Pressable
              onPress={() => update({ personField: 'bio', text: undefined })}
              className={`rounded-lg border px-sm py-xs ${
                layer.personField === 'bio' ? 'border-brand bg-brand/10' : 'border-border bg-card-surface'
              }`}
            >
              <Text className="text-xs font-medium">Person Bio</Text>
            </Pressable>
            <Pressable
              onPress={() => update({ personField: 'hometown', text: undefined })}
              className={`rounded-lg border px-sm py-xs ${
                layer.personField === 'hometown'
                  ? 'border-brand bg-brand/10'
                  : 'border-border bg-card-surface'
              }`}
            >
              <Text className="text-xs font-medium">Hometown</Text>
            </Pressable>
          </View>

          {/* Custom text input */}
          {!layer.personField && (
            <View className="gap-xs pt-xs">
              <Text className="text-xs font-semibold uppercase text-muted-text">Text Content</Text>
              <Input
                value={layer.text ?? ''}
                onChangeText={(text) => update({ text: text.slice(0, 4000) })}
                placeholder="Enter card text..."
                multiline
              />
            </View>
          )}

          {/* Typography: Font size */}
          <View className="gap-xs pt-xs">
            <Text className="text-xs font-semibold uppercase text-muted-text">Font Size ({layer.fontSize ?? 18}px)</Text>
            <View className="flex-row flex-wrap gap-xs">
              {FONT_SIZES.map((size) => (
                <Pressable
                  key={size}
                  onPress={() => update({ fontSize: size })}
                  className={`rounded-md border px-sm py-xs ${
                    (layer.fontSize ?? 18) === size
                      ? 'border-brand bg-brand/10'
                      : 'border-border bg-card-surface'
                  }`}
                >
                  <Text className="text-xs font-semibold">{size}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Text color fill */}
          <View className="gap-xs pt-xs">
            <Text className="text-xs font-semibold uppercase text-muted-text">Text Color</Text>
            <View className="flex-row items-center gap-xs">
              <Input
                className="w-28 text-xs"
                value={layer.fill ?? '#FFFFFF'}
                onChangeText={(fill) => update({ fill })}
                placeholder="#FFFFFF"
                autoCapitalize="none"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-xs">
                {COLOR_SWATCHES.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => update({ fill: color })}
                    style={{ backgroundColor: color }}
                    className={`h-7 w-7 rounded-full border ${
                      layer.fill === color ? 'border-brand border-2' : 'border-neutral-700'
                    }`}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {layer.type === 'RECTANGLE' && (
        <View className="gap-sm">
          <Text className="text-xs font-semibold uppercase text-muted-text">Fill Color</Text>
          <View className="flex-row items-center gap-xs">
            <Input
              className="w-28 text-xs"
              value={layer.fill ?? '#18181B'}
              onChangeText={(fill) => update({ fill })}
              placeholder="#18181B"
              autoCapitalize="none"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-xs">
              {COLOR_SWATCHES.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => update({ fill: color })}
                  style={{ backgroundColor: color }}
                  className={`h-7 w-7 rounded-full border ${
                    layer.fill === color ? 'border-brand border-2' : 'border-neutral-700'
                  }`}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {layer.type === 'IMAGE' && (
        <View className="gap-sm">
          <Text className="text-xs font-semibold uppercase text-muted-text">Image Asset ID or URL</Text>
          <Input
            value={layer.imageAssetId ?? ''}
            onChangeText={(imageAssetId) => update({ imageAssetId })}
            placeholder="Asset ID or image URL"
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Geometry: X, Y, Width, Height */}
      <View className="gap-xs border-t border-border pt-sm">
        <Text className="text-xs font-semibold uppercase text-muted-text">Geometry (Canvas 600 × 900)</Text>
        <View className="flex-row gap-xs">
          <View className="flex-1">
            <Text variant="caption">X</Text>
            <Input
              keyboardType="numeric"
              value={String(layer.x ?? 0)}
              onChangeText={(val) => update({ x: Math.max(0, parseInt(val, 10) || 0) })}
            />
          </View>
          <View className="flex-1">
            <Text variant="caption">Y</Text>
            <Input
              keyboardType="numeric"
              value={String(layer.y ?? 0)}
              onChangeText={(val) => update({ y: Math.max(0, parseInt(val, 10) || 0) })}
            />
          </View>
          <View className="flex-1">
            <Text variant="caption">Width</Text>
            <Input
              keyboardType="numeric"
              value={String(layer.width ?? 100)}
              onChangeText={(val) => update({ width: Math.max(10, parseInt(val, 10) || 100) })}
            />
          </View>
          <View className="flex-1">
            <Text variant="caption">Height</Text>
            <Input
              keyboardType="numeric"
              value={String(layer.height ?? 100)}
              onChangeText={(val) => update({ height: Math.max(10, parseInt(val, 10) || 100) })}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

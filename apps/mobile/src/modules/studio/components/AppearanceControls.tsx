import React from 'react'
import { Pressable, View } from 'react-native'
import { Check, Sparkles, SunMedium, Layers, Type, Palette } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { AppearanceGroup } from '../types/panelNavigation'
import type { StudioAppearanceState } from '@/modules/designs/flagshipDesigns'
import type { FontRole } from '@/modules/typography/textFit'

export interface AppearanceControlsProps {
  group: AppearanceGroup
  appearance: StudioAppearanceState
  onUpdate: (patch: Partial<StudioAppearanceState>) => void
}

const FONT_ROLES: Array<{ id: FontRole; label: string; desc: string }> = [
  { id: 'serif', label: 'Serif', desc: 'Editorial, classic, archival' },
  { id: 'sans', label: 'Sans', desc: 'Modern, clean, balanced' },
  { id: 'mono', label: 'Mono', desc: 'Technical, tabular, structured' },
  { id: 'display', label: 'Display', desc: 'Bold, prominent, stylized' },
]

const COLOR_PRESETS: Array<{
  name: string
  bg: string
  accent: string
  border: string
  fg: string
}> = [
  { name: 'Obsidian', bg: '#09090b', accent: '#E4E4E7', border: '#27272a', fg: '#FAFAFA' },
  { name: 'Paper', bg: '#F4F4F5', accent: '#18181B', border: '#E4E4E7', fg: '#09090b' },
  { name: 'Gold', bg: '#0A0F1D', accent: '#F59E0B', border: '#1E293B', fg: '#F8FAFC' },
  { name: 'Crimson', bg: '#180709', accent: '#F43F5E', border: '#3B0D14', fg: '#FFF1F2' },
  { name: 'Emerald', bg: '#041711', accent: '#10B981', border: '#064E3B', fg: '#ECFDF5' },
  { name: 'Cyber', bg: '#060B1E', accent: '#38BDF8', border: '#1E293B', fg: '#F0F9FF' },
]

const BORDER_WIDTHS = [0, 4, 8, 16]

export function AppearanceControls({
  group,
  appearance,
  onUpdate,
}: AppearanceControlsProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  if (group === 'typography') {
    const activeRole = appearance.fontRole || 'serif'
    return (
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
            Font Style
          </Text>
          <Text variant="caption" className="text-xs text-muted-text">
            Choose the typographic tone that best reflects the card&apos;s era:
          </Text>
        </View>

        <View className="gap-2">
          {FONT_ROLES.map((role) => {
            const isSelected = activeRole === role.id
            return (
              <Pressable
                key={role.id}
                testID={`font-role-${role.id}`}
                onPress={() => onUpdate({ fontRole: role.id })}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border p-3 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40'
                )}
              >
                <View>
                  <Text className={cn('text-sm font-bold', isSelected ? 'text-brand' : 'text-text')}>
                    {role.label}
                  </Text>
                  <Text variant="caption" className="text-xs text-muted-text">
                    {role.desc}
                  </Text>
                </View>
                {isSelected ? <Check size={16} color={brandColor} /> : null}
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  if (group === 'colors') {
    return (
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
            Color Palette
          </Text>
          <Text variant="caption" className="text-xs text-muted-text">
            Select a harmonic palette preset for background and accent highlights:
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          {COLOR_PRESETS.map((p) => {
            const isSelected =
              appearance.backgroundColor === p.bg && appearance.accentColor === p.accent
            return (
              <Pressable
                key={p.name}
                testID={`color-preset-${p.name.toLowerCase()}`}
                onPress={() =>
                  onUpdate({
                    backgroundColor: p.bg,
                    accentColor: p.accent,
                    borderColor: p.border,
                    textColor: p.fg,
                  })
                }
                className={cn(
                  'w-[calc(50%-5px)] rounded-xl border p-3 gap-2.5 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40'
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-text">
                    {p.name}
                  </Text>
                  {isSelected ? <Check size={14} color={brandColor} /> : null}
                </View>

                {/* Color swatches */}
                <View className="flex-row items-center gap-1.5">
                  <View
                    style={{ backgroundColor: p.bg }}
                    className="h-5 flex-1 rounded border border-white/20"
                  />
                  <View
                    style={{ backgroundColor: p.accent }}
                    className="h-5 flex-1 rounded border border-white/20"
                  />
                  <View
                    style={{ backgroundColor: p.fg }}
                    className="h-5 flex-1 rounded border border-white/20"
                  />
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* Reset to Design Defaults */}
        <Pressable
          onPress={() =>
            onUpdate({
              backgroundColor: undefined,
              accentColor: undefined,
              borderColor: undefined,
              textColor: undefined,
            })
          }
          className="rounded-lg border border-border/80 p-2.5 items-center justify-center hover:bg-surface active:opacity-70"
        >
          <Text className="text-xs font-medium text-muted-text">
            Reset to Preset Defaults
          </Text>
        </Pressable>
      </View>
    )
  }

  if (group === 'framing') {
    const activeWidth = appearance.borderWidth ?? 0
    return (
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
            Border Width
          </Text>
          <Text variant="caption" className="text-xs text-muted-text">
            Control the inner framing border around the card artwork:
          </Text>
        </View>

        <View className="flex-row gap-2">
          {BORDER_WIDTHS.map((bw) => {
            const isSelected = activeWidth === bw
            return (
              <Pressable
                key={bw}
                testID={`border-width-${bw}`}
                onPress={() => onUpdate({ borderWidth: bw })}
                className={cn(
                  'flex-1 rounded-xl border p-3 items-center justify-center active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10'
                    : 'border-border/80 bg-surface hover:border-brand/40'
                )}
              >
                <Text className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-text')}>
                  {bw === 0 ? 'None' : `${bw}px`}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  if (group === 'effects') {
    const activeTexture = appearance.textureEffect || 'none'
    const isVignette = Boolean(appearance.vignetteEffect)

    return (
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
            Texture & Sheen
          </Text>
          <Text variant="caption" className="text-xs text-muted-text">
            Add physical collectible finishes to the composition:
          </Text>
        </View>

        <View className="gap-2">
          {[
            { id: 'none', label: 'Clean', desc: 'Smooth digital finish' },
            { id: 'holo', label: 'Holographic', desc: 'Prismatic light reflection accent' },
            { id: 'foil', label: 'Gold Foil', desc: 'Polished metallic gold trim' },
          ].map((tex) => {
            const isSelected = activeTexture === tex.id
            return (
              <Pressable
                key={tex.id}
                testID={`effect-texture-${tex.id}`}
                onPress={() => onUpdate({ textureEffect: tex.id as any })}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border p-3 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40'
                )}
              >
                <View>
                  <Text className={cn('text-sm font-bold', isSelected ? 'text-brand' : 'text-text')}>
                    {tex.label}
                  </Text>
                  <Text variant="caption" className="text-xs text-muted-text">
                    {tex.desc}
                  </Text>
                </View>
                {isSelected ? <Check size={16} color={brandColor} /> : null}
              </Pressable>
            )
          })}
        </View>

        {/* Vignette Toggle */}
        <Pressable
          testID="effect-vignette-toggle"
          onPress={() => onUpdate({ vignetteEffect: !isVignette })}
          className={cn(
            'flex-row items-center justify-between rounded-xl border p-3 active:opacity-70 transition-all',
            isVignette
              ? 'border-brand bg-brand/10'
              : 'border-border/80 bg-surface'
          )}
        >
          <View>
            <Text className={cn('text-sm font-bold', isVignette ? 'text-brand' : 'text-text')}>
              Vignette
            </Text>
            <Text variant="caption" className="text-xs text-muted-text">
              Soft cinematic edge shadowing
            </Text>
          </View>
          {isVignette ? <Check size={16} color={brandColor} /> : null}
        </Pressable>
      </View>
    )
  }

  // Layout group
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
          Layout Geometry
        </Text>
        <Text variant="caption" className="text-xs text-muted-text">
          Geometry is tailored by your Card Template (Standard, Stats, or Minimal) and flagship aesthetic recipe.
        </Text>
      </View>

      <View className="rounded-xl border border-border/80 bg-surface p-3.5 gap-2">
        <Text className="text-xs font-semibold text-text">
          Active Layout Adaptation
        </Text>
        <Text variant="caption" className="text-xs text-muted-text">
          Positioning and typography bounds adapt smoothly without clipping or content distortion.
        </Text>
      </View>
    </View>
  )
}

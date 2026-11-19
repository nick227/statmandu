import React from 'react'
import { Pressable, View } from 'react-native'
import { Check } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type {
  StudioAppearanceState,
  LayoutVariant,
  ArtworkStyle,
  FinishEffect,
} from '@/modules/designs/flagshipDesigns'
import type { FontRole } from '@/modules/typography/textFit'

export interface AppearanceControlsProps {
  appearance: StudioAppearanceState
  onUpdate: (patch: Partial<StudioAppearanceState>) => void
}

const LAYOUT_VARIANTS: Array<{ id: LayoutVariant; label: string; desc: string }> = [
  { id: 'portrait', label: 'Portrait', desc: 'Subject-focused vertical emphasis' },
  { id: 'balanced', label: 'Balanced', desc: 'Harmonious composition and spacing' },
  { id: 'editorial', label: 'Editorial', desc: 'Magazine layout with expansive text space' },
]

const FONT_ROLES: Array<{ id: FontRole; label: string; desc: string }> = [
  { id: 'serif', label: 'Editorial Serif', desc: 'Refined, literary, archival' },
  { id: 'sans', label: 'Modern Sans', desc: 'Clean, neutral, contemporary' },
  { id: 'mono', label: 'Technical Mono', desc: 'Structured, tabular, data-driven' },
  { id: 'display', label: 'Bold Display', desc: 'Prominent, poster-grade headline' },
]

const COLOR_PRESETS: Array<{
  name: string
  bg: string
  accent: string
  border: string
  fg: string
}> = [
  { name: 'Obsidian', bg: '#09090b', accent: '#E4E4E7', border: '#27272a', fg: '#FAFAFA' },
  { name: 'Gold', bg: '#0A0F1D', accent: '#F59E0B', border: '#1E293B', fg: '#F8FAFC' },
  { name: 'Paper', bg: '#F4F4F5', accent: '#18181B', border: '#E4E4E7', fg: '#09090b' },
  { name: 'Crimson', bg: '#180709', accent: '#F43F5E', border: '#3B0D14', fg: '#FFF1F2' },
  { name: 'Emerald', bg: '#041711', accent: '#10B981', border: '#064E3B', fg: '#ECFDF5' },
  { name: 'Cyber', bg: '#060B1E', accent: '#38BDF8', border: '#1E293B', fg: '#F0F9FF' },
]

const ARTWORK_STYLES: Array<{ id: ArtworkStyle; label: string; desc: string }> = [
  { id: 'photographic', label: 'Photographic', desc: 'Clean, unaltered natural portrait' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Dramatic contrast and vignette focus' },
  { id: 'vintage', label: 'Vintage', desc: 'Archival sepia and warm patina' },
  { id: 'illustrated', label: 'Illustrated', desc: 'Stylized poster graphic aesthetic' },
]

const FINISH_EFFECTS: Array<{ id: FinishEffect; label: string; desc: string }> = [
  { id: 'matte', label: 'Matte', desc: 'Smooth, glare-free archival finish' },
  { id: 'metallic', label: 'Metallic', desc: 'Polished reflective gold accent trim' },
  { id: 'holographic', label: 'Holographic', desc: 'Prismatic light reflection sheen' },
  { id: 'textured', label: 'Textured', desc: 'Tactile physical paper grain' },
]

/**
 * Cohesive visual selections for Card Appearance:
 * - Layout (Portrait, Balanced, Editorial)
 * - Typography (Curated font pairings)
 * - Colors (Coordinated harmonic palettes)
 * - Style (Photographic, Illustrated, Vintage, Cinematic)
 * - Finish (Matte, Metallic, Holographic, Textured)
 *
 * Intelligently handles borders and composition details without exposing technical sliders.
 */
export function AppearanceControls({
  appearance,
  onUpdate,
}: AppearanceControlsProps) {
  const brandColor = useNativeColor('brand')

  const activeLayout = appearance.layoutVariant || 'balanced'
  const activeFontRole = appearance.fontRole || 'serif'
  const activeStyle = appearance.artworkStyle || 'photographic'
  const activeFinish = appearance.finishEffect || (appearance.textureEffect === 'holo' ? 'holographic' : appearance.textureEffect === 'foil' ? 'metallic' : 'matte')

  return (
    <View className="gap-6">
      {/* 1. Layout Variants */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Layout
        </Text>
        <View className="gap-1.5">
          {LAYOUT_VARIANTS.map((item) => {
            const isSelected = activeLayout === item.id
            return (
              <Pressable
                key={item.id}
                testID={`layout-variant-${item.id}`}
                onPress={() => onUpdate({ layoutVariant: item.id })}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border p-2.5 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40',
                )}
              >
                <View className="flex-1 pr-2">
                  <Text className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-text')}>
                    {item.label}
                  </Text>
                  <Text variant="caption" className="text-[11px] text-muted-text">
                    {item.desc}
                  </Text>
                </View>
                {isSelected ? <Check size={14} color={brandColor} /> : null}
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* 2. Typography Pairings */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Typography
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {FONT_ROLES.map((role) => {
            const isSelected = activeFontRole === role.id
            return (
              <Pressable
                key={role.id}
                testID={`font-role-${role.id}`}
                onPress={() => onUpdate({ fontRole: role.id })}
                className={cn(
                  'flex-1 min-w-[130px] rounded-xl border p-2.5 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40',
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-text')}>
                    {role.label}
                  </Text>
                  {isSelected ? <Check size={12} color={brandColor} /> : null}
                </View>
                <Text variant="caption" className="text-[10px] text-muted-text mt-0.5">
                  {role.desc}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* 3. Coordinated Color Palettes */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Colors
        </Text>
        <View className="flex-row flex-wrap gap-2">
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
                  'w-[calc(50%-4px)] rounded-xl border p-2.5 gap-2 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40',
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-text">
                    {p.name}
                  </Text>
                  {isSelected ? <Check size={12} color={brandColor} /> : null}
                </View>
                <View className="flex-row items-center gap-1">
                  <View
                    style={{ backgroundColor: p.bg }}
                    className="h-4 flex-1 rounded border border-white/20"
                  />
                  <View
                    style={{ backgroundColor: p.accent }}
                    className="h-4 flex-1 rounded border border-white/20"
                  />
                  <View
                    style={{ backgroundColor: p.fg }}
                    className="h-4 flex-1 rounded border border-white/20"
                  />
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* 4. Artwork Treatment Style */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Style
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ARTWORK_STYLES.map((style) => {
            const isSelected = activeStyle === style.id
            return (
              <Pressable
                key={style.id}
                testID={`artwork-style-${style.id}`}
                onPress={() => onUpdate({ artworkStyle: style.id })}
                className={cn(
                  'flex-1 min-w-[130px] rounded-xl border p-2.5 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40',
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-text')}>
                    {style.label}
                  </Text>
                  {isSelected ? <Check size={12} color={brandColor} /> : null}
                </View>
                <Text variant="caption" className="text-[10px] text-muted-text mt-0.5">
                  {style.desc}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* 5. Decorative Finishes */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Finish
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {FINISH_EFFECTS.map((fin) => {
            const isSelected = activeFinish === fin.id
            return (
              <Pressable
                key={fin.id}
                testID={`finish-effect-${fin.id}`}
                onPress={() => {
                  const textureEffect = fin.id === 'holographic' ? 'holo' : fin.id === 'metallic' ? 'foil' : fin.id === 'textured' ? 'grain' : 'none'
                  onUpdate({ finishEffect: fin.id, textureEffect })
                }}
                className={cn(
                  'flex-1 min-w-[130px] rounded-xl border p-2.5 active:opacity-70 transition-all',
                  isSelected
                    ? 'border-brand bg-brand/10 shadow-2xs'
                    : 'border-border/80 bg-surface hover:border-brand/40',
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={cn('text-xs font-bold', isSelected ? 'text-brand' : 'text-text')}>
                    {fin.label}
                  </Text>
                  {isSelected ? <Check size={12} color={brandColor} /> : null}
                </View>
                <Text variant="caption" className="text-[10px] text-muted-text mt-0.5">
                  {fin.desc}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

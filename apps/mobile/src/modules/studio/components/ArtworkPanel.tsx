import React from 'react'
import { Pressable, View } from 'react-native'
import { SlidersHorizontal } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { MediaLibrarySelector } from './MediaLibrarySelector'
import type { MediaCategoryFilter, MediaLibraryItem } from '@/modules/media/useUnifiedMediaLibrary'
import type { ArtworkStyle } from '@/modules/designs/flagshipDesigns'

export interface ArtworkPanelProps {
  mediaItems: MediaLibraryItem[]
  selectedImageId: string
  mediaCategoryFilter: MediaCategoryFilter
  activeStyle?: ArtworkStyle
  onCategoryFilterChange: (filter: MediaCategoryFilter) => void
  onSelectArtwork: (id: string) => void
  onPickCustomImage: () => void
  onSelectStyle: (style: ArtworkStyle) => void
  onOpenAdjustFraming: () => void
}

const ARTWORK_STYLES: { id: ArtworkStyle; label: string; desc: string }[] = [
  { id: 'photographic', label: 'Photographic', desc: 'Clean, unaltered natural tones' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Dramatic contrast with vignette focus' },
  { id: 'vintage', label: 'Vintage', desc: 'Warm aged sepia and soft highlights' },
  { id: 'retro', label: 'Retro Gold', desc: 'Warm metallic highlights & film vibe' },
  { id: 'psychedelic', label: 'Chromatic', desc: 'Electric prism & holographic flair' },
  { id: 'illustrated', label: 'Illustrated', desc: 'Stylized graphic poster aesthetic' },
  { id: 'painterly', label: 'Painterly', desc: 'Rich textural canvas feel' },
  { id: 'abstract', label: 'Abstract', desc: 'Modern geometric depth' },
]

export function ArtworkPanel({
  mediaItems,
  selectedImageId,
  mediaCategoryFilter,
  activeStyle = 'photographic',
  onCategoryFilterChange,
  onSelectArtwork,
  onPickCustomImage,
  onSelectStyle,
  onOpenAdjustFraming,
}: ArtworkPanelProps) {
  return (
    <View className="gap-5">
      {/* 1. Media Library Gallery & Upload */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Artwork Source
        </Text>
        <MediaLibrarySelector
          mediaItems={mediaItems}
          selectedImageId={selectedImageId}
          mediaCategoryFilter={mediaCategoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
          onSelectArtwork={onSelectArtwork}
          onPickCustomImage={onPickCustomImage}
        />
      </View>

      {/* 2. Visual Style Presets (Select, don't configure) */}
      <View className="gap-2.5 pt-2 border-t border-border/60">
        <Text className="text-sm font-semibold text-text">
          Artwork Style
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ARTWORK_STYLES.map((style) => {
            const isSelected = activeStyle === style.id
            return (
              <Pressable
                key={style.id}
                testID={`artwork-style-${style.id}`}
                onPress={() => onSelectStyle(style.id)}
                className={`py-2 px-3 rounded-xl border flex-1 min-w-[130px] ${
                  isSelected
                    ? 'border-brand bg-brand/10'
                    : 'border-border bg-surface'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-brand' : 'text-text'
                  }`}
                >
                  {style.label}
                </Text>
                <Text variant="caption" className="text-[10px] text-muted-text mt-0.5">
                  {style.desc}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* 3. Framing Adjustments Shortcut */}
      <View className="pt-2 border-t border-border/60">
        <Button
          size="sm"
          variant="secondary"
          icon={SlidersHorizontal}
          onPress={onOpenAdjustFraming}
          testID="open-artwork-adjust-button"
        >
          Adjust Framing
        </Button>
      </View>
    </View>
  )
}

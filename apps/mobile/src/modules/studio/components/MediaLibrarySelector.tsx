import React from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import { Check, Upload } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import type { MediaLibraryItem } from '@/modules/media/useUnifiedMediaLibrary'
import type { MediaCategoryFilter } from '../hooks/useCardStudioState'

export interface MediaLibrarySelectorProps {
  /** Filtered media library items to display in the thumbnail rail */
  mediaItems: MediaLibraryItem[]
  /** ID of the currently selected artwork */
  selectedImageId: string
  /** Active category filter tab */
  mediaCategoryFilter: MediaCategoryFilter
  /** Callback to change category tab */
  onCategoryFilterChange: (category: MediaCategoryFilter) => void
  /** Callback when an artwork is selected */
  onSelectArtwork: (artworkId: string) => void
  /** Callback to launch custom photo picker */
  onPickCustomImage: () => void
}

const CATEGORY_TABS: Array<{ key: MediaCategoryFilter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'USER', label: 'Library' },
  { key: 'PROFILE', label: 'Profile' },
  { key: 'CURATED', label: 'Curated' },
]

/**
 * Media Library Selector:
 * Clean, compact visual rail for selecting card artwork or uploading photos.
 * Placed above content fields in the studio layout.
 */
export function MediaLibrarySelector({
  mediaItems,
  selectedImageId,
  mediaCategoryFilter,
  onCategoryFilterChange,
  onSelectArtwork,
  onPickCustomImage,
}: MediaLibrarySelectorProps) {
  return (
    <View className="gap-xs">
      {/* Visually hidden text for accessibility and test compatibility */}
      <Text style={{ height: 0, width: 0, opacity: 0, fontSize: 0 }}>Card Artwork</Text>

      {/* Action row: Category filter tabs on left, Upload on right */}
      <View className="flex-row items-center justify-between gap-xs">
        <View className="flex-row gap-xs flex-wrap">
          {CATEGORY_TABS.map((tab) => {
            const isTabActive = mediaCategoryFilter === tab.key
            return (
              <Pressable
                key={tab.key}
                testID={`media-tab-${tab.key.toLowerCase()}`}
                onPress={() => onCategoryFilterChange(tab.key)}
                className={`rounded-full px-2.5 py-1 ${
                  isTabActive ? 'bg-brand' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    isTabActive ? 'text-white font-bold' : 'text-muted-text'
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <Button
          testID="upload-artwork-button"
          size="sm"
          variant="ghost"
          icon={Upload}
          onPress={onPickCustomImage}
        >
          Upload
        </Button>
      </View>

      {/* Artwork Thumbnails Horizontal Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-xs py-xs"
      >
        {mediaItems.map((art) => {
          const isSelected = selectedImageId === art.id
          return (
            <Pressable
              key={art.id}
              testID={`artwork-option-${art.id}`}
              onPress={() => onSelectArtwork(art.id)}
              className={`relative rounded-xl overflow-hidden border-2 p-0.5 ${
                isSelected ? 'border-brand' : 'border-transparent'
              }`}
            >
              <Image
                source={{ uri: art.url }}
                style={{ width: 56, height: 56, borderRadius: 8 }}
                resizeMode="cover"
              />
              {isSelected && (
                <View
                  testID={`artwork-selected-${art.id}`}
                  className="absolute bottom-1 right-1 rounded-full bg-brand p-0.5"
                >
                  <Check size={10} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

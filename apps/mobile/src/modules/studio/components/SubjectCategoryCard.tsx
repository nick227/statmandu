import React from 'react'
import { Image, Pressable, TextInput, View } from 'react-native'
import { Check, Scissors, Upload, User, X } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { useNativeColor } from '@/lib/theme'
import type { UniversalProfile } from '@/modules/profiles/profileTaxonomy'

export interface SubjectCategoryCardProps {
  activeProfile: UniversalProfile | null
  subjectName: string
  userProfile?: { displayName?: string | null; username?: string | null; avatarUrl?: string | null } | null
  subjectImageUri?: string | null
  subjectCutoutUri?: string | null
  activeSubjectImageType?: 'original' | 'cutout'
  isRemovingBackground?: boolean
  selectedImageId?: string
  mediaItems?: Array<{ id: string; url: string; label?: string; category?: string }>
  onSelectImage?: (imageId: string) => void
  onUseMyProfile: () => void
  onClearSubject: () => void
  onSubjectNameChange: (name: string) => void
  onRemoveBackground?: () => void
  onToggleSubjectImageType?: (type: 'original' | 'cutout') => void
  onPickSubjectImage?: () => void
}

/**
 * Tightened Subject Category Editor:
 * - Direct subject name entry with profile autofill / unlink
 * - Compact thumbnail grid for 1-click media selection with integrated upload tile
 * - Low-profile background removal / cutout toggle
 */
export function SubjectCategoryCard({
  activeProfile,
  subjectName,
  userProfile,
  subjectImageUri,
  subjectCutoutUri,
  activeSubjectImageType = 'original',
  isRemovingBackground = false,
  selectedImageId,
  mediaItems = [],
  onSelectImage,
  onUseMyProfile,
  onClearSubject,
  onSubjectNameChange,
  onRemoveBackground,
  onToggleSubjectImageType,
  onPickSubjectImage,
}: SubjectCategoryCardProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="gap-3">
      {/* 1. Direct Subject Name */}
      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-text">
            Subject Name
          </Text>
          {activeProfile ? (
            <View className="flex-row items-center gap-1.5 bg-brand/10 px-2 py-0.5 rounded-full">
              <Text className="text-[11px] font-medium text-brand">
                {activeProfile.displayName}
              </Text>
              <Pressable
                testID="unlink-subject-button"
                onPress={onClearSubject}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Clear linked profile"
              >
                <X size={11} color={brandColor} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              testID="use-my-profile-button"
              onPress={onUseMyProfile}
              hitSlop={6}
              className="flex-row items-center gap-1 opacity-75 active:opacity-100"
              accessibilityRole="button"
              accessibilityLabel="Autofill my profile"
            >
              <User size={12} color={mutedColor} />
              <Text variant="caption" className="text-xs text-muted-text">
                Autofill profile
              </Text>
            </Pressable>
          )}
        </View>

        <TextInput
          value={subjectName}
          onChangeText={onSubjectNameChange}
          placeholder="Enter subject name..."
          placeholderTextColor="#9ca3af"
          testID="subject-name-input"
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text"
        />
      </View>

      {/* 2. Media Thumbnail Grid with Integrated Upload Tile */}
      <View className="gap-1.5 pt-2 border-t border-border/60">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-text">
            Media & Artwork
          </Text>
          {subjectCutoutUri ? (
            <View className="flex-row items-center gap-1 bg-surface border border-border rounded-md p-0.5">
              <Pressable
                testID="subject-image-type-cutout"
                onPress={() => onToggleSubjectImageType?.('cutout')}
                className={`px-2 py-0.5 rounded ${
                  activeSubjectImageType === 'cutout' ? 'bg-brand' : 'bg-transparent'
                }`}
                accessibilityRole="button"
                accessibilityLabel="Cutout image"
              >
                <Text
                  className={`text-[10px] font-bold ${
                    activeSubjectImageType === 'cutout' ? 'text-brand-foreground' : 'text-muted-text'
                  }`}
                >
                  Cutout
                </Text>
              </Pressable>
              <Pressable
                testID="subject-image-type-original"
                onPress={() => onToggleSubjectImageType?.('original')}
                className={`px-2 py-0.5 rounded ${
                  activeSubjectImageType === 'original' ? 'bg-brand' : 'bg-transparent'
                }`}
                accessibilityRole="button"
                accessibilityLabel="Original image"
              >
                <Text
                  className={`text-[10px] font-bold ${
                    activeSubjectImageType === 'original' ? 'text-brand-foreground' : 'text-muted-text'
                  }`}
                >
                  Original
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              testID="remove-background-button"
              onPress={onRemoveBackground}
              disabled={isRemovingBackground || !onRemoveBackground}
              hitSlop={6}
              className="flex-row items-center gap-1 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Remove Background"
            >
              <Scissors size={11} color={mutedColor} />
              <Text className="text-[11px] font-semibold text-muted-text">
                {isRemovingBackground ? 'Removing...' : 'Remove Background (Unavailable)'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Small Thumbnail Grid */}
        <View className="flex-row flex-wrap gap-2 pt-1">
          {/* Integrated Upload Tile */}
          <Pressable
            testID="upload-subject-image-button"
            onPress={onPickSubjectImage}
            className="w-12 h-12 rounded-lg border-2 border-dashed border-border/80 hover:border-brand items-center justify-center bg-surface/50 active:opacity-75 transition-all"
            accessibilityRole="button"
            accessibilityLabel="Upload New Media"
          >
            <Upload size={14} color={mutedColor} />
            <Text className="text-[8.5px] font-bold text-muted-text mt-0.5 uppercase tracking-tight">
              Upload
            </Text>
          </Pressable>

          {/* Media Items Tiles */}
          {mediaItems.map((item) => {
            const isSelected =
              selectedImageId === item.id ||
              (!selectedImageId && subjectImageUri === item.url)

            return (
              <Pressable
                key={item.id}
                testID={`media-thumb-${item.id}`}
                onPress={() => onSelectImage?.(item.id)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 relative transition-all active:opacity-80 ${
                  isSelected
                    ? 'border-brand ring-2 ring-brand/30 shadow-xs scale-105'
                    : 'border-transparent hover:border-border'
                }`}
                accessibilityRole="button"
                accessibilityLabel={item.label || `Media item ${item.id}`}
              >
                <Image
                  source={{ uri: item.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {isSelected && (
                  <View className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-brand items-center justify-center shadow-xs">
                    <Check size={8} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

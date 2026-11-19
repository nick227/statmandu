import React from 'react'
import { Image, TextInput, View } from 'react-native'
import { Scissors, Upload, User } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { useNativeColor } from '@/lib/theme'
import type { UniversalProfile } from '@/modules/profiles/profileTaxonomy'

export interface SubjectCategoryCardProps {
  activeProfile: UniversalProfile | null
  subjectName: string
  userProfile?: { displayName?: string | null; username?: string | null; avatarUrl?: string | null } | null
  subjectImageUri?: string | null
  onUseMyProfile: () => void
  onClearSubject: () => void
  onSubjectNameChange: (name: string) => void
  onPickSubjectImage?: () => void
}

/**
 * Subject Category Editor:
 * - Creator profile shortcut (1-click auto-fill)
 * - Direct subject name entry (no seeded mock athletes)
 * - Subject image selection; background removal is unavailable until real segmentation is configured
 * - Natural single-word headings, zero eyebrow labels
 */
export function SubjectCategoryCard({
  activeProfile,
  subjectName,
  userProfile,
  subjectImageUri,
  onUseMyProfile,
  onClearSubject,
  onSubjectNameChange,
  onPickSubjectImage,
}: SubjectCategoryCardProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="gap-4">
      {/* 1. Direct Subject Name */}
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-text">
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
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
        />
      </View>

      {/* 2. Subject Image & Background Removal */}
      <View className="gap-2.5 pt-2 border-t border-border/60">
        <Text className="text-sm font-semibold text-text">
          Subject Image
        </Text>

        {subjectImageUri ? (
          <View className="gap-3">
            <View className="flex-row items-center gap-3 bg-surface p-2.5 rounded-xl border border-border">
              <View className="h-16 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: subjectImageUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1 min-w-0 gap-1">
                <Text className="text-xs font-semibold text-text" numberOfLines={1}>
                  Original Portrait
                </Text>
                <Text variant="caption" className="text-[11px] text-muted-text">
                  Standard subject portrait
                </Text>
              </View>
            </View>

            <Button
              size="sm"
              variant="secondary"
              icon={Scissors}
              disabled
              testID="remove-background-button"
            >
              Remove Background (Unavailable)
            </Button>
            <Text variant="caption" className="text-xs text-muted-text">
              Background removal requires a supported subject-segmentation service.
            </Text>

            {onPickSubjectImage && (
              <Button
                size="sm"
                variant="ghost"
                icon={Upload}
                onPress={onPickSubjectImage}
                testID="change-subject-image-button"
              >
                Upload New Image
              </Button>
            )}
          </View>
        ) : (
          <View className="gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Upload}
              onPress={onPickSubjectImage}
              testID="upload-subject-image-button"
            >
              Select Image
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}

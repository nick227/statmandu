import React from 'react'
import { Image, Pressable, TextInput, View } from 'react-native'
import { Scissors, Sparkles, Upload, User, X } from 'lucide-react-native'
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
  subjectCutoutUri?: string | null
  activeSubjectImageType?: 'original' | 'cutout'
  isRemovingBackground?: boolean
  onUseMyProfile: () => void
  onClearSubject: () => void
  onSubjectNameChange: (name: string) => void
  onRemoveBackground?: () => void
  onToggleSubjectImageType?: (type: 'original' | 'cutout') => void
  onPickSubjectImage?: () => void
}

/**
 * Subject Category Editor:
 * - Creator profile shortcut (1-click auto-fill)
 * - Direct subject name entry (no seeded mock athletes)
 * - Subject Image & Priority Background Removal (Cutout vs Original toggle)
 * - Natural single-word headings, zero eyebrow labels
 */
export function SubjectCategoryCard({
  activeProfile,
  subjectName,
  userProfile,
  subjectImageUri,
  subjectCutoutUri,
  activeSubjectImageType = 'original',
  isRemovingBackground = false,
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
    <View className="gap-5">
      {/* 1. Profile Attribution */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-text">
          Subject Profile
        </Text>
        {activeProfile ? (
          <View className="flex-row items-center justify-between p-3 rounded-xl border border-border bg-surface">
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <Avatar
                uri={activeProfile.avatarUrl ?? null}
                fallback={activeProfile.displayName || 'You'}
                size="sm"
              />
              <View className="flex-1 min-w-0">
                <Text className="font-semibold text-sm text-text" numberOfLines={1}>
                  {activeProfile.displayName}
                </Text>
                <Text variant="caption" className="text-xs text-muted-text" numberOfLines={1}>
                  {activeProfile.hometown || activeProfile.calling || 'Profile linked'}
                </Text>
              </View>
            </View>
            <Button
              size="sm"
              variant="ghost"
              onPress={onClearSubject}
              testID="unlink-subject-button"
            >
              Clear
            </Button>
          </View>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            icon={User}
            onPress={onUseMyProfile}
            testID="use-my-profile-button"
          >
            {userProfile?.displayName ? `Use ${userProfile.displayName}` : 'Use My Profile'}
          </Button>
        )}
      </View>

      {/* 2. Direct Subject Name */}
      <View className="gap-1.5">
        <Text className="text-sm font-semibold text-text">
          Subject Name
        </Text>
        <TextInput
          value={subjectName}
          onChangeText={onSubjectNameChange}
          placeholder="Enter subject name..."
          placeholderTextColor="#9ca3af"
          testID="subject-name-input"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
        />
        <Text variant="caption" className="text-xs text-muted-text">
          Used on the collectible and for publishing attribution.
        </Text>
      </View>

      {/* 3. Subject Image & Background Removal */}
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
                  {activeSubjectImageType === 'cutout' ? 'Transparent Cutout' : 'Original Portrait'}
                </Text>
                <Text variant="caption" className="text-[11px] text-muted-text">
                  {activeSubjectImageType === 'cutout'
                    ? 'Background removed cleanly'
                    : 'Standard subject portrait'}
                </Text>
              </View>
            </View>

            {/* Cutout vs Original Toggle Buttons */}
            {subjectCutoutUri ? (
              <View className="flex-row items-center gap-2">
                <Pressable
                  testID="subject-image-type-cutout"
                  onPress={() => onToggleSubjectImageType?.('cutout')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border items-center justify-center ${
                    activeSubjectImageType === 'cutout'
                      ? 'bg-brand/10 border-brand'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeSubjectImageType === 'cutout' ? 'text-brand' : 'text-muted-text'
                    }`}
                  >
                    Cutout
                  </Text>
                </Pressable>
                <Pressable
                  testID="subject-image-type-original"
                  onPress={() => onToggleSubjectImageType?.('original')}
                  className={`flex-1 py-1.5 px-3 rounded-lg border items-center justify-center ${
                    activeSubjectImageType === 'original'
                      ? 'bg-brand/10 border-brand'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeSubjectImageType === 'original' ? 'text-brand' : 'text-muted-text'
                    }`}
                  >
                    Original
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                icon={Scissors}
                onPress={onRemoveBackground}
                isLoading={isRemovingBackground}
                testID="remove-background-button"
              >
                Remove Background
              </Button>
            )}

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

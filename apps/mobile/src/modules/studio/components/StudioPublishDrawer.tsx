import React from 'react'
import { Pressable, View } from 'react-native'
import { Rocket, X } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import type { CardEditionMode } from '../hooks/useReleases'

export interface StudioPublishDrawerProps {
  /** Whether the inline drawer is open */
  isOpen: boolean
  /** Close drawer */
  onClose: () => void
  /** Subject attribution name */
  publishSubjectName: string
  onSubjectNameChange: (val: string) => void
  /** Subject profession or calling */
  publishSubjectBio: string
  onSubjectBioChange: (val: string) => void
  /** Selected edition mode (LIMITED | ONE_OF_ONE | UNLIMITED) */
  publishEditionMode: CardEditionMode
  onEditionModeChange: (mode: CardEditionMode) => void
  /** Limited edition size */
  publishEditionSize: string
  onEditionSizeChange: (val: string) => void
  /** Publishing mutation state */
  isPublishing: boolean
  /** Confirm & publish release callback */
  onConfirmPublish: () => void
}

/**
 * Lightweight inline configuration panel for publishing a release:
 * Single-word headings, clean inputs, and zero clutter.
 */
export function StudioPublishDrawer({
  isOpen,
  onClose,
  publishSubjectName,
  onSubjectNameChange,
  publishSubjectBio,
  onSubjectBioChange,
  publishEditionMode,
  onEditionModeChange,
  publishEditionSize,
  onEditionSizeChange,
  isPublishing,
  onConfirmPublish,
}: StudioPublishDrawerProps) {
  if (!isOpen) return null

  return (
    <View
      testID="inline-publish-drawer"
      className="rounded-2xl border-2 border-brand/50 bg-card-surface p-md gap-md shadow-lg"
    >
      {/* Drawer Header with One-Word Title */}
      <View className="flex-row items-center justify-between border-b border-border pb-xs">
        <View className="flex-row items-center gap-xs">
          <Rocket size={18} className="text-brand" />
          <Text className="font-bold text-base text-text">Publish</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={8}>
          <X size={18} className="text-muted-text" />
        </Pressable>
      </View>

      {/* Subject Name Input */}
      <View className="gap-1">
        <Input
          testID="publish-subject-name-input"
          value={publishSubjectName}
          onChangeText={onSubjectNameChange}
          placeholder="Subject name"
        />
      </View>

      {/* Subject Calling / Bio Input */}
      <View className="gap-1">
        <Input
          testID="publish-subject-bio-input"
          value={publishSubjectBio}
          onChangeText={onSubjectBioChange}
          placeholder="Calling or bio (optional)"
        />
      </View>

      {/* Edition Mode Selector */}
      <View className="gap-1" testID="publish-edition-mode-selector">
        <View className="flex-row gap-xs">
          <Pressable
            testID="edition-mode-limited"
            onPress={() => onEditionModeChange('LIMITED')}
            className={`flex-1 rounded-xl border p-sm items-center justify-center ${
              publishEditionMode === 'LIMITED'
                ? 'border-brand bg-brand/10'
                : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                publishEditionMode === 'LIMITED' ? 'text-brand' : 'text-text'
              }`}
            >
              Limited
            </Text>
          </Pressable>
          <Pressable
            testID="edition-mode-one-of-one"
            onPress={() => onEditionModeChange('ONE_OF_ONE')}
            className={`flex-1 rounded-xl border p-sm items-center justify-center ${
              publishEditionMode === 'ONE_OF_ONE'
                ? 'border-brand bg-brand/10'
                : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                publishEditionMode === 'ONE_OF_ONE' ? 'text-brand' : 'text-text'
              }`}
            >
              1 of 1
            </Text>
          </Pressable>
          <Pressable
            testID="edition-mode-unlimited"
            onPress={() => onEditionModeChange('UNLIMITED')}
            className={`flex-1 rounded-xl border p-sm items-center justify-center ${
              publishEditionMode === 'UNLIMITED'
                ? 'border-brand bg-brand/10'
                : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                publishEditionMode === 'UNLIMITED' ? 'text-brand' : 'text-text'
              }`}
            >
              Open
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Edition Size (Visible only when LIMITED) */}
      {publishEditionMode === 'LIMITED' && (
        <View className="gap-1">
          <Input
            testID="publish-edition-size-input"
            value={publishEditionSize}
            onChangeText={onEditionSizeChange}
            keyboardType="number-pad"
            placeholder="Numbered copies (25)"
          />
        </View>
      )}

      {/* Action Buttons: One-Word Titles */}
      <View className="flex-row items-center justify-end gap-xs pt-xs border-t border-border">
        <Button
          testID="cancel-publish-button"
          size="sm"
          variant="ghost"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          testID="confirm-publish-button"
          size="sm"
          variant="primary"
          icon={Rocket}
          isLoading={isPublishing}
          onPress={onConfirmPublish}
        >
          Publish
        </Button>
      </View>
    </View>
  )
}

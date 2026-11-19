import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, FolderOpen, Plus, Redo2, Rocket, Save, Undo2 } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import type { CardDesign } from '../hooks/useCardDesigns'

export interface StudioTopBarProps {
  /** Current design title */
  designTitle: string
  /** Callback when title changes */
  onTitleChange: (title: string) => void
  /** The currently loaded active design document, or null if unsaved draft */
  activeDesign: CardDesign | null
  /** List of user's saved card designs */
  savedDesigns: CardDesign[]
  /** Whether the saved designs dropdown is visible */
  isSavedDesignsOpen: boolean
  /** Toggle saved designs dropdown */
  onToggleSavedDesigns: () => void
  /** Select a saved design to load */
  onSelectSavedDesign: (design: CardDesign) => void
  /** Start a fresh card design draft */
  onStartNewDesign: () => void
  /** History undo capability */
  canUndo: boolean
  onUndo: () => void
  /** History redo capability */
  canRedo: boolean
  onRedo: () => void
  /** Save mutation state */
  isSaving: boolean
  saveSuccessMsg: boolean
  onSave: () => void
  /** Publish drawer toggle and state */
  isPublishing: boolean
  isPublishDrawerOpen: boolean
  onTogglePublishDrawer: () => void
}

/**
 * Top action bar for Card Studio:
 * One-word actions, floating popovers, and clean document status.
 */
export function StudioTopBar({
  designTitle,
  onTitleChange,
  activeDesign,
  savedDesigns,
  isSavedDesignsOpen,
  onToggleSavedDesigns,
  onSelectSavedDesign,
  onStartNewDesign,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  isSaving,
  saveSuccessMsg,
  onSave,
  isPublishing,
  isPublishDrawerOpen,
  onTogglePublishDrawer,
}: StudioTopBarProps) {
  return (
    <View className="mb-md flex-col md:flex-row md:items-center justify-between gap-sm border-b border-border pb-md">
      {/* Primary Left/Top Row: Design Title & Revision Badge */}
      <View className="flex-row items-center gap-xs flex-1 max-w-full md:max-w-md">
        <Input
          value={designTitle}
          onChangeText={onTitleChange}
          placeholder="Design title..."
          className="flex-1 font-bold text-base md:text-lg h-10"
        />
        {activeDesign ? (
          <View className="rounded-full bg-brand/10 px-sm py-xs flex-shrink-0">
            <Text className="text-xs font-bold text-brand">v{activeDesign.revision}</Text>
          </View>
        ) : (
          <View className="rounded-full bg-muted-text/10 px-sm py-xs flex-shrink-0">
            <Text className="text-xs font-semibold text-muted-text">Draft</Text>
          </View>
        )}
      </View>

      {/* Secondary Right/Bottom Row: Saved Designs & Action Buttons */}
      <View className="flex-row items-center justify-between md:justify-end gap-xs flex-wrap">
        {/* Saved Designs Dropdown (Floating) */}
        <View className="relative z-50">
          <Button
            testID="saved-designs-dropdown"
            size="sm"
            variant="ghost"
            icon={FolderOpen}
            onPress={onToggleSavedDesigns}
          >
            {activeDesign ? activeDesign.title.slice(0, 16) : `Saved (${savedDesigns.length})`}
          </Button>

          {isSavedDesignsOpen && (
            <View className="absolute left-0 md:left-auto md:right-0 top-full mt-1 z-50 w-72 rounded-xl border border-border bg-card-surface shadow-2xl p-xs">
              <Pressable
                testID="new-design-option"
                onPress={onStartNewDesign}
                className="flex-row items-center gap-sm rounded-lg px-md py-sm hover:bg-canvas border-b border-border/40"
              >
                <Plus size={16} className="text-brand" />
                <Text className="text-sm font-semibold text-brand">+ New</Text>
              </Pressable>

              <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }} className="pt-xs">
                {savedDesigns.length === 0 ? (
                  <View className="p-sm">
                    <Text variant="caption" className="text-center">
                      No saved designs
                    </Text>
                  </View>
                ) : (
                  savedDesigns.map((d) => {
                    const isSelected = activeDesign?.id === d.id
                    return (
                      <Pressable
                        key={d.id}
                        testID={`saved-design-${d.id}`}
                        onPress={() => onSelectSavedDesign(d)}
                        className={`flex-row items-center justify-between rounded-lg px-md py-sm ${
                          isSelected ? 'bg-brand/10' : 'hover:bg-canvas'
                        }`}
                      >
                        <View className="flex-1">
                          <Text
                            className={`text-sm ${
                              isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                            }`}
                            numberOfLines={1}
                          >
                            {d.title}
                          </Text>
                          <Text variant="caption">v{d.revision}</Text>
                        </View>
                        {isSelected && <Check size={16} className="text-brand" />}
                      </Pressable>
                    )
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Action buttons with clean one-word labels: Undo, Redo, Save, Publish */}
        <View className="flex-row items-center gap-xs">
          <Button
            size="sm"
            variant="ghost"
            icon={Undo2}
            disabled={!canUndo}
            onPress={onUndo}
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Redo2}
            disabled={!canRedo}
            onPress={onRedo}
          >
            Redo
          </Button>
          <Button
            testID="save-design-button"
            size="sm"
            variant={saveSuccessMsg ? 'secondary' : 'ghost'}
            icon={Save}
            isLoading={isSaving}
            onPress={onSave}
          >
            {saveSuccessMsg ? 'Saved' : 'Save'}
          </Button>
          <Button
            testID="publish-release-button"
            size="sm"
            variant="primary"
            icon={Rocket}
            isLoading={isPublishing}
            onPress={onTogglePublishDrawer}
          >
            Publish
          </Button>
        </View>
      </View>
    </View>
  )
}

import React, { useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import { usePageTitle } from '@/lib/pageTitle'
import { useCardStudioState } from './hooks/useCardStudioState'
import { StudioTopBar } from './components/StudioTopBar'
import { StudioAlerts } from './components/StudioAlerts'
import { StudioPublishDrawer } from './components/StudioPublishDrawer'
import { SubjectProfileSelector } from './components/SubjectProfileSelector'
import { CardTypeSelector } from './components/CardTypeSelector'
import { ContentFieldsEditor } from './components/ContentFieldsEditor'
import { FlagshipDesignPicker } from './components/FlagshipDesignPicker'
import { MediaLibrarySelector } from './components/MediaLibrarySelector'
import { CardPreviewStage } from './components/CardPreviewStage'

/**
 * CardStudioScreen
 *
 * Full-width workspace-first product experience inspired by modern creative suites.
 *
 * Architecture:
 * 1. Persistent Top Chrome: Full-width document title, saved designs loader, undo/redo, and save/publish actions.
 * 2. Dedicated Fixed Left Tools Column: Compact, quiet controls (Subject, Type, Design, Artwork, Content, Publishing).
 * 3. Expansive Fluid Stage: Center canvas occupying all remaining viewport space with a neutral workspace backdrop.
 * 4. Responsive Scaling: Card scales dynamically to fit available stage height preserving its 2:3 aspect ratio.
 */
export function CardStudioScreen() {
  const { width, height } = useWindowDimensions()
  const isDesktop = width >= 1024
  const isTablet = width >= 768 && width < 1024
  const isWide = isDesktop || isTablet

  // Dedicated fixed editor tool panel width
  const editorWidth = isDesktop ? 390 : isTablet ? 330 : width

  // Compute stage dimensions on wide screens (viewport minus header & gutters)
  const availableStageHeight = Math.max(500, height - 130)
  const availableStageWidth = Math.max(340, width - editorWidth - 64)
  const maxCardWidthByHeight = Math.floor(availableStageHeight * (600 / 900) * 0.94)

  // Card canvas scaling: scale to use available height without overflowing; compact on mobile for immediate visual feedback
  const canvasWidth = isWide
    ? Math.min(560, availableStageWidth, maxCardWidthByHeight)
    : Math.min(270, width - 40)

  // Encapsulated state, business logic, and mutations
  const studio = useCardStudioState()

  // Centralized dynamic document title reacting to the active design title
  usePageTitle(studio.designTitle ? `${studio.designTitle} · Card Studio` : 'Card Studio')

  // Contextual editor section navigation (preserves single-panel experience without multi-panel icon rails)
  const [editorSection, setEditorSection] = useState<'all' | 'identity' | 'design' | 'artwork' | 'content'>('all')

  return (
    <Screen layout="workspace" insetTop={false} className="h-full">
      {/* 1. Full-Width Persistent Compact Header */}
      <View className="px-md md:px-lg border-b border-border bg-surface pt-sm">
        <StudioTopBar
          designTitle={studio.designTitle}
          onTitleChange={(t) => {
            studio.setDesignTitle(t)
            studio.setSaveSuccessMsg(false)
          }}
          activeDesign={studio.activeDesign}
          savedDesigns={studio.savedDesigns}
          isSavedDesignsOpen={studio.savedDesignsDropdownOpen}
          onToggleSavedDesigns={() =>
            studio.setSavedDesignsDropdownOpen(!studio.savedDesignsDropdownOpen)
          }
          onSelectSavedDesign={studio.handleSelectSavedDesign}
          onStartNewDesign={studio.handleStartNewDesign}
          canUndo={studio.historyIndex > 0}
          onUndo={studio.handleUndo}
          canRedo={studio.historyIndex < studio.historyLength - 1}
          onRedo={studio.handleRedo}
          isSaving={studio.isSaving}
          saveSuccessMsg={studio.saveSuccessMsg}
          onSave={studio.handleSaveDesign}
          isPublishing={studio.isPublishing}
          isPublishDrawerOpen={studio.isPublishDrawerOpen}
          onTogglePublishDrawer={() =>
            studio.setIsPublishDrawerOpen(!studio.isPublishDrawerOpen)
          }
        />
      </View>

      {/* 2. Workspace Body */}
      {isWide ? (
        // Desktop / Tablet: Fixed-width editor column + flexible card canvas stage
        <View className="flex-1 flex-row w-full overflow-hidden">
          {/* Left Column: Fixed Editor Panel with independent scrolling */}
          <View
            style={{ width: editorWidth }}
            className="border-r border-border bg-surface flex-shrink-0"
          >
            <ScrollView
              contentContainerClassName="p-md gap-md pb-xxl"
              showsVerticalScrollIndicator={true}
            >
              {/* Notifications & Alerts */}
              <StudioAlerts
                conflictMessage={studio.conflictMessage}
                publishSuccessMsg={studio.publishSuccessMsg}
              />

              {/* Inline Publishing Configuration Drawer */}
              <StudioPublishDrawer
                isOpen={studio.isPublishDrawerOpen}
                onClose={() => studio.setIsPublishDrawerOpen(false)}
                publishSubjectName={studio.publishSubjectName}
                onSubjectNameChange={studio.setPublishSubjectName}
                publishSubjectBio={studio.publishSubjectBio}
                onSubjectBioChange={studio.setPublishSubjectBio}
                publishEditionMode={studio.publishEditionMode}
                onEditionModeChange={studio.setPublishEditionMode}
                publishEditionSize={studio.publishEditionSize}
                onEditionSizeChange={studio.setPublishEditionSize}
                isPublishing={studio.isPublishing}
                onConfirmPublish={studio.handleConfirmPublish}
              />

              {/* Contextual Single-Panel Section Navigation */}
              <View className="flex-row items-center gap-1.5 pb-2 border-b border-border/40">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5 py-0.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'identity', label: 'Subject' },
                    { id: 'design', label: 'Design' },
                    { id: 'artwork', label: 'Artwork' },
                    { id: 'content', label: 'Content' },
                  ].map((tab) => {
                    const active = editorSection === tab.id
                    return (
                      <Pressable
                        key={tab.id}
                        onPress={() => setEditorSection(tab.id as any)}
                        accessibilityRole="button"
                        accessibilityLabel={`${tab.label} section`}
                        className={cn(
                          'rounded-full px-3 py-1 border transition-all active:opacity-70',
                          active
                            ? 'border-text bg-text'
                            : 'border-border/80 bg-canvas hover:border-text/40'
                        )}
                      >
                        <Text className={cn('text-xs font-semibold', active ? 'text-surface' : 'text-text')}>
                          {tab.label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>

              {/* Modular Editor Controls (Clean, unnested, minimal borders) */}
              <View className="gap-md">
                {/* 1. Subject Profile Selector */}
                {(editorSection === 'all' || editorSection === 'identity') && (
                  <SubjectProfileSelector
                    activeProfile={studio.activeProfile}
                    isOpen={studio.personDropdownOpen}
                    onToggle={studio.togglePersonDropdown}
                    onSelectProfile={studio.handleSelectPersonProfile}
                    customPeople={studio.customPeople}
                  />
                )}

                {/* 2. Card Type Selector */}
                {(editorSection === 'all' || editorSection === 'identity') && (
                  <CardTypeSelector
                    activeCardTypeId={studio.activeCardTypeId}
                    activeCardType={studio.activeCardType}
                    isOpen={studio.cardTypeDropdownOpen}
                    onToggle={studio.toggleCardTypeDropdown}
                    onSelectType={studio.handleSelectCardType}
                  />
                )}

                {/* 3. Flagship Design Picker */}
                {(editorSection === 'all' || editorSection === 'design') && (
                  <FlagshipDesignPicker
                    activeFlagshipId={studio.activeFlagshipId}
                    activeFlagship={studio.activeFlagship}
                    isOpen={studio.designDropdownOpen}
                    onToggle={studio.toggleDesignDropdown}
                    onSelectDesign={studio.handleSelectFlagshipDesign}
                  />
                )}

                {/* 4. Unified Media Library */}
                {(editorSection === 'all' || editorSection === 'artwork') && (
                  <MediaLibrarySelector
                    mediaItems={studio.displayedMediaItems}
                    selectedImageId={studio.selectedImageId}
                    mediaCategoryFilter={studio.mediaCategoryFilter}
                    onCategoryFilterChange={studio.setMediaCategoryFilter}
                    onSelectArtwork={studio.handleSelectArtwork}
                    onPickCustomImage={studio.handlePickCustomImage}
                  />
                )}

                {/* 5. Dynamic Content Fields */}
                {(editorSection === 'all' || editorSection === 'content') && (
                  <ContentFieldsEditor
                    boundFields={studio.boundFields}
                    activeCardType={studio.activeCardType}
                    activeFlagship={studio.activeFlagship}
                    isOverflow={studio.currentFlagshipResult.isOverflow}
                    onUpdateField={studio.handleUpdatePositionalInput}
                    onRelinkField={studio.handleRelinkField}
                  />
                )}
              </View>
            </ScrollView>
          </View>

          {/* Right Column: Flexible Card Stage with Neutral Workspace Background */}
          <CardPreviewStage
            composition={studio.composition}
            canvasWidth={canvasWidth}
            assets={studio.assetsList}
            className="flex-1 p-lg"
          />
        </View>
      ) : (
        // Mobile: Compact card preview at top for immediate feedback, followed by editor controls
        <ScrollView contentContainerClassName="pb-xxl">
          {/* Compact Card Stage at top */}
          <View className="w-full bg-neutral-100 dark:bg-neutral-900/60 py-md items-center justify-center border-b border-border">
            <CardPreviewStage
              composition={studio.composition}
              canvasWidth={canvasWidth}
              assets={studio.assetsList}
              className="bg-transparent"
            />
          </View>

          {/* Editor Controls below */}
          <View className="p-md gap-md bg-surface">
            <StudioAlerts
              conflictMessage={studio.conflictMessage}
              publishSuccessMsg={studio.publishSuccessMsg}
            />

            <StudioPublishDrawer
              isOpen={studio.isPublishDrawerOpen}
              onClose={() => studio.setIsPublishDrawerOpen(false)}
              publishSubjectName={studio.publishSubjectName}
              onSubjectNameChange={studio.setPublishSubjectName}
              publishSubjectBio={studio.publishSubjectBio}
              onSubjectBioChange={studio.setPublishSubjectBio}
              publishEditionMode={studio.publishEditionMode}
              onEditionModeChange={studio.setPublishEditionMode}
              publishEditionSize={studio.publishEditionSize}
              onEditionSizeChange={studio.setPublishEditionSize}
              isPublishing={studio.isPublishing}
              onConfirmPublish={studio.handleConfirmPublish}
            />

            {/* Contextual Single-Panel Section Navigation */}
            <View className="flex-row items-center gap-1.5 pb-2 border-b border-border/40">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5 py-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'identity', label: 'Subject' },
                  { id: 'design', label: 'Design' },
                  { id: 'artwork', label: 'Artwork' },
                  { id: 'content', label: 'Content' },
                ].map((tab) => {
                  const active = editorSection === tab.id
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setEditorSection(tab.id as any)}
                      accessibilityRole="button"
                      accessibilityLabel={`${tab.label} section mobile`}
                      className={cn(
                        'rounded-full px-3 py-1 border transition-all active:opacity-70',
                        active
                          ? 'border-text bg-text'
                          : 'border-border/80 bg-canvas hover:border-text/40'
                      )}
                    >
                      <Text className={cn('text-xs font-semibold', active ? 'text-surface' : 'text-text')}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>

            {(editorSection === 'all' || editorSection === 'identity') && (
              <SubjectProfileSelector
                activeProfile={studio.activeProfile}
                isOpen={studio.personDropdownOpen}
                onToggle={studio.togglePersonDropdown}
                onSelectProfile={studio.handleSelectPersonProfile}
                customPeople={studio.customPeople}
              />
            )}

            {(editorSection === 'all' || editorSection === 'identity') && (
              <CardTypeSelector
                activeCardTypeId={studio.activeCardTypeId}
                activeCardType={studio.activeCardType}
                isOpen={studio.cardTypeDropdownOpen}
                onToggle={studio.toggleCardTypeDropdown}
                onSelectType={studio.handleSelectCardType}
              />
            )}

            {(editorSection === 'all' || editorSection === 'design') && (
              <FlagshipDesignPicker
                activeFlagshipId={studio.activeFlagshipId}
                activeFlagship={studio.activeFlagship}
                isOpen={studio.designDropdownOpen}
                onToggle={studio.toggleDesignDropdown}
                onSelectDesign={studio.handleSelectFlagshipDesign}
              />
            )}

            {(editorSection === 'all' || editorSection === 'artwork') && (
              <MediaLibrarySelector
                mediaItems={studio.displayedMediaItems}
                selectedImageId={studio.selectedImageId}
                mediaCategoryFilter={studio.mediaCategoryFilter}
                onCategoryFilterChange={studio.setMediaCategoryFilter}
                onSelectArtwork={studio.handleSelectArtwork}
                onPickCustomImage={studio.handlePickCustomImage}
              />
            )}

            {(editorSection === 'all' || editorSection === 'content') && (
              <ContentFieldsEditor
                boundFields={studio.boundFields}
                activeCardType={studio.activeCardType}
                activeFlagship={studio.activeFlagship}
                isOverflow={studio.currentFlagshipResult.isOverflow}
                onUpdateField={studio.handleUpdatePositionalInput}
                onRelinkField={studio.handleRelinkField}
              />
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

import React from 'react'
import { ScrollView, View, useWindowDimensions } from 'react-native'
import { Screen } from '@/shared/layout/Screen'
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

  // Card canvas scaling: scale to use available height without overflowing
  const canvasWidth = isWide
    ? Math.min(560, availableStageWidth, maxCardWidthByHeight)
    : Math.min(380, width - 32)

  // Encapsulated state, business logic, and mutations
  const studio = useCardStudioState()

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

              {/* Modular Editor Controls (Clean, unnested, minimal borders) */}
              <View className="gap-md">
                {/* 1. Subject Profile Selector */}
                <SubjectProfileSelector
                  activeProfile={studio.activeProfile}
                  isOpen={studio.personDropdownOpen}
                  onToggle={studio.togglePersonDropdown}
                  onSelectProfile={studio.handleSelectPersonProfile}
                  customPeople={studio.customPeople}
                />

                {/* 2. Card Type Selector */}
                <CardTypeSelector
                  activeCardTypeId={studio.activeCardTypeId}
                  activeCardType={studio.activeCardType}
                  isOpen={studio.cardTypeDropdownOpen}
                  onToggle={studio.toggleCardTypeDropdown}
                  onSelectType={studio.handleSelectCardType}
                />

                {/* 3. Flagship Design Picker */}
                <FlagshipDesignPicker
                  activeFlagshipId={studio.activeFlagshipId}
                  activeFlagship={studio.activeFlagship}
                  isOpen={studio.designDropdownOpen}
                  onToggle={studio.toggleDesignDropdown}
                  onSelectDesign={studio.handleSelectFlagshipDesign}
                />

                {/* 4. Unified Media Library */}
                <MediaLibrarySelector
                  mediaItems={studio.displayedMediaItems}
                  selectedImageId={studio.selectedImageId}
                  mediaCategoryFilter={studio.mediaCategoryFilter}
                  onCategoryFilterChange={studio.setMediaCategoryFilter}
                  onSelectArtwork={studio.handleSelectArtwork}
                  onPickCustomImage={studio.handlePickCustomImage}
                />

                {/* 5. Dynamic Content Fields */}
                <ContentFieldsEditor
                  boundFields={studio.boundFields}
                  activeCardType={studio.activeCardType}
                  activeFlagship={studio.activeFlagship}
                  isOverflow={studio.currentFlagshipResult.isOverflow}
                  onUpdateField={studio.handleUpdatePositionalInput}
                  onRelinkField={studio.handleRelinkField}
                />
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
        // Mobile: Prominent card preview on workspace stage, controls below
        <ScrollView contentContainerClassName="pb-xxl">
          {/* Card Stage at top */}
          <View className="w-full bg-neutral-100 dark:bg-neutral-900/60 py-xl items-center justify-center border-b border-border">
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

            <SubjectProfileSelector
              activeProfile={studio.activeProfile}
              isOpen={studio.personDropdownOpen}
              onToggle={studio.togglePersonDropdown}
              onSelectProfile={studio.handleSelectPersonProfile}
              customPeople={studio.customPeople}
            />

            <CardTypeSelector
              activeCardTypeId={studio.activeCardTypeId}
              activeCardType={studio.activeCardType}
              isOpen={studio.cardTypeDropdownOpen}
              onToggle={studio.toggleCardTypeDropdown}
              onSelectType={studio.handleSelectCardType}
            />

            <FlagshipDesignPicker
              activeFlagshipId={studio.activeFlagshipId}
              activeFlagship={studio.activeFlagship}
              isOpen={studio.designDropdownOpen}
              onToggle={studio.toggleDesignDropdown}
              onSelectDesign={studio.handleSelectFlagshipDesign}
            />

            <MediaLibrarySelector
              mediaItems={studio.displayedMediaItems}
              selectedImageId={studio.selectedImageId}
              mediaCategoryFilter={studio.mediaCategoryFilter}
              onCategoryFilterChange={studio.setMediaCategoryFilter}
              onSelectArtwork={studio.handleSelectArtwork}
              onPickCustomImage={studio.handlePickCustomImage}
            />

            <ContentFieldsEditor
              boundFields={studio.boundFields}
              activeCardType={studio.activeCardType}
              activeFlagship={studio.activeFlagship}
              isOverflow={studio.currentFlagshipResult.isOverflow}
              onUpdateField={studio.handleUpdatePositionalInput}
              onRelinkField={studio.handleRelinkField}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

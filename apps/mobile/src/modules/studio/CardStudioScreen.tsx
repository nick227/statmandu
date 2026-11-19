import React, { useMemo } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { Palette, ChevronRight } from 'lucide-react-native'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { useNativeColor } from '@/lib/theme'
import { usePageTitle } from '@/lib/pageTitle'
import { useCardStudioState } from './hooks/useCardStudioState'
import { StudioTopBar } from './components/StudioTopBar'
import { StudioAlerts } from './components/StudioAlerts'
import { StudioPublishDrawer } from './components/StudioPublishDrawer'
import { StudioPanelHeader } from './components/StudioPanelHeader'
import { SubjectCategoryCard } from './components/SubjectCategoryCard'
import { CardTypeSelector } from './components/CardTypeSelector'
import { ContentFieldsEditor } from './components/ContentFieldsEditor'
import { FlagshipDesignPicker } from './components/FlagshipDesignPicker'
import { MediaLibrarySelector } from './components/MediaLibrarySelector'
import { AppearanceGroupList } from './components/AppearanceGroupList'
import { AppearanceControls } from './components/AppearanceControls'
import { ArtworkAdjustControls } from './components/ArtworkAdjustControls'
import { CardPreviewStage } from './components/CardPreviewStage'

/**
 * CardStudioScreen
 *
 * Full-width workspace-first product experience inspired by modern creative suites.
 *
 * Architecture:
 * 1. Persistent Top Chrome: Full-width document title, saved designs loader, undo/redo, and save/publish actions.
 * 2. 3-Level Contextual Left Panel:
 *    - Level 1: Category overview (Subject, Template, Style, Artwork, Content, Appearance)
 *    - Level 2: Property groups (Layout, Typography, Colors, Framing, Effects)
 *    - Level 3: Granular controls (Font role, swatches, border widths, surface sheens)
 * 3. Expansive Fluid Stage: Center canvas occupying all remaining viewport space with a neutral workspace backdrop.
 * 4. Responsive Scaling: Card scales dynamically to fit available stage height preserving its 2:3 aspect ratio.
 */
export function CardStudioScreen() {
  const { width, height } = useWindowDimensions()
  const isDesktop = width >= 1024
  const isTablet = width >= 768 && width < 1024
  const isWide = isDesktop || isTablet

  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

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

  const panelTitle = useMemo(() => {
    if (studio.panelLocation.level === 1) return 'Studio'
    if (studio.panelLocation.level === 2) return 'Appearance'
    if (studio.panelLocation.level === 3) {
      if (studio.panelLocation.category === 'artwork') return 'Framing'
      if (studio.panelLocation.group) {
        return studio.panelLocation.group.charAt(0).toUpperCase() + studio.panelLocation.group.slice(1)
      }
    }
    return 'Studio'
  }, [studio.panelLocation])

  const renderPanelBody = () => (
    <>
      <StudioPanelHeader
        location={studio.panelLocation}
        breadcrumbs={studio.breadcrumbs}
        title={panelTitle}
        onBack={studio.navigateBack}
        onNavigate={studio.navigateTo}
      />

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

      {/* Level 1: Category Stack */}
      {studio.panelLocation.level === 1 && (
        <View className="gap-md">
          {/* Subject with Independent vs Linked Attribution */}
          <SubjectCategoryCard
            activeProfile={studio.activeProfile}
            people={studio.customPeople}
            isOpen={studio.personDropdownOpen}
            onToggle={studio.togglePersonDropdown}
            onSelectPerson={studio.handleSelectPersonProfile}
            onUnlink={studio.handleUnlinkSubject}
          />

          {/* 1. Template Selector (Standard, Stats, Minimal) */}
          <CardTypeSelector
            activeCardTypeId={studio.activeCardTypeId}
            activeCardType={studio.activeCardType}
            isOpen={studio.cardTypeDropdownOpen}
            onToggle={studio.toggleCardTypeDropdown}
            onSelectType={studio.handleSelectCardType}
          />

          {/* 2. Style (Flagship Design Picker) */}
          <FlagshipDesignPicker
            activeFlagshipId={studio.activeFlagshipId}
            activeFlagship={studio.activeFlagship}
            isOpen={studio.designDropdownOpen}
            onToggle={studio.toggleDesignDropdown}
            onSelectDesign={studio.handleSelectFlagshipDesign}
          />

          {/* 3. Media Library with Artwork Adjust shortcut */}
          <View className="gap-2">
            <MediaLibrarySelector
              mediaItems={studio.displayedMediaItems}
              selectedImageId={studio.selectedImageId}
              mediaCategoryFilter={studio.mediaCategoryFilter}
              onCategoryFilterChange={studio.setMediaCategoryFilter}
              onSelectArtwork={studio.handleSelectArtwork}
              onPickCustomImage={studio.handlePickCustomImage}
            />
            <Button
              size="sm"
              variant="secondary"
              onPress={() =>
                studio.navigateTo({
                  level: 3,
                  category: 'artwork',
                  group: 'adjust',
                })
              }
              testID="open-artwork-adjust-button"
            >
              Adjust Framing
            </Button>
          </View>

          {/* 4. Dynamic Content Fields */}
          <ContentFieldsEditor
            boundFields={studio.boundFields}
            activeCardType={studio.activeCardType}
            activeFlagship={studio.activeFlagship}
            isOverflow={studio.currentFlagshipResult.isOverflow}
            onUpdateField={studio.handleUpdatePositionalInput}
            onRelinkField={studio.handleRelinkField}
          />

          {/* 5. Appearance Levers Entry Card */}
          <Pressable
            onPress={() => studio.navigateTo({ level: 2, category: 'appearance' })}
            testID="open-appearance-button"
            className="rounded-xl border border-border/80 bg-surface p-4 gap-2.5 active:bg-canvas/50 shadow-2xs"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Palette size={15} color={brandColor} />
                <Text className="text-[11px] font-extrabold uppercase tracking-widest text-muted-text">
                  Appearance
                </Text>
              </View>
              <ChevronRight size={16} color={mutedColor} />
            </View>
            <Text className="text-xs text-muted-text">
              Customize layout, typography, colors, framing, and surface effects.
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Badge tone="muted-text">
                {studio.appearance.fontRole ? studio.appearance.fontRole.toUpperCase() : 'Default Type'}
              </Badge>
              {studio.appearance.textureEffect && studio.appearance.textureEffect !== 'none' && (
                <Badge tone="brand">{studio.appearance.textureEffect.toUpperCase()}</Badge>
              )}
              {studio.appearance.vignetteEffect && <Badge tone="brand">Vignette</Badge>}
            </View>
          </Pressable>
        </View>
      )}

      {/* Level 2: Property Group List */}
      {studio.panelLocation.level === 2 && studio.panelLocation.category === 'appearance' && (
        <AppearanceGroupList
          onSelectGroup={(group) =>
            studio.navigateTo({
              level: 3,
              category: 'appearance',
              group,
            })
          }
        />
      )}

      {/* Level 3: Granular Appearance Controls */}
      {studio.panelLocation.level === 3 && studio.panelLocation.category === 'appearance' && studio.panelLocation.group && (
        <AppearanceControls
          group={studio.panelLocation.group}
          appearance={studio.appearance}
          onUpdate={studio.handleUpdateAppearance}
        />
      )}

      {/* Level 3: Artwork Adjust Controls */}
      {studio.panelLocation.level === 3 && studio.panelLocation.category === 'artwork' && (
        <ArtworkAdjustControls
          appearance={studio.appearance}
          onUpdate={studio.handleUpdateAppearance}
        />
      )}
    </>
  )

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
              {renderPanelBody()}
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
            {renderPanelBody()}
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

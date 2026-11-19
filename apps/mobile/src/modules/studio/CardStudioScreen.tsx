import React, { useState, useMemo, useCallback } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'
import { ChevronDown, ChevronRight, ChevronLeft, Layers, Palette, Type, User } from 'lucide-react-native'
import { Screen } from '@/shared/layout/Screen'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import { usePageTitle } from '@/lib/pageTitle'
import { useCardStudioState } from './hooks/useCardStudioState'
import { StudioTopBar } from './components/StudioTopBar'
import { StudioAlerts } from './components/StudioAlerts'
import { StudioPublishDrawer } from './components/StudioPublishDrawer'
import { SubjectCategoryCard } from './components/SubjectCategoryCard'
import { CardTypeSelector } from './components/CardTypeSelector'
import { ContentFieldsEditor } from './components/ContentFieldsEditor'
import { FlagshipDesignPicker } from './components/FlagshipDesignPicker'
import { AppearanceControls } from './components/AppearanceControls'
import { CardPreviewStage } from './components/CardPreviewStage'
import { PrefabCardBrowserRail } from './components/PrefabCardBrowserRail'

export type StudioSection = 'subject' | 'card' | 'content' | 'appearance'

interface SectionConfig {
  id: StudioSection
  label: string
  icon: typeof User
}

const SECTIONS: SectionConfig[] = [
  { id: 'subject', label: 'Subject', icon: User },
  { id: 'card', label: 'Card', icon: Layers },
  { id: 'content', label: 'Content', icon: Type },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

/**
 * CardStudioScreen
 *
 * Single, consistent creative workspace adhering strictly to the RARE Studio UX:
 * 1. Persistent Top Chrome: RARE / Card Studio branding, title, undo/redo, save/publish
 * 2. 4 Inline Expandable Sections:
 *    - Subject: Person attribution, primary portrait, background removal, cutout toggle
 *    - Card: Card title, template type (Standard, Stats, Minimal), design preset
 *    - Content: Dynamically bound positional text fields
 *    - Appearance: Cohesive visual selections (Layout, Typography, Colors, Style, Finish)
 * 3. Large, fixed, continuously updating live card preview stage
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

  // Compute stage dimensions on wide screens (viewport minus header, rail & gutters)
  const availableStageHeight = Math.max(360, height - 340)
  const availableStageWidth = Math.max(300, width - editorWidth - 64)
  const maxCardWidthByHeight = Math.floor(availableStageHeight * (600 / 900) * 0.94)

  // Card canvas scaling: scale to use available height without overflowing; compact on mobile for immediate visual feedback
  const canvasWidth = isWide
    ? Math.min(460, availableStageWidth, maxCardWidthByHeight)
    : Math.min(270, width - 40)

  // Encapsulated state, business logic, and mutations
  const studio = useCardStudioState()

  // Centralized dynamic document title reacting to the active design title
  usePageTitle(studio.designTitle ? `${studio.designTitle} · Card Studio` : 'Card Studio')

  // Inline expandable accordion state
  const [openSection, setOpenSection] = useState<StudioSection | null>(null)

  const toggleSection = useCallback((section: StudioSection) => {
    setOpenSection((current) => current === section ? null : section)
  }, [])

  const collapseAll = useCallback(() => setOpenSection(null), [])

  // Section summary captions
  const sectionSummaries = useMemo(() => {
    const subjectSummary =
      studio.activeProfile?.displayName ||
      studio.publishSubjectName ||
      'No subject linked'

    const cardSummary = `${studio.activeCardType.name} · ${studio.activeFlagship.name}`

    const filledCount = studio.boundFields.filter((bf) => Boolean(bf.effectiveValue)).length
    const contentSummary = `${filledCount} of ${studio.boundFields.length} fields filled`

    const appearanceSummary = `${studio.appearance.layoutVariant || 'balanced'} · ${
      studio.appearance.fontRole || 'serif'
    } · ${studio.appearance.finishEffect || 'matte'}`

    return {
      subject: subjectSummary,
      card: cardSummary,
      content: contentSummary,
      appearance: appearanceSummary,
    }
  }, [
    studio.activeProfile?.displayName,
    studio.publishSubjectName,
    studio.activeCardType.name,
    studio.activeFlagship.name,
    studio.boundFields,
    studio.appearance,
  ])

  const renderSectionBody = (sectionId: StudioSection) => {
    switch (sectionId) {
      case 'subject':
        return (
          <View className="pt-3 border-t border-border/60">
            <SubjectCategoryCard
              activeProfile={studio.activeProfile}
              subjectName={studio.publishSubjectName}
              userProfile={studio.currentUserProfile}
              subjectImageUri={studio.subjectImageUri}
              onUseMyProfile={studio.handleUseMyProfile}
              onClearSubject={studio.handleUnlinkSubject}
              onSubjectNameChange={studio.handleUpdateSubjectName}
              onPickSubjectImage={studio.handlePickCustomImage}
            />
          </View>
        )

      case 'card':
        return (
          <View className="pt-3 border-t border-border/60 gap-4">
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
          </View>
        )

      case 'content':
        return (
          <View className="pt-3 border-t border-border/60">
            <ContentFieldsEditor
              boundFields={studio.boundFields}
              activeCardType={studio.activeCardType}
              activeFlagship={studio.activeFlagship}
              isOverflow={studio.currentFlagshipResult.isOverflow}
              onUpdateField={studio.handleUpdatePositionalInput}
              onRelinkField={studio.handleRelinkField}
            />
          </View>
        )

      case 'appearance':
        return (
          <View className="pt-3 border-t border-border/60">
            <AppearanceControls
              appearance={studio.appearance}
              onUpdate={studio.handleUpdateAppearance}
            />
          </View>
        )

      default:
        return null
    }
  }

  const renderPanelBody = () => (
    <>
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

      {/* 4 Inline Expandable Accordion Sections */}
      <View className="gap-3">
        {SECTIONS.map((sec) => {
          const isOpen = openSection === sec.id
          const IconComponent = sec.icon
          const summary = sectionSummaries[sec.id]

          return (
            <View
              key={sec.id}
              testID={`accordion-${sec.id}`}
              className="rounded-2xl border border-border/80 bg-surface overflow-hidden shadow-2xs"
            >
              {/* Accordion Header */}
              <Pressable
                testID={`category-${sec.id}`}
                onPress={() => toggleSection(sec.id)}
                className="flex-row items-center justify-between p-3.5 active:bg-canvas/40"
                accessibilityRole="button"
                accessibilityLabel={`${sec.label} section`}
              >
                <View className="flex-row items-center gap-3 flex-1 min-w-0 pr-2">
                  <View
                    className={`h-8 w-8 rounded-xl items-center justify-center ${
                      isOpen ? 'bg-brand/10' : 'bg-muted-text/10'
                    }`}
                  >
                    <IconComponent
                      size={17}
                      color={isOpen ? brandColor : mutedColor}
                    />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-bold text-text" numberOfLines={1}>
                      {sec.label}
                    </Text>
                    <Text variant="caption" className="text-xs text-muted-text" numberOfLines={1}>
                      {summary}
                    </Text>
                  </View>
                </View>

                {isOpen ? (
                  <ChevronDown size={18} color={mutedColor} />
                ) : (
                  <ChevronRight size={18} color={mutedColor} />
                )}
              </Pressable>

              {/* Inline Expanded Controls */}
              {isOpen && (
                <View className="px-3.5 pb-4">
                  {renderSectionBody(sec.id)}
                </View>
              )}
            </View>
          )
        })}
      </View>
    </>
  )

  return (
    <Screen
      layout="workspace"
      insetTop={false}
      className="h-full"
      style={isWide ? ({ height: 'calc(100vh - 56px)', overflow: 'hidden' } as any) : undefined}
    >
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

      {/* 2. Workspace Body: Left Accordion Panel + Right Live Card Preview */}
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
            backComposition={studio.backComposition}
            canvasWidth={canvasWidth}
            assets={studio.assetsList}
            activeFace={studio.activeCardFace}
            onToggleFace={studio.handleToggleCardFace}
            displayMode={studio.displayMode}
            onToggleDisplayMode={studio.handleToggleDisplayMode}
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
              backComposition={studio.backComposition}
              canvasWidth={canvasWidth}
              assets={studio.assetsList}
              activeFace={studio.activeCardFace}
              onToggleFace={studio.handleToggleCardFace}
              displayMode={studio.displayMode}
              onToggleDisplayMode={studio.handleToggleDisplayMode}
              className="bg-transparent"
            />
          </View>

          {/* Editor Controls below */}
          <View className="p-md gap-md bg-surface">
            {renderPanelBody()}
          </View>
        </ScrollView>
      )}

      {/* 3. Bottom Rail: Prefabbed Card Browser with Finished Collectibles */}
      <PrefabCardBrowserRail
        activePrefabId={studio.activePrefabId}
        activeFlagshipId={studio.activeFlagshipId}
        onSelectPrefab={studio.handleSelectPrefabCard}
      />
    </Screen>
  )
}
